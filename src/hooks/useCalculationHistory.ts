import { useState, useEffect, useCallback } from 'react';
import type { CalculationHistory, CalculationState, CalculationResult } from '../types/calculator';

const STORAGE_KEY = '3d-calculator-history';

export const useCalculationHistory = () => {
  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Sort by timestamp descending (newest first)
        return parsed.sort((a: CalculationHistory, b: CalculationHistory) => b.timestamp - a.timestamp);
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
      setHistory((prev) => {
        const updated = prev.map((item) =>
          item.id === id
            ? { ...item, state, result, note, modelName, modelLink, timestamp: Date.now() }
            : item
        );
        // Sort by timestamp descending (newest first)
        return updated.sort((a, b) => b.timestamp - a.timestamp);
      });
    },
    []
  );

  // Очищення всієї історії (крім закріплених)
  const clearHistory = useCallback(() => {
    setHistory((prev) => prev.filter((item) => item.pinned));
  }, []);

  // Перемикання статусу закріплення
  const togglePin = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      );
      // Sort: pinned items first, then by timestamp
      return updated.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.timestamp - a.timestamp;
      });
    });
  }, []);

  // Отримання розрахунку за ID
  const getCalculation = useCallback(
    (id: string) => {
      return history.find((item) => item.id === id);
    },
    [history]
  );

  // Upsert: оновити існуючий або створити новий розрахунок
  const upsertCalculation = useCallback(
    (id: string | null, state: CalculationState, result: CalculationResult, note?: string, modelName?: string, modelLink?: string): string => {
      // Generate ID before setHistory if needed
      const savedId = id || `calc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      setHistory((prev) => {
        let updated;
        if (id) {
          // Спробувати оновити існуючий запис
          const exists = prev.some((calc) => calc.id === id);
          if (exists) {
            // Оновити існуючий
            updated = prev.map((calc) =>
              calc.id === id
                ? { ...calc, state, result, note, modelName, modelLink, timestamp: Date.now() }
                : calc
            );
            // Sort by timestamp descending (newest first)
            return updated.sort((a, b) => b.timestamp - a.timestamp);
          }
        }

        // Створити новий запис
        const newCalculation: CalculationHistory = {
          id: savedId,
          timestamp: Date.now(),
          state,
          result,
          note,
          modelName,
          modelLink,
        };
        // New items are already at the top, but sort to be safe
        return [newCalculation, ...prev];
      });

      return savedId;
    },
    []
  );

  return {
    history,
    addCalculation,
    deleteCalculation,
    updateCalculation,
    clearHistory,
    getCalculation,
    upsertCalculation,
    togglePin,
  };
};
