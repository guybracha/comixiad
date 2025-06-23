// index.js
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import 'bootstrap/dist/css/bootstrap.min.css';

import { UserProvider } from './context/UserContext';

// --- NEW: i18n imports ---
import './i18n';                     // מפעיל את הקונפיגורציה
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';           // הא实例ה שמייצא הקובץ

// יצירת root לאפליקציה
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// רינדור האפליקציה
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      {/* Suspense מאפשר טעינת קובצי תרגום עצלים */}
      <Suspense fallback={<div style={{padding:16}}>Loading…</div>}>
        <UserProvider>
          <App />
        </UserProvider>
      </Suspense>
    </I18nextProvider>
  </React.StrictMode>
);

// אופציונלי: מדידת ביצועים
reportWebVitals();
