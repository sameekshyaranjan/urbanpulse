require('dotenv').config();

// ─── Required — server will not start without these ───────
const required = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

// ─── Optional — warnings only, server still starts ────────
const optional = [
  'IMAGEKIT_PUBLIC_KEY',
  'IMAGEKIT_PRIVATE_KEY',
  'IMAGEKIT_URL_ENDPOINT',
  'ALLOWED_ORIGINS',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[env] Missing required environment variables: ${missing.join(', ')}\n` +
    'Copy backend/.env.example to backend/.env and fill in the values.'
  );
}

for (const key of optional) {
  if (!process.env[key]) {
    const hint =
      key.startsWith('IMAGEKIT') ? 'Image file uploads will fail (JSON imageUrl still works).' :
      key === 'ALLOWED_ORIGINS'    ? 'Defaulting to http://localhost:3000.' :
      '';
    console.warn(`[env] Warning: ${key} is not set. ${hint}`);
  }
}

module.exports = {
  NODE_ENV:               process.env.NODE_ENV || 'development',
  PORT:                   parseInt(process.env.PORT, 10),
  MONGO_URI:              process.env.MONGO_URI,
  JWT_SECRET:             process.env.JWT_SECRET,
  JWT_REFRESH_SECRET:     process.env.JWT_REFRESH_SECRET,
  // JWT_EXPIRES_IN and JWT_REFRESH_EXPIRES_IN are documented in .env.example
  // but the values are hardcoded in auth.service.js ('15m', '7d') for simplicity.
  // To make them configurable, update auth.service.js to read these values.
  IMAGEKIT_PUBLIC_KEY:    process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY:   process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT:  process.env.IMAGEKIT_URL_ENDPOINT,
  ALLOWED_ORIGINS:        process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
};
