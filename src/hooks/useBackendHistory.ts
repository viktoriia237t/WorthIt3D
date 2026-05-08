import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../api/calculations';
import { useCalculationHistory } from './useCalculationHistory';
import type { CalculationHistory, CalculationState, CalculationResult } from '../types/calculator';

const MIGRATION_KEY_PREFIX = 'backend-migrated-';

export const useBackendHistory = (userId: string | null) => {
  const localHistory = useCalculationHistory();
  const [isMigrating, setIsMigrating] = useState(false);
  const isInitializedRef = useRef(false);

  // Load from backend on auth
  useEffect(() => {
    if (!userId || isInitializedRef.current) return;

    const init = async () => {
      const migrationKey = MIGRATION_KEY_PREFIX + userId;
      const alreadyMigrated = localStorage.getItem(migrationKey) === 'true';

      // Migrate localStorage history to backend (one-time)
      if (!alreadyMigrated && localHistory.history.length > 0) {
        setIsMigrating(true);
        try {
          await api.batchUpsert(localHistory.history);
          localStorage.setItem(migrationKey, 'true');
        } catch (error) {
          console.error('Migration failed:', error);
        }
        setIsMigrating(false);
      } else if (!alreadyMigrated) {
        localStorage.setItem(migrationKey, 'true');
      }

      // Fetch latest from backend and merge — backend wins on conflicts,
      // but local-only entries are preserved (handles partial migration failures)
      try {
        const remote = await api.fetchCalculations();
        localHistory.importHistory(remote, 'update');
      } catch (error) {
        console.error('Failed to fetch calculations:', error);
      }

      isInitializedRef.current = true;
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Reset initialization when user changes
  useEffect(() => {
    if (!userId) {
      isInitializedRef.current = false;
    }
  }, [userId]);

  const addCalculation = useCallback(
    (state: CalculationState, result: CalculationResult, note?: string, modelName?: string, modelLink?: string) => {
      const id = localHistory.addCalculation(state, result, note, modelName, modelLink);

      const entry: CalculationHistory = {
        id,
        timestamp: Date.now(),
        state,
        result,
        note,
        modelName,
        modelLink,
      };
      api.createCalculation(entry).catch(console.error);

      return id;
    },
    [localHistory],
  );

  const updateCalculation = useCallback(
    (id: string, state: CalculationState, result: CalculationResult, note?: string, modelName?: string, modelLink?: string) => {
      localHistory.updateCalculation(id, state, result, note, modelName, modelLink);

      const existing = localHistory.history.find((h) => h.id === id);
      const entry: CalculationHistory = {
        id,
        timestamp: Date.now(),
        state,
        result,
        note,
        modelName,
        modelLink,
        pinned: existing?.pinned,
      };
      api.upsertCalculation(id, entry).catch(console.error);
    },
    [localHistory],
  );

  const deleteCalculation = useCallback(
    (id: string) => {
      localHistory.deleteCalculation(id);
      api.deleteCalculation(id).catch(console.error);
    },
    [localHistory],
  );

  const clearHistory = useCallback(() => {
    localHistory.clearHistory();
    api.clearCalculations().catch(console.error);
  }, [localHistory]);

  const togglePin = useCallback(
    (id: string) => {
      localHistory.togglePin(id);
      api.togglePin(id).catch(console.error);
    },
    [localHistory],
  );

  const upsertCalculation = useCallback(
    (id: string | null, state: CalculationState, result: CalculationResult, note?: string, modelName?: string, modelLink?: string): string => {
      const savedId = localHistory.upsertCalculation(id, state, result, note, modelName, modelLink);

      const existing = localHistory.history.find((h) => h.id === savedId);
      const entry: CalculationHistory = {
        id: savedId,
        timestamp: Date.now(),
        state,
        result,
        note,
        modelName,
        modelLink,
        pinned: existing?.pinned,
      };
      api.upsertCalculation(savedId, entry).catch(console.error);

      return savedId;
    },
    [localHistory],
  );

  const importHistory = useCallback(
    (data: CalculationHistory[], strategy: 'replace' | 'skip' | 'update') => {
      localHistory.importHistory(data, strategy);
      api.batchUpsert(data).catch(console.error);
    },
    [localHistory],
  );

  return {
    history: localHistory.history,
    addCalculation,
    deleteCalculation,
    updateCalculation,
    clearHistory,
    getCalculation: localHistory.getCalculation,
    upsertCalculation,
    togglePin,
    importHistory,
    isMigrating,
  };
};
