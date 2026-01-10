import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {Card, CardBody, } from "@heroui/card";
import { Button, ButtonGroup } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Tooltip } from "@heroui/tooltip";
import { Badge } from "@heroui/badge";
import { Alert } from "@heroui/alert";
import { Save, SaveAll, Eraser, FilePlus } from "lucide-react";
import { ToastProvider, addToast } from "@heroui/toast";
import { CalculatorForm } from './components/CalculatorForm';
import { CalculationResultComponent } from './components/CalculationResult';
import { CalculationHistory } from './components/CalculationHistory';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { GitHubLink } from './components/GitHubLink';
import { useCalculator } from './hooks/useCalculator';
import { useCalculationHistory } from './hooks/useCalculationHistory';
import { useCalculationManager } from './hooks/useCalculationManager';
import { useSaveManager } from './hooks/useSaveManager';
import { useSeoMeta } from './hooks/useSeoMeta';
import Logo from '../src/components/Logo';
import { initGA, logPageView, logEvent } from './utils/analytics';

function App() {
  const { t, i18n } = useTranslation();

  // Initialize Google Analytics
  useEffect(() => {
    const initialize = async () => {
      await initGA();
      await logPageView(window.location.pathname + window.location.search);
    };
    initialize();
  }, []);

  // Update HTML lang attribute when language changes and track language switch
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    logEvent('Language', 'change', i18n.language).catch(console.error);
  }, [i18n.language]);

  // Update SEO meta tags when language changes
  useSeoMeta();

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('calculator');

  // Calculation manager hook - handles form state and localStorage
  const calculationManager = useCalculationManager();
  const {
    currentState,
    setCurrentState,
    modelName,
    setModelName,
    modelLink,
    setModelLink,
    note,
    setNote,
    editingId,
    setEditingId,
    isEmptyForm,
    loadCalculation,
    clearForm,
    cancelEdit,
  } = calculationManager;

  // History hook
  const { history, addCalculation, deleteCalculation, updateCalculation, clearHistory, getCalculation, upsertCalculation, togglePin, importHistory } = useCalculationHistory();

  // Calculate result
  const result = useCalculator(currentState);

  // Toast callback for save manager
  const handleToast = (toast: { title: string; description?: string; color: string }) => {
    addToast({
      title: toast.title,
      description: toast.description,
      color: toast.color as any,
      variant: "flat",
      timeout: 3000,
    });
  };

  // Save manager hook - handles auto-save and manual save logic
  const saveManager = useSaveManager(
    {
      currentState,
      result,
      modelName,
      modelLink,
      note,
      editingId,
      isEmptyForm,
      upsertCalculation,
      updateCalculation,
      addCalculation,
    },
    handleToast,
    handleToast
  );

  const {
    autoSaveId,
    setAutoSaveId,
    lastSaveTime,
    hasUnsavedChanges,
    handleSave,
    handleSaveAndNew,
    clearSaveState,
  } = saveManager;

  // Handle edit calculation from history
  const handleEditCalculation = (id: string) => {
    const calculation = getCalculation(id);
    if (calculation) {
      loadCalculation(id, calculation);
      clearSaveState(); // Clear auto-save state when loading from history
      setActiveTab('calculator');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    cancelEdit();
    clearSaveState();
  };

  // Handle new calculation
  const handleNewCalculation = () => {
    clearForm();
    clearSaveState();
  };

  // Wrapper for handleSave that includes analytics and note clearing
  const handleSaveCalculation = () => {
    const wasEditMode = !!editingId;
    const hadAutoSave = !!autoSaveId;

    handleSave();

    // Analytics
    if (wasEditMode) {
      setAutoSaveId(editingId);  // Transfer ID so subsequent saves update same entry
      setEditingId(null);
      logEvent('Calculation', 'update', 'edit_mode').catch(console.error);
    } else if (hadAutoSave) {
      logEvent('Calculation', 'save', 'update_draft').catch(console.error);
    } else {
      logEvent('Calculation', 'save', 'new').catch(console.error);
    }

    // Clear note after save
    setNote('');
  };

  // Wrapper for handleSaveAndNew with analytics
  const handleSaveAndNewWrapper = () => {
    handleSaveAndNew();
    setNote('');
    logEvent('Calculation', 'save_and_new', 'duplicate_params').catch(console.error);
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

        {/* Development Warning Alert */}
        <Alert
          color="warning"
          variant="bordered"
          className="mb-4 md:w-1/2 mx-auto "
          title={t('alert.development.title')}
          description={t('alert.development.description')}
        />

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
              onSelectionChange={(key) => {
                const tabKey = key as string;
                setActiveTab(tabKey);
                logEvent('Navigation', 'tab_switch', tabKey).catch(console.error);
              }}
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
                <Tooltip content={t('buttons.saveAndNew')}>
                  <Button
                    color="default"
                    variant="flat"
                    isIconOnly
                    onPress={handleSaveAndNewWrapper}
                    aria-label={t('buttons.saveAndNew')}
                  >
                    <FilePlus size={18} />
                  </Button>
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
                  <CalculationResultComponent result={result} weight={currentState.weight} />
                </div>
              </aside>
            </div>
          )}

          {activeTab === 'history' && (
            <section aria-label="Calculation history">
              <CalculationHistory
                history={history}
                onDelete={(id) => {
                  deleteCalculation(id);
                  logEvent('Calculation', 'delete', id).catch(console.error);
                }}
                onEdit={handleEditCalculation}
                onTogglePin={togglePin}
                onClearAll={() => {
                  clearHistory();
                  logEvent('History', 'clear_all', String(history.length)).catch(console.error);
                  addToast({
                    title: t('toast.historyCleared'),
                    color: "success",
                    variant: "flat",
                    timeout: 3000,
                  });
                }}
                onImport={(data, strategy) => {
                  importHistory(data, strategy);
                  logEvent('History', 'import', strategy).catch(console.error);
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
