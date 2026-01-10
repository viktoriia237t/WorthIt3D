import { useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_CALCULATION_STATE } from '../types/calculator';
import type { CalculationState } from '../types/calculator';

const CURRENT_MODEL_STORAGE_KEY = 'current-model-info';
const CURRENT_STATE_STORAGE_KEY = 'current-calculator-state';
const EDITING_ID_STORAGE_KEY = 'current-editing-id';

interface CalculationManagerState {
  // Calculator state
  currentState: CalculationState;
  setCurrentState: (state: CalculationState) => void;

  // Model info
  modelName: string;
  setModelName: (name: string) => void;
  modelLink: string;
  setModelLink: (link: string) => void;
  note: string;
  setNote: (note: string) => void;

  // Edit mode
  editingId: string | null;
  setEditingId: (id: string | null) => void;

  // Helpers
  isEmptyForm: boolean;
  loadCalculation: (id: string, calculation: { state: CalculationState; note?: string; modelName?: string; modelLink?: string }) => void;
  clearForm: () => void;
  cancelEdit: () => void;
}

export const useCalculationManager = (): CalculationManagerState => {
  // Calculator state
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

  // Model info
  const [modelName, setModelName] = useState('');
  const [modelLink, setModelLink] = useState('');
  const [note, setNote] = useState('');

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(EDITING_ID_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to load editing ID:', error);
      return null;
    }
  });

  // Load model info from localStorage on mount
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

  // Save model info to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_MODEL_STORAGE_KEY, JSON.stringify({ modelName, modelLink }));
    } catch (error) {
      console.error('Failed to save current model info:', error);
    }
  }, [modelName, modelLink]);

  // Save calculator state to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_STATE_STORAGE_KEY, JSON.stringify(currentState));
    } catch (error) {
      console.error('Failed to save current state:', error);
    }
  }, [currentState]);

  // Save editingId to localStorage when changed
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

  // Check if form is empty
  const isEmptyForm = useMemo(
    () => JSON.stringify(currentState) === JSON.stringify(DEFAULT_CALCULATION_STATE),
    [currentState]
  );

  // Load a calculation from history
  const loadCalculation = useCallback((
    id: string,
    calculation: { state: CalculationState; note?: string; modelName?: string; modelLink?: string }
  ) => {
    setCurrentState(calculation.state);
    setNote(calculation.note || '');
    setModelName(calculation.modelName || '');
    setModelLink(calculation.modelLink || '');
    setEditingId(id);
  }, []);

  // Clear form and reset to defaults
  const clearForm = useCallback(() => {
    setCurrentState(DEFAULT_CALCULATION_STATE);
    setNote('');
    setModelName('');
    setModelLink('');
    setEditingId(null);
  }, []);

  // Cancel edit mode and clear form
  const cancelEdit = useCallback(() => {
    clearForm();
  }, [clearForm]);

  return {
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
  };
};
