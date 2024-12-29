const multer = require('multer');
const path = require('path');
const Series = require('../models/Series');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Directory for storing uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Create a new series
exports.createSeries = async (req, res) => {
  try {
    const { name, description, author } = req.body;
    const coverImage = req.file ? req.file.filename : null;

    const series = new Series({
      name,
      description,
      author,
      coverImage,
    });

    await series.save();
    res.status(201).json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadComic = async (req, res) => {
    try {
      const { title, description, genre, language, author, series } = req.body;
  
      const pages = req.files.map(file => ({
        filename: file.filename,
        url: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      }));
  
      const comic = new Comic({
        title,
        description,
        genre,
        language,
        author,
        series: series || null,
        pages
      });
  
      await comic.save();
      res.status(201).json(comic);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  