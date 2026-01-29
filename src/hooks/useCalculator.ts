import { useMemo } from 'react';
import type { CalculationState, CalculationResult } from '../types/calculator';

export const useCalculator = (state: CalculationState): CalculationResult => {
  // Pre-calculate custom expenses - these are recalculated in the main useMemo with batch logic
  // This is just a placeholder for dependency tracking

  return useMemo(() => {
    // Ensure backward compatibility with old calculations
    const normalizedState = {
      ...state,
      batchCount: state.batchCount ?? 1,
      weightPerModel: state.weightPerModel ?? true,
      customExpenses: state.customExpenses.map(exp => ({
        ...exp,
        perItem: exp.perItem ?? true
      }))
    };

    // Determine if batch mode is active (count > 1)
    const isBatchMode = normalizedState.batchCount > 1;

    // Helper function to handle division by zero
    const safeDivide = (numerator: number, denominator: number): number => {
      if (denominator === 0 || !isFinite(denominator)) return 0;
      const result = numerator / denominator;
      return isFinite(result) ? result : 0;
    };

    // 1. Витрати на матеріал (C_mat) - AFFECTED BY BATCH MODE
    const effectiveBatchCount = normalizedState.batchCount > 0
      ? normalizedState.batchCount
      : 1;

    const effectiveWeight = isBatchMode && normalizedState.weightPerModel
      ? normalizedState.weight * effectiveBatchCount
      : normalizedState.weight;

    const materialCost = safeDivide(effectiveWeight * normalizedState.spoolPrice, normalizedState.spoolWeight);

    // 2. Електроенергія (C_elec)
    // C_elec = printTime × powerConsumption × electricityTariff + effectiveDryTime × dryerConsumption × electricityTariff
    // If dryDuringPrint is true, use printTime as dryTime
    // If dryerConsumption is 0, skip dryer calculation entirely
    const printerElectricityCost = normalizedState.printTime * normalizedState.powerConsumption * normalizedState.electricityTariff;

    let dryerElectricityCost = 0;
    if (normalizedState.dryerConsumption > 0) {
      const effectiveDryTime = normalizedState.dryDuringPrint ? normalizedState.printTime : normalizedState.dryTime;
      dryerElectricityCost = effectiveDryTime * normalizedState.dryerConsumption * normalizedState.electricityTariff;
    }

    const electricityCost = printerElectricityCost + dryerElectricityCost;

    // 3. Амортизація принтера (C_dep)
    // C_dep = (printerPrice / lifespan) × printTime
    const depreciationCost = safeDivide(normalizedState.printerPrice, normalizedState.lifespan) * normalizedState.printTime;

    // 4. Знос сопла (C_nozzle)
    // C_nozzle = (nozzlePrice / nozzleLifespan) × printTime
    const nozzleWearCost = safeDivide(normalizedState.nozzlePrice, normalizedState.nozzleLifespan) * normalizedState.printTime;

    // 5. Знос столу/плити (C_bed)
    // C_bed = (bedPrice / bedLifespan) × printTime
    const bedWearCost = safeDivide(normalizedState.bedPrice, normalizedState.bedLifespan) * normalizedState.printTime;

    // 6. Ваша робота (C_labor)
    // C_labor = (prepTime + postTime) × hourlyRate
    const laborCost = (normalizedState.prepTime + normalizedState.postTime) * normalizedState.hourlyRate;

    // 7. Витратні матеріали (для Resin друку)
    const consumablesCost = normalizedState.consumables;

    // 8. Кастомні додаткові витрати with batch logic
    // Split custom expenses by includeInFee flag and apply batch multiplier
    let baseExpenses = 0;
    let feeExpenses = 0;

    normalizedState.customExpenses.forEach(exp => {
      // Apply batch multiplier if in batch mode and perItem is true
      const multiplier = (isBatchMode && exp.perItem) ? effectiveBatchCount : 1;
      const effectiveAmount = exp.amount * multiplier;

      if (exp.includeInFee) {
        baseExpenses += effectiveAmount;
      } else {
        feeExpenses += effectiveAmount;
      }
    });

    // Total custom expenses for display
    const customExpensesCost = normalizedState.customExpenses.reduce((sum, exp) => {
      const multiplier = (isBatchMode && exp.perItem) ? effectiveBatchCount : 1;
      return sum + (exp.amount * multiplier);
    }, 0);

    // Підсумок всіх компонентів (без врахування вартості праці)
    const subtotal =
      materialCost + electricityCost + depreciationCost + nozzleWearCost +
      bedWearCost + consumablesCost + baseExpenses;

    // Собівартість (з урахуванням браку)
    // TotalCost = subtotal + (subtotal × failureRate / 100)
    // failureRate is now a percentage, e.g., 10 = +10%
    const totalCost = normalizedState.failureRate > 0
      ? subtotal + (subtotal * normalizedState.failureRate / 100)
      : subtotal;

    // Фінальна ціна (з націнкою + вартість праці додається окремо, без множення на markup)
    // Price = (TotalCost × (markup/100)) + laborCost + feeExpenses
    // markup is in percentage, e.g., 100 = 100% = 1x (no markup), 200 = 200% = 2x
    // feeExpenses (includeInFee = false) are added to final price as static values
    const finalPrice = totalCost * (normalizedState.markup / 100) + laborCost + feeExpenses;

    // Чистий прибуток
    const profit = finalPrice - totalCost;

    // OLX calculations - supports both per-item and batch commission modes
    const olxFeePerItem = normalizedState.olxFeePerItem ?? true; // Default to per-item for backward compatibility
    const olxPrice = normalizedState.includeOlxFee
      ? (isBatchMode && olxFeePerItem
          ? (finalPrice / effectiveBatchCount) * 1.02 + 20 * effectiveBatchCount  // Per-item commission × count
          : finalPrice * 1.02 + 20)  // Single commission (for batch or single item)
      : 0;
    const olxProfit = normalizedState.includeOlxFee ? olxPrice - totalCost : 0;

    // Per-item calculations (only meaningful when batch count > 1)
    const showPerItem = isBatchMode;
    const perItemCost = showPerItem ? safeDivide(totalCost, effectiveBatchCount) : 0;
    const perItemPrice = showPerItem ? safeDivide(finalPrice, effectiveBatchCount) : 0;
    const perItemProfit = showPerItem ? safeDivide(profit, effectiveBatchCount) : 0;
    const olxPricePerItem = showPerItem && normalizedState.includeOlxFee
      ? safeDivide(olxPrice, effectiveBatchCount)
      : 0;
    const olxProfitPerItem = showPerItem && normalizedState.includeOlxFee
      ? safeDivide(olxProfit, effectiveBatchCount)
      : 0;

    return {
      materialCost,
      electricityCost,
      depreciationCost,
      nozzleWearCost,
      bedWearCost,
      laborCost,
      consumablesCost,
      customExpensesCost,
      subtotal,
      totalCost,
      finalPrice,
      profit,
      olxPrice,
      olxProfit,
      perItemCost,
      perItemPrice,
      perItemProfit,
      olxPricePerItem,
      olxProfitPerItem,
    };
  }, [
    state.weight,
    state.spoolPrice,
    state.spoolWeight,
    state.printTime,
    state.prepTime,
    state.postTime,
    state.dryTime,
    state.dryDuringPrint,
    state.powerConsumption,
    state.dryerConsumption,
    state.electricityTariff,
    state.printerPrice,
    state.lifespan,
    state.nozzlePrice,
    state.nozzleLifespan,
    state.bedPrice,
    state.bedLifespan,
    state.hourlyRate,
    state.consumables,
    state.failureRate,
    state.markup,
    state.includeOlxFee,
    state.olxFeePerItem,
    state.batchCount,
    state.weightPerModel,
    state.customExpenses,
  ]);
};
