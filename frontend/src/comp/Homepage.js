import React from 'react';
import ComicList from './ComicList';
import { Link } from 'react-router-dom';
import '../Homepage.css';

function Homepage() {
  return (
    <div className="homepage">
      {/* Section 1: Banner */}
      <header className="homepage-banner">
        <h1>ברוכים הבאים ל-Comixiad!</h1>
        <p>הפלטפורמה שלכם לקרוא, לשתף וליצור קומיקס מכל העולם.</p>
        <Link to="/upload" className="btn btn-primary mt-3">
          העלו את הקומיקס שלכם
        </Link>
      </header>

      {/* Section 2: Categories */}
      <section className="homepage-categories">
        <h2>קטגוריות פופולריות</h2>
        <div className="categories-list">
          <Link to="/category/action" className="category-card">🎭 פעולה</Link>
          <Link to="/category/fantasy" className="category-card">🪄 פנטזיה</Link>
          <Link to="/category/scifi" className="category-card">🚀 מדע בדיוני</Link>
          <Link to="/category/comedy" className="category-card">😂 קומדיה</Link>
        </div>
      </section>

      {/* Section 3: Featured Comics */}
      <section className="homepage-featured">
        <h2>קומיקסים מומלצים</h2>
        <ComicList />
        </section>
    </div>
  );
}

export default Homepage;
