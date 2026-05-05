import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCalculator } from '../../hooks/useCalculator';
import type { CalculationState } from '../../types/calculator';
import { DEFAULT_CALCULATION_STATE } from '../../types/calculator';

describe('useCalculator', () => {
  describe('Material Cost Calculation', () => {
    it('should calculate material cost correctly', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 1000 }],
      };

      const { result } = renderHook(() => useCalculator(state));

      // (100 * 800) / 1000 = 80
      expect(result.current.materialCost).toBe(80);
    });

    it('should return 0 when spool weight is 0 (avoid division by zero)', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 0 }],
      };

      const { result } = renderHook(() => useCalculator(state));

      expect(result.current.materialCost).toBe(0);
    });

    it('should handle zero weight', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 0, spoolPrice: 800, spoolWeight: 1000 }],
      };

      const { result } = renderHook(() => useCalculator(state));

      expect(result.current.materialCost).toBe(0);
    });
  });

  describe('Electricity Cost Calculation', () => {
    it('should calculate printer electricity cost only when dryer consumption is 0', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        printTime: 5, // hours
        powerConsumption: 0.3, // kW
        dryerConsumption: 0, // kW
        electricityTariff: 4, // UAH per kWh
      };

      const { result } = renderHook(() => useCalculator(state));

      // 5 * 0.3 * 4 = 6
      expect(result.current.electricityCost).toBe(6);
    });

    it('should calculate combined electricity cost with dryer when dryTime is set separately', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        printTime: 5, // hours
        powerConsumption: 0.3, // kW
        dryerConsumption: 0.2, // kW
        dryTime: 3, // hours
        dryDuringPrint: false,
        electricityTariff: 4, // UAH per kWh
      };

      const { result } = renderHook(() => useCalculator(state));

      // Printer: 5 * 0.3 * 4 = 6
      // Dryer: 3 * 0.2 * 4 = 2.4
      // Total: 6 + 2.4 = 8.4
      expect(result.current.electricityCost).toBe(8.4);
    });

    it('should use printTime as dryTime when dryDuringPrint is true', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        printTime: 5, // hours
        powerConsumption: 0.3, // kW
        dryerConsumption: 0.2, // kW
        dryTime: 10, // hours (should be ignored)
        dryDuringPrint: true,
        electricityTariff: 4, // UAH per kWh
      };

      const { result } = renderHook(() => useCalculator(state));

      // Printer: 5 * 0.3 * 4 = 6
      // Dryer: 5 * 0.2 * 4 = 4 (uses printTime, not dryTime)
      // Total: 6 + 4 = 10
      expect(result.current.electricityCost).toBe(10);
    });

    it('should not add dryer cost when dryerConsumption is 0 even if dryTime is set', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        printTime: 5,
        powerConsumption: 0.3,
        dryerConsumption: 0,
        dryTime: 3,
        dryDuringPrint: false,
        electricityTariff: 4,
      };

      const { result } = renderHook(() => useCalculator(state));

      // Only printer cost: 5 * 0.3 * 4 = 6
      expect(result.current.electricityCost).toBe(6);
    });
  });

  describe('Depreciation Cost Calculation', () => {
    it('should calculate printer depreciation correctly', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        printerPrice: 10000, // UAH
        lifespan: 2000, // hours
        printTime: 5, // hours
      };

      const { result } = renderHook(() => useCalculator(state));

      // (10000 / 2000) * 5 = 25
      expect(result.current.depreciationCost).toBe(25);
    });

    it('should return 0 when lifespan is 0 (avoid division by zero)', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        printerPrice: 10000,
        lifespan: 0,
        printTime: 5,
      };

      const { result } = renderHook(() => useCalculator(state));

      expect(result.current.depreciationCost).toBe(0);
    });

    it('should calculate nozzle wear correctly', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        nozzlePrice: 100, // UAH
        nozzleLifespan: 500, // hours
        printTime: 5, // hours
      };

      const { result } = renderHook(() => useCalculator(state));

      // (100 / 500) * 5 = 1
      expect(result.current.nozzleWearCost).toBe(1);
    });

    it('should calculate bed wear correctly', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        bedPrice: 300, // UAH
        bedLifespan: 1000, // hours
        printTime: 5, // hours
      };

      const { result } = renderHook(() => useCalculator(state));

      // (300 / 1000) * 5 = 1.5
      expect(result.current.bedWearCost).toBe(1.5);
    });
  });

  describe('Labor Cost Calculation', () => {
    it('should calculate labor cost from prep and post time', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        prepTime: 0.5, // hours
        postTime: 1, // hours
        hourlyRate: 100, // UAH per hour
      };

      const { result } = renderHook(() => useCalculator(state));

      // (0.5 + 1) * 100 = 150
      expect(result.current.laborCost).toBe(150);
    });

    it('should return 0 when no prep or post time', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        prepTime: 0,
        postTime: 0,
        hourlyRate: 100,
      };

      const { result } = renderHook(() => useCalculator(state));

      expect(result.current.laborCost).toBe(0);
    });
  });

  describe('Consumables and Custom Expenses', () => {
    it('should include consumables cost', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        consumables: 50,
      };

      const { result } = renderHook(() => useCalculator(state));

      expect(result.current.consumablesCost).toBe(50);
    });

    it('should calculate total custom expenses', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        customExpenses: [
          { id: '1', name: 'Packaging', amount: 20, includeInFee: true, perItem: true },
          { id: '2', name: 'Shipping', amount: 30, includeInFee: false, perItem: true },
        ],
      };

      const { result } = renderHook(() => useCalculator(state));

      // 20 + 30 = 50
      expect(result.current.customExpensesCost).toBe(50);
    });

    it('should include expenses with includeInFee=true in subtotal', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 1000 }],
        customExpenses: [
          { id: '1', name: 'Material', amount: 20, includeInFee: true, perItem: true },
          { id: '2', name: 'Service', amount: 30, includeInFee: false, perItem: true },
        ],
      };

      const { result } = renderHook(() => useCalculator(state));

      // Material cost: 80
      // Base expense (includeInFee=true): 20
      // Subtotal: 80 + 20 = 100
      expect(result.current.subtotal).toBe(100);
    });
  });

  describe('Failure Rate Calculation', () => {
    it('should apply failure rate correctly', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 1000 }],
        failureRate: 10, // 10%
      };

      const { result } = renderHook(() => useCalculator(state));

      // Material cost: 80
      // Subtotal: 80
      // With 10% failure rate: 80 + (80 * 0.1) = 88
      expect(result.current.totalCost).toBe(88);
    });

    it('should not apply failure rate when it is 0', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 1000 }],
        failureRate: 0,
      };

      const { result } = renderHook(() => useCalculator(state));

      expect(result.current.totalCost).toBe(80);
    });
  });

  describe('Markup and Final Price Calculation', () => {
    it('should apply markup correctly', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 1000 }],
        markup: 100, // 100% = 1x
        prepTime: 1,
        hourlyRate: 100,
      };

      const { result } = renderHook(() => useCalculator(state));

      // Material cost: 80
      // Total cost: 80 (no failure rate)
      // With 100% markup: 80 * 1 = 80
      // Labor: 100
      // Final: 80 + 100 = 180
      expect(result.current.finalPrice).toBe(180);
    });

    it('should add fee expenses (includeInFee=false) to final price', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 1000 }],
        markup: 100,
        customExpenses: [
          { id: '1', name: 'Fee', amount: 50, includeInFee: false, perItem: true },
        ],
      };

      const { result } = renderHook(() => useCalculator(state));

      // Material: 80
      // Total cost: 80
      // With markup: 80 * 1 = 80
      // Fee expense: 50
      // Final: 80 + 50 = 130
      expect(result.current.finalPrice).toBe(130);
    });

    it('should calculate profit correctly', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 1000 }],
        markup: 200, // 200% = 2x
      };

      const { result } = renderHook(() => useCalculator(state));

      // Total cost: 80
      // Final price: 80 * 2 = 160
      // Profit: 160 - 80 = 80
      expect(result.current.profit).toBe(80);
    });
  });

  describe('OLX Fee Calculation', () => {
    it('should calculate OLX price when enabled', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 1000 }],
        markup: 100,
        includeOlxFee: true,
      };

      const { result } = renderHook(() => useCalculator(state));

      // Final price: 80
      // OLX: 80 * 1.02 + 20 = 101.6
      expect(result.current.olxPrice).toBe(101.6);
    });

    it('should return 0 for OLX price when disabled', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 1000 }],
        includeOlxFee: false,
      };

      const { result } = renderHook(() => useCalculator(state));

      expect(result.current.olxPrice).toBe(0);
    });

    it('should calculate OLX profit correctly', () => {
      const state: CalculationState = {
        ...DEFAULT_CALCULATION_STATE,
        filaments: [{ id: 'test', name: '', weight: 100, spoolPrice: 800, spoolWeight: 1000 }],
        markup: 100,
        includeOlxFee: true,
      };

      const { result } = renderHook(() => useCalculator(state));

      // Total cost: 80
      // Final price: 80
      // OLX price: 101.6
      // OLX profit: 101.6 - 80 = 21.6
      expect(result.current.olxProfit).toBeCloseTo(21.6, 2);
    });
  });

  describe('Complex Scenario', () => {
    it('should calculate complete scenario correctly', () => {
      const state: CalculationState = {
        // Materials
        filaments: [{ id: 'test', name: '', weight: 150, spoolPrice: 1000, spoolWeight: 1000 }],
        // Time
        printTime: 10,
        prepTime: 0.5,
        postTime: 1.5,
        dryTime: 5,
        dryDuringPrint: false,
        // Electricity
        powerConsumption: 0.3,
        dryerConsumption: 0.15,
        electricityTariff: 4.5,
        // Depreciation
        printerPrice: 15000,
        lifespan: 3000,
        nozzlePrice: 150,
        nozzleLifespan: 600,
        bedPrice: 400,
        bedLifespan: 1200,
        // Labor
        hourlyRate: 120,
        // Business
        failureRate: 8,
        markup: 150,
        // Additional
        consumables: 25,
        customExpenses: [
          { id: '1', name: 'Packaging', amount: 15, includeInFee: true, perItem: true },
          { id: '2', name: 'Delivery', amount: 50, includeInFee: false, perItem: true },
        ],
        includeOlxFee: true,
        olxFeePerItem: true,
        // Batch
        batchCount: 1,
        weightPerModel: true,
      };

      const { result } = renderHook(() => useCalculator(state));

      // Material: (150 * 1000) / 1000 = 150
      // Electricity: (10 * 0.3 * 4.5) + (5 * 0.15 * 4.5) = 13.5 + 3.375 = 16.875
      // Depreciation: (15000 / 3000) * 10 = 50
      // Nozzle: (150 / 600) * 10 = 2.5
      // Bed: (400 / 1200) * 10 = 3.333...
      // Labor: (0.5 + 1.5) * 120 = 240
      // Consumables: 25
      // Base custom expense: 15
      // Subtotal: 150 + 16.875 + 50 + 2.5 + 3.333... + 25 + 15 = 262.708...
      // Total cost with 8% failure: 262.708... * 1.08 = 283.725...
      // Final price with markup: 283.725... * 1.5 = 425.5875
      // Final price: 425.5875 + 240 (labor) + 50 (fee expense) = 715.5875
      // Profit: 715.5875 - 283.725... = 431.8625
      // OLX: 715.5875 * 1.02 + 20 = 749.899...

      expect(result.current.materialCost).toBe(150);
      expect(result.current.electricityCost).toBeCloseTo(16.875, 2);
      expect(result.current.depreciationCost).toBe(50);
      expect(result.current.nozzleWearCost).toBe(2.5);
      expect(result.current.bedWearCost).toBeCloseTo(3.333, 2);
      expect(result.current.laborCost).toBe(240);
      expect(result.current.consumablesCost).toBe(25);
      expect(result.current.customExpensesCost).toBe(65);
      expect(result.current.subtotal).toBeCloseTo(262.708, 2);
      expect(result.current.totalCost).toBeCloseTo(283.725, 2);
      expect(result.current.finalPrice).toBeCloseTo(715.5875, 2);
      expect(result.current.profit).toBeCloseTo(431.8625, 2);
      expect(result.current.olxPrice).toBeCloseTo(749.899, 2);
    });
  });
});
