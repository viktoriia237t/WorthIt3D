import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Calculator, Zap, Package, Wrench, User, Info, TrendingUp } from "lucide-react";
import type { CalculationResult } from '../types/calculator';

interface CalculationResultProps {
    result: CalculationResult;
}

export const CalculationResultComponent: React.FC<CalculationResultProps> = ({
                                                                                 result,
                                                                             }) => {
    const { t, i18n } = useTranslation();

    // Форматування валюти за стандартом
    const formatCurrency = (value: number) => {
        const currencySymbol = t('units.currencySymbol');
        // Handle null, undefined, NaN, Infinity, and invalid numbers
        if (value == null || !isFinite(value) || isNaN(value)) {
            return `0.00 ${currencySymbol}`;
        }
        return `${value.toFixed(2)} ${currencySymbol}`;
    };

    return (
        <Card
            isBlurred
            className="border-none bg-background/60 dark:bg-default-100/50 shadow-2xl max-w-[450px]"
        >
            <CardHeader className="flex gap-3 px-6 pt-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <Calculator className="text-primary" size={24} />
                </div>
                <div className="flex flex-col">
                    <p className="text-xl font-bold tracking-tight">{t('result.title')}</p>
                    <p className="text-tiny text-default-500 uppercase font-semibold">
                        {t('result.costBreakdown')}
                    </p>
                </div>
            </CardHeader>

            <Divider />

            <CardBody className="gap-6 px-6 py-4">
                {/* Блок складових собівартості */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-default-400 uppercase tracking-widest">{t('result.costBreakdown')}</span>
                        <Chip size="sm" variant="flat" color="primary">{t('result.costBreakdown')}</Chip>
                    </div>

                    <CostRow
                        icon={<Package size={16} />}
                        label={t('result.materials')}
                        value={formatCurrency(result.materialCost)}
                    />
                    <CostRow
                        icon={<Zap size={16} />}
                        label={t('result.electricity')}
                        value={formatCurrency(result.electricityCost)}
                    />
                    <CostRow
                        icon={<Wrench size={16} />}
                        label={t('result.depreciation')}
                        value={formatCurrency(result.depreciationCost)}
                    />
                    <CostRow
                        icon={<Wrench size={16} />}
                        label={t('result.nozzleWear')}
                        value={formatCurrency(result.nozzleWearCost)}
                    />
                    <CostRow
                        icon={<Wrench size={16} />}
                        label={t('result.bedWear')}
                        value={formatCurrency(result.bedWearCost)}
                    />
                    <CostRow
                        icon={<User size={16} />}
                        label={t('result.labor')}
                        value={formatCurrency(result.laborCost)}
                    />

                    {result.consumablesCost > 0 && (
                        <CostRow
                            icon={<Info size={16} />}
                            label={t('result.consumables')}
                            value={formatCurrency(result.consumablesCost)}
                        />
                    )}

                    {result.customExpensesCost > 0 && (
                        <CostRow
                            icon={<Info size={16} />}
                            label={t('result.customExpenses')}
                            value={formatCurrency(result.customExpensesCost)}
                        />
                    )}

                    {result.olxPrice > 0 && i18n.language === 'uk' && (
                        <CostRow
                            icon={<Package size={16} />}
                            label="OLX (+2% + 20₴)"
                            value={formatCurrency(result.olxPrice - result.finalPrice)}
                        />
                    )}

                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-default-200">
                        <span className="text-default-600 font-medium">{t('result.subtotal')}</span>
                        <span className="font-bold text-lg text-default-700">{formatCurrency(result.subtotal)}</span>
                    </div>
                </div>

                {/* Секція фінальних показників */}
                <div className="flex flex-col gap-4">
                    {/* Собівартість з браком */}
                    <div className="flex justify-between items-center p-4 rounded-2xl bg-warning-50 dark:bg-warning-900/20 border-1 border-warning-100 dark:border-warning-800/30">
                        <div className="flex flex-col">
                            <span className="text-warning-700 dark:text-warning-400 font-bold">{t('result.totalCost')}</span>
                            <span className="text-[10px] text-warning-600/70 uppercase font-bold">{t('result.failureRate')}</span>
                        </div>
                        <span className="text-xl font-bold text-warning-700 dark:text-warning-400">
              {formatCurrency(result.totalCost)}
            </span>
                    </div>

                    {/* ГОЛОВНА ЦІНА */}
                    <div className="relative p-5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/40 overflow-hidden">
                        <div className="flex flex-row justify-between items-center relative z-10">
                            <div>
                                <p className="text-xs font-black uppercase opacity-70 tracking-widest mb-1">{t('result.finalPrice')}</p>
                                <h3 className="text-4xl font-black">{formatCurrency(result.finalPrice)}</h3>
                            </div>
                            <TrendingUp className="opacity-20" size={80} />
                        </div>
                    </div>

                    {/* ЦІНА З OLX КОМІСІЄЮ - показуємо тільки для української мови */}
                    {result.olxPrice > 0 && i18n.language === 'uk' && (
                        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg overflow-hidden">
                            <div className="flex flex-col gap-2 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest">{t('result.olxPrice')}</p>
                                        <h3 className="text-3xl font-black">{formatCurrency(result.olxPrice)}</h3>
                                    </div>
                                    <Package className="opacity-20" size={60} />
                                </div>
                                <p className="text-[11px] opacity-80 font-medium">
                                    OLX: +2% + 20₴
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Чистий прибуток */}
                    <div className="flex flex-col md:flex-row justify-between items-center p-3 px-5 rounded-2xl bg-success-50 dark:bg-success-900/20 border-1 border-success-100 dark:border-success-800/30">
            <span className="text-success-700 dark:text-success-400 font-semibold flex items-center gap-2">
              {t('result.profit')}
              <Tooltip content={t('result.profit')}>
                <Info size={14} className="cursor-help" />
              </Tooltip>
            </span>
                        <span className="text-2xl font-black text-success-700 dark:text-success-400">
              {formatCurrency(result.profit)}
            </span>
                    </div>
                </div>
            </CardBody>

            <CardFooter className="px-6 pb-6 pt-2">
                <div className="flex gap-3 p-3 w-full bg-default-100/50 rounded-xl items-start">
                    <Info className="text-primary shrink-0" size={18} />
                    <p className="text-tiny text-default-500 leading-tight">
                        <strong>{t('result.tip')}</strong> {t('result.tipMessage')}
                    </p>
                </div>
            </CardFooter>
        </Card>
    );
};

/**
 * Допоміжний компонент для рядка витрат
 */
const CostRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex justify-between items-center group">
        <div className="flex items-center gap-3 text-default-500 group-hover:text-default-900 transition-colors">
            <span className="opacity-70 group-hover:opacity-100">{icon}</span>
            <span className="text-small">{label}</span>
        </div>
        <span className="text-small font-semibold font-mono tracking-tighter text-default-700">{value}</span>
    </div>
);