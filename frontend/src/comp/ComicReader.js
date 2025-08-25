import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../ComicReader.css';
import { Helmet } from 'react-helmet';
import { API_BASE_URL } from '../Config';
import RandomThree from './RandomThree';
import { useUser } from '../context/UserContext'; // הוסף למעלה

const ComicReader = () => {
  const { id: comicId } = useParams();
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  const { user } = useUser(); // בתוך ComicReader
  const [hasLiked, setHasLiked] = useState(false); // למעקב אחרי לייק אישי
  const adultKey = `adult-ok:${comicId}`;
  const [showAdultGate, setShowAdultGate] = useState(false);

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [comicId]);

  useEffect(() => {
    const fetchComic = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/comics/${comicId}`);
        setComic(data);
        await axios.put(`${API_BASE_URL}/api/comics/${comicId}/view`);

        setHasLiked(!!data.likedBy?.includes(user?._id));

        // 🔴 NEW: decide if to show adult gate
        const isAdult = !!data?.adultOnly;
        const ok = localStorage.getItem(adultKey) === 'true';
        setShowAdultGate(isAdult && !ok);
      } catch (err) {
        console.error('Error fetching comic:', err);
        setError('לא ניתן לטעון את הקומיקס');
      } finally {
        setLoading(false);
      }
    };

    fetchComic();
  }, [comicId, user?._id, adultKey]); // adultKey תלוי ב-comicId

  const handleAdultConfirm = () => {
    localStorage.setItem(adultKey, 'true');
    setShowAdultGate(false);
  };

  const handleAdultExit = () => {
    // חזרה אחורה אם אפשר; אחרת לעמוד הבית
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  };


  const handleLike = async () => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/comics/${comicId}/like`, {
      userId: user._id,
    });
    setComic(response.data);
    setHasLiked(true);
  } catch (err) {
    console.error('Error liking comic:', err);
  }
};

const handleUnlike = async () => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/comics/${comicId}/unlike`, {
      userId: user._id,
    });
    setComic(response.data);
    setHasLiked(false);
  } catch (err) {
    console.error('Error unliking comic:', err);
  }
};


  if (loading) return <div className="text-center py-5">📚 טוען קומיקס...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className={`container mt-4 ${showAdultGate ? 'blurred' : ''}`}>
      <Helmet>
        <title>{comic.title} - קומיקס ב־Comixiad</title>
        <meta name="description" content={comic.description || 'קרא קומיקס ב־Comixiad'} />
        <meta property="og:title" content={`${comic.title} - קומיקס ב־Comixiad`} />
        <meta property="og:description" content={comic.description || 'קרא קומיקס מקורי'} />
        <meta
          property="og:image"
          content={
            comic.pages[0]?.url
              ? `${API_BASE_URL}/${comic.pages[0].url.replace(/\\/g, '/')}`
              : 'https://comixiad.com/default-cover.jpg'
          }
        />
        <meta property="og:url" content={`https://comixiad.com/series/${comic.series}`} />
        <meta property="og:type" content="article" />
      </Helmet>
       {/* מודאל אזהרת 18+ */}
       {showAdultGate && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.6)' }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">תוכן למבוגרים (18+)</h5>
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  הקומיקס מכיל תוכן שמיועד למבוגרים בלבד. כדי להמשיך, אשר/י כי הינך מעל גיל 18.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleAdultExit}>
                  חזרה
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAdultConfirm}>
                  אני מעל 18
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* כותרת ותיאור */}
      <h2>{comic?.title || 'ללא שם'}</h2>
      <p>{comic?.description || 'אין תיאור זמין'}</p>

      {/* צפיות + כפתורי שיתוף */}
      <div className="d-flex justify-content-between align-items-center mb-3 share-buttons">
      <span>📊 צפיות: {comic?.views || 0}</span>
        <span>❤️ לייקים: {comic?.likes || 0}</span>

        {user && (
          hasLiked ? (
            <button className="btn btn-outline-danger btn-sm" onClick={handleUnlike}>
              הסר לייק
            </button>
          ) : (
            <button className="btn btn-outline-success btn-sm" onClick={handleLike}>
              לייק
            </button>
          )
        )}
        <div className="d-flex gap-2">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=https://comixiad.com/preview/comic/${comicId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary btn-sm"
          >
            <i className="bi bi-facebook me-1"></i> שתף בפייסבוק
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`📖 ${comic.title} ב־Comixiad: https://comixiad.com/preview/comic/${comicId}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-success btn-sm"
          >
            <i className="bi bi-whatsapp me-1"></i> שתף בוואטסאפ
          </a>
        </div>
      </div>

      {/* פרטי היוצר */}
      {comic.author && (
        <div className="author-box">
          <img
            src={
              comic.author.avatar
                ? comic.author.avatar.startsWith('http')
                  ? comic.author.avatar
                  : `${API_BASE_URL}/${comic.author.avatar.replace(/\\/g, '/')}`
                : 'https://www.gravatar.com/avatar/?d=mp'
            }
            alt={comic.author.username}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://www.gravatar.com/avatar/?d=mp';
            }}
          />
          <a href={`/profile/${comic.author._id}`}>{comic.author.username}</a>
        </div>
      )}

      {/* עמודי הקומיקס */}
      <div className="comic-pages">
        {comic?.pages?.length > 0 ? (
          comic.pages.map((page, index) => {
            const imageUrl = `${API_BASE_URL}/${page.url.replace(/\\/g, '/')}`;
            return (
              <div key={index} className="comic-page mb-4">
                {!imgErrors[index] ? (
                  <img
                    src={imageUrl}
                    alt={`Page ${index + 1}`}
                    onError={(e) => {
                      setImgErrors((prev) => ({ ...prev, [index]: true }));
                      e.target.onerror = null;
                      e.target.src = 'https://www.gravatar.com/avatar/?d=mp';
                    }}
                    className="img-fluid"
                  />
                ) : (
                  <div className="text-danger">⚠️ לא ניתן לטעון עמוד {index + 1}</div>
                )}
              </div>
            );
          })
        ) : (
          <p>אין עמודים להצגה</p>
        )}
      </div>

      {/* קומיקס נוספים אקראיים */}
      <RandomThree />
    </div>
  );
};

export default ComicReader;
