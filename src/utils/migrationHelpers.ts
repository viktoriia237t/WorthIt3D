import type { CalculationState } from '../types/calculator';

export function migrateCalculationState(raw: any): CalculationState {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  // Already new format
  if (Array.isArray(raw.filaments) && raw.filaments.length > 0) {
    return raw as CalculationState;
  }

  // Old format: migrate flat weight/spoolPrice/spoolWeight fields to filaments array
  const { weight, spoolPrice, spoolWeight, ...rest } = raw;
  return {
    ...rest,
    filaments: [{
      id: 'fil-migrated',
      name: '',
      weight: weight ?? 0,
      spoolPrice: spoolPrice ?? 0,
      spoolWeight: spoolWeight ?? 0,
    }],
  } as CalculationState;
}
