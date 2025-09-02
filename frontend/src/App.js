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
import 'bootstrap-icons/font/bootstrap-icons.css';


const TRACKING_ID = 'G-5R595Q7CLJ';
ReactGA.initialize(TRACKING_ID);
function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);
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
