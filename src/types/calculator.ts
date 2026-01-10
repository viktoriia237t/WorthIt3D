export interface CalculationState {
  // Матеріали
  weight: number; // Вага моделі з підтримками (грами)
  spoolPrice: number; // Ціна за котушку/літр пластику/смоли (грн)
  spoolWeight: number; // Вага/об'єм цілої котушки (грами)

  // Час
  printTime: number; // Тривалість друку (години)
  prepTime: number; // Час на підготовку (години)
  postTime: number; // Час на пост-обробку (години)

  // Електроенергія
  powerConsumption: number; // Споживання принтера (кВт)
  electricityTariff: number; // Вартість 1 кВт-год (грн)

  // Амортизація
  printerPrice: number; // Вартість принтера (грн)
  lifespan: number; // Розрахунковий ресурс (години)

  // Витратні частини (сопла, столи)
  nozzlePrice: number; // Вартість сопла (грн)
  nozzleLifespan: number; // Ресурс сопла (години)
  bedPrice: number; // Вартість столу/плити (грн)
  bedLifespan: number; // Ресурс столу (години)

  // Робота
  hourlyRate: number; // Ставка за годину роботи (грн/год)

  // Бізнес
  failureRate: number; // Запас на невдалий друк (відсотки, наприклад 10 = +10%)
  markup: number; // Націнка (відсотки, наприклад 100 = +100%)

  // Додаткові витрати (для Resin друку)
  consumables: number; // Витратні матеріали (грн)

  // Кастомні додаткові витрати
  customExpenses: CustomExpense[];

  // OLX комісія
  includeOlxFee: boolean; // Включити комісію OLX (+2% + 20 грн)
}

export interface CustomExpense {
  id: string;
  name: string; // Назва витрати (пакування, доставка і т.д.)
  amount: number; // Сума (грн)
  includeInFee: boolean; // Включити у базову вартість (з урахуванням браку та націнки)
}

export interface CalculationResult {
  // Компоненти вартості
  materialCost: number; // Вартість матеріалу
  electricityCost: number; // Вартість електроенергії
  depreciationCost: number; // Амортизація принтера
  nozzleWearCost: number; // Знос сопла
  bedWearCost: number; // Знос столу
  laborCost: number; // Вартість роботи
  consumablesCost: number; // Витратні матеріали
  customExpensesCost: number; // Сума кастомних витрат

  // Підсумки
  subtotal: number; // Сума всіх компонентів
  totalCost: number; // Собівартість (з урахуванням браку)
  finalPrice: number; // Фінальна ціна (з націнкою)
  profit: number; // Чистий прибуток

  // OLX
  olxPrice: number; // Ціна з комісією OLX (finalPrice * 1.02 + 20)
  olxProfit: number; // Прибуток з урахуванням OLX комісії
}

export interface CalculationHistory {
  id: string;
  timestamp: number;
  state: CalculationState;
  result: CalculationResult;
  note?: string;
  modelName?: string;
  modelLink?: string;
  pinned?: boolean;
}

export const DEFAULT_CALCULATION_STATE: CalculationState = {
  // Матеріали
  weight: 0,
  spoolPrice: 0,
  spoolWeight: 0,

  // Час
  printTime: 0,
  prepTime: 0,
  postTime: 0,

  // Електроенергія
  powerConsumption: 0,
  electricityTariff: 0,

  // Амортизація
  printerPrice: 0,
  lifespan: 0,

  // Витратні частини
  nozzlePrice: 0, // Середня ціна сопла
  nozzleLifespan: 0, // Ресурс сопла (години)
  bedPrice: 0, // Вартість столу/покриття
  bedLifespan: 0, // Ресурс столу (години)

  // Робота
  hourlyRate: 0,

  // Бізнес
  failureRate: 0,
  markup: 100,

  // Додаткові витрати
  consumables: 0,

  // Кастомні витрати
  customExpenses: [],

  // OLX
  includeOlxFee: false,
};
