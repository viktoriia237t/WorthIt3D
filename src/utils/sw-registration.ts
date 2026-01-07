// Service Worker Registration Utility
// Handles SW registration, update detection, and lifecycle management

export interface ServiceWorkerUpdateEvent {
  type: 'update-available' | 'update-installed' | 'controlling';
}

export type UpdateCallback = (event: ServiceWorkerUpdateEvent) => void;

/**
 * Registers the service worker and sets up update detection
 * @param onUpdate Callback function called when updates are detected
 * @returns ServiceWorkerRegistration or null if not supported
 */
export async function registerServiceWorker(
  onUpdate: UpdateCallback
): Promise<ServiceWorkerRegistration | null> {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW Registration] Service workers are not supported in this browser');
    return null;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW Registration] Service worker registered successfully:', registration.scope);

    // Set up update detection
    setupUpdateDetection(registration, onUpdate);

    // Check for updates periodically (every 60 minutes)
    setInterval(() => {
      console.log('[SW Registration] Checking for updates...');
      registration.update();
    }, 60 * 60 * 1000); // 60 minutes

    // Also check for updates when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('[SW Registration] Page visible, checking for updates...');
        registration.update();
      }
    });

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Registration] New service worker activated');
      onUpdate({ type: 'controlling' });
    });

    return registration;
  } catch (error) {
    console.error('[SW Registration] Registration failed:', error);
    return null;
  }
}

/**
 * Sets up update detection for the service worker
 * @param registration ServiceWorkerRegistration instance
 * @param onUpdate Callback for update events
 */
function setupUpdateDetection(
  registration: ServiceWorkerRegistration,
  onUpdate: UpdateCallback
): void {
  // Check if there's already an update waiting
  if (registration.waiting) {
    console.log('[SW Registration] Update already waiting');
    onUpdate({ type: 'update-available' });
  }

  // Listen for new service worker installing
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;

    if (!newWorker) {
      return;
    }

    console.log('[SW Registration] New service worker installing...');

    newWorker.addEventListener('statechange', () => {
      console.log('[SW Registration] Service worker state:', newWorker.state);

      // When the new SW is installed and there's an existing controller
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('[SW Registration] New version available!');
        onUpdate({ type: 'update-available' });
      }

      // When the new SW is activated
      if (newWorker.state === 'activated') {
        console.log('[SW Registration] New service worker activated');
        onUpdate({ type: 'update-installed' });
      }
    });
  });
}

/**
 * Tells the waiting service worker to skip waiting and activate immediately
 * @param registration ServiceWorkerRegistration instance
 */
export function skipWaiting(registration: ServiceWorkerRegistration | null): void {
  if (!registration || !registration.waiting) {
    console.warn('[SW Registration] No waiting service worker to skip');
    return;
  }

  console.log('[SW Registration] Sending SKIP_WAITING message to service worker');
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Checks if a service worker is currently registered
 * @returns boolean indicating if SW is registered
 */
export function isServiceWorkerRegistered(): boolean {
  return 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
}

/**
 * Unregisters all service workers (for debugging/cleanup)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
      await registration.unregister();
      console.log('[SW Registration] Unregistered service worker');
    }

    return true;
  } catch (error) {
    console.error('[SW Registration] Failed to unregister:', error);
    return false;
  }
}
