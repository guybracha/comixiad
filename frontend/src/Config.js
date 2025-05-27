const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://api.comixiad.com'; // ← שים לב ל-https!

export { API_BASE_URL };
