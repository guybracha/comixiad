const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // ייבוא מודל המשתמשים
const router = express.Router();

// מסלול כניסה
router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // חיפוש המשתמש במאגר
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'אימייל או סיסמה שגויים.' });
        }

        // אימות הסיסמה
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'אימייל או סיסמה שגויים.' });
        }

        // יצירת טוקן JWT
        const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });

        // החזרת מידע המשתמש (ללא סיסמה)
        res.json({
            message: 'התחברת בהצלחה.',
            user: { id: user._id, name: user.name, email: user.email },
            token,
        });
    } catch (err) {
        res.status(500).json({ message: 'שגיאה בשרת.' });
    }
});

module.exports = router;
