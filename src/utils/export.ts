import type { CalculationHistory } from '../types/calculator';

/**
 * Format date for filenames (YYYY-MM-DD)
 */
function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date for CSV export (DD/MM/YYYY HH:MM)
 */
function formatDateForCSV(timestamp: number): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Escape CSV field (handle quotes, commas, newlines)
 */
function escapeCSVField(value: string | number | boolean | undefined | null): string {
  if (value === null || value === undefined) return '';

  const str = String(value);

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Download a file to the user's computer
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export calculation history to JSON file
 */
export function exportToJSON(history: CalculationHistory[]): void {
  const dataStr = JSON.stringify(history, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const filename = `worthit3d-history-${formatDateForFilename(new Date())}.json`;
  downloadFile(blob, filename);
}

/**
 * Convert calculation history to CSV format
 */
function convertToCSV(history: CalculationHistory[]): string {
  // CSV Header
  const headers = [
    'ID',
    'Date',
    'Model Name',
    'Model Link',
    'Note',
    'Pinned',
    'Weight(g)',
    'Spool Price',
    'Spool Weight',
    'Print Time(h)',
    'Prep Time(h)',
    'Post Time(h)',
    'Power(kW)',
    'Tariff',
    'Printer Price',
    'Lifespan(h)',
    'Nozzle Price',
    'Nozzle Life(h)',
    'Bed Price',
    'Bed Life(h)',
    'Hourly Rate',
    'Failure Rate',
    'Markup',
    'Consumables',
    'Include OLX',
    'Material Cost',
    'Electricity Cost',
    'Depreciation',
    'Nozzle Wear',
    'Bed Wear',
    'Labor Cost',
    'Consumables Cost',
    'Custom Expenses',
    'Subtotal',
    'Total Cost',
    'Final Price',
    'Profit',
    'OLX Price',
    'OLX Profit',
  ];

  const rows = [headers.join(',')];

  // Convert each history entry to CSV row
  for (const item of history) {
    const row = [
      escapeCSVField(item.id),
      escapeCSVField(formatDateForCSV(item.timestamp)),
      escapeCSVField(item.modelName || ''),
      escapeCSVField(item.modelLink || ''),
      escapeCSVField(item.note || ''),
      escapeCSVField(item.pinned ? 'Yes' : 'No'),
      escapeCSVField(item.state.weight),
      escapeCSVField(item.state.spoolPrice),
      escapeCSVField(item.state.spoolWeight),
      escapeCSVField(item.state.printTime),
      escapeCSVField(item.state.prepTime),
      escapeCSVField(item.state.postTime),
      escapeCSVField(item.state.powerConsumption),
      escapeCSVField(item.state.electricityTariff),
      escapeCSVField(item.state.printerPrice),
      escapeCSVField(item.state.lifespan),
      escapeCSVField(item.state.nozzlePrice),
      escapeCSVField(item.state.nozzleLifespan),
      escapeCSVField(item.state.bedPrice),
      escapeCSVField(item.state.bedLifespan),
      escapeCSVField(item.state.hourlyRate),
      escapeCSVField(item.state.failureRate),
      escapeCSVField(item.state.markup),
      escapeCSVField(item.state.consumables),
      escapeCSVField(item.state.includeOlxFee ? 'Yes' : 'No'),
      escapeCSVField(item.result.materialCost),
      escapeCSVField(item.result.electricityCost),
      escapeCSVField(item.result.depreciationCost),
      escapeCSVField(item.result.nozzleWearCost),
      escapeCSVField(item.result.bedWearCost),
      escapeCSVField(item.result.laborCost),
      escapeCSVField(item.result.consumablesCost),
      escapeCSVField(item.result.customExpensesCost),
      escapeCSVField(item.result.subtotal),
      escapeCSVField(item.result.totalCost),
      escapeCSVField(item.result.finalPrice),
      escapeCSVField(item.result.profit),
      escapeCSVField(item.result.olxPrice),
      escapeCSVField(item.result.olxProfit),
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Export calculation history to CSV file
 */
export function exportToCSV(history: CalculationHistory[]): void {
  const csv = convertToCSV(history);
  // Add UTF-8 BOM for Excel compatibility
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const filename = `worthit3d-history-${formatDateForFilename(new Date())}.csv`;
  downloadFile(blob, filename);
}
