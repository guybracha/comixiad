// src/comp/Legal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { TERMS_HE_HTML, PRIVACY_HE_HTML, PRIVACY_EN_HTML, ACCESSIBILITY_HTML } from "./legal/legalTexts";

const TABS = ["terms", "privacy", "accessibility"];

export default function Legal() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(() => {
    const q = params.get("tab");
    return TABS.includes(q || "") ? q : "terms";
  });

  // שמירה לסרגל הכתובת
  useEffect(() => {
    const current = params.get("tab");
    if (current !== tab) {
      const p = new URLSearchParams(params);
      p.set("tab", tab);
      setParams(p, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const isHebrew = useMemo(() => i18n.language?.toLowerCase().startsWith("he"), [i18n.language]);
  const dir = isHebrew ? "rtl" : "ltr";
  const lastUpdated = isHebrew ? "8 בספטמבר 2025" : "September 8, 2025";

  return (
    <div className="container py-4" dir={dir}>
      {/* Skip link לצרכי נגישות */}
      <a href="#legal-main" className="visually-hidden-focusable">
        {isHebrew ? "דלג לתוכן" : "Skip to content"}
      </a>

      <header className="mb-3">
        <h1 className="h3 mb-1">
          {tab === "terms"
            ? t("legal.termsTitle")
            : tab === "privacy"
            ? t("legal.privacyTitle")
            : t("legal.accessTitle")}
        </h1>
        <p className="text-muted mb-0">{t("legal.lastUpdated", { date: lastUpdated })}</p>
      </header>

      {/* Nav tabs */}
      <ul className="nav nav-pills gap-2 mb-4" role="tablist" aria-label="Legal navigation">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${tab === "terms" ? "active" : ""}`}
            onClick={() => setTab("terms")}
            aria-selected={tab === "terms"}
            aria-controls="panel-terms"
            role="tab"
          >
            {t("nav.terms")}
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${tab === "privacy" ? "active" : ""}`}
            onClick={() => setTab("privacy")}
            aria-selected={tab === "privacy"}
            aria-controls="panel-privacy"
            role="tab"
          >
            {t("nav.privacy")}
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${tab === "accessibility" ? "active" : ""}`}
            onClick={() => setTab("accessibility")}
            aria-selected={tab === "accessibility"}
            aria-controls="panel-accessibility"
            role="tab"
          >
            {t("nav.accessibility")}
          </button>
        </li>
      </ul>

      {/* Panels */}
      <main id="legal-main">
        {/* Terms */}
        <section
          id="panel-terms"
          role="tabpanel"
          hidden={tab !== "terms"}
          aria-labelledby="terms-tab"
          className="card shadow-sm"
        >
          <div className="card-body">
            {/* תנאי שימוש – בעברית */}
            <div dangerouslySetInnerHTML={{ __html: TERMS_HE_HTML }} />
            <hr />
            <ContactBlock />
          </div>
        </section>

        {/* Privacy */}
        <section
          id="panel-privacy"
          role="tabpanel"
          hidden={tab !== "privacy"}
          aria-labelledby="privacy-tab"
          className="card shadow-sm"
        >
          <div className="card-body">
            {/* מדיניות פרטיות – עברית */}
            <h2 className="h5 mb-3">{t("legal.privacyTitle")}</h2>
            <div dangerouslySetInnerHTML={{ __html: PRIVACY_HE_HTML }} />

            <hr className="my-4" />

            {/* Privacy – English */}
            <div dir="ltr">
              <h2 className="h5 mb-3">{t("legal.privacyTitleEN")}</h2>
              <div dangerouslySetInnerHTML={{ __html: PRIVACY_EN_HTML }} />
            </div>

            <hr />
            <ContactBlock />
          </div>
        </section>

        {/* Accessibility */}
        <section
          id="panel-accessibility"
          role="tabpanel"
          hidden={tab !== "accessibility"}
          aria-labelledby="accessibility-tab"
          className="card shadow-sm"
        >
          <div className="card-body">
            <div dangerouslySetInnerHTML={{ __html: ACCESSIBILITY_HTML }} />
            <hr />
            <ContactBlock />
          </div>
        </section>
      </main>
    </div>
  );
}

function ContactBlock() {
  const { t } = useTranslation();
  return (
    <section className="mt-3">
      <h2 className="h5">{t("legal.contact")}</h2>
      <p>{t("legal.contactNote")}</p>
      <ul className="list-unstyled mb-0">
        <li>
          {t("legal.email")}:{" "}
          <a href="mailto:support@comixiad.com">support@comixiad.com</a>{" "}
          | <a href="mailto:privacy@comixiad.com">privacy@comixiad.com</a>{" "}
          | <a href="mailto:accessibility@comixiad.com">accessibility@comixiad.com</a>
        </li>
      </ul>
    </section>
  );
}