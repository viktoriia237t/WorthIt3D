import { useMemo } from 'react';
import type { CalculationState, CalculationResult } from '../types/calculator';

export const useCalculator = (state: CalculationState): CalculationResult => {
  // Pre-calculate custom expenses total to avoid recalculating when array reference changes
  const customExpensesCost = useMemo(
    () => state.customExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [state.customExpenses]
  );

  return useMemo(() => {
    // Helper function to handle division by zero
    const safeDivide = (numerator: number, denominator: number): number => {
      if (denominator === 0 || !isFinite(denominator)) return 0;
      const result = numerator / denominator;
      return isFinite(result) ? result : 0;
    };

    // 1. Витрати на матеріал (C_mat)
    // C_mat = (weight × spoolPrice) / spoolWeight
    const materialCost = safeDivide(state.weight * state.spoolPrice, state.spoolWeight);

    // 2. Електроенергія (C_elec)
    // C_elec = printTime × powerConsumption × electricityTariff
    const electricityCost =
      state.printTime * state.powerConsumption * state.electricityTariff;

    // 3. Амортизація принтера (C_dep)
    // C_dep = (printerPrice / lifespan) × printTime
    const depreciationCost = safeDivide(state.printerPrice, state.lifespan) * state.printTime;

    // 4. Знос сопла (C_nozzle)
    // C_nozzle = (nozzlePrice / nozzleLifespan) × printTime
    const nozzleWearCost = safeDivide(state.nozzlePrice, state.nozzleLifespan) * state.printTime;

    // 5. Знос столу/плити (C_bed)
    // C_bed = (bedPrice / bedLifespan) × printTime
    const bedWearCost = safeDivide(state.bedPrice, state.bedLifespan) * state.printTime;

    // 6. Ваша робота (C_labor)
    // C_labor = (prepTime + postTime) × hourlyRate
    const laborCost = (state.prepTime + state.postTime) * state.hourlyRate;

    // 7. Витратні матеріали (для Resin друку)
    const consumablesCost = state.consumables;

    // 8. Кастомні додаткові витрати (pre-calculated above)

    // Підсумок всіх компонентів
    const subtotal =
      materialCost + electricityCost + depreciationCost + nozzleWearCost +
      bedWearCost + laborCost + consumablesCost + customExpensesCost;

    // Собівартість (з урахуванням браку)
    // TotalCost = (C_mat + C_elec + C_dep + C_labor + consumables) × failureRate
    const totalCost = subtotal * state.failureRate;

    // Фінальна ціна (з націнкою)
    // Price = TotalCost × (markup/100)
    // markup is in percentage, e.g., 100 = 100% = 1x (no markup), 200 = 200% = 2x
    const finalPrice = totalCost * (state.markup / 100);

    // Чистий прибуток
    const profit = finalPrice - totalCost;

    // OLX комісія (якщо включено): +2% від ціни для клієнта + 20 грн
    const olxPrice = state.includeOlxFee ? finalPrice * 1.02 + 20 : 0;
    const olxProfit = state.includeOlxFee ? olxPrice - totalCost : 0;

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
    };
  }, [
    state.weight,
    state.spoolPrice,
    state.spoolWeight,
    state.printTime,
    state.prepTime,
    state.postTime,
    state.powerConsumption,
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
    customExpensesCost,
  ]);
};
