// routers/Comics.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');

const Comic = require('../models/Comic');
const { authRequired} = require('../middleware/authMiddleware'); // צריך לחשוף req.user
const { compressUploadsArray } = require('../middleware/imageCompress');

// ===== יצירת תיקיית העלאות אם לא קיימת =====
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'comics');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ===== Multer: אחסון, סינון קבצים ומגבלות =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg');
    const base = path.basename(file.originalname || 'page', ext)
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/g, '');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(png|jpe?g|webp|gif|avif)$/i.test(file.mimetype)) cb(null, true);
  else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024, files: 100 }, // 20MB לקובץ, עד 100 עמודים
});

// ===== עזר =====
const baseLang = (lng = 'en') => String(lng).toLowerCase().split('-')[0];

// ================== יצירת קומיקס ==================
router.post(
  '/upload',
  authRequired,
  (req, res, next) => {
    upload.array('pages', 100)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large (max 20MB per page)' });
        if (err.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ error: 'Only image files are allowed' });
        return res.status(400).json({ error: err.message });
      }
      if (err) return next(err);
      next();
    });
  },
  async (req, res) => {
    try {
      // === דיבאג חד־פעמי: ודא שיש יוזר ===
      console.log('upload: auth user =', req.user);

      const { title, description, language, genre, series, adultOnly } = req.body;

      if (!title || !description || !language || !genre) {
        return res.status(422).json({ error: 'Missing required fields' });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(422).json({ error: 'No pages uploaded' });
      }
      if (!req.user?.id) {
        return res.status(401).json({ error: 'No authenticated user on request' });
      }

      const pages = req.files.map((f) => ({
        url: require('path').posix.join('/uploads/comics', f.filename),
      }));

      const comic = await Comic.create({
        title: String(title).trim(),
        description: String(description).trim(),
        language: String(language).toLowerCase().split('-')[0],
        genre,
        series: series || null,
        adultOnly: String(adultOnly) === 'true',
        pages,
        coverImage: pages[0]?.url || null,
        author: req.user.id,            // ← כאן!
        uploadedBy: req.user.id,
      });

      return res.status(201).json({ ok: true, id: comic._id, comic });
    } catch (error) {
      console.error('Upload comic error:', error);
      return res.status(500).json({ error: 'Upload failed', detail: error.message });
    }
  }
);

// 📥 שליפת כל הקומיקסים
router.get('/', async (req, res) => {
    try {
        // אם יש פרמטר author ב-query, נסנן לפיו
        const filter = {};
        if (req.query.author) {
            filter.author = req.query.author;
        }
        
        const comics = await Comic.find(filter).populate('author', 'username').sort({ createdAt: -1 }).lean();
        
        // עדכון ה-URLs לכתובות מלאות
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const comicsWithFullUrls = comics.map(comic => ({
            ...comic,
            pages: comic.pages.map(page => ({
                ...page,
                url: page.url.startsWith('http') ? page.url : `${baseUrl}${page.url.startsWith('/') ? '' : '/'}${page.url}`
            })),
            coverImage: comic.coverImage ? 
                (comic.coverImage.startsWith('http') ? comic.coverImage : `${baseUrl}${comic.coverImage.startsWith('/') ? '' : '/'}${comic.coverImage}`) 
                : null
        }));
        
        res.json(comicsWithFullUrls);
    } catch (error) {
        console.error('Error fetching comics:', error);
        res.status(500).json({ message: 'Error fetching comics', error: error.message });
    }
});

// 📥 שליפת קומיקס לפי סדרה
router.get('/series/:seriesId', async (req, res) => {
    try {
        const comics = await Comic.find({ series: req.params.seriesId }).populate('author', 'username').lean();
        
        // עדכון ה-URLs לכתובות מלאות
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const comicsWithFullUrls = comics.map(comic => ({
            ...comic,
            pages: comic.pages.map(page => ({
                ...page,
                url: page.url.startsWith('http') ? page.url : `${baseUrl}${page.url.startsWith('/') ? '' : '/'}${page.url}`
            })),
            coverImage: comic.coverImage ? 
                (comic.coverImage.startsWith('http') ? comic.coverImage : `${baseUrl}${comic.coverImage.startsWith('/') ? '' : '/'}${comic.coverImage}`) 
                : null
        }));
        
        res.json(comicsWithFullUrls);
    } catch (error) {
        console.error('Error fetching comics by series:', error);
        res.status(500).json({ message: 'Error fetching comics by series', error: error.message });
    }
});

// 📊 שליפת הקומיקסים הכי פופולריים
router.get('/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const comics = await Comic.find()
            .populate('author', 'username')
            .sort({ views: -1, likes: -1 })
            .limit(limit)
            .lean();
        
        // עדכון ה-URLs לכתובות מלאות
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const comicsWithFullUrls = comics.map(comic => ({
            ...comic,
            pages: comic.pages.map(page => ({
                ...page,
                url: page.url.startsWith('http') ? page.url : `${baseUrl}${page.url.startsWith('/') ? '' : '/'}${page.url}`
            })),
            coverImage: comic.coverImage ? 
                (comic.coverImage.startsWith('http') ? comic.coverImage : `${baseUrl}${comic.coverImage.startsWith('/') ? '' : '/'}${comic.coverImage}`) 
                : null
        }));
        
        res.json(comicsWithFullUrls);
    } catch (error) {
        console.error('Error fetching top comics:', error);
        res.status(500).json({ message: 'Error fetching top comics', error: error.message });
    }
});

// ⚠️ חשוב: צריך להופיע **אחרי** /series ו-/top כדי לא לבלוע אותם
router.get('/:id', async (req, res) => {
    try {
      const comic = await Comic.findById(req.params.id)
        .populate('author', 'username avatar')
        .lean(); // כדי לאפשר שינוי ישיר באובייקט
  
      if (!comic) {
        return res.status(404).json({ message: 'Comic not found' });
      }
  
      // עדכון ה־URL של כל עמוד – יצירת כתובת מלאה לטעינה בדפדפן
      const baseUrl = `${req.protocol}://${req.get('host')}`;
  
      comic.pages = comic.pages.map(page => ({
        ...page,
        url: page.url.startsWith('http') ? page.url : `${baseUrl}${page.url.startsWith('/') ? '' : '/'}${page.url}`
      }));
      
      if (comic.coverImage) {
        comic.coverImage = comic.coverImage.startsWith('http') ? comic.coverImage : `${baseUrl}${comic.coverImage.startsWith('/') ? '' : '/'}${comic.coverImage}`;
      }
  
      res.json(comic);
    } catch (error) {
      console.error('Error fetching comic by ID:', error);
      res.status(500).json({ message: 'Error fetching comic', error: error.message });
    }
  });
  

// ✅ עדכון קומיקס
router.put('/:id', authRequired, upload.array('newPages', 50), async (req, res) => {
  try {
    const { title, description, language, genre, series, pageOrder } = req.body;
    const comic = await Comic.findById(req.params.id);
    if (!comic) return res.status(404).json({ message: 'Comic not found' });

    // ✅ בדוק אם המשתמש המחובר הוא גם היוצר של הקומיקס
    if (comic.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this comic.' });
    }

    comic.title = title;
    comic.description = description;
    comic.language = language;
    comic.genre = genre;
    if (series) comic.series = series;

    // עדכון סדר העמודים
    if (pageOrder) {
      try {
        const order = JSON.parse(pageOrder);
        const newPages = [];
        
        // סדר העמודים הקיימים לפי הסדר החדש
        for (const identifier of order) {
          const existingPage = comic.pages.find(p => p._id.toString() === identifier || p.url.includes(identifier));
          if (existingPage) {
            newPages.push(existingPage);
          }
        }
        
        comic.pages = newPages;
      } catch (e) {
        console.error('Error parsing pageOrder:', e);
      }
    }

    // הוספת עמודים חדשים
    if (req.files && req.files.length > 0) {
      const additionalPages = req.files.map(file => ({
        url: `/uploads/comics/${file.filename}`
      }));
      comic.pages.push(...additionalPages);
    }

    await comic.save();
    res.json(comic);
  } catch (error) {
    console.error('Error updating comic:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ מחיקת קומיקס
router.delete('/:id', async (req, res) => {
    try {
        const comic = await Comic.findByIdAndDelete(req.params.id);
        if (!comic) return res.status(404).json({ message: 'Comic not found' });
        res.json({ message: 'Comic deleted successfully' });
    } catch (error) {
        console.error('Error deleting comic:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ✅ צפיות
router.put('/:id/view', async (req, res) => {
    try {
        const comic = await Comic.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        if (!comic) return res.status(404).json({ message: 'Comic not found' });
        res.json(comic);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update views' });
    }
});

// ✅ לייקים
router.put('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const comic = await Comic.findById(req.params.id);
        if (!comic) return res.status(404).json({ message: 'Comic not found' });

        if (comic.likedBy.includes(userId)) {
            return res.status(400).json({ message: 'User already liked this comic' });
        }

        comic.likes += 1;
        comic.likedBy.push(userId);
        await comic.save();

        res.json(comic);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update likes' });
    }
});

module.exports = router;
