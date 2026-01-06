import { useMemo } from 'react';
import type { CalculationState, CalculationResult } from '../types/calculator';

export const useCalculator = (state: CalculationState): CalculationResult => {
  return useMemo(() => {
    // 1. Витрати на матеріал (C_mat)
    // C_mat = (weight × spoolPrice) / spoolWeight
    const materialCost = (state.weight * state.spoolPrice) / state.spoolWeight;

    // 2. Електроенергія (C_elec)
    // C_elec = printTime × powerConsumption × electricityTariff
    const electricityCost =
      state.printTime * state.powerConsumption * state.electricityTariff;

    // 3. Амортизація принтера (C_dep)
    // C_dep = (printerPrice / lifespan) × printTime
    const depreciationCost = (state.printerPrice / state.lifespan) * state.printTime;

    // 4. Знос сопла (C_nozzle)
    // C_nozzle = (nozzlePrice / nozzleLifespan) × printTime
    const nozzleWearCost = (state.nozzlePrice / state.nozzleLifespan) * state.printTime;

    // 5. Знос столу/плити (C_bed)
    // C_bed = (bedPrice / bedLifespan) × printTime
    const bedWearCost = (state.bedPrice / state.bedLifespan) * state.printTime;

    // 6. Ваша робота (C_labor)
    // C_labor = (prepTime + postTime) × hourlyRate
    const laborCost = (state.prepTime + state.postTime) * state.hourlyRate;

    // 7. Витратні матеріали (для Resin друку)
    const consumablesCost = state.consumables;

    // 8. Кастомні додаткові витрати
    const customExpensesCost = state.customExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Підсумок всіх компонентів
    const subtotal =
      materialCost + electricityCost + depreciationCost + nozzleWearCost +
      bedWearCost + laborCost + consumablesCost + customExpensesCost;

    // Собівартість (з урахуванням браку)
    // TotalCost = (C_mat + C_elec + C_dep + C_labor + consumables) × failureRate
    const totalCost = subtotal * state.failureRate;

    // Фінальна ціна (з націнкою)
    // Price = TotalCost × markup
    const finalPrice = totalCost * state.markup;

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
  }, [state]);
};
