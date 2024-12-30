const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.warn('No token provided');
        req.user = null; // Allow requests without a token
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Add decoded user info to the request
        next();
    } catch (err) {
        console.warn('Invalid or expired token');
        req.user = null; // Allow requests with an invalid token
        next();
    }
};

module.exports = verifyToken;