export interface FilamentEntry {
  id: string;
  name: string;
  weight: number; // grams used from this filament
  spoolPrice: number; // price of the full spool (UAH)
  spoolWeight: number; // total weight of the spool (grams)
}

export const DEFAULT_FILAMENT_ENTRY: Omit<FilamentEntry, 'id'> = {
  name: '',
  weight: 0,
  spoolPrice: 0,
  spoolWeight: 0,
};

export interface CalculationState {
  // Матеріали
  filaments: FilamentEntry[];

  // Час
  printTime: number; // Тривалість друку (години)
  prepTime: number; // Час на підготовку (години)
  postTime: number; // Час на пост-обробку (години)
  dryTime: number; // Час сушіння (години)
  dryDuringPrint: boolean; // Сушіння під час друку

  // Електроенергія
  powerConsumption: number; // Споживання принтера (кВт)
  dryerConsumption: number; // Споживання сушки (кВт)
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
  olxFeePerItem: boolean; // true = commission per item × count, false = single commission for batch

  // Batch printing
  batchCount: number; // Number of models in batch (min: 1, batch mode enabled when > 1)
  weightPerModel: boolean; // true = weight per model, false = weight for entire batch
}

export interface CustomExpense {
  id: string;
  name: string; // Назва витрати (пакування, доставка і т.д.)
  amount: number; // Сума (грн)
  includeInFee: boolean; // Включити у базову вартість (з урахуванням браку та націнки)
  perItem: boolean; // multiply by batchCount when true (only relevant in batch mode)
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

  // Batch results (only populated when batchPrint = true and batchCount > 1)
  perItemCost: number; // Total cost ÷ batchCount
  perItemPrice: number; // Final price ÷ batchCount
  perItemProfit: number; // Profit ÷ batchCount
  olxPricePerItem: number; // OLX price ÷ batchCount
  olxProfitPerItem: number; // OLX profit ÷ batchCount
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
  filaments: [{ id: 'fil-default', name: '', weight: 0, spoolPrice: 0, spoolWeight: 0 }],

  // Час
  printTime: 0,
  prepTime: 0,
  postTime: 0,
  dryTime: 0,
  dryDuringPrint: false,

  // Електроенергія
  powerConsumption: 0,
  dryerConsumption: 0,
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
  olxFeePerItem: true,

  // Batch printing
  batchCount: 1,
  weightPerModel: false,
};
