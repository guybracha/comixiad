const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token missing or malformed.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Now req.user.userId is available
        next();
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('JWT Error:', error.message);
        }
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = verifyToken;
