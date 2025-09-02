// src/index.js
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './context/UserContext';

import i18n, { i18nReady } from './i18n';
import { I18nextProvider } from 'react-i18next';

// CRA קורא רק משתנים שמתחילים ב-REACT_APP_
const clientIdRaw = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const clientId = clientIdRaw.trim();

// === Debug ===
console.log(`🔑 CLIENT=[${clientIdRaw}] (raw len=${clientIdRaw.length})`);
console.log(`🔑 CLIENT_TRIM=[${clientId}] (trim len=${clientId.length})`);

const container = document.getElementById('root');
const root = createRoot(container);

// מסך טעינה בסיסי עד שה-i18n מוכן
function Loading() {
  return <div style={{ padding: 16 }}>Loading…</div>;
}

// אם אין clientId, נתריע בקונסול (נרנדר ללא Provider כדי לא לשבור את האפליקציה)
if (!clientId) {
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️ Missing REACT_APP_GOOGLE_CLIENT_ID. Add it to your frontend .env and restart the dev server.'
  );
}

root.render(<Loading />);

// נוודא שהתרגומים מוכנים לפני הרנדר הראשי
i18nReady.then(() => {
  const appTree = (
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={<Loading />}>
          <UserProvider>
            <App />
          </UserProvider>
        </Suspense>
      </I18nextProvider>
    </React.StrictMode>
  );

  // נעטוף ב-GoogleOAuthProvider רק אם יש clientId תקין
  root.render(
    clientId ? (
      <GoogleOAuthProvider clientId={clientId}>
        {appTree}
      </GoogleOAuthProvider>
    ) : (
      appTree
    )
  );
});

reportWebVitals();
