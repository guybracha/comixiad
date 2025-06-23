// src/comp/LanguageSwitcher.js
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const change = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    document.documentElement.dir  = lng === 'he' ? 'rtl' : 'ltr';
  };

  return (
    <div className="btn-group">
      <button
        className="btn btn-outline-secondary btn-sm"
        disabled={i18n.language === 'en'}
        onClick={() => change('en')}
      >
        EN
      </button>
      <button
        className="btn btn-outline-secondary btn-sm"
        disabled={i18n.language === 'he'}
        onClick={() => change('he')}
      >
        עִבְרִית
      </button>
    </div>
  );
}

export default LanguageSwitcher;
