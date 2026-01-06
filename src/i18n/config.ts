import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uk from './locales/uk.json';
import en from './locales/en.json';

const LANGUAGE_KEY = 'app-language';

// Get language from URL parameter, localStorage, or default to Ukrainian
const getInitialLanguage = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');

  if (urlLang && ['en', 'uk'].includes(urlLang)) {
    return urlLang;
  }

  return localStorage.getItem(LANGUAGE_KEY) || 'uk';
};

const savedLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uk: { translation: uk },
      en: { translation: en },
    },
    lng: savedLanguage,
    fallbackLng: 'uk',
    interpolation: {
      escapeValue: false,
    },
  });

// Save language preference and update URL when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANGUAGE_KEY, lng);

  // Update URL parameter
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lng);
  window.history.replaceState({}, '', url.toString());
});

export default i18n;
