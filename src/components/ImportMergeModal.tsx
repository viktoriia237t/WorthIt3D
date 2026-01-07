import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { RadioGroup, Radio } from '@heroui/radio';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Chip } from '@heroui/chip';
import type { CalculationHistory } from '../types/calculator';
import { detectDuplicates } from '../utils/import';

interface ImportMergeModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  importedData: CalculationHistory[];
  existingData: CalculationHistory[];
  onConfirm: (strategy: 'replace' | 'skip' | 'update') => void;
}

export const ImportMergeModal: React.FC<ImportMergeModalProps> = ({
  isOpen,
  onOpenChange,
  importedData,
  existingData,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [strategy, setStrategy] = useState<'replace' | 'skip' | 'update'>('skip');

  const { duplicates } = useMemo(
    () => detectDuplicates(existingData, importedData),
    [existingData, importedData]
  );

  const previewData = useMemo(() => importedData.slice(0, 5), [importedData]);

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
    if (value == null || !isFinite(value) || isNaN(value)) {
      return `0.00 ${currencySymbol}`;
    }
    return `${value.toFixed(2)} ${currencySymbol}`;
  };

  const handleConfirm = () => {
    onConfirm(strategy);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-xl font-bold">{t('history.import.mergeModal.title')}</span>
              <p className="text-sm text-default-500 font-normal">
                {t('history.import.mergeModal.summary', {
                  total: importedData.length,
                  duplicates: duplicates,
                })}
              </p>
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="flex flex-col gap-6">
                {/* Strategy Selection */}
                <div>
                  <p className="text-sm font-semibold mb-3">
                    {t('history.import.mergeModal.strategy')}
                  </p>
                  <RadioGroup value={strategy} onValueChange={(val) => setStrategy(val as any)}>
                    <Radio value="replace" description={t('history.import.mergeModal.replaceDesc')}>
                      {t('history.import.mergeModal.replace')}
                    </Radio>
                    <Radio value="skip" description={t('history.import.mergeModal.skipDesc')}>
                      {t('history.import.mergeModal.skip')}
                    </Radio>
                    <Radio value="update" description={t('history.import.mergeModal.updateDesc')}>
                      {t('history.import.mergeModal.update')}
                    </Radio>
                  </RadioGroup>
                </div>

                {/* Preview Table */}
                {previewData.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-3">
                      {t('history.import.mergeModal.preview')}
                    </p>
                    <Table
                      removeWrapper
                      aria-label="Preview of imported calculations"
                      className="border border-default-200 rounded-lg"
                    >
                      <TableHeader>
                        <TableColumn>DATE</TableColumn>
                        <TableColumn>MODEL</TableColumn>
                        <TableColumn>COST</TableColumn>
                        <TableColumn>PRICE</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {previewData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <span className="text-small">{formatDate(item.timestamp)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-small font-medium">
                                {item.modelName || item.note || 'Unnamed'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Chip size="sm" variant="flat" color="warning">
                                {formatCurrency(item.result.totalCost)}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <Chip size="sm" variant="flat" color="success">
                                {formatCurrency(item.result.finalPrice)}
                              </Chip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {importedData.length > 5 && (
                      <p className="text-tiny text-default-400 mt-2">
                        ... and {importedData.length - 5} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="flat" onPress={onClose}>
                {t('history.import.mergeModal.cancel')}
              </Button>
              <Button color="primary" onPress={handleConfirm}>
                {t('history.import.mergeModal.confirm')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
