import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Alert } from "@heroui/alert";

interface MigrationBannerProps {
  isMigrating: boolean;
  migrationError: string | null;
}

export const MigrationBanner: React.FC<MigrationBannerProps> = ({
  isMigrating,
  migrationError,
}) => {
  const { t } = useTranslation();

  if (migrationError) {
    return (
      <Alert
        color="danger"
        variant="bordered"
        className="mb-4"
        title={t('migration.error.title')}
        description={t('migration.error.description')}
      />
    );
  }

  if (!isMigrating) return null;

  return (
    <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20">
      <CardBody>
        <div className="flex items-center gap-3">
          <Spinner size="sm" />
          <div>
            <p className="font-semibold text-blue-800 dark:text-blue-300">
              {t('migration.inProgress.title')}
            </p>
            <p className="text-small text-blue-600 dark:text-blue-400">
              {t('migration.inProgress.description')}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
