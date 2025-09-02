// index.js
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

// === CRA: קרא רק מ-REACT_APP_* ===
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!clientId) {
  // eslint-disable-next-line no-console
  console.warn(
    'Missing Google Client ID. Set REACT_APP_GOOGLE_CLIENT_ID in your frontend .env and restart the dev server.'
  );
}

const container = document.getElementById('root');
const root = createRoot(container);

// מסך טעינה זמני עד שה-i18n מוכן
root.render(<div style={{ padding: 16 }}>Loading…</div>);

i18nReady.then(() => {
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={clientId || ''}>
        <I18nextProvider i18n={i18n}>
          <Suspense fallback={null}>
            <UserProvider>
              <App />
            </UserProvider>
          </Suspense>
        </I18nextProvider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
});

reportWebVitals();
