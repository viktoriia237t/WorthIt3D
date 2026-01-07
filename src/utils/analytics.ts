import ReactGA from 'react-ga4';

const MEASUREMENT_ID = 'G-44H68B8VSZ';

export const initGA = async () => {
  return new Promise<void>((resolve) => {
    try {
      ReactGA.initialize(MEASUREMENT_ID);
      resolve();
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
      resolve();
    }
  });
};

export const logPageView = async (page: string) => {
  return new Promise<void>((resolve) => {
    try {
      ReactGA.send({ hitType: 'pageview', page });
      resolve();
    } catch (error) {
      console.error('Failed to log page view:', error);
      resolve();
    }
  });
};

export const logEvent = async (category: string, action: string, label?: string) => {
  return new Promise<void>((resolve) => {
    try {
      ReactGA.event({
        category,
        action,
        label,
      });
      resolve();
    } catch (error) {
      console.error('Failed to log event:', error);
      resolve();
    }
  });
};
