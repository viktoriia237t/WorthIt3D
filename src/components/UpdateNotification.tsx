import { useState, useEffect } from 'react';
import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { skipWaiting } from '../utils/sw-registration';

interface UpdateNotificationProps {
  registration: ServiceWorkerRegistration | null;
}

export function UpdateNotification({ registration }: UpdateNotificationProps) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if update was previously dismissed in this session
    const dismissed = sessionStorage.getItem('sw-update-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // Show notification if there's a waiting service worker
    if (registration?.waiting && !dismissed) {
      setShowUpdate(true);
    }
  }, [registration]);

  const handleUpdate = () => {
    if (!registration) return;

    // Send skip waiting message to service worker
    skipWaiting(registration);

    // Listen for controller change to reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload the page to get the new version
      window.location.reload();
    });

    // Hide the notification
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    // Store dismissal in session storage (persists until tab closes)
    sessionStorage.setItem('sw-update-dismissed', 'true');
    setShowUpdate(false);
    setIsDismissed(true);
  };

  // Don't render if dismissed or no update available
  if (!showUpdate || isDismissed || !registration?.waiting) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Alert
        color="primary"
        variant="flat"
        title="Нова версія доступна!"
        description="Оновіть додаток, щоб отримати найновіші функції та покращення."
        endContent={
          <div className="flex gap-2">
            <Button
              color="primary"
              size="sm"
              onPress={handleUpdate}
            >
              Оновити
            </Button>
            <Button
              color="default"
              variant="light"
              size="sm"
              onPress={handleDismiss}
            >
              Пізніше
            </Button>
          </div>
        }
      />
    </div>
  );
}
