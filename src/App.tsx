import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {Card, CardBody, } from "@heroui/card";
import { Button} from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { ToastProvider, addToast } from "@heroui/toast";
import { CalculatorForm } from './components/CalculatorForm';
import { CalculationResultComponent } from './components/CalculationResult';
import { CalculationHistory } from './components/CalculationHistory';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useCalculator } from './hooks/useCalculator';
import { useCalculationHistory } from './hooks/useCalculationHistory';
import { DEFAULT_CALCULATION_STATE } from './types/calculator';
import type { CalculationState } from './types/calculator';
import Logo from '../src/components/Logo';


const CURRENT_MODEL_STORAGE_KEY = 'current-model-info';
const CURRENT_STATE_STORAGE_KEY = 'current-calculator-state';

function App() {
  const { t } = useTranslation();

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('calculator');

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

  const result = useCalculator(currentState);
  const { history, addCalculation, deleteCalculation, updateCalculation, clearHistory, getCalculation } = useCalculationHistory();

  const handleSaveCalculation = () => {
    if (editingId) {
      // Оновлення існуючого розрахунку
      updateCalculation(editingId, currentState, result, note, modelName, modelLink);
      setEditingId(null);
        addToast({
            title: t('toast.updated'),
            description: modelName || t('toast.updatedDescription'),
            color: "success",
            variant: "flat",
            timeout: 3000,
        });
    } else {
      // Збереження нового розрахунку
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
  };

  const handleNewCalculation = () => {
    setCurrentState(DEFAULT_CALCULATION_STATE);
    setNote('');
    setModelName('');
    setModelLink('');
    setEditingId(null);
  };

  return (
    <>
     <ToastProvider placement="top-right" toastOffset={20} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <Logo/>
            </div>
            <div className="flex-1 flex justify-end">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {t('header.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('header.subtitle')}
            </p>
          </div>
        </div>

        {/* Edit Mode Banner */}
        {editingId && (
          <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20">
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
                <Button color="default" variant="flat" onPress={handleCancelEdit}>
                  {t('editMode.cancel')}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          size="lg"
          className="mb-6"
        >
          <Tab key="calculator" title={t('tabs.calculator')}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Форма */}
              <div className="lg:col-span-2">
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

                {/* Кнопки дій */}
                <div className="flex md:flex-row flex-col gap-3 mt-6">
                  <Button
                    color="primary"
                    size="lg"
                    onPress={handleSaveCalculation}
                  >
                    {editingId ? t('buttons.update') : t('buttons.save')}
                  </Button>
                  {editingId ? (
                    <Button
                      color="default"
                      variant="flat"
                      size="lg"
                      onPress={handleCancelEdit}
                    >
                      {t('buttons.cancel')}
                    </Button>
                  ) : (
                    <Button
                      color="default"
                      variant="flat"
                      size="lg"
                      onPress={handleNewCalculation}
                    >
                      {t('buttons.clear')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Результат */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <CalculationResultComponent result={result} />
                </div>
              </div>
            </div>
          </Tab>

          <Tab key="history" title={`${t('tabs.history')} (${history.length})`}>
            <CalculationHistory
              history={history}
              onDelete={deleteCalculation}
              onEdit={handleEditCalculation}
              onClearAll={() => {
                if (confirm(`${t('history.confirmDelete.title')}\n\n${t('history.confirmDelete.message')}`)) {
                  clearHistory();
                  addToast({
                    title: t('toast.historyCleared'),
                    color: "success",
                    variant: "flat",
                    timeout: 3000,
                  });
                }
              }}
            />
          </Tab>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-small text-gray-500 dark:text-gray-400">
          <p>
            {t('footer.line1')}
          </p>
          <p className="mt-1">
            {t('footer.line2')}
          </p>
        </div>
        </div>
      </div>
    </>
  );
}

export default App;
