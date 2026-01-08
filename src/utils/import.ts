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
    // Check if file has system headers comment line
    const lines = text.split('\n');
    let systemHeaders: string[] | null = null;
    let csvText = text;

    // Extract system headers if present (first line starting with #)
    if (lines[0]?.trim().startsWith('#')) {
      const headerLine = lines[0].substring(1).trim(); // Remove # prefix
      systemHeaders = headerLine.split(',').map(h => h.trim());
      // Remove comment line from CSV for parsing
      csvText = lines.slice(1).join('\n');
    }

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      comments: '#', // Skip any other comment lines
      complete: (results) => {
        try {
          const calculations: CalculationHistory[] = results.data.map((row: any) => {
            // If we have system headers, remap the row using them
            let mappedRow = row;
            if (systemHeaders && results.meta.fields) {
              mappedRow = {};
              results.meta.fields.forEach((translatedHeader: string, i: number) => {
                const systemHeader = systemHeaders[i];
                mappedRow[systemHeader] = row[translatedHeader];
              });
            }

            // Parse state
            const state: CalculationState = {
              weight: parseNumber(mappedRow['Weight(g)']),
              spoolPrice: parseNumber(mappedRow['Spool Price']),
              spoolWeight: parseNumber(mappedRow['Spool Weight']),
              printTime: parseNumber(mappedRow['Print Time(h)']),
              prepTime: parseNumber(mappedRow['Prep Time(h)']),
              postTime: parseNumber(mappedRow['Post Time(h)']),
              powerConsumption: parseNumber(mappedRow['Power(kW)']),
              electricityTariff: parseNumber(mappedRow['Tariff']),
              printerPrice: parseNumber(mappedRow['Printer Price']),
              lifespan: parseNumber(mappedRow['Lifespan(h)']),
              nozzlePrice: parseNumber(mappedRow['Nozzle Price']),
              nozzleLifespan: parseNumber(mappedRow['Nozzle Life(h)']),
              bedPrice: parseNumber(mappedRow['Bed Price']),
              bedLifespan: parseNumber(mappedRow['Bed Life(h)']),
              hourlyRate: parseNumber(mappedRow['Hourly Rate']),
              failureRate: parseNumber(mappedRow['Failure Rate'], 1.0),
              markup: parseNumber(mappedRow['Markup'], 100),
              consumables: parseNumber(mappedRow['Consumables']),
              customExpenses: [], // CSV doesn't preserve custom expenses array
              includeOlxFee: parseBoolean(mappedRow['Include OLX']),
            };

            // Parse result
            const result: CalculationResult = {
              materialCost: parseNumber(mappedRow['Material Cost']),
              electricityCost: parseNumber(mappedRow['Electricity Cost']),
              depreciationCost: parseNumber(mappedRow['Depreciation']),
              nozzleWearCost: parseNumber(mappedRow['Nozzle Wear']),
              bedWearCost: parseNumber(mappedRow['Bed Wear']),
              laborCost: parseNumber(mappedRow['Labor Cost']),
              consumablesCost: parseNumber(mappedRow['Consumables Cost']),
              customExpensesCost: parseNumber(mappedRow['Custom Expenses']),
              subtotal: parseNumber(mappedRow['Subtotal']),
              totalCost: parseNumber(mappedRow['Total Cost']),
              finalPrice: parseNumber(mappedRow['Final Price']),
              profit: parseNumber(mappedRow['Profit']),
              olxPrice: parseNumber(mappedRow['OLX Price']),
              olxProfit: parseNumber(mappedRow['OLX Profit']),
            };

            // Build calculation history item
            const calculation: CalculationHistory = {
              id: mappedRow['ID'] || `calc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              timestamp: mappedRow['Date'] ? parseDate(mappedRow['Date']) : Date.now(),
              state,
              result,
              note: mappedRow['Note'] || undefined,
              modelName: mappedRow['Model Name'] || undefined,
              modelLink: mappedRow['Model Link'] || undefined,
              pinned: parseBoolean(mappedRow['Pinned']),
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
