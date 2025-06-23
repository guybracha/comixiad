import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ComicList from './ComicList';
import SeriesList from './SeriesList';
import RandomThree from './RandomThree';
import TopFive from './TopFive';
import LanguageSwitcher from './LanguageSwitcher';
import genres from '../config/Genres';
import '../Homepage.css';

function Homepage() {
  const { t } = useTranslation();

  return (
    <div className="homepage">
      <Helmet>
        <title>Comixiad</title>
        <meta
          name="description"
          content={t('bannerSubtitle')}
        />
        <html lang={document.documentElement.lang} />
      </Helmet>

      {/* Banner */}
      <header className="homepage-banner text-center">
        <LanguageSwitcher /> {/* מראה תמיד בפינה */}
        <h1>{t('bannerTitle')}</h1>
        <p>{t('bannerSubtitle')}</p>
        <Link to="/upload" className="btn btn-primary mt-3">
          {t('uploadBtn')}
        </Link>
      </header>

      <TopFive />

      {/* Categories */}
      <section className="homepage-categories">
        <h2>{t('popularCats')}</h2>
        <div className="categories-list">
          {genres.map((genre) => (
            <Link
              key={genre.id}
              to={`/category/${genre.id}`}
              className="category-card"
            >
              <span>{genre.emoji}</span>
              {genre.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="homepage-featured">
        <div className="container">
          <h2>{t('featuredComics')}</h2>
          <ComicList />
        </div>
      </section>

      <section className="homepage-featured">
        <div className="container">
          <h2>{t('houseSeries')}</h2>
          <SeriesList />
        </div>
      </section>

      <RandomThree />
    </div>
  );
}

export default Homepage;
