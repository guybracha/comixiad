import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import 'bootstrap-icons/font/bootstrap-icons.css';


const TRACKING_ID = 'G-5R595Q7CLJ';
ReactGA.initialize(TRACKING_ID);
function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);
}

function AccessibilityWidget({ requireConsent = false }) {
  useEffect(() => {
    if (window.__userwayLoaded) return;

    if (requireConsent) {
      const consent = localStorage.getItem("cookieConsent"); // התאם למפתח שלך
      if (!consent) return;
    }

    // 1) config לפני הטעינה
    window._userway_config = {
      account: "YOUR_USERWAY_ACCOUNT_ID",                 // ← להחליף
      language: (document.documentElement.lang || "en").startsWith("he") ? "he" : "en",
      position: "right",
      size: "small",
      mobile: true,
      // color: "#0d6efd",
      // statement_url: "/legal?tab=accessibility"
    };

    // 2) טעינת הסקריפט (עם SRI כמו בקוד שלך)
    const s = document.createElement("script");
    s.id = "userway-widget";
    s.async = true;
    s.src = "https://cdn.userway.org/widget.js";
    s.integrity = "sha256-QPrb2tX87EVFWCE3Fbl0tzkoVG93kt8h6BrdZHod66U=";
    s.crossOrigin = "anonymous";
    s.onload = () => (window.__userwayLoaded = true);
    document.body.appendChild(s);
  }, [requireConsent]);

  return null;
}


const AppContent = () => {
    const { user, setUser } = useUser();
    usePageTracking(); // ✅ עכשיו בתוך Router

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [setUser]);

    return (
        <>
            <AccessibilityWidget requireConsent={false} />
            <Navbar user={user} />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route 
                    path="/upload" 
                    element={user ? <UploadComic /> : <Navigate to="/login" replace />} 
                />
                <Route 
                path="/createSeries" 
                element={user ? <CreateSeries /> : <Navigate to="/login" replace />} 
                />
                <Route path="/comics/:id" element={<ComicReader />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route path="/login" element={<Login />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/profile/:id" element={<UserProfile />} />
                <Route
                    path="/series/:seriesId/edit"
                    element={user ? <EditSeries /> : <Navigate to="/login" replace />}
                    />
                    {/* עריכת קומיקס */}
                <Route
                    path="/comics/:comicId/edit"
                    element={user ? <EditComic /> : <Navigate to="/login" replace />}
                />
                <Route path="/series/:id" element={<SeriesDetail />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="*" element={<Error />} />
                <Route path="/legal" element={<Legal />} />
            </Routes>
            <Footer />
        </>
    );
};

const App = () => {
    return (
        <UserProvider>
            <Router> {/* ✅ העברה לכאן */}
                <AppContent />
            </Router>
        </UserProvider>
    );
};

export default App;
