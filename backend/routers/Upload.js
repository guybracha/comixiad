const fs = require('fs');
const path = require('path');

// Set up multer for file uploads
const uploadDir = path.join(__dirname, '../uploads/comics');

// צור את התיקייה אם היא לא קיימת
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });
