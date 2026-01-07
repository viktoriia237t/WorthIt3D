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
        // Find and update the item
        const updatedItem = prev.find(item => item.id === id);
        if (!updatedItem) return prev;

        const updated = {
          ...updatedItem,
          state,
          result,
          note,
          modelName,
          modelLink,
          timestamp: Date.now()
        };

        // Remove old item and add updated one at the start (newest first)
        // No sorting needed - new items go to the front automatically
        return [updated, ...prev.filter(item => item.id !== id)];
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
        if (id) {
          // Спробувати оновити існуючий запис
          const existingIndex = prev.findIndex((calc) => calc.id === id);
          if (existingIndex !== -1) {
            // Оновити існуючий - move to front
            const updated = {
              ...prev[existingIndex],
              state,
              result,
              note,
              modelName,
              modelLink,
              timestamp: Date.now()
            };
            return [updated, ...prev.filter((_, i) => i !== existingIndex)];
          }
        }

        // Створити новий запис - add to front
        const newCalculation: CalculationHistory = {
          id: savedId,
          timestamp: Date.now(),
          state,
          result,
          note,
          modelName,
          modelLink,
        };
        return [newCalculation, ...prev];
      });

      return savedId;
    },
    []
  );

  // Імпорт історії з вибором стратегії об'єднання
  const importHistory = useCallback((
    imported: CalculationHistory[],
    strategy: 'replace' | 'skip' | 'update'
  ) => {
    setHistory((prev) => {
      if (strategy === 'replace') {
        return imported.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.timestamp - a.timestamp;
        });
      }

      const existingIds = new Set(prev.map(h => h.id));

      if (strategy === 'skip') {
        const newEntries = imported.filter(h => !existingIds.has(h.id));
        const merged = [...prev, ...newEntries];
        return merged.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.timestamp - a.timestamp;
        });
      }

      if (strategy === 'update') {
        const updated = prev.map(existing => {
          const imp = imported.find(i => i.id === existing.id);
          if (imp) {
            // Preserve pinned status from existing
            return { ...imp, pinned: existing.pinned };
          }
          return existing;
        });
        const newEntries = imported.filter(h => !existingIds.has(h.id));
        const merged = [...updated, ...newEntries];
        return merged.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.timestamp - a.timestamp;
        });
      }

      return prev;
    });
  }, []);

  return {
    history,
    addCalculation,
    deleteCalculation,
    updateCalculation,
    clearHistory,
    getCalculation,
    upsertCalculation,
    togglePin,
    importHistory,
  };
};
