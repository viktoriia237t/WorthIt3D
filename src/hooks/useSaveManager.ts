import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebouncedEffect } from './useDebouncedEffect';
import type { CalculationState, CalculationResult } from '../types/calculator';

const AUTO_SAVE_ID_STORAGE_KEY = 'current-auto-save-id';
const LAST_SAVE_TIME_STORAGE_KEY = 'last-save-time';

interface SaveManagerOptions {
  currentState: CalculationState;
  result: CalculationResult;
  modelName: string;
  modelLink: string;
  note: string;
  editingId: string | null;
  isEmptyForm: boolean;
  upsertCalculation: (
    id: string | null,
    state: CalculationState,
    result: CalculationResult,
    note?: string,
    modelName?: string,
    modelLink?: string
  ) => string;
  updateCalculation: (
    id: string,
    state: CalculationState,
    result: CalculationResult,
    note?: string,
    modelName?: string,
    modelLink?: string
  ) => void;
  addCalculation: (
    state: CalculationState,
    result: CalculationResult,
    note?: string,
    modelName?: string,
    modelLink?: string
  ) => string;
}

interface SaveManagerState {
  // Auto-save state
  autoSaveId: string | null;
  setAutoSaveId: (id: string | null) => void;
  lastSaveTime: number | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  handleSave: () => void;
  handleSaveAndNew: () => void;
  clearSaveState: () => void;
  loadSavedState: (state: import('../types/calculator').CalculationState, modelName: string, modelLink: string, note: string) => void;
}

export const useSaveManager = (
  options: SaveManagerOptions,
  onSaved?: (toast: { title: string; description?: string; color: string }) => void,
  onError?: (toast: { title: string; description?: string; color: string }) => void
): SaveManagerState => {
  const {
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
  } = options;

  // Auto-save state
  const [autoSaveId, setAutoSaveId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTO_SAVE_ID_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to load auto-save ID:', error);
      return null;
    }
  });

  const [lastSaveTime, setLastSaveTime] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(LAST_SAVE_TIME_STORAGE_KEY);
      return stored ? parseInt(stored, 10) : null;
    } catch (error) {
      console.error('Failed to load last save time:', error);
      return null;
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isInitialMount = useRef(true);
  const skipNextAutoSave = useRef(false);
  const savedSnapshotRef = useRef<string | null>(null);

  // Save autoSaveId to localStorage when changed
  useEffect(() => {
    try {
      if (autoSaveId) {
        localStorage.setItem(AUTO_SAVE_ID_STORAGE_KEY, autoSaveId);
      } else {
        localStorage.removeItem(AUTO_SAVE_ID_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save auto-save ID:', error);
    }
  }, [autoSaveId]);

  // Save lastSaveTime to localStorage when changed
  useEffect(() => {
    try {
      if (lastSaveTime) {
        localStorage.setItem(LAST_SAVE_TIME_STORAGE_KEY, lastSaveTime.toString());
      } else {
        localStorage.removeItem(LAST_SAVE_TIME_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save last save time:', error);
    }
  }, [lastSaveTime]);

  // Track unsaved changes by comparing current state snapshot against saved snapshot
  useEffect(() => {
    if (isSaving) return;

    const hasContent = !isEmptyForm || !!modelName || !!modelLink || !!note;
    if (!hasContent) {
      setHasUnsavedChanges(false);
      return;
    }

    const currentSnapshot = JSON.stringify({ currentState, modelName, modelLink, note });
    setHasUnsavedChanges(savedSnapshotRef.current !== currentSnapshot);
  }, [currentState, isEmptyForm, modelName, modelLink, note, isSaving]);

  // Auto-save calculator state to history (debounced)
  useDebouncedEffect(
    () => {
      // Skip auto-save on initial mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      // Skip auto-save if flag is set (e.g., after Save and Create New)
      if (skipNextAutoSave.current) {
        skipNextAutoSave.current = false;
        return;
      }

      // Check if we need to save RIGHT NOW (not when debounce was triggered)
      // This prevents saving after manual save cleared the IDs
      if (!hasUnsavedChanges) {
        return;
      }

      // Don't auto-save if form is empty (all defaults) and no model info
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
        savedSnapshotRef.current = JSON.stringify({ currentState, modelName, modelLink, note });
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    },
    15000, // 15 second debounce delay
    [currentState, modelName, modelLink, note, editingId, isSaving, upsertCalculation, isEmptyForm, autoSaveId, hasUnsavedChanges]
  );

  // Manual save handler
  const handleSave = useCallback(() => {
    // Don't save if form is empty (all defaults) and no model info
    if (isEmptyForm && !modelName && !modelLink && !note) {
      onError?.({
        title: 'Cannot save empty form',
        description: 'Please fill in at least one field or add model information',
        color: 'warning',
      });
      return;
    }

    // Prevent concurrent saves
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing entry (from edit mode)
        updateCalculation(editingId, currentState, result, note, modelName, modelLink);
        onSaved?.({
          title: 'Calculation updated successfully!',
          description: modelName || 'Changes saved',
          color: 'success',
        });
      } else if (autoSaveId) {
        // User clicked "Save" on an auto-saved draft - update it
        updateCalculation(autoSaveId, currentState, result, note, modelName, modelLink);
        // Keep autoSaveId so subsequent saves update the same entry
        onSaved?.({
          title: 'Calculation saved successfully!',
          description: modelName || 'Added to history',
          color: 'success',
        });
      } else {
        // Create new entry (no auto-save draft exists)
        const newId = addCalculation(currentState, result, note, modelName, modelLink);
        // Set autoSaveId to prevent duplicate saves on multiple clicks
        setAutoSaveId(newId);
        onSaved?.({
          title: 'Calculation saved successfully!',
          description: modelName || 'Added to history',
          color: 'success',
        });
      }
      setLastSaveTime(Date.now());
      savedSnapshotRef.current = JSON.stringify({ currentState, modelName, modelLink, note });
    } finally {
      setIsSaving(false);
    }
  }, [
    isEmptyForm,
    modelName,
    modelLink,
    note,
    isSaving,
    editingId,
    autoSaveId,
    currentState,
    result,
    updateCalculation,
    addCalculation,
    onSaved,
    onError,
  ]);

  // Save and create new handler - saves current item, then prepares for new one
  const handleSaveAndNew = useCallback(() => {
    // Don't save if form is empty
    if (isEmptyForm && !modelName && !modelLink && !note) {
      onError?.({
        title: 'Cannot save empty form',
        description: 'Please fill in at least one field or add model information',
        color: 'warning',
      });
      return;
    }

    // Save current item (update if editing/has autoSaveId, otherwise create new)
    if (editingId) {
      updateCalculation(editingId, currentState, result, note, modelName, modelLink);
    } else if (autoSaveId) {
      updateCalculation(autoSaveId, currentState, result, note, modelName, modelLink);
    } else {
      addCalculation(currentState, result, note, modelName, modelLink);
    }

    // Clear identifiers to prepare for a NEW calculation on next save
    setAutoSaveId(null);
    setLastSaveTime(null);
    savedSnapshotRef.current = null;

    // Skip the next auto-save since we just saved and nothing changed yet
    skipNextAutoSave.current = true;

    onSaved?.({
      title: 'Calculation saved successfully!',
      description: modelName || 'Added to history',
      color: 'success',
    });
  }, [isEmptyForm, modelName, modelLink, note, editingId, autoSaveId, currentState, result, updateCalculation, addCalculation, onSaved, onError]);

  // Clear save state (used when loading from history or canceling)
  const clearSaveState = useCallback(() => {
    setAutoSaveId(null);
    setLastSaveTime(null);
    savedSnapshotRef.current = null;
  }, []);

  // Load a saved state for editing — snapshots it so indicator starts green
  const loadSavedState = useCallback((
    state: import('../types/calculator').CalculationState,
    mName: string,
    mLink: string,
    n: string
  ) => {
    setAutoSaveId(null);
    setLastSaveTime(null);
    savedSnapshotRef.current = JSON.stringify({ currentState: state, modelName: mName, modelLink: mLink, note: n });
  }, []);

  return {
    autoSaveId,
    setAutoSaveId,
    lastSaveTime,
    isSaving,
    hasUnsavedChanges,
    handleSave,
    handleSaveAndNew,
    clearSaveState,
    loadSavedState,
  };
};
