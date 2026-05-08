export interface FilamentEntry {
  id: string;
  name: string;
  weight: number | null;
  spoolPrice: number | null;
  spoolWeight: number | null;
}

export const DEFAULT_FILAMENT_ENTRY: Omit<FilamentEntry, 'id'> = {
  name: '',
  weight: null,
  spoolPrice: null,
  spoolWeight: null,
};

export interface CalculationState {
  // Матеріали
  filaments: FilamentEntry[];

  // Час
  printTime: number | null;
  prepTime: number | null;
  postTime: number | null;
  dryTime: number | null;
  dryDuringPrint: boolean;

  // Електроенергія
  powerConsumption: number | null;
  dryerConsumption: number | null;
  electricityTariff: number | null;

  // Амортизація
  printerPrice: number | null;
  lifespan: number | null;

  // Витратні частини (сопла, столи)
  nozzlePrice: number | null;
  nozzleLifespan: number | null;
  bedPrice: number | null;
  bedLifespan: number | null;

  // Робота
  hourlyRate: number | null;

  // Бізнес
  failureRate: number | null;
  markup: number | null;

  // Додаткові витрати (для Resin друку)
  consumables: number | null;

  // Кастомні додаткові витрати
  customExpenses: CustomExpense[];

  // OLX комісія
  includeOlxFee: boolean;
  olxFeePerItem: boolean;

  // Batch printing
  batchCount: number;
  weightPerModel: boolean;
}

export interface CustomExpense {
  id: string;
  name: string;
  amount: number | null;
  includeInFee: boolean;
  perItem: boolean;
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
  filaments: [{ id: 'fil-default', name: '', weight: null, spoolPrice: null, spoolWeight: null }],

  printTime: null,
  prepTime: null,
  postTime: null,
  dryTime: null,
  dryDuringPrint: false,

  powerConsumption: null,
  dryerConsumption: null,
  electricityTariff: null,

  printerPrice: null,
  lifespan: null,

  nozzlePrice: null,
  nozzleLifespan: null,
  bedPrice: null,
  bedLifespan: null,

  hourlyRate: null,

  failureRate: null,
  markup: 100,

  consumables: null,

  customExpenses: [],

  includeOlxFee: false,
  olxFeePerItem: true,

  batchCount: 1,
  weightPerModel: false,
};
