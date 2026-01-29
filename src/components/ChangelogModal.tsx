import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Divider } from '@heroui/react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChangelogModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

export default function ChangelogModal({ isOpen, onOpenChange }: ChangelogModalProps) {
  const { t } = useTranslation();

  const versions = t('changelog.versions', { returnObjects: true }) as Record<string, { date: string; changes: string[] }>;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-2 items-center">
              <FileText size={20} />
              {t('changelog.title')}
            </ModalHeader>
            <ModalBody>
              {Object.entries(versions)
                .reverse()
                .map(([version, info], index) => (
                <div key={version}>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Chip color="primary" variant="flat">
                        {t('changelog.version')} {version}
                      </Chip>
                      <span className="text-sm text-default-500">{info.date}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {info.changes.map((change, idx) => (
                        <li key={idx} className="text-default-700 dark:text-default-300">
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {index < Object.keys(versions).length - 1 && <Divider className="my-4" />}
                </div>
              ))}
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
