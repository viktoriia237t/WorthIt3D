import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Модульні імпорти HeroUI
import { Input, Textarea } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Switch } from '@heroui/switch';
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

            {/* ІНФОРМАЦІЯ ПРО МОДЕЛЬ */}
            <FormSection
                title={t('form.modelInfo.title')}
                subtitle={t('form.modelInfo.title')}
                icon={<FileText size={22} className="text-green-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </FormSection>

            {/* 1. МАТЕРІАЛИ */}
            <FormSection
                title={`1. ${t('form.materials.title')}`}
                subtitle={t('form.materials.title')}
                icon={<Package size={22} className="text-blue-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </FormSection>

            {/* 2. ЧАСОВІ ВИТРАТИ */}
            <FormSection
                title={`2. ${t('form.time.title')}`}
                subtitle={t('form.time.title')}
                icon={<Clock size={22} className="text-orange-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        type="number"
                        variant="flat"
                        label={t('form.time.printTime')}
                        labelPlacement="outside"
                        value={state.printTime.toString()}
                        onChange={(e) => handleChange('printTime', parseFloat(e.target.value) || 0)}
                        endContent={<span className="text-tiny text-default-400">{t('units.hours')}</span>}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label={t('form.time.prepTime')}
                        labelPlacement="outside"
                        value={state.prepTime.toString()}
                        onChange={(e) => handleChange('prepTime', parseFloat(e.target.value) || 0)}
                        endContent={<span className="text-tiny text-default-400">{t('units.hours')}</span>}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label={t('form.time.postTime')}
                        labelPlacement="outside"
                        value={state.postTime.toString()}
                        onChange={(e) => handleChange('postTime', parseFloat(e.target.value) || 0)}
                        endContent={<span className="text-tiny text-default-400">{t('units.hours')}</span>}
                    />
                </div>
            </FormSection>

            {/* 3. ЕЛЕКТРИКА ТА АМОРТИЗАЦІЯ */}
            <FormSection
                title={`3. ${t('form.electricity.title')} & ${t('form.depreciation.title')}`}
                subtitle={t('form.electricity.title')}
                icon={<Cpu size={22} className="text-purple-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </FormSection>

            {/* 4. БІЗНЕС */}
            <FormSection
                title={`4. ${t('form.business.title')}`}
                subtitle={t('form.business.title')}
                icon={<TrendingUp size={22} className="text-success-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="1.5"
                        value={state.markup.toString()}
                        onChange={(e) => handleChange('markup', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label={t('form.business.failureRate')}
                        labelPlacement="outside"
                        placeholder="1.1"
                        value={state.failureRate.toString()}
                        onChange={(e) => handleChange('failureRate', parseFloat(e.target.value) || 0)}
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
            </FormSection>

            {/* 5. ДОДАТКОВІ ВИТРАТИ */}
            <FormSection
                title={`5. ${t('form.additional.title')}`}
                subtitle={t('form.additional.customExpenses')}
                icon={<PlusCircle size={22} className="text-amber-500" />}
            >
                <div className="flex flex-col gap-3">
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
            </FormSection>

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

/**
 * Допоміжний компонент для секції форми
 */
const FormSection = ({ title, subtitle, icon, children }: { title: string, subtitle: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-1">
            <div className="p-2 rounded-lg bg-default-100">
                {icon}
            </div>
            <div>
                <h3 className="text-md font-bold leading-tight">{title}</h3>
                <p className="text-tiny text-default-500 uppercase tracking-wider">{subtitle}</p>
            </div>
        </div>
        <Card shadow="sm" className="border-none bg-background/60 dark:bg-default-100/20">
            <CardBody className="p-6">
                {children}
            </CardBody>
        </Card>
    </div>
);