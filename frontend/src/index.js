import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // קובץ הסגנונות הכללי
import App from './App'; // הקומפוננטה הראשית של האפליקציה
import reportWebVitals from './reportWebVitals'; // מדידת ביצועים
import 'bootstrap/dist/css/bootstrap.min.css'; // ייבוא Bootstrap
import { UserProvider } from './context/UserContext'; // הקונטקסט של המשתמשים

// יצירת root לאפליקציה
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// רינדור האפליקציה
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

// אופציונלי: מדידת ביצועי האפליקציה
reportWebVitals();
