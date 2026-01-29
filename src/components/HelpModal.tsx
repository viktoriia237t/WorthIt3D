import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Accordion, AccordionItem } from '@heroui/react';
import { HelpCircle, Package, DollarSign, Clock, Zap, TrendingDown, Briefcase, Plus, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HelpModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

export default function HelpModal({ isOpen, onOpenChange }: HelpModalProps) {
  const { t } = useTranslation();

  const sections = [
    {
      key: 'modelInfo',
      title: t('help.sections.modelInfo.title'),
      icon: <Package size={18} />,
      content: t('help.sections.modelInfo.content'),
    },
    {
      key: 'materials',
      title: t('help.sections.materials.title'),
      icon: <DollarSign size={18} />,
      content: t('help.sections.materials.content'),
    },
    {
      key: 'time',
      title: t('help.sections.time.title'),
      icon: <Clock size={18} />,
      content: t('help.sections.time.content'),
    },
    {
      key: 'electricity',
      title: t('help.sections.electricity.title'),
      icon: <Zap size={18} />,
      content: t('help.sections.electricity.content'),
    },
    {
      key: 'depreciation',
      title: t('help.sections.depreciation.title'),
      icon: <TrendingDown size={18} />,
      content: t('help.sections.depreciation.content'),
    },
    {
      key: 'business',
      title: t('help.sections.business.title'),
      icon: <Briefcase size={18} />,
      content: t('help.sections.business.content'),
    },
    {
      key: 'additional',
      title: t('help.sections.additional.title'),
      icon: <Plus size={18} />,
      content: t('help.sections.additional.content'),
    },
    {
      key: 'olx',
      title: t('help.sections.olx.title'),
      icon: <ShoppingCart size={18} />,
      content: t('help.sections.olx.content'),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-2 items-center">
              <HelpCircle size={20} />
              {t('help.title')}
            </ModalHeader>
            <ModalBody>
              <Accordion
                variant="bordered"
                defaultExpandedKeys={['modelInfo', 'materials', 'business']}
                selectionMode="multiple"
              >
                {sections.map((section) => (
                  <AccordionItem
                    key={section.key}
                    aria-label={section.title}
                    title={
                      <div className="flex items-center gap-2">
                        {section.icon}
                        <span className="font-semibold">{section.title}</span>
                      </div>
                    }
                  >
                    <div className="text-sm text-default-700 dark:text-default-300 whitespace-pre-line pb-2">
                      {section.content}
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                {t('buttons.close')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
