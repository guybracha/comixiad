// index.js
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

import { UserProvider } from './context/UserContext';

// i18n
import i18n, { i18nReady } from './i18n';
import { I18nextProvider } from 'react-i18next';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// רנדר עדין של “Loading…” בזמן שמחכים ל-i18n (רשות)
root.render(<div style={{ padding: 16 }}>Loading…</div>);

// אחרי ש-i18n מוכן — רנדר מלא
i18nReady.then(() => {
  root.render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={null /* או שלד קטן */}>
          <UserProvider>
            <App />
          </UserProvider>
        </Suspense>
      </I18nextProvider>
    </React.StrictMode>
  );
});

reportWebVitals();
