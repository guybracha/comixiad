import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import languages from '../config/Languages';
import genres from '../config/Genres';
import { Link, useNavigate } from 'react-router-dom';

function UploadComic() {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [pages, setPages] = useState([]);
  const [series, setSeries] = useState('');
  const [allSeries, setAllSeries] = useState([]);
  const [adultOnly, setAdultOnly] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  /* ---------- חסימת דף למשתמשים לא מחוברים ---------- */
  useEffect(() => {
    if (!user?._id) navigate('/login', { replace: true });
  }, [user, navigate]);

  /* ---------- טעינת הסדרות של המשתמש ---------- */
  useEffect(() => {
    if (!user?._id) return;

    const fetchSeries = async () => {
      try {
        const { data } = await api.get('/api/series'); // ה־JWT מצורף אוטומטית
        setAllSeries(data.filter((s) => s.author === user._id));
      } catch (err) {
        console.error('series fetch error ->', err?.response || err);
      }
    };
    fetchSeries();
  }, [user]);

  const handlePagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setPages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!pages.length) {
      setError(t('upload.noPages') || 'לא נבחרו עמודים');
      return;
    }

    try {
      const form = new FormData();
      form.append('title', title.trim());
      form.append('description', description.trim());
      form.append('language', String(language || '').toLowerCase());
      form.append('genre', genre);
      if (series) form.append('series', series);
      form.append('adultOnly', adultOnly ? 'true' : 'false');

      // multer בצד שרת מצפה לשם 'pages'
      pages.forEach((p) => form.append('pages', p));

      await api.post('/api/comics/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage(t('upload.success') || 'העלאה הצליחה!');
      setTitle('');
      setDescription('');
      setLanguage('');
      setGenre('');
      setSeries('');
      setPages([]);
      setAdultOnly(false);
      // אפשר לנווט לעמוד הקומיקס החדש אם השרת מחזיר _id
      // navigate(`/comic/${res.data._id}`);
    } catch (err) {
      console.error('upload error ->', err?.response?.status, err?.response?.data || err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }
      const apiMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        t('upload.fail') ||
        'העלאה נכשלה. נסה שוב.';
      setError(apiMsg);
    }
  };

  return (
    <div className="container py-5">
      <h2>{t('upload.title')}</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            {t('upload.comicName')}
          </label>
          <input
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            {t('upload.description')}
          </label>
          <textarea
            id="description"
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="language" className="form-label">
            {t('upload.language')}
          </label>
          <select
            id="language"
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
          >
            <option value="">{t('upload.chooseLanguage')}</option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.emoji} {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="genre" className="form-label">
            {t('upload.genre')}
          </label>
          <select
            id="genre"
            className="form-select"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          >
            <option value="">{t('upload.chooseGenre')}</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.emoji} {t(`genres.${g.id}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="pages" className="form-label">
            {t('upload.pages')}
          </label>
          <input
            id="pages"
            type="file"
            className="form-control"
            multiple
            accept="image/*"
            onChange={handlePagesChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="series" className="form-label">
            {t('upload.seriesOpt')}
          </label>
          <select
            id="series"
            className="form-select"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
          >
            <option value="">{t('upload.chooseSeries')}</option>
            {allSeries.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-check mb-3">
          <input
            id="adultOnly"
            type="checkbox"
            className="form-check-input"
            checked={adultOnly}
            onChange={(e) => setAdultOnly(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="adultOnly">
            {t('upload.adultLabel')}
          </label>
          <div className="form-text">{t('upload.adultHint')}</div>
        </div>

        <button className="btn btn-primary" type="submit">
          {t('upload.submit')}
        </button>
        <Link to="/CreateSeries" className="btn btn-secondary ms-2">
          {t('upload.createSeries')}
        </Link>
      </form>
    </div>
  );
}

export default UploadComic;
