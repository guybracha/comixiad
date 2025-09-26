// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import ReactGA from 'react-ga4';

import Navbar from './comp/Navbar';
import Homepage from './comp/Homepage';
import UploadComic from './comp/UploadComic';
import ComicReader from './comp/ComicReader';
import RegistrationForm from './comp/RegistrationForm';
import Login from './comp/Login';
import CategoryPage from './comp/CategoryPage';
import Error from './comp/Error';
import Footer from './comp/Footer';
import UserProfile from './comp/UserProfile';
import CreateSeries from './comp/CreateSeries';
import EditComic from './comp/EditComic';
import EditSeries from './comp/EditSeries';
import SearchResults from './comp/SearchResults';
import SeriesDetail from './comp/SeriesDetail';
import Legal from './comp/Legal';

import { API_BASE_URL } from './Config';
import 'bootstrap-icons/font/bootstrap-icons.css';

/* ---------- Google Analytics ---------- */
const TRACKING_ID = 'G-5R595Q7CLJ';
ReactGA.initialize(TRACKING_ID);

function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    // שולח גם query string כדי לקבל תמונה מלאה
    const page = location.pathname + (location.search || '');
    ReactGA.send({ hitType: 'pageview', page });
  }, [location]);
}

/* ---------- Guard: דרישת בעלות על משאב ---------- */
/**
 * בודק מול ה-API אם המשתמש המחובר הוא הבעלים של המשאב.
 * resource: 'comic' | 'series'
 * ownerField: שדה הבעלות שמוחזר מהשרת, ברירת מחדל 'author'
 * אם אצלך הבעלות נשמרת בשדה אחר (למשל userId/ownerId) עדכן בלוגיקה למטה.
 */
function RequireOwnership({ resource, ownerField = 'author', children }) {
  const { user } = useUser();
  const { comicId, seriesId } = useParams();
  const id = resource === 'comic' ? comicId : seriesId;

  const [allowed, setAllowed] = useState(null); // null=טוען, true=מורשה, false=אסור

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) { if (alive) setAllowed(false); return; }
      try {
        const url =
          resource === 'comic'
            ? `${API_BASE_URL}/api/comics/${id}`
            : `${API_BASE_URL}/api/series/${id}`;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) { if (alive) setAllowed(false); return; }
        const data = await res.json();

        // הפקת מזהה הבעלים: author יכול להיות אובייקט או ID.
        const ownerId =
          data?.[ownerField]?._id ||
          data?.[ownerField] ||
          data?.author?._id ||
          data?.userId ||
          data?.ownerId;

        if (alive) setAllowed(String(ownerId) === String(user?._id));
      } catch {
        if (alive) setAllowed(false);
      }
    })();
    return () => { alive = false; };
  }, [user, id, resource, ownerField]);

  if (allowed === null) return <div className="text-muted p-3">טוען…</div>;
  if (!allowed) return <Navigate to="/login" replace />;

  return children;
}

/* ---------- תוכן האפליקציה ---------- */
const AppContent = () => {
  const { user, setUser } = useUser();
  usePageTracking();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser]);

  return (
    <>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Homepage />} />

        {/* העלאה/יצירת סדרה – דורש התחברות */}
        <Route
          path="/upload"
          element={user ? <UploadComic /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/createSeries"
          element={user ? <CreateSeries /> : <Navigate to="/login" replace />}
        />

        {/* קריאה/צפייה */}
        <Route path="/comics/:id" element={<ComicReader />} />
        <Route path="/series/:id" element={<SeriesDetail />} />

        {/* פרופיל/קטגוריות/חיפוש */}
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/search" element={<SearchResults />} />

        {/* Auth + סטטי */}
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/legal" element={<Legal />} />

        {/* עריכת סדרה/קומיקס – דורש התחברות ובעלות */}
        <Route
          path="/series/:seriesId/edit"
          element={
            user ? (
              <RequireOwnership resource="series" ownerField="author">
                <EditSeries />
              </RequireOwnership>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/comics/:comicId/edit"
          element={
            user ? (
              <RequireOwnership resource="comic" ownerField="author">
                <EditComic />
              </RequireOwnership>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<Error />} />
      </Routes>
      <Footer />
    </>
  );
};

/* ---------- מעטפת האפליקציה ---------- */
const App = () => {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
};

export default App;
