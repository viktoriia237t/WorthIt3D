import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// Імпорти HeroUI з окремих пакетів
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useDisclosure } from "@heroui/use-disclosure";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { ScrollShadow } from "@heroui/scroll-shadow";

// Іконки
import {
    History,
    Trash2,
    Eye,
    Edit3,
    Calendar,
    Layers,
    Clock,
    Info,
    ChevronRight
} from "lucide-react";

import type { CalculationHistory as CalculationHistoryType } from '../types/calculator';

interface CalculationHistoryProps {
    history: CalculationHistoryType[];
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onClearAll: () => void;
}

export const CalculationHistory: React.FC<CalculationHistoryProps> = ({
                                                                          history,
                                                                          onDelete,
                                                                          onEdit,
                                                                          onClearAll,
                                                                      }) => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState<CalculationHistoryType | null>(null);

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(timestamp));
    };

    const formatCurrency = (value: number) => {
        const currencySymbol = t('units.currencySymbol');
        return `${value.toFixed(2)} ${currencySymbol}`;
    };

    const handleViewDetails = (item: CalculationHistoryType) => {
        setSelectedItem(item);
        onOpen();
    };

    if (history.length === 0) {
        return (
            <Card shadow="sm" className="bg-default-50/50 border-dashed border-2 border-default-200">
                <CardBody className="text-center py-12 flex flex-col items-center gap-3">
                    <div className="p-4 bg-default-100 rounded-full">
                        <History size={32} className="text-default-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-default-600">{t('history.empty')}</p>
                        <p className="text-small text-default-400">
                            {t('history.emptyDescription')}
                        </p>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <>
            <Card shadow="sm">
                <CardHeader className="flex flex-col md:flex-row justify-between items-center px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                            <History className="text-secondary" size={20} />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-bold">{t('history.title')}</p>
                            <p className="text-tiny text-default-500 uppercase">
                                {history.length} {t('history.recordsSaved')}
                            </p>
                        </div>
                    </div>
                    <Button
                        color="danger"
                        variant="light"
                        size="sm"
                        startContent={<Trash2 size={16} />}
                        onPress={onClearAll}
                    >
                        {t('buttons.clearAll')}
                    </Button>
                </CardHeader>
                <Divider />

                <CardBody className="p-0">
                    <ScrollShadow orientation="horizontal" className="w-full">
                        <Table
                            removeWrapper
                            aria-label="Таблиця історії розрахунків"
                            className="min-w-[800px]"
                        >
                            <TableHeader>
                                <TableColumn>{t('history.columns.dateAndNote')}</TableColumn>
                                <TableColumn>{t('history.columns.parameters')}</TableColumn>
                                <TableColumn>{t('history.columns.cost')}</TableColumn>
                                <TableColumn>{t('history.columns.clientPrice')}</TableColumn>
                                <TableColumn align="center">{t('history.columns.actions')}</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {history.map((item) => (
                                    <TableRow key={item.id} className="border-b border-default-100 last:border-none">
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                        <span className="text-small font-medium flex items-center gap-1 text-default-700">
                          <Calendar size={12} /> {formatDate(item.timestamp)}
                        </span>
                                                {item.modelName && (
                                                    <span className="text-small font-semibold text-default-900 truncate max-w-[200px]">
                            {item.modelName}
                          </span>
                                                )}
                                                {item.note && (
                                                    <span className="text-tiny text-default-400 italic truncate max-w-[150px]">
                            {item.note}
                          </span>
                                                )}
                                                {!item.modelName && !item.note && (
                                                    <span className="text-tiny text-default-400 italic truncate max-w-[150px]">
                            {t('history.noName')}
                          </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Chip size="sm" variant="flat" startContent={<Layers size={12} className="ml-1" />}>
                                                    {item.state.weight}{t('units.grams')}
                                                </Chip>
                                                <Chip size="sm" variant="flat" startContent={<Clock size={12} className="ml-1" />}>
                                                    {item.state.printTime}{t('units.hours')}
                                                </Chip>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                      <span className="text-small font-semibold text-warning-600">
                        {formatCurrency(item.result.totalCost)}
                      </span>
                                        </TableCell>
                                        <TableCell>
                      <span className="text-small font-bold text-success-600">
                        {formatCurrency(item.result.finalPrice)}
                      </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative flex items-center justify-center gap-2">
                                                <Tooltip content={t('history.tooltips.details')}>
                                                    <Button isIconOnly size="sm" variant="light" onPress={() => handleViewDetails(item)}>
                                                        <Eye size={18} className="text-default-500" />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={t('history.tooltips.edit')}>
                                                    <Button isIconOnly size="sm" variant="light" onPress={() => onEdit(item.id)}>
                                                        <Edit3 size={18} className="text-primary" />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip color="danger" content={t('history.tooltips.delete')}>
                                                    <Button isIconOnly size="sm" variant="light" onPress={() => onDelete(item.id)}>
                                                        <Trash2 size={18} className="text-danger" />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollShadow>
                </CardBody>
            </Card>

            {/* Modal для детального перегляду */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="lg"
                scrollBehavior="inside"
                backdrop="blur"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b border-default-100">
                                <span className="text-xl font-bold">{t('modal.title')}</span>
                                <div className="flex items-center gap-2 text-tiny text-default-400 font-normal">
                                    <Calendar size={12} /> {selectedItem && formatDate(selectedItem.timestamp)}
                                </div>
                            </ModalHeader>
                            <ModalBody className="py-6">
                                {selectedItem && (
                                    <div className="flex flex-col gap-6">
                                        {/* Назва моделі */}
                                        {selectedItem.modelName && (
                                            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-l-4 border-primary">
                                                <p className="text-tiny text-primary-700 dark:text-primary-400 uppercase font-bold mb-1">{t('modal.modelName')}</p>
                                                <p className="text-small text-primary-900 dark:text-primary-400 font-semibold">{selectedItem.modelName}</p>
                                                {selectedItem.modelLink && (
                                                    <a
                                                        href={selectedItem.modelLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-tiny text-primary-600 dark:text-primary-400 hover:underline mt-1 block"
                                                    >
                                                        {t('modal.modelLink')} →
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Нотатка */}
                                        {selectedItem.note && (
                                            <div className="p-3 bg-default-100 rounded-xl border-l-4 border-secondary">
                                                <p className="text-tiny text-default-500 uppercase font-bold mb-1">{t('modal.note')}</p>
                                                <p className="text-small text-default-700 italic">"{selectedItem.note}"</p>
                                            </div>
                                        )}

                                        {/* Сітка параметрів */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailBlock label={t('modal.weight')} value={`${selectedItem.state.weight} ${t('units.grams')}`} icon={<Layers size={14}/>} />
                                            <DetailBlock label={t('modal.printTime')} value={`${selectedItem.state.printTime} ${t('units.hours')}`} icon={<Clock size={14}/>} />
                                        </div>

                                        <Divider />

                                        {/* Фінансовий розклад */}
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-default-400 uppercase tracking-widest">{t('modal.costBreakdown')}</p>
                                            <div className="space-y-2">
                                                <FinanceRow label={t('modal.materials')} value={selectedItem.result.materialCost} t={t} />
                                                <FinanceRow label={t('modal.electricity')} value={selectedItem.result.electricityCost} t={t} />
                                                <FinanceRow label={t('modal.labor')} value={selectedItem.result.laborCost} t={t} />
                                                <FinanceRow label={t('modal.depreciation')} value={selectedItem.result.depreciationCost} t={t} />
                                            </div>

                                            <div className="mt-4 p-4 rounded-2xl bg-success-50 dark:bg-success-900/10 flex justify-between items-center">
                                                <div>
                                                    <p className="text-success-700 dark:text-success-400 font-bold text-lg">{t('modal.finalPrice')}</p>
                                                    <p className="text-tiny text-success-600 opacity-70">{t('modal.yourProfit')}: {formatCurrency(selectedItem.result.profit)}</p>
                                                </div>
                                                <span className="text-2xl font-black text-success-700 dark:text-success-400">
                          {formatCurrency(selectedItem.result.finalPrice)}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter className="border-t border-default-100">
                                <Button color="default" variant="flat" onPress={onClose}>
                                    {t('buttons.close')}
                                </Button>
                                <Button color="primary" onPress={() => {onEdit(selectedItem?.id || ''); onClose();}}>
                                    {t('buttons.loadToCalculator')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

// Допоміжні мікро-компоненти для Modal
const DetailBlock = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-default-50 border border-default-100">
        <span className="text-tiny text-default-400 flex items-center gap-1">{icon} {label}</span>
        <span className="text-medium font-bold text-default-700">{value}</span>
    </div>
);

const FinanceRow = ({ label, value, t }: { label: string, value: number, t: any }) => (
    <div className="flex justify-between items-center px-1">
        <span className="text-small text-default-500">{label}</span>
        <span className="text-small font-mono font-medium">{value.toFixed(2)} {t('units.uah')}</span>
    </div>
);