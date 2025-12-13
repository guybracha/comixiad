// תמיד בלי '/' בסוף
// Use localhost for development, production URL for build
export const API_BASE_URL = (process.env.NODE_ENV === 'production' 
  ? 'https://api.comixiad.com' 
  : 'http://localhost:5000').replace(/\/+$/, '');

// בדיקת דיאגנוסטיקה חד-פעמית
console.log("API_BASE_URL =", API_BASE_URL);