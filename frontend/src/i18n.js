// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const loadLocale = (lng) =>
  import(`./locales/${lng}/translation.json`);   // ← כאן השינוי

const setDir = (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir  = lng === 'he' ? 'rtl' : 'ltr';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {},
    interpolation:{ escapeValue:false },
    react:{ useSuspense:true },
  })
  .then(() => setDir(i18n.language));

i18n.on('languageChanged', async (lng) => {
  setDir(lng);

  if (!i18n.hasResourceBundle(lng, 'translation')) {
    const msgs = (await loadLocale(lng)).default;
    i18n.addResourceBundle(lng, 'translation', msgs, true, true);
  }
});

export default i18n;
