import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// Модульні імпорти HeroUI
import { Input, Textarea } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Switch } from '@heroui/switch';
import { Accordion, AccordionItem } from '@heroui/accordion';
import { Tooltip } from '@heroui/tooltip';
// Іконки для візуалізації
import {
    Package,
    Clock,
    Zap,
    Wrench,
    User,
    TrendingUp,
    PlusCircle,
    FileText,
    Weight,
    CircleDollarSign,
    Trash2,
    Plus,
    Info
} from "lucide-react";

import type { CalculationState, CustomExpense } from '../types/calculator';
import { DEFAULT_CALCULATION_STATE } from '../types/calculator';
import { Button } from '@heroui/button';
import { NumberInput } from './NumberInput';

interface CalculatorFormProps {
    initialState?: CalculationState;
    onStateChange: (state: CalculationState) => void;
    modelName?: string;
    onModelNameChange?: (name: string) => void;
    modelLink?: string;
    onModelLinkChange?: (link: string) => void;
    note?: string;
    onNoteChange?: (note: string) => void;
}

const ACCORDION_STATE_STORAGE_KEY = 'calculator-accordion-state';
const ELECTRICITY_PERSISTENT_STORAGE_KEY = 'calculator-electricity-persistent';

interface ElectricityPersistentState {
    powerConsumption: number;
    dryerConsumption: number;
    electricityTariff: number;
    printerPrice: number;
    lifespan: number;
    nozzlePrice: number;
    nozzleLifespan: number;
    bedPrice: number;
    bedLifespan: number;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  initialState = DEFAULT_CALCULATION_STATE,
  onStateChange,
  modelName = '',
  onModelNameChange,
  modelLink = '',
  onModelLinkChange,
  note = '',
  onNoteChange,
}) => {
    const { t, i18n } = useTranslation();

    // Load persistent electricity values from localStorage
    const loadPersistentElectricity = (): Partial<ElectricityPersistentState> => {
        try {
            const stored = localStorage.getItem(ELECTRICITY_PERSISTENT_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load persistent electricity values:', error);
        }
        return {};
    };

    const [state, setState] = useState<CalculationState>(() => {
        // Merge persistent electricity values with initial state
        const persistentValues = loadPersistentElectricity();
        return { ...initialState, ...persistentValues };
    });

    // Track if we're in the middle of an update from the form itself
    const isInternalUpdateRef = useRef(false);
    // Track the last external state we received
    const lastExternalStateRef = useRef(initialState);

    // Accordion state management with localStorage persistence
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
        try {
            const stored = localStorage.getItem(ACCORDION_STATE_STORAGE_KEY);
            if (stored) {
                const keys = JSON.parse(stored);
                return new Set(keys);
            }
        } catch (error) {
            console.error('Failed to load accordion state:', error);
        }
        // Default: all sections expanded (electricity first)
        return new Set(['modelInfo', 'electricity', 'amortisation', 'materials', 'time', 'business', 'additional']);
    });

    // Persist accordion state to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(ACCORDION_STATE_STORAGE_KEY, JSON.stringify(Array.from(expandedKeys)));
        } catch (error) {
            console.error('Failed to save accordion state:', error);
        }
    }, [expandedKeys]);

    // Синхронізація локального стану з initialState (для редагування)
    // Тільки якщо це зовнішня зміна (не від самої форми)
    useEffect(() => {
        // Skip if this is an update triggered by our own form changes
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            lastExternalStateRef.current = initialState;
            return;
        }

        // Check if initialState actually changed externally
        if (JSON.stringify(lastExternalStateRef.current) !== JSON.stringify(initialState)) {
            // External change detected - this is a real load from history or edit
            // Merge with persistent electricity values to preserve user settings
            const persistentValues = loadPersistentElectricity();
            const mergedState = { ...initialState, ...persistentValues };
            setState(mergedState);
            lastExternalStateRef.current = initialState;

            // Notify parent about the merged state so calculations use correct values
            // Use setTimeout to avoid updating state during render
            setTimeout(() => {
                isInternalUpdateRef.current = true;
                onStateChange(mergedState);
            }, 0);
        }
    }, [initialState, onStateChange]);

    // Persist electricity values to localStorage when they change
    useEffect(() => {
        try {
            const persistentValues: ElectricityPersistentState = {
                powerConsumption: state.powerConsumption,
                dryerConsumption: state.dryerConsumption,
                electricityTariff: state.electricityTariff,
                printerPrice: state.printerPrice,
                lifespan: state.lifespan,
                nozzlePrice: state.nozzlePrice,
                nozzleLifespan: state.nozzleLifespan,
                bedPrice: state.bedPrice,
                bedLifespan: state.bedLifespan,
            };
            localStorage.setItem(ELECTRICITY_PERSISTENT_STORAGE_KEY, JSON.stringify(persistentValues));
        } catch (error) {
            console.error('Failed to save persistent electricity values:', error);
        }
    }, [
        state.powerConsumption,
        state.dryerConsumption,
        state.electricityTariff,
        state.printerPrice,
        state.lifespan,
        state.nozzlePrice,
        state.nozzleLifespan,
        state.bedPrice,
        state.bedLifespan,
    ]);

    const handleChange = (field: keyof CalculationState, value: number) => {
        const newState = { ...state, [field]: value };
        setState(newState);
        // Mark that this is an internal update so useEffect won't reset the state
        isInternalUpdateRef.current = true;
        onStateChange(newState);
    };

    const handleBooleanChange = (field: keyof CalculationState, value: boolean) => {
        const newState = { ...state, [field]: value };
        setState(newState);
        // Mark that this is an internal update so useEffect won't reset the state
        isInternalUpdateRef.current = true;
        onStateChange(newState);
    };

    const handleAddCustomExpense = () => {
        const newExpense: CustomExpense = {
            id: `exp-${Date.now()}`,
            name: '',
            amount: 0,
            includeInFee: false,
            perItem: true,
        };
        const newState = {
            ...state,
            customExpenses: [...state.customExpenses, newExpense],
        };
        setState(newState);
        // Mark that this is an internal update so useEffect won't reset the state
        isInternalUpdateRef.current = true;
        onStateChange(newState);
    };

    const handleUpdateCustomExpense = (id: string, field: 'name' | 'amount' | 'includeInFee' | 'perItem', value: string | number | boolean) => {
        const newState = {
            ...state,
            customExpenses: state.customExpenses.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            ),
        };
        setState(newState);
        // Mark that this is an internal update so useEffect won't reset the state
        isInternalUpdateRef.current = true;
        onStateChange(newState);
    };

    const handleRemoveCustomExpense = (id: string) => {
        const newState = {
            ...state,
            customExpenses: state.customExpenses.filter(exp => exp.id !== id),
        };
        setState(newState);
        // Mark that this is an internal update so useEffect won't reset the state
        isInternalUpdateRef.current = true;
        onStateChange(newState);
    };

    return (
        <div className="flex flex-col gap-8 pb-10">
            <Accordion
                selectedKeys={expandedKeys}
                onSelectionChange={(keys) => setExpandedKeys(keys as Set<string>)}
                selectionMode="multiple"
                variant="splitted"
                className="px-0"
                itemClasses={{
                    base: "shadow-sm border-none bg-background/60 dark:bg-default-100/20",
                    title: "font-normal text-medium",
                    trigger: "py-4",
                    content: "pb-4 pt-0"
                }}
            >
                {/* ІНФОРМАЦІЯ ПРО МОДЕЛЬ */}
                <AccordionItem
                    key="modelInfo"
                    aria-label={t('form.modelInfo.title')}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <FileText size={22} className="text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{t('form.modelInfo.title')}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.modelInfo.title')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onFocus={(e) => e.stopPropagation()}>
                        <Input
                            type="text"
                            variant="flat"
                            label={t('form.modelInfo.name')}
                            labelPlacement="outside"
                            placeholder={t('form.modelInfo.namePlaceholder')}
                            value={modelName}
                            onChange={(e) => onModelNameChange?.(e.target.value)}
                        />
                        <Input
                            type="text"
                            variant="flat"
                            label={t('form.modelInfo.link')}
                            labelPlacement="outside"
                            placeholder={t('form.modelInfo.linkPlaceholder')}
                            value={modelLink}
                            onChange={(e) => onModelLinkChange?.(e.target.value)}
                        />
                        <NumberInput
                            variant="flat"
                            label={
                                <div className="flex items-center gap-1">
                                    {t('form.modelInfo.batchCount')}
                                    <Tooltip content={t('form.modelInfo.batchCountTooltip')}>
                                        <Info size={14} className="text-default-400 cursor-help" />
                                    </Tooltip>
                                </div>
                            }
                            labelPlacement="outside"
                            placeholder="1"
                            value={state.batchCount}
                            onChange={(value) => handleChange('batchCount', Math.max(1, value))}
                            min={1}
                            description={t('form.modelInfo.batchCountDesc')}
                        />
                    </div>
                </AccordionItem>

                {/* 1. ЕЛЕКТРИКА */}
                <AccordionItem
                    key="electricity"
                    aria-label={`1. ${t('form.electricity.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <Zap size={22} className="text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`1. ${t('form.electricity.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.electricity.title')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" onFocus={(e) => e.stopPropagation()}>
                        <NumberInput
                            variant="flat"
                            label={t('form.electricity.powerConsumption')}
                            labelPlacement="outside"
                            startContent={<Zap size={18} className="text-default-400" />}
                            value={state.powerConsumption}
                            onChange={(value) => handleChange('powerConsumption', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={
                                <div className="flex items-center gap-1">
                                    {t('form.electricity.dryerConsumption')}
                                    <Tooltip content={t('form.electricity.dryerConsumptionTooltip')}>
                                        <Info size={14} className="text-default-400 cursor-help" />
                                    </Tooltip>
                                </div>
                            }
                            labelPlacement="outside"
                            startContent={<Zap size={18} className="text-default-400" />}
                            value={state.dryerConsumption}
                            onChange={(value) => handleChange('dryerConsumption', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={t('form.electricity.tariff')}
                            labelPlacement="outside"
                            value={state.electricityTariff}
                            onChange={(value) => handleChange('electricityTariff', value)}
                            min={0}
                        />
                    </div>
                </AccordionItem>

                {/* 2. АМОРТИЗАЦІЯ */}
                <AccordionItem
                    key="amortisation"
                    aria-label={`2. ${t('form.depreciation.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <Wrench size={22} className="text-purple-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`2. ${t('form.depreciation.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.depreciation.title')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onFocus={(e) => e.stopPropagation()}>
                        <NumberInput
                            variant="flat"
                            label={t('form.depreciation.printerPrice')}
                            labelPlacement="outside"
                            startContent={<Wrench size={18} className="text-default-400" />}
                            value={state.printerPrice}
                            onChange={(value) => handleChange('printerPrice', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={t('form.depreciation.lifespan')}
                            labelPlacement="outside"
                            value={state.lifespan}
                            onChange={(value) => handleChange('lifespan', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={t('form.depreciation.nozzlePrice')}
                            labelPlacement="outside"
                            value={state.nozzlePrice}
                            onChange={(value) => handleChange('nozzlePrice', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={t('form.depreciation.nozzleLifespan')}
                            labelPlacement="outside"
                            value={state.nozzleLifespan}
                            onChange={(value) => handleChange('nozzleLifespan', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={t('form.depreciation.bedPrice')}
                            labelPlacement="outside"
                            value={state.bedPrice}
                            onChange={(value) => handleChange('bedPrice', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={t('form.depreciation.bedLifespan')}
                            labelPlacement="outside"
                            value={state.bedLifespan}
                            onChange={(value) => handleChange('bedLifespan', value)}
                            min={0}
                        />
                    </div>
                </AccordionItem>

                {/* 3. МАТЕРІАЛИ */}
                <AccordionItem
                    key="materials"
                    aria-label={`3. ${t('form.materials.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <Package size={22} className="text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`3. ${t('form.materials.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.materials.title')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onFocus={(e) => e.stopPropagation()}>
                        <NumberInput
                            variant="flat"
                            label={t('form.materials.weight')}
                            labelPlacement="outside"
                            placeholder="0.00"
                            startContent={<Weight size={18} className="text-default-400" />}
                            endContent={<span className="text-tiny text-default-400">{t('units.grams')}</span>}
                            value={state.weight}
                            onChange={(value) => handleChange('weight', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={t('form.materials.spoolPrice')}
                            labelPlacement="outside"
                            placeholder="800"
                            startContent={<CircleDollarSign size={18} className="text-default-400" />}
                            endContent={<span className="text-tiny text-default-400">{t('units.uah')}</span>}
                            value={state.spoolPrice}
                            onChange={(value) => handleChange('spoolPrice', value)}
                            min={0}
                        />
                        <NumberInput
                            className="md:col-span-2"
                            variant="flat"
                            label={t('form.materials.spoolWeight')}
                            labelPlacement="outside"
                            placeholder="1000"
                            endContent={<span className="text-tiny text-default-400">{t('units.grams')}</span>}
                            value={state.spoolWeight}
                            onChange={(value) => handleChange('spoolWeight', value)}
                            min={0}
                        />
                        {state.batchCount > 1 && (
                            <>
                                <Divider className="md:col-span-2 my-2" />
                                <div className="md:col-span-2">
                                    <Switch
                                        size="sm"
                                        isSelected={state.weightPerModel}
                                        onValueChange={(value) => handleBooleanChange('weightPerModel', value)}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="text-small font-medium">{t('form.materials.weightPerModel')}</span>
                                            <span className="text-tiny text-default-400">
                                                {state.weightPerModel
                                                    ? t('form.materials.weightPerModelDesc')
                                                    : t('form.materials.weightForBatchDesc')}
                                            </span>
                                        </div>
                                    </Switch>
                                </div>
                            </>
                        )}
                    </div>
                </AccordionItem>

                {/* 4. ЧАСОВІ ВИТРАТИ */}
                <AccordionItem
                    key="time"
                    aria-label={`4. ${t('form.time.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <Clock size={22} className="text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`4. ${t('form.time.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.time.title')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="flex flex-col gap-4" onFocus={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <NumberInput
                                variant="flat"
                                label={t('form.time.printTime')}
                                labelPlacement="outside"
                                value={state.printTime}
                                onChange={(value) => handleChange('printTime', value)}
                                endContent={<span className="text-tiny text-default-400">{t('units.hours')}</span>}
                                min={0}
                            />
                            <NumberInput
                                variant="flat"
                                label={t('form.time.prepTime')}
                                labelPlacement="outside"
                                value={state.prepTime}
                                onChange={(value) => handleChange('prepTime', value)}
                                endContent={<span className="text-tiny text-default-400">{t('units.hours')}</span>}
                                min={0}
                            />
                            <NumberInput
                                variant="flat"
                                label={t('form.time.postTime')}
                                labelPlacement="outside"
                                value={state.postTime}
                                onChange={(value) => handleChange('postTime', value)}
                                endContent={<span className="text-tiny text-default-400">{t('units.hours')}</span>}
                                min={0}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-baseline">
                            <NumberInput
                                variant="flat"
                                label={t('form.time.dryTime')}
                                labelPlacement="outside"
                                value={state.dryTime}
                                onChange={(value) => handleChange('dryTime', value)}
                                endContent={<span className="text-tiny text-default-400">{t('units.hours')}</span>}
                                min={0}
                            />
                            <Switch
                                isSelected={state.dryDuringPrint}
                                onValueChange={(value) => handleBooleanChange('dryDuringPrint', value)}
                            >
                                <div className="flex items-center gap-1">
                                    {t('form.time.dryDuringPrint')}
                                    <Tooltip content={t('form.electricity.dryDuringPrintTooltip')}>
                                        <Info size={14} className="text-default-400 cursor-help" />
                                    </Tooltip>
                                </div>
                            </Switch>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    key="business"
                    aria-label={`5. ${t('form.business.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <TrendingUp size={22} className="text-success-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`5. ${t('form.business.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.business.title')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onFocus={(e) => e.stopPropagation()}>
                        <NumberInput
                            variant="flat"
                            label={t('form.labor.hourlyRate')}
                            labelPlacement="outside"
                            startContent={<User size={18} className="text-default-400" />}
                            endContent={<span className="text-tiny text-default-400">{t('units.uahPerHour')}</span>}
                            value={state.hourlyRate}
                            onChange={(value) => handleChange('hourlyRate', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={
                                <div className="flex items-center gap-1">
                                    {t('form.business.markup')}
                                    <Tooltip content={t('form.business.markupTooltip')}>
                                        <Info size={14} className="text-default-400 cursor-help" />
                                    </Tooltip>
                                </div>
                            }
                            labelPlacement="outside"
                            placeholder="100"
                            value={state.markup}
                            onChange={(value) => handleChange('markup', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={
                                <div className="flex items-center gap-1">
                                    {t('form.business.failureRate')}
                                    <Tooltip content={t('form.business.failureRateTooltip')}>
                                        <Info size={14} className="text-default-400 cursor-help" />
                                    </Tooltip>
                                </div>
                            }
                            labelPlacement="outside"
                            placeholder="0"
                            value={state.failureRate}
                            onChange={(value) => handleChange('failureRate', value)}
                            min={0}
                        />
                        <NumberInput
                            variant="flat"
                            label={t('form.additional.consumables')}
                            labelPlacement="outside"
                            startContent={<PlusCircle size={18} className="text-default-400" />}
                            value={state.consumables}
                            onChange={(value) => handleChange('consumables', value)}
                            min={0}
                        />
                    </div>
                    {/* Показуємо OLX тільки для української мови */}
                    {i18n.language === 'uk' && (
                        <>
                            <Divider className="my-2" />
                            <div className="flex flex-col gap-2">
                                <Switch
                                    isSelected={state.includeOlxFee}
                                    onValueChange={(value) => handleBooleanChange('includeOlxFee', value)}
                                    classNames={{
                                        base: "inline-flex flex-row-reverse w-full max-w-full bg-content1 hover:bg-content2 items-center justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent data-[selected=true]:border-primary",
                                        wrapper: "p-0 h-4 overflow-visible",
                                        thumb: "w-6 h-6 border-2 shadow-lg group-data-[selected=true]:ml-6"
                                    }}
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="text-medium font-semibold">{t('form.business.includeOlxFee')}</p>
                                        <p className="text-tiny text-default-400">{t('form.business.includeOlxFeeDesc')}</p>
                                    </div>
                                </Switch>

                                {/* OLX Per-Item Toggle - Only show when OLX enabled and batch mode active */}
                                {state.includeOlxFee && state.batchCount > 1 && (
                                    <div className="ml-4 pl-4 border-l-2 border-default-200">
                                        <Switch
                                            size="sm"
                                            isSelected={state.olxFeePerItem}
                                            onValueChange={(value) => handleBooleanChange('olxFeePerItem', value)}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-small font-medium">{t('form.business.olxFeePerItem')}</span>
                                                <span className="text-tiny text-default-400">
                                                    {state.olxFeePerItem
                                                        ? t('form.business.olxFeePerItemDesc')
                                                        : t('form.business.olxFeeBatchCommissionDesc')}
                                                </span>
                                            </div>
                                        </Switch>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </AccordionItem>

                <AccordionItem
                    key="additional"
                    aria-label={`6. ${t('form.additional.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <PlusCircle size={22} className="text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`6. ${t('form.additional.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.additional.customExpenses')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="flex flex-col gap-3" onFocus={(e) => e.stopPropagation()}>
                        {state.customExpenses.map((expense) => (
                            <div key={expense.id} className="flex flex-col gap-3 p-4 rounded-lg border border-default-200 bg-default-50">
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_auto] gap-3 items-end">
                                    <Input
                                        type="text"
                                        variant="flat"
                                        label={t('form.additional.expenseName')}
                                        labelPlacement="outside"
                                        placeholder={t('form.additional.expenseName')}
                                        value={expense.name}
                                        onChange={(e) => handleUpdateCustomExpense(expense.id, 'name', e.target.value)}
                                    />
                                    <NumberInput
                                        variant="flat"
                                        label={t('form.additional.expenseAmount')}
                                        labelPlacement="outside"
                                        placeholder="0"
                                        endContent={<span className="text-tiny text-default-400">{t('units.uah')}</span>}
                                        value={expense.amount}
                                        onChange={(value) => handleUpdateCustomExpense(expense.id, 'amount', value)}
                                        min={0}
                                    />
                                    <Button
                                        isIconOnly
                                        color="danger"
                                        variant="flat"
                                        size="lg"
                                        onPress={() => handleRemoveCustomExpense(expense.id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Switch
                                        size="sm"
                                        isSelected={expense.includeInFee}
                                        onValueChange={(value) => handleUpdateCustomExpense(expense.id, 'includeInFee', value)}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span className="text-small">{t('form.additional.includeInFee')}</span>
                                            <Tooltip content={t('form.additional.includeInFeeTooltip')}>
                                                <Info size={14} className="text-default-400 cursor-help" />
                                            </Tooltip>
                                        </div>
                                    </Switch>
                                    {state.batchCount > 1 && (
                                        <Switch
                                            size="sm"
                                            isSelected={expense.perItem}
                                            onValueChange={(value) => handleUpdateCustomExpense(expense.id, 'perItem', value)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-small">{t('form.additional.perItem')}</span>
                                                <span className="text-tiny text-default-400">
                                                    {expense.perItem
                                                        ? t('form.additional.perItemDesc')
                                                        : t('form.additional.perBatchDesc')}
                                                </span>
                                            </div>
                                        </Switch>
                                    )}
                                </div>
                            </div>
                        ))}
                        <Button
                            color="primary"
                            variant="bordered"
                            startContent={<Plus size={18} />}
                            onPress={handleAddCustomExpense}
                            className="w-full md:w-auto"
                        >
                            {t('form.additional.addExpense')}
                        </Button>
                    </div>
                </AccordionItem>
            </Accordion>

            {/* ПРИМІТКА */}
            {onNoteChange && (
                <Card shadow="sm" className="border-none bg-default-50">
                    <CardHeader className="flex gap-3">
                        <FileText size={20} className="text-default-500" />
                        <p className="font-bold">{t('form.modelInfo.note')}</p>
                    </CardHeader>
                    <CardBody>
                        <Textarea
                            variant="bordered"
                            placeholder={t('form.modelInfo.notePlaceholder')}
                            value={note}
                            onChange={(e) => onNoteChange(e.target.value)}
                            minRows={3}
                        />
                    </CardBody>
                </Card>
            )}
        </div>
    );
};