import React from 'react';
import ComicList from './ComicList';
import { Link } from 'react-router-dom';
import '../Homepage.css';
import SeriesList from './SeriesList';
import About from './About';
import { Helmet } from 'react-helmet';
import genres from '../config/Genres';
import RandomThree from './RandomThree';
import TopFive from './TopFive';

function Homepage() {
  return (
    <div className="homepage">
      <Helmet>
        <title>Comixiad - קהילת הקומיקס שלכם</title>
        <meta name="description" content="קראו, שתפו וצרו קומיקסים ייחודיים עם יוצרים מרחבי העולם." />
        <meta name="keywords" content="קומיקס, קומיקס ישראלי, manga, comic book, artist, יצירה" />
      </Helmet>
      {/* Section 1: Banner */}
      <header className="homepage-banner">
        <h1>ברוכים הבאים ל-Comixiad!</h1>
        <p>הפלטפורמה שלכם לקרוא, לשתף וליצור קומיקס מכל העולם.</p>
        <Link to="/upload" className="btn btn-primary mt-3">
          העלו את הקומיקס שלכם
        </Link>
      </header>
      <TopFive/>
      {/* Section 2: Categories */}
      <section className="homepage-categories">
        <h2>קטגוריות פופולריות</h2>
        <div className="categories-list">
          {genres.map((genre) => (
            <Link key={genre.id} to={`/category/${genre.id}`} className="category-card">
              <span>{genre.emoji}</span>
              {genre.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3: Featured Comics */}
      <section className="homepage-featured">
        <div className='container'>
        <h2>קומיקסים מומלצים</h2>
        <ComicList />
        </div>
        </section>

        <section className="homepage-featured">
        <div className='container'>
        <h2>סדרות הבית שלנו</h2>
        <SeriesList />
        </div>
        </section>
        <RandomThree />
        <div>
        <About />
      </div>
    </div>
  );
}

export default Homepage;
