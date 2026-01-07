import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Модульні імпорти HeroUI
import { Input, Textarea } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Switch } from '@heroui/switch';
import { Accordion, AccordionItem } from '@heroui/accordion';
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
    Cpu,
    Trash2,
    Plus
} from "lucide-react";

import type { CalculationState, CustomExpense } from '../types/calculator';
import { DEFAULT_CALCULATION_STATE } from '../types/calculator';
import { Button } from '@heroui/button';

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
    const [state, setState] = useState<CalculationState>(initialState);

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
        // Default: all sections expanded
        return new Set(['modelInfo', 'materials', 'time', 'electricity', 'business', 'additional']);
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
    useEffect(() => {
        setState(initialState);
    }, [initialState]);

    const handleChange = (field: keyof CalculationState, value: number) => {
        const newState = { ...state, [field]: value };
        setState(newState);
        onStateChange(newState);
    };

    const handleBooleanChange = (field: keyof CalculationState, value: boolean) => {
        const newState = { ...state, [field]: value };
        setState(newState);
        onStateChange(newState);
    };

    const handleAddCustomExpense = () => {
        const newExpense: CustomExpense = {
            id: `exp-${Date.now()}`,
            name: '',
            amount: 0,
        };
        const newState = {
            ...state,
            customExpenses: [...state.customExpenses, newExpense],
        };
        setState(newState);
        onStateChange(newState);
    };

    const handleUpdateCustomExpense = (id: string, field: 'name' | 'amount', value: string | number) => {
        const newState = {
            ...state,
            customExpenses: state.customExpenses.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            ),
        };
        setState(newState);
        onStateChange(newState);
    };

    const handleRemoveCustomExpense = (id: string) => {
        const newState = {
            ...state,
            customExpenses: state.customExpenses.filter(exp => exp.id !== id),
        };
        setState(newState);
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
                    </div>
                </AccordionItem>

                {/* 1. МАТЕРІАЛИ */}
                <AccordionItem
                    key="materials"
                    aria-label={`1. ${t('form.materials.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <Package size={22} className="text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`1. ${t('form.materials.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.materials.title')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onFocus={(e) => e.stopPropagation()}>
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.materials.weight')}
                            labelPlacement="outside"
                            placeholder="0.00"
                            startContent={<Weight size={18} className="text-default-400" />}
                            endContent={<span className="text-tiny text-default-400">{t('units.grams')}</span>}
                            value={state.weight.toString()}
                            onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.materials.spoolPrice')}
                            labelPlacement="outside"
                            placeholder="800"
                            startContent={<CircleDollarSign size={18} className="text-default-400" />}
                            endContent={<span className="text-tiny text-default-400">{t('units.uah')}</span>}
                            value={state.spoolPrice.toString()}
                            onChange={(e) => handleChange('spoolPrice', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            className="md:col-span-2"
                            type="number"
                            variant="flat"
                            label={t('form.materials.spoolWeight')}
                            labelPlacement="outside"
                            placeholder="1000"
                            endContent={<span className="text-tiny text-default-400">{t('units.grams')}</span>}
                            value={state.spoolWeight.toString()}
                            onChange={(e) => handleChange('spoolWeight', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </AccordionItem>

                {/* 2. ЧАСОВІ ВИТРАТИ */}
                <AccordionItem
                    key="time"
                    aria-label={`2. ${t('form.time.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <Clock size={22} className="text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`2. ${t('form.time.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.time.title')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" onFocus={(e) => e.stopPropagation()}>
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.time.printTime')}
                            labelPlacement="outside"
                            value={state.printTime.toString()}
                            onChange={(e) => handleChange('printTime', parseFloat(e.target.value) || 0)}
                            endContent={<span className="text-tiny text-default-400">{t('units.hours')}</span>}
                            min={0}
                            step={0.1}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.time.prepTime')}
                            labelPlacement="outside"
                            value={state.prepTime.toString()}
                            onChange={(e) => handleChange('prepTime', parseFloat(e.target.value) || 0)}
                            endContent={<span className="text-tiny text-default-400">{t('units.hours')}</span>}
                            min={0}
                            step={0.1}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.time.postTime')}
                            labelPlacement="outside"
                            value={state.postTime.toString()}
                            onChange={(e) => handleChange('postTime', parseFloat(e.target.value) || 0)}
                            endContent={<span className="text-tiny text-default-400">{t('units.hours')}</span>}
                            min={0}
                            step={0.1}
                        />
                    </div>
                </AccordionItem>

                {/* 3. ЕЛЕКТРИКА ТА АМОРТИЗАЦІЯ */}
                <AccordionItem
                    key="electricity"
                    aria-label={`3. ${t('form.electricity.title')} & ${t('form.depreciation.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <Cpu size={22} className="text-purple-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`3. ${t('form.electricity.title')} & ${t('form.depreciation.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.electricity.title')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onFocus={(e) => e.stopPropagation()}>
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.electricity.powerConsumption')}
                            labelPlacement="outside"
                            startContent={<Zap size={18} className="text-default-400" />}
                            value={state.powerConsumption.toString()}
                            onChange={(e) => handleChange('powerConsumption', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.electricity.tariff')}
                            labelPlacement="outside"
                            value={state.electricityTariff.toString()}
                            onChange={(e) => handleChange('electricityTariff', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.depreciation.printerPrice')}
                            labelPlacement="outside"
                            startContent={<Wrench size={18} className="text-default-400" />}
                            value={state.printerPrice.toString()}
                            onChange={(e) => handleChange('printerPrice', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.depreciation.lifespan')}
                            labelPlacement="outside"
                            value={state.lifespan.toString()}
                            onChange={(e) => handleChange('lifespan', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.depreciation.nozzlePrice')}
                            labelPlacement="outside"
                            value={state.nozzlePrice.toString()}
                            onChange={(e) => handleChange('nozzlePrice', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.depreciation.nozzleLifespan')}
                            labelPlacement="outside"
                            value={state.nozzleLifespan.toString()}
                            onChange={(e) => handleChange('nozzleLifespan', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.depreciation.bedPrice')}
                            labelPlacement="outside"
                            value={state.bedPrice.toString()}
                            onChange={(e) => handleChange('bedPrice', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.depreciation.bedLifespan')}
                            labelPlacement="outside"
                            value={state.bedLifespan.toString()}
                            onChange={(e) => handleChange('bedLifespan', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </AccordionItem>

                <AccordionItem
                    key="business"
                    aria-label={`4. ${t('form.business.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <TrendingUp size={22} className="text-success-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`4. ${t('form.business.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.business.title')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onFocus={(e) => e.stopPropagation()}>
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.labor.hourlyRate')}
                            labelPlacement="outside"
                            startContent={<User size={18} className="text-default-400" />}
                            endContent={<span className="text-tiny text-default-400">{t('units.uahPerHour')}</span>}
                            value={state.hourlyRate.toString()}
                            onChange={(e) => handleChange('hourlyRate', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.business.markup')}
                            labelPlacement="outside"
                            placeholder="100"
                            value={state.markup.toString()}
                            onChange={(e) => handleChange('markup', parseFloat(e.target.value) || 0)}
                            min={0}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.business.failureRate')}
                            labelPlacement="outside"
                            placeholder="1"
                            value={state.failureRate.toString()}
                            onChange={(e) => handleChange('failureRate', parseFloat(e.target.value) || 0)}
                            min={1}
                        />
                        <Input
                            type="number"
                            variant="flat"
                            label={t('form.additional.consumables')}
                            labelPlacement="outside"
                            startContent={<PlusCircle size={18} className="text-default-400" />}
                            value={state.consumables.toString()}
                            onChange={(e) => handleChange('consumables', parseFloat(e.target.value) || 0)}
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
                                        <p className="text-tiny text-default-400">
                                            {t('form.business.includeOlxFee')}
                                        </p>
                                    </div>
                                </Switch>
                            </div>
                        </>
                    )}
                </AccordionItem>

                <AccordionItem
                    key="additional"
                    aria-label={`5. ${t('form.additional.title')}`}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-default-100">
                                <PlusCircle size={22} className="text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-md font-bold leading-tight">{`5. ${t('form.additional.title')}`}</h3>
                                <p className="text-tiny text-default-500 uppercase tracking-wider">{t('form.additional.customExpenses')}</p>
                            </div>
                        </div>
                    }
                >
                    <div className="flex flex-col gap-3" onFocus={(e) => e.stopPropagation()}>
                        {state.customExpenses.map((expense) => (
                            <div key={expense.id} className="grid grid-cols-1 md:grid-cols-[1fr_150px_auto] gap-3 items-end">
                                <Input
                                    type="text"
                                    variant="flat"
                                    label={t('form.additional.expenseName')}
                                    labelPlacement="outside"
                                    placeholder={t('form.additional.expenseName')}
                                    value={expense.name}
                                    onChange={(e) => handleUpdateCustomExpense(expense.id, 'name', e.target.value)}
                                />
                                <Input
                                    type="number"
                                    variant="flat"
                                    label={t('form.additional.expenseAmount')}
                                    labelPlacement="outside"
                                    placeholder="0"
                                    endContent={<span className="text-tiny text-default-400">{t('units.uah')}</span>}
                                    value={expense.amount.toString()}
                                    onChange={(e) => handleUpdateCustomExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
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