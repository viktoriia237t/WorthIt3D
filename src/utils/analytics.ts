import ReactGA from 'react-ga4';

const MEASUREMENT_ID = 'G-44H68B8VSZ';
const IS_DEV = import.meta.env.DEV;

export const initGA = async () => {
  return new Promise<void>((resolve) => {
    try {
      ReactGA.initialize(MEASUREMENT_ID, {
        gaOptions: {
          debug_mode: IS_DEV,
        },
        gtagOptions: {
          debug_mode: IS_DEV,
        },
      });
      console.log('[GA] Initialized with measurement ID:', MEASUREMENT_ID);
      resolve();
    } catch (error) {
      console.error('[GA] Failed to initialize Google Analytics:', error);
      resolve();
    }
  });
};

export const logPageView = async (page: string) => {
  return new Promise<void>((resolve) => {
    try {
      ReactGA.send({ hitType: 'pageview', page });
      console.log('[GA] Page view:', page);
      resolve();
    } catch (error) {
      console.error('[GA] Failed to log page view:', error);
      resolve();
    }
  });
};

export const logEvent = async (category: string, action: string, label?: string) => {
  return new Promise<void>((resolve) => {
    try {
      // GA4 uses different event structure than Universal Analytics
      // We use action as the event name and pass category/label as parameters
      const eventParams: Record<string, string> = {
        event_category: category,
      };

      if (label) {
        eventParams.event_label = label;
      }

      ReactGA.event(action, eventParams);
      console.log('[GA] Event:', action, eventParams);
      resolve();
    } catch (error) {
      console.error('[GA] Failed to log event:', error);
      resolve();
    }
  });
};
