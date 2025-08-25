// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const baseLang = (lng = 'en') => lng.toLowerCase().split('-')[0];
const RTL_SET = ['ar', 'he', 'fa', 'ur'];

const setDir = (lng) => {
  const code = baseLang(lng);
  document.documentElement.lang = code;
  document.documentElement.dir = RTL_SET.includes(code) ? 'rtl' : 'ltr';
};

const loadLocale = async (lng) => {
  const code = baseLang(lng);
  const mod = await import(`./locales/${code}/translation.json`);
  return { code, messages: mod.default };
};

const ensureBundle = async (lng) => {
  const code = baseLang(lng);
  if (!i18n.hasResourceBundle(code, 'translation')) {
    const { messages } = await loadLocale(code);
    i18n.addResourceBundle(code, 'translation', messages, true, true);
  }
  return code;
};

// אפשרי: פרה-טעינה לשתי השפות העיקריות למניעת פלאש
const prefetchCoreLangs = Promise.allSettled([
  loadLocale('en').then(({ messages }) =>
    i18n.addResourceBundle('en', 'translation', messages, true, true)
  ),
  loadLocale('he').then(({ messages }) =>
    i18n.addResourceBundle('he', 'translation', messages, true, true)
  ),
]);

// אתחול + פרומיס מוכנות שתרנדרו רק לאחריו
export const i18nReady = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lowerCaseLng: true,
    load: 'languageOnly',
    supportedLngs: ['en', 'he'],
    nonExplicitSupportedLngs: true,
    resources: {},                         // נטען דינמית
    interpolation: { escapeValue: false },
    react: { useSuspense: true },          // נשתמש ב-Suspense ברנדור
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  })
  .then(async () => {
    await prefetchCoreLangs;
    await ensureBundle(i18n.resolvedLanguage); // bundle ראשוני
    setDir(i18n.resolvedLanguage);
  });

i18n.on('languageChanged', async (lng) => {
  await ensureBundle(lng);
  setDir(lng);
});

export default i18n;
