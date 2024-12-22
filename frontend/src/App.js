import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './comp/Navbar';
import ComicList from './comp/ComicList';
import ComicReader from './comp/ComicReader';
import UploadComic from './comp/UploadComic';

const App = () => (
    <Router>
        <Navbar />
        <Routes>
            <Route path="/" element={<ComicList />} />
            <Route path="/upload" element={<UploadComic/>}/>
            <Route path="/comics/:id" element={<ComicReader />} />
            <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
    </Router>
);

export default App;
