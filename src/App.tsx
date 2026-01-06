import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {Card, CardBody, } from "@heroui/card";
import { Button, ButtonGroup } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Tooltip } from "@heroui/tooltip";
import { Badge } from "@heroui/badge";
import { Save, SaveAll, Eraser } from "lucide-react";
import { ToastProvider, addToast } from "@heroui/toast";
import { CalculatorForm } from './components/CalculatorForm';
import { CalculationResultComponent } from './components/CalculationResult';
import { CalculationHistory } from './components/CalculationHistory';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { GitHubLink } from './components/GitHubLink';
import { useCalculator } from './hooks/useCalculator';
import { useCalculationHistory } from './hooks/useCalculationHistory';
import { useSeoMeta } from './hooks/useSeoMeta';
import { useDebouncedEffect } from './hooks/useDebouncedEffect';
import { DEFAULT_CALCULATION_STATE } from './types/calculator';
import type { CalculationState } from './types/calculator';
import Logo from '../src/components/Logo';


const CURRENT_MODEL_STORAGE_KEY = 'current-model-info';
const CURRENT_STATE_STORAGE_KEY = 'current-calculator-state';
const EDITING_ID_STORAGE_KEY = 'current-editing-id';

function App() {
  const { t, i18n } = useTranslation();

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Update SEO meta tags when language changes
  useSeoMeta();

  const [currentState, setCurrentState] = useState<CalculationState>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_STATE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load current state:', error);
    }
    return DEFAULT_CALCULATION_STATE;
  });

  const [modelName, setModelName] = useState('');
  const [modelLink, setModelLink] = useState('');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(EDITING_ID_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to load editing ID:', error);
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<string>('calculator');

  // Auto-save state
  const [autoSaveId, setAutoSaveId] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isInitialMount = useRef(true);

  // Завантаження назви та посилання моделі з localStorage при монтуванні
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENT_MODEL_STORAGE_KEY);
      if (stored) {
        const { modelName: savedName, modelLink: savedLink } = JSON.parse(stored);
        setModelName(savedName || '');
        setModelLink(savedLink || '');
      }
    } catch (error) {
      console.error('Failed to load current model info:', error);
    }
  }, []);

  // Збереження назви та посилання моделі в localStorage при зміні
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_MODEL_STORAGE_KEY, JSON.stringify({ modelName, modelLink }));
    } catch (error) {
      console.error('Failed to save current model info:', error);
    }
  }, [modelName, modelLink]);

  // Збереження стану калькулятора в localStorage при зміні
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_STATE_STORAGE_KEY, JSON.stringify(currentState));
    } catch (error) {
      console.error('Failed to save current state:', error);
    }
  }, [currentState]);

  // Збереження editingId в localStorage при зміні
  useEffect(() => {
    try {
      if (editingId) {
        localStorage.setItem(EDITING_ID_STORAGE_KEY, editingId);
      } else {
        localStorage.removeItem(EDITING_ID_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save editing ID:', error);
    }
  }, [editingId]);

  const result = useCalculator(currentState);
  const { history, addCalculation, deleteCalculation, updateCalculation, clearHistory, getCalculation, upsertCalculation, togglePin } = useCalculationHistory();

  // Track unsaved changes
  useEffect(() => {
    // Check if form is not empty
    const isEmptyForm = JSON.stringify(currentState) === JSON.stringify(DEFAULT_CALCULATION_STATE);
    const hasContent = !isEmptyForm || modelName || modelLink || note;

    // If we just saved (lastSaveTime exists), mark as saved
    if (lastSaveTime && !isSaving) {
      setHasUnsavedChanges(false);
      return;
    }

    setHasUnsavedChanges(hasContent);
  }, [currentState, modelName, modelLink, note, isSaving, lastSaveTime]);

  // Auto-save calculator state to history (debounced)
  useDebouncedEffect(
    () => {
      // Skip auto-save on initial mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      // Don't auto-save if form is empty (all defaults) and no model info
      const isEmptyForm = JSON.stringify(currentState) === JSON.stringify(DEFAULT_CALCULATION_STATE);
      if (isEmptyForm && !modelName && !modelLink && !note) {
        return;
      }

      // Don't auto-save if already saving
      if (isSaving) {
        return;
      }

      // Perform auto-save
      setIsSaving(true);
      try {
        const targetId = editingId || autoSaveId;
        const savedId = upsertCalculation(
          targetId,
          currentState,
          result,
          note,
          modelName,
          modelLink
        );

        // Store the auto-save ID for future updates
        if (!editingId) {
          setAutoSaveId(savedId);
        }

        setLastSaveTime(Date.now());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    },
    2000, // 2 second debounce delay
    [currentState, modelName, modelLink, note, result, editingId, isSaving, upsertCalculation]
  );

  const handleSaveCalculation = () => {
    if (editingId) {
      // Update existing entry (from edit mode)
      updateCalculation(editingId, currentState, result, note, modelName, modelLink);
      setEditingId(null);
      setAutoSaveId(null); // Clear auto-save ID
      addToast({
        title: t('toast.updated'),
        description: modelName || t('toast.updatedDescription'),
        color: "success",
        variant: "flat",
        timeout: 3000,
      });
    } else if (autoSaveId) {
      // User clicked "Save" on an auto-saved draft - finalize it
      updateCalculation(autoSaveId, currentState, result, note, modelName, modelLink);
      setAutoSaveId(null);
      addToast({
        title: t('toast.saved'),
        description: modelName || t('toast.savedDescription'),
        color: "success",
        variant: "flat",
        timeout: 3000,
      });
    } else {
      // Create new entry (no auto-save draft exists)
      addCalculation(currentState, result, note, modelName, modelLink);
      addToast({
        title: t('toast.saved'),
        description: modelName || t('toast.savedDescription'),
        color: "success",
        variant: "flat",
        timeout: 3000,
      });
    }
    setNote('');
    setLastSaveTime(Date.now());
  };

  const handleEditCalculation = (id: string) => {
    const calculation = getCalculation(id);
    if (calculation) {
      setCurrentState(calculation.state);
      setNote(calculation.note || '');
      setModelName(calculation.modelName || '');
      setModelLink(calculation.modelLink || '');
      setEditingId(id);
      setActiveTab('calculator');
    }
  };

  const handleCancelEdit = () => {
    setCurrentState(DEFAULT_CALCULATION_STATE);
    setNote('');
    setModelName('');
    setModelLink('');
    setEditingId(null);
    setAutoSaveId(null); // Clear auto-save ID when canceling
  };

  const handleNewCalculation = () => {
    setCurrentState(DEFAULT_CALCULATION_STATE);
    setNote('');
    setModelName('');
    setModelLink('');
    setEditingId(null);
    setAutoSaveId(null); // Clear auto-save ID when starting new calculation
  };

  return (
    <>
     <ToastProvider placement="top-right" toastOffset={20} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8" role="banner">
          <nav className="flex justify-between items-center mb-4" aria-label="Main navigation">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <Logo/>
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
              <GitHubLink />
              <LanguageSwitcher />
            </div>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {t('header.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('header.subtitle')}
            </p>
          </div>
        </header>

        {/* Edit Mode Banner */}
        {editingId && (
          <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20" role="alert" aria-live="polite">
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-300">
                    {t('editMode.title')}
                  </p>
                  <p className="text-small text-blue-600 dark:text-blue-400">
                    {t('editMode.subtitle')}
                  </p>
                </div>
                <Button
                  color="default"
                  variant="flat"
                  onPress={handleCancelEdit}
                  aria-label={t('editMode.cancel')}
                >
                  {t('editMode.cancel')}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Tabs and Actions */}
        <main role="main">
          {/* Tab Switcher and Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              size="lg"
              aria-label="Calculator sections"
              disableAnimation
            >
              <Tab key="calculator" title={t('tabs.calculator')} />
              <Tab key="history" title={`${t('tabs.history')} (${history.length})`} />
            </Tabs>

            {/* Action Buttons */}
            {activeTab === 'calculator' && (
              <ButtonGroup>
                <Tooltip content={editingId ? t('buttons.update') : t('buttons.save')}>
                  <Badge
                    content=""
                    color={lastSaveTime && !hasUnsavedChanges ? "success" : "warning"}
                    placement="top-right"
                    shape="circle"
                    isDot
                    isInvisible={!lastSaveTime && !hasUnsavedChanges}
                  >
                    <Button
                      color="default"
                      variant="flat"
                      isIconOnly
                      onPress={handleSaveCalculation}
                      aria-label={editingId ? t('buttons.update') : t('buttons.save')}
                    >
                      {editingId || autoSaveId ? <SaveAll size={18} /> : <Save size={18} />}
                    </Button>
                  </Badge>
                </Tooltip>
                <Tooltip content={t('buttons.clear')}>
                  <Button
                    color="default"
                    variant="flat"
                    isIconOnly
                    onPress={handleNewCalculation}
                    aria-label={t('buttons.clear')}
                  >
                    <Eraser size={18} />
                  </Button>
                </Tooltip>
              </ButtonGroup>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Форма */}
              <section className="lg:col-span-2" aria-label="Calculator form">
                <CalculatorForm
                  initialState={currentState}
                  onStateChange={setCurrentState}
                  modelName={modelName}
                  onModelNameChange={setModelName}
                  modelLink={modelLink}
                  onModelLinkChange={setModelLink}
                  note={note}
                  onNoteChange={setNote}
                />
              </section>

              {/* Результат */}
              <aside className="lg:col-span-1" aria-label="Calculation results">
                <div className="sticky top-4">
                  <CalculationResultComponent result={result} />
                </div>
              </aside>
            </div>
          )}

          {activeTab === 'history' && (
            <section aria-label="Calculation history">
              <CalculationHistory
                history={history}
                onDelete={deleteCalculation}
                onEdit={handleEditCalculation}
                onTogglePin={togglePin}
                onClearAll={() => {
                  clearHistory();
                  addToast({
                    title: t('toast.historyCleared'),
                    color: "success",
                    variant: "flat",
                    timeout: 3000,
                  });
                }}
              />
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center text-small text-gray-500 dark:text-gray-400" role="contentinfo">
          <p>
            {t('footer.line1')}
          </p>
          <p className="mt-1">
            {t('footer.line2')}
          </p>
        </footer>
        </div>
      </div>
    </>
  );
}

export default App;
