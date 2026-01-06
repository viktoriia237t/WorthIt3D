import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useSeoMeta = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language;

    // Update document title
    document.title = t('seo.title');

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('seo.description'));
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', t('seo.keywords'));
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t('seo.title'));
    }

    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', t('seo.description'));
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', t('seo.title'));
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', t('seo.description'));
    }

    // Update Open Graph locale
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute('content', currentLang === 'uk' ? 'uk_UA' : 'en_US');
    }

    const ogLocaleAlternate = document.querySelector('meta[property="og:locale:alternate"]');
    if (ogLocaleAlternate) {
      ogLocaleAlternate.setAttribute('content', currentLang === 'uk' ? 'en_US' : 'uk_UA');
    }
  }, [i18n.language, t]);
};
