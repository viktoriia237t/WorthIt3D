import React, { useState, useEffect } from 'react';
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
                title="Інформація про модель"
                subtitle="Назва та посилання для ідентифікації"
                icon={<FileText size={22} className="text-green-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        type="text"
                        variant="flat"
                        label="Назва моделі"
                        labelPlacement="outside"
                        placeholder="Наприклад: Фігурка дракона"
                        value={modelName}
                        onChange={(e) => onModelNameChange?.(e.target.value)}
                    />
                    <Input
                        type="text"
                        variant="flat"
                        label="Посилання на модель"
                        labelPlacement="outside"
                        placeholder="https://www.thingiverse.com/..."
                        value={modelLink}
                        onChange={(e) => onModelLinkChange?.(e.target.value)}
                    />
                </div>
            </FormSection>

            {/* 1. МАТЕРІАЛИ */}
            <FormSection
                title="1. Матеріали"
                subtitle="Пластик або фотополімерна смола"
                icon={<Package size={22} className="text-blue-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        type="number"
                        variant="flat"
                        label="Вага моделі"
                        labelPlacement="outside"
                        placeholder="0.00"
                        startContent={<Weight size={18} className="text-default-400" />}
                        endContent={<span className="text-tiny text-default-400">г</span>}
                        value={state.weight.toString()}
                        onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Ціна котушки/літра"
                        labelPlacement="outside"
                        placeholder="800"
                        startContent={<CircleDollarSign size={18} className="text-default-400" />}
                        endContent={<span className="text-tiny text-default-400">грн</span>}
                        value={state.spoolPrice.toString()}
                        onChange={(e) => handleChange('spoolPrice', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        className="md:col-span-2"
                        type="number"
                        variant="flat"
                        label="Загальна вага котушки"
                        labelPlacement="outside"
                        placeholder="1000"
                        endContent={<span className="text-tiny text-default-400">г</span>}
                        value={state.spoolWeight.toString()}
                        onChange={(e) => handleChange('spoolWeight', parseFloat(e.target.value) || 0)}
                    />
                </div>
            </FormSection>

            {/* 2. ЧАСОВІ ВИТРАТИ */}
            <FormSection
                title="2. Часові витрати"
                subtitle="Друк та ручна робота"
                icon={<Clock size={22} className="text-orange-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        type="number"
                        variant="flat"
                        label="Друк"
                        labelPlacement="outside"
                        value={state.printTime.toString()}
                        onChange={(e) => handleChange('printTime', parseFloat(e.target.value) || 0)}
                        endContent={<span className="text-tiny text-default-400">год</span>}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Підготовка"
                        labelPlacement="outside"
                        value={state.prepTime.toString()}
                        onChange={(e) => handleChange('prepTime', parseFloat(e.target.value) || 0)}
                        endContent={<span className="text-tiny text-default-400">год</span>}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Пост-обробка"
                        labelPlacement="outside"
                        value={state.postTime.toString()}
                        onChange={(e) => handleChange('postTime', parseFloat(e.target.value) || 0)}
                        endContent={<span className="text-tiny text-default-400">год</span>}
                    />
                </div>
            </FormSection>

            {/* 3. ЕЛЕКТРИКА ТА АМОРТИЗАЦІЯ */}
            <FormSection
                title="3. Технічні витрати"
                subtitle="Енергія та знос обладнання"
                icon={<Cpu size={22} className="text-purple-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        type="number"
                        variant="flat"
                        label="Споживання (кВт)"
                        labelPlacement="outside"
                        startContent={<Zap size={18} className="text-default-400" />}
                        value={state.powerConsumption.toString()}
                        onChange={(e) => handleChange('powerConsumption', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Тариф (грн/кВт)"
                        labelPlacement="outside"
                        value={state.electricityTariff.toString()}
                        onChange={(e) => handleChange('electricityTariff', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Вартість принтера"
                        labelPlacement="outside"
                        startContent={<Wrench size={18} className="text-default-400" />}
                        value={state.printerPrice.toString()}
                        onChange={(e) => handleChange('printerPrice', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Ресурс принтера (год)"
                        labelPlacement="outside"
                        value={state.lifespan.toString()}
                        onChange={(e) => handleChange('lifespan', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Вартість сопла"
                        labelPlacement="outside"
                        description="Ціна одного сопла (грн)"
                        value={state.nozzlePrice.toString()}
                        onChange={(e) => handleChange('nozzlePrice', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Ресурс сопла (год)"
                        labelPlacement="outside"
                        description="Ресурс до заміни"
                        value={state.nozzleLifespan.toString()}
                        onChange={(e) => handleChange('nozzleLifespan', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Вартість столу/плити"
                        labelPlacement="outside"
                        description="Ціна столу або покриття (грн)"
                        value={state.bedPrice.toString()}
                        onChange={(e) => handleChange('bedPrice', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Ресурс столу (год)"
                        labelPlacement="outside"
                        description="Ресурс до заміни"
                        value={state.bedLifespan.toString()}
                        onChange={(e) => handleChange('bedLifespan', parseFloat(e.target.value) || 0)}
                    />
                </div>
            </FormSection>

            {/* 4. БІЗНЕС */}
            <FormSection
                title="4. Бізнес та робота"
                subtitle="Прибуток та оплата праці"
                icon={<TrendingUp size={22} className="text-success-500" />}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        type="number"
                        variant="flat"
                        label="Ставка майстра"
                        labelPlacement="outside"
                        startContent={<User size={18} className="text-default-400" />}
                        endContent={<span className="text-tiny text-default-400">грн/год</span>}
                        value={state.hourlyRate.toString()}
                        onChange={(e) => handleChange('hourlyRate', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Націнка (коефіцієнт)"
                        labelPlacement="outside"
                        placeholder="1.5"
                        value={state.markup.toString()}
                        onChange={(e) => handleChange('markup', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Ризик браку"
                        labelPlacement="outside"
                        placeholder="1.1"
                        value={state.failureRate.toString()}
                        onChange={(e) => handleChange('failureRate', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                        type="number"
                        variant="flat"
                        label="Інші витрати"
                        labelPlacement="outside"
                        startContent={<PlusCircle size={18} className="text-default-400" />}
                        value={state.consumables.toString()}
                        onChange={(e) => handleChange('consumables', parseFloat(e.target.value) || 0)}
                    />
                </div>
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
                            <p className="text-medium font-semibold">Додати комісію OLX</p>
                            <p className="text-tiny text-default-400">
                                Розрахувати вартість з урахуванням комісії OLX (+2% + 20 грн)
                            </p>
                        </div>
                    </Switch>
                </div>
            </FormSection>

            {/* 5. ДОДАТКОВІ ВИТРАТИ */}
            <FormSection
                title="5. Додаткові витрати"
                subtitle="Пакування, доставка, OLX тощо"
                icon={<PlusCircle size={22} className="text-amber-500" />}
            >
                <div className="flex flex-col gap-3">
                    {state.customExpenses.map((expense) => (
                        <div key={expense.id} className="grid grid-cols-1 md:grid-cols-[1fr_150px_auto] gap-3 items-end">
                            <Input
                                type="text"
                                variant="flat"
                                label="Назва витрати"
                                labelPlacement="outside"
                                placeholder="Наприклад: Доставка Нова Пошта"
                                value={expense.name}
                                onChange={(e) => handleUpdateCustomExpense(expense.id, 'name', e.target.value)}
                            />
                            <Input
                                type="number"
                                variant="flat"
                                label="Сума"
                                labelPlacement="outside"
                                placeholder="0"
                                endContent={<span className="text-tiny text-default-400">грн</span>}
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
                        Додати витрату
                    </Button>
                </div>
            </FormSection>

            {/* ПРИМІТКА */}
            {onNoteChange && (
                <Card shadow="sm" className="border-none bg-default-50">
                    <CardHeader className="flex gap-3">
                        <FileText size={20} className="text-default-500" />
                        <p className="font-bold">Нотатки до замовлення</p>
                    </CardHeader>
                    <CardBody>
                        <Textarea
                            variant="bordered"
                            placeholder="Вкажіть назву моделі або особливі побажання..."
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