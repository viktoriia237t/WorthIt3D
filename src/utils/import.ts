import Papa from 'papaparse';
import type { CalculationHistory, CalculationState, CalculationResult } from '../types/calculator';

/**
 * Safely parse a number with fallback to default value
 */
function parseNumber(value: any, defaultValue: number = 0): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
}

/**
 * Safely parse a boolean value
 */
function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === '1';
  }
  return Boolean(value);
}

/**
 * Parse date string to timestamp
 */
function parseDate(dateStr: string): number {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? Date.now() : date.getTime();
}

/**
 * Validate a CalculationHistory item
 */
function validateCalculationHistory(item: any): CalculationHistory {
  // Check required fields
  if (!item.id || !item.timestamp || !item.state || !item.result) {
    throw new Error('Missing required fields: id, timestamp, state, or result');
  }

  // Validate state structure
  const requiredStateFields = [
    'weight',
    'spoolPrice',
    'spoolWeight',
    'printTime',
    'prepTime',
    'postTime',
    'powerConsumption',
    'electricityTariff',
    'printerPrice',
    'lifespan',
    'nozzlePrice',
    'nozzleLifespan',
    'bedPrice',
    'bedLifespan',
    'hourlyRate',
    'failureRate',
    'markup',
    'consumables',
  ];

  for (const field of requiredStateFields) {
    if (item.state[field] === undefined || item.state[field] === null) {
      throw new Error(`Missing required state field: ${field}`);
    }
  }

  // Validate result structure
  const requiredResultFields = [
    'materialCost',
    'electricityCost',
    'depreciationCost',
    'nozzleWearCost',
    'bedWearCost',
    'laborCost',
    'consumablesCost',
    'customExpensesCost',
    'subtotal',
    'totalCost',
    'finalPrice',
    'profit',
  ];

  for (const field of requiredResultFields) {
    if (item.result[field] === undefined || item.result[field] === null) {
      throw new Error(`Missing required result field: ${field}`);
    }
  }

  return item as CalculationHistory;
}

/**
 * Import calculation history from JSON file
 */
export async function importFromJSON(file: File): Promise<CalculationHistory[]> {
  const text = await file.text();

  let data: any;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }

  // Validate structure
  if (!Array.isArray(data)) {
    throw new Error('Invalid format: expected array of calculations');
  }

  // Validate each entry
  const validated: CalculationHistory[] = [];
  for (let i = 0; i < data.length; i++) {
    try {
      const item = validateCalculationHistory(data[i]);
      validated.push(item);
    } catch (error) {
      throw new Error(`Item ${i + 1}: ${(error as Error).message}`);
    }
  }

  return validated;
}

/**
 * Import calculation history from CSV file
 */
export async function importFromCSV(file: File): Promise<CalculationHistory[]> {
  const text = await file.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const calculations: CalculationHistory[] = results.data.map((row: any) => {
            // Parse state
            const state: CalculationState = {
              weight: parseNumber(row['Weight(g)']),
              spoolPrice: parseNumber(row['Spool Price']),
              spoolWeight: parseNumber(row['Spool Weight']),
              printTime: parseNumber(row['Print Time(h)']),
              prepTime: parseNumber(row['Prep Time(h)']),
              postTime: parseNumber(row['Post Time(h)']),
              powerConsumption: parseNumber(row['Power(kW)']),
              electricityTariff: parseNumber(row['Tariff']),
              printerPrice: parseNumber(row['Printer Price']),
              lifespan: parseNumber(row['Lifespan(h)']),
              nozzlePrice: parseNumber(row['Nozzle Price']),
              nozzleLifespan: parseNumber(row['Nozzle Life(h)']),
              bedPrice: parseNumber(row['Bed Price']),
              bedLifespan: parseNumber(row['Bed Life(h)']),
              hourlyRate: parseNumber(row['Hourly Rate']),
              failureRate: parseNumber(row['Failure Rate'], 1.0),
              markup: parseNumber(row['Markup'], 1.0),
              consumables: parseNumber(row['Consumables']),
              customExpenses: [], // CSV doesn't preserve custom expenses array
              includeOlxFee: parseBoolean(row['Include OLX']),
            };

            // Parse result
            const result: CalculationResult = {
              materialCost: parseNumber(row['Material Cost']),
              electricityCost: parseNumber(row['Electricity Cost']),
              depreciationCost: parseNumber(row['Depreciation']),
              nozzleWearCost: parseNumber(row['Nozzle Wear']),
              bedWearCost: parseNumber(row['Bed Wear']),
              laborCost: parseNumber(row['Labor Cost']),
              consumablesCost: parseNumber(row['Consumables Cost']),
              customExpensesCost: parseNumber(row['Custom Expenses']),
              subtotal: parseNumber(row['Subtotal']),
              totalCost: parseNumber(row['Total Cost']),
              finalPrice: parseNumber(row['Final Price']),
              profit: parseNumber(row['Profit']),
              olxPrice: parseNumber(row['OLX Price']),
              olxProfit: parseNumber(row['OLX Profit']),
            };

            // Build calculation history item
            const calculation: CalculationHistory = {
              id: row['ID'] || `calc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              timestamp: row['Date'] ? parseDate(row['Date']) : Date.now(),
              state,
              result,
              note: row['Note'] || undefined,
              modelName: row['Model Name'] || undefined,
              modelLink: row['Model Link'] || undefined,
              pinned: parseBoolean(row['Pinned']),
            };

            return calculation;
          });

          resolve(calculations);
        } catch (error) {
          reject(new Error(`CSV parsing error: ${(error as Error).message}`));
        }
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Detect duplicate IDs between existing and imported data
 */
export function detectDuplicates(
  existing: CalculationHistory[],
  imported: CalculationHistory[]
): { duplicates: number; newEntries: number } {
  const existingIds = new Set(existing.map((h) => h.id));
  const duplicateCount = imported.filter((h) => existingIds.has(h.id)).length;
  const newCount = imported.length - duplicateCount;

  return {
    duplicates: duplicateCount,
    newEntries: newCount,
  };
}
