import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalculationHistory } from '../../hooks/useCalculationHistory';
import { DEFAULT_CALCULATION_STATE } from '../../types/calculator';
import type { CalculationState, CalculationResult, CalculationHistory } from '../../types/calculator';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCalculationHistory', () => {
  const mockState: CalculationState = {
    ...DEFAULT_CALCULATION_STATE,
    weight: 100,
    spoolPrice: 800,
    spoolWeight: 1000,
  };

  const mockResult: CalculationResult = {
    materialCost: 80,
    electricityCost: 10,
    depreciationCost: 5,
    nozzleWearCost: 1,
    bedWearCost: 1,
    laborCost: 50,
    consumablesCost: 0,
    customExpensesCost: 0,
    subtotal: 97,
    totalCost: 97,
    finalPrice: 194,
    profit: 97,
    olxPrice: 0,
    olxProfit: 0,
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty history', () => {
      const { result } = renderHook(() => useCalculationHistory());
      expect(result.current.history).toEqual([]);
    });

    it('should load history from localStorage on mount', () => {
      const existingHistory: CalculationHistory[] = [
        {
          id: 'calc-1',
          timestamp: 1000,
          state: mockState,
          result: mockResult,
          modelName: 'Test Model',
        },
      ];

      localStorageMock.setItem('3d-calculator-history', JSON.stringify(existingHistory));

      const { result } = renderHook(() => useCalculationHistory());
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].id).toBe('calc-1');
      expect(result.current.history[0].modelName).toBe('Test Model');
    });

    it('should sort history by timestamp descending on load', () => {
      const existingHistory: CalculationHistory[] = [
        { id: 'calc-1', timestamp: 1000, state: mockState, result: mockResult },
        { id: 'calc-2', timestamp: 3000, state: mockState, result: mockResult },
        { id: 'calc-3', timestamp: 2000, state: mockState, result: mockResult },
      ];

      localStorageMock.setItem('3d-calculator-history', JSON.stringify(existingHistory));

      const { result } = renderHook(() => useCalculationHistory());
      expect(result.current.history[0].id).toBe('calc-2'); // Newest first
      expect(result.current.history[1].id).toBe('calc-3');
      expect(result.current.history[2].id).toBe('calc-1');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem('3d-calculator-history', 'invalid json');

      const { result } = renderHook(() => useCalculationHistory());
      expect(result.current.history).toEqual([]);
    });
  });

  describe('addCalculation', () => {
    it('should add a new calculation to history', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let newId: string;
      act(() => {
        newId = result.current.addCalculation(
          mockState,
          mockResult,
          'Test note',
          'Test Model',
          'https://example.com'
        );
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].id).toBe(newId!);
      expect(result.current.history[0].modelName).toBe('Test Model');
      expect(result.current.history[0].note).toBe('Test note');
      expect(result.current.history[0].modelLink).toBe('https://example.com');
    });

    it('should add new calculations to the front of the list', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let firstId: string, secondId: string;

      act(() => {
        firstId = result.current.addCalculation(mockState, mockResult, 'First');
      });

      act(() => {
        secondId = result.current.addCalculation(mockState, mockResult, 'Second');
      });

      expect(result.current.history[0].id).toBe(secondId!);
      expect(result.current.history[1].id).toBe(firstId!);
    });

    it('should generate unique IDs', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id1: string, id2: string;

      act(() => {
        id1 = result.current.addCalculation(mockState, mockResult);
      });

      act(() => {
        id2 = result.current.addCalculation(mockState, mockResult);
      });

      expect(id1).not.toBe(id2);
    });

    it('should save to localStorage after adding', () => {
      const { result } = renderHook(() => useCalculationHistory());

      act(() => {
        result.current.addCalculation(mockState, mockResult, 'Test');
      });

      const stored = localStorageMock.getItem('3d-calculator-history');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].note).toBe('Test');
    });
  });

  describe('deleteCalculation', () => {
    it('should delete a calculation by id', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id: string;
      act(() => {
        id = result.current.addCalculation(mockState, mockResult);
      });

      expect(result.current.history).toHaveLength(1);

      act(() => {
        result.current.deleteCalculation(id!);
      });

      expect(result.current.history).toHaveLength(0);
    });

    it('should not affect other calculations when deleting one', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id1: string, id2: string;

      act(() => {
        id1 = result.current.addCalculation(mockState, mockResult, 'First');
        id2 = result.current.addCalculation(mockState, mockResult, 'Second');
      });

      act(() => {
        result.current.deleteCalculation(id1!);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].id).toBe(id2!);
    });

    it('should handle deleting non-existent id gracefully', () => {
      const { result } = renderHook(() => useCalculationHistory());

      act(() => {
        result.current.addCalculation(mockState, mockResult);
      });

      expect(() => {
        act(() => {
          result.current.deleteCalculation('non-existent-id');
        });
      }).not.toThrow();

      expect(result.current.history).toHaveLength(1);
    });
  });

  describe('updateCalculation', () => {
    it('should update an existing calculation', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id: string;
      act(() => {
        id = result.current.addCalculation(mockState, mockResult, 'Original note');
      });

      const updatedState = { ...mockState, weight: 200 };
      const updatedResult = { ...mockResult, materialCost: 160 };

      act(() => {
        result.current.updateCalculation(
          id!,
          updatedState,
          updatedResult,
          'Updated note',
          'Updated Model'
        );
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].note).toBe('Updated note');
      expect(result.current.history[0].modelName).toBe('Updated Model');
      expect(result.current.history[0].state.weight).toBe(200);
      expect(result.current.history[0].result.materialCost).toBe(160);
    });

    it('should move updated calculation to the front', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id1: string, id2: string;

      act(() => {
        id1 = result.current.addCalculation(mockState, mockResult, 'First');
        id2 = result.current.addCalculation(mockState, mockResult, 'Second');
      });

      // id2 is at the front, id1 is second

      act(() => {
        result.current.updateCalculation(id1!, mockState, mockResult, 'Updated First');
      });

      // Now id1 should be at the front
      expect(result.current.history[0].id).toBe(id1!);
      expect(result.current.history[1].id).toBe(id2!);
    });

    it('should update timestamp when updating', async () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id: string;
      act(() => {
        id = result.current.addCalculation(mockState, mockResult);
      });

      const originalTimestamp = result.current.history[0].timestamp;

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      act(() => {
        result.current.updateCalculation(id!, mockState, mockResult);
      });

      expect(result.current.history[0].timestamp).toBeGreaterThanOrEqual(originalTimestamp);
    });
  });

  describe('clearHistory', () => {
    it('should clear all non-pinned calculations', () => {
      const { result } = renderHook(() => useCalculationHistory());

      act(() => {
        result.current.addCalculation(mockState, mockResult, 'Item 1');
        result.current.addCalculation(mockState, mockResult, 'Item 2');
        result.current.addCalculation(mockState, mockResult, 'Item 3');
      });

      expect(result.current.history).toHaveLength(3);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
    });

    it('should preserve pinned calculations when clearing', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id1: string, id2: string, id3: string;

      act(() => {
        id1 = result.current.addCalculation(mockState, mockResult, 'Item 1');
        id2 = result.current.addCalculation(mockState, mockResult, 'Item 2');
        id3 = result.current.addCalculation(mockState, mockResult, 'Item 3');
      });

      // Pin id2
      act(() => {
        result.current.togglePin(id2!);
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].id).toBe(id2!);
      expect(result.current.history[0].pinned).toBe(true);
    });
  });

  describe('togglePin', () => {
    it('should pin a calculation', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id: string;
      act(() => {
        id = result.current.addCalculation(mockState, mockResult);
      });

      act(() => {
        result.current.togglePin(id!);
      });

      expect(result.current.history[0].pinned).toBe(true);
    });

    it('should unpin a pinned calculation', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id: string;
      act(() => {
        id = result.current.addCalculation(mockState, mockResult);
      });

      act(() => {
        result.current.togglePin(id!);
      });

      expect(result.current.history[0].pinned).toBe(true);

      act(() => {
        result.current.togglePin(id!);
      });

      expect(result.current.history[0].pinned).toBe(false);
    });

    it('should sort pinned items to the front', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id1: string, id2: string, id3: string;

      act(() => {
        id1 = result.current.addCalculation(mockState, mockResult, 'Item 1');
        id2 = result.current.addCalculation(mockState, mockResult, 'Item 2');
        id3 = result.current.addCalculation(mockState, mockResult, 'Item 3');
      });

      // Order: id3, id2, id1 (newest first)

      // Pin id1 (oldest)
      act(() => {
        result.current.togglePin(id1!);
      });

      // id1 should now be at the front
      expect(result.current.history[0].id).toBe(id1!);
      expect(result.current.history[0].pinned).toBe(true);
    });
  });

  describe('getCalculation', () => {
    it('should retrieve a calculation by id', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id: string;
      act(() => {
        id = result.current.addCalculation(mockState, mockResult, 'Test note');
      });

      const retrieved = result.current.getCalculation(id!);
      expect(retrieved).toBeTruthy();
      expect(retrieved!.id).toBe(id!);
      expect(retrieved!.note).toBe('Test note');
    });

    it('should return undefined for non-existent id', () => {
      const { result } = renderHook(() => useCalculationHistory());

      const retrieved = result.current.getCalculation('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('upsertCalculation', () => {
    it('should create new calculation when id is null', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let newId: string;
      act(() => {
        newId = result.current.upsertCalculation(
          null,
          mockState,
          mockResult,
          'New item'
        );
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].id).toBe(newId!);
      expect(result.current.history[0].note).toBe('New item');
    });

    it('should update existing calculation when id exists', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let id: string;
      act(() => {
        id = result.current.addCalculation(mockState, mockResult, 'Original');
      });

      act(() => {
        result.current.upsertCalculation(id!, mockState, mockResult, 'Updated');
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].note).toBe('Updated');
    });

    it('should create new calculation when provided id does not exist', () => {
      const { result } = renderHook(() => useCalculationHistory());

      act(() => {
        result.current.upsertCalculation('non-existent-id', mockState, mockResult, 'New');
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].id).toBe('non-existent-id');
    });

    it('should return the saved id', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let returnedId: string;
      act(() => {
        returnedId = result.current.upsertCalculation(null, mockState, mockResult);
      });

      expect(returnedId!).toBeTruthy();
      expect(result.current.history[0].id).toBe(returnedId!);
    });
  });

  describe('importHistory', () => {
    it('should replace all history with replace strategy', () => {
      const { result } = renderHook(() => useCalculationHistory());

      act(() => {
        result.current.addCalculation(mockState, mockResult, 'Existing 1');
        result.current.addCalculation(mockState, mockResult, 'Existing 2');
      });

      const importData: CalculationHistory[] = [
        {
          id: 'import-1',
          timestamp: 5000,
          state: mockState,
          result: mockResult,
          note: 'Imported 1',
        },
        {
          id: 'import-2',
          timestamp: 6000,
          state: mockState,
          result: mockResult,
          note: 'Imported 2',
        },
      ];

      act(() => {
        result.current.importHistory(importData, 'replace');
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[0].note).toBe('Imported 2');
      expect(result.current.history[1].note).toBe('Imported 1');
    });

    it('should skip duplicates with skip strategy', () => {
      const { result } = renderHook(() => useCalculationHistory());

      act(() => {
        result.current.upsertCalculation('existing-id', mockState, mockResult, 'Existing');
      });

      const importData: CalculationHistory[] = [
        {
          id: 'existing-id',
          timestamp: 5000,
          state: mockState,
          result: mockResult,
          note: 'Should be skipped',
        },
        {
          id: 'new-id',
          timestamp: 6000,
          state: mockState,
          result: mockResult,
          note: 'Should be added',
        },
      ];

      act(() => {
        result.current.importHistory(importData, 'skip');
      });

      expect(result.current.history).toHaveLength(2);
      const existing = result.current.history.find(h => h.id === 'existing-id');
      expect(existing!.note).toBe('Existing'); // Not updated
      const newItem = result.current.history.find(h => h.id === 'new-id');
      expect(newItem!.note).toBe('Should be added');
    });

    it('should update duplicates with update strategy', () => {
      const { result } = renderHook(() => useCalculationHistory());

      let existingId: string;
      act(() => {
        existingId = result.current.upsertCalculation(
          'existing-id',
          mockState,
          mockResult,
          'Original'
        );
        result.current.togglePin(existingId);
      });

      const importData: CalculationHistory[] = [
        {
          id: 'existing-id',
          timestamp: 5000,
          state: mockState,
          result: mockResult,
          note: 'Updated from import',
          pinned: false, // This should be preserved from existing
        },
        {
          id: 'new-id',
          timestamp: 6000,
          state: mockState,
          result: mockResult,
          note: 'New item',
        },
      ];

      act(() => {
        result.current.importHistory(importData, 'update');
      });

      expect(result.current.history).toHaveLength(2);
      const updated = result.current.history.find(h => h.id === 'existing-id');
      expect(updated!.note).toBe('Updated from import');
      expect(updated!.pinned).toBe(true); // Preserved from existing
    });

    it('should sort imported history correctly', () => {
      const { result } = renderHook(() => useCalculationHistory());

      const importData: CalculationHistory[] = [
        {
          id: 'pinned-old',
          timestamp: 1000,
          state: mockState,
          result: mockResult,
          pinned: true,
        },
        {
          id: 'unpinned-new',
          timestamp: 5000,
          state: mockState,
          result: mockResult,
          pinned: false,
        },
        {
          id: 'unpinned-old',
          timestamp: 2000,
          state: mockState,
          result: mockResult,
          pinned: false,
        },
      ];

      act(() => {
        result.current.importHistory(importData, 'replace');
      });

      // Pinned items first, then sorted by timestamp descending
      expect(result.current.history[0].id).toBe('pinned-old');
      expect(result.current.history[1].id).toBe('unpinned-new');
      expect(result.current.history[2].id).toBe('unpinned-old');
    });
  });

  describe('localStorage persistence', () => {
    it('should persist history to localStorage on changes', () => {
      const { result } = renderHook(() => useCalculationHistory());

      act(() => {
        result.current.addCalculation(mockState, mockResult, 'Persist test');
      });

      const stored = localStorageMock.getItem('3d-calculator-history');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].note).toBe('Persist test');
    });

    it('should handle localStorage errors gracefully', () => {
      const { result } = renderHook(() => useCalculationHistory());

      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new Error('Storage quota exceeded');
      };

      expect(() => {
        act(() => {
          result.current.addCalculation(mockState, mockResult);
        });
      }).not.toThrow();

      // Restore original
      localStorageMock.setItem = originalSetItem;
    });
  });
});
