import type { CalculationHistory } from '../types/calculator';
import { apiFetch } from './client';

interface ApiCalculation {
  id: string;
  timestamp: number;
  state: CalculationHistory['state'];
  result: CalculationHistory['result'];
  note: string | null;
  modelName: string | null;
  modelLink: string | null;
  pinned: boolean;
}

function toHistory(calc: ApiCalculation): CalculationHistory {
  return {
    id: calc.id,
    timestamp: calc.timestamp,
    state: calc.state,
    result: calc.result,
    note: calc.note ?? undefined,
    modelName: calc.modelName ?? undefined,
    modelLink: calc.modelLink ?? undefined,
    pinned: calc.pinned,
  };
}

function toApiBody(calc: CalculationHistory) {
  return {
    id: calc.id,
    timestamp: calc.timestamp,
    state: calc.state,
    result: calc.result,
    note: calc.note ?? null,
    modelName: calc.modelName ?? null,
    modelLink: calc.modelLink ?? null,
    pinned: calc.pinned ?? false,
  };
}

export async function fetchCalculations(): Promise<CalculationHistory[]> {
  const data = await apiFetch<ApiCalculation[]>('/api/calculations');
  return data.map(toHistory);
}

export async function createCalculation(calc: CalculationHistory): Promise<CalculationHistory> {
  const data = await apiFetch<ApiCalculation>('/api/calculations', {
    method: 'POST',
    body: JSON.stringify(toApiBody(calc)),
  });
  return toHistory(data);
}

export async function upsertCalculation(id: string, calc: CalculationHistory): Promise<CalculationHistory> {
  const data = await apiFetch<ApiCalculation>(`/api/calculations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toApiBody(calc)),
  });
  return toHistory(data);
}

export async function deleteCalculation(id: string): Promise<void> {
  await apiFetch<void>(`/api/calculations/${id}`, { method: 'DELETE' });
}

export async function clearCalculations(): Promise<void> {
  await apiFetch<void>('/api/calculations', { method: 'DELETE' });
}

export async function togglePin(id: string): Promise<CalculationHistory> {
  const data = await apiFetch<ApiCalculation>(`/api/calculations/${id}/pin`, {
    method: 'PATCH',
  });
  return toHistory(data);
}

export async function batchUpsert(calculations: CalculationHistory[]): Promise<CalculationHistory[]> {
  const data = await apiFetch<ApiCalculation[]>('/api/calculations/batch', {
    method: 'POST',
    body: JSON.stringify({ calculations: calculations.map(toApiBody) }),
  });
  return data.map(toHistory);
}
