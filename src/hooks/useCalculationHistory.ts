import { useState, useEffect, useCallback } from 'react';
import type { CalculationHistory, CalculationState, CalculationResult } from '../types/calculator';

const STORAGE_KEY = '3d-calculator-history';

export const useCalculationHistory = () => {
  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load calculation history:', error);
    }
    return [];
  });

  // Збереження історії в localStorage при зміні
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save calculation history:', error);
    }
  }, [history]);

  // Додавання нового розрахунку
  const addCalculation = useCallback(
    (state: CalculationState, result: CalculationResult, note?: string, modelName?: string, modelLink?: string) => {
      const newEntry: CalculationHistory = {
        id: `calc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: Date.now(),
        state,
        result,
        note,
        modelName,
        modelLink,
      };

      setHistory((prev) => [newEntry, ...prev]);
      return newEntry.id;
    },
    []
  );

  // Видалення розрахунку
  const deleteCalculation = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Оновлення розрахунку
  const updateCalculation = useCallback(
    (id: string, state: CalculationState, result: CalculationResult, note?: string, modelName?: string, modelLink?: string) => {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, state, result, note, modelName, modelLink, timestamp: Date.now() }
            : item
        )
      );
    },
    []
  );

  // Очищення всієї історії
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Отримання розрахунку за ID
  const getCalculation = useCallback(
    (id: string) => {
      return history.find((item) => item.id === id);
    },
    [history]
  );

  return {
    history,
    addCalculation,
    deleteCalculation,
    updateCalculation,
    clearHistory,
    getCalculation,
  };
};
