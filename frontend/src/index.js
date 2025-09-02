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

// debug נחמד לראות שאין רווחים/ריקים
console.log(`🔑 CLIENT=[${clientIdRaw}] (raw len=${clientIdRaw.length})`);
console.log(`🔑 CLIENT_TRIM=[${clientId}] (trim len=${clientId.length})`);

const container = document.getElementById('root');
const root = createRoot(container);

function Loading() {
  return <div style={{ padding: 16 }}>Loading…</div>;
}

// רנדר ראשוני למסך טעינה
root.render(<Loading />);

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

  // עוטפים בגוגל רק אם יש clientId תקין
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
