import { useState, useEffect } from 'react';
import {Card, CardBody, } from "@heroui/card";
import { Button} from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { ToastProvider, addToast } from "@heroui/toast";
import { CalculatorForm } from './components/CalculatorForm';
import { CalculationResultComponent } from './components/CalculationResult';
import { CalculationHistory } from './components/CalculationHistory';
import { useCalculator } from './hooks/useCalculator';
import { useCalculationHistory } from './hooks/useCalculationHistory';
import { DEFAULT_CALCULATION_STATE } from './types/calculator';
import type { CalculationState } from './types/calculator';
import Logo from '../src/components/Logo';


const CURRENT_MODEL_STORAGE_KEY = 'current-model-info';
const CURRENT_STATE_STORAGE_KEY = 'current-calculator-state';

function App() {

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
            title: "Розрахунок успішно оновлено!",
            description: modelName || "Зміни збережено",
            color: "success",
            variant: "flat",
            timeout: 3000,
        });
    } else {
      // Збереження нового розрахунку
      addCalculation(currentState, result, note, modelName, modelLink);
        addToast({
            title: "Розрахунок успішно збережено!",
            description: modelName || "Додано в історію",
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
        <div className="mb-8 text-center">

            <Logo/>

          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Калькулятор вартості 3D-друку
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Професійний розрахунок собівартості та ціни для клієнта
          </p>
        </div>

        {/* Edit Mode Banner */}
        {editingId && (
          <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20">
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-300">
                    Режим редагування
                  </p>
                  <p className="text-small text-blue-600 dark:text-blue-400">
                    Ви редагуєте існуючий розрахунок
                  </p>
                </div>
                <Button color="default" variant="flat" onPress={handleCancelEdit}>
                  Скасувати
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
          <Tab key="calculator" title="Калькулятор">
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
                <div className="flex gap-3 mt-6">
                  <Button
                    color="primary"
                    size="lg"
                    className="flex-1"
                    onPress={handleSaveCalculation}
                  >
                    {editingId ? 'Оновити розрахунок' : 'Зберегти розрахунок'}
                  </Button>
                  {editingId ? (
                    <Button
                      color="default"
                      variant="flat"
                      size="lg"
                      onPress={handleCancelEdit}
                    >
                      Скасувати
                    </Button>
                  ) : (
                    <Button
                      color="default"
                      variant="flat"
                      size="lg"
                      onPress={handleNewCalculation}
                    >
                      Очистити форму
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

          <Tab key="history" title={`Історія (${history.length})`}>
            <CalculationHistory
              history={history}
              onDelete={deleteCalculation}
              onEdit={handleEditCalculation}
              onClearAll={() => {
                toast.custom(
                  (t) => (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-danger-200 dark:border-danger-800">
                      <p className="font-semibold text-danger mb-2">Видалити всю історію?</p>
                      <p className="text-small text-default-600 mb-4">
                        Ви впевнені, що хочете видалити всю історію розрахунків? Цю дію не можна скасувати.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="danger"
                          onPress={() => {
                            clearHistory();
                            toast.dismiss(t);
                            toast.success('Історію очищено');
                          }}
                        >
                          Видалити
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => toast.dismiss(t)}
                        >
                          Скасувати
                        </Button>
                      </div>
                    </div>
                  ),
                  { duration: Infinity }
                );
              }}
            />
          </Tab>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-small text-gray-500 dark:text-gray-400">
          <p>
            Професійний інструмент для розрахунку вартості 3D-друку з урахуванням усіх витрат
          </p>
          <p className="mt-1">
            Враховує матеріали, електрику, амортизацію, роботу та бізнес-ризики
          </p>
        </div>
        </div>
      </div>
    </>
  );
}

export default App;
