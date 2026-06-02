const multer = require('multer');
const ImageKit = require('imagekit');
const AppError = require('./AppError');

// Configure ImageKit (reads from env at runtime)
let imagekit = null;
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// We now use Memory Storage so we get the file as a buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG and PNG files are allowed', 400));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
});

// Multer middleware for a single 'image' field
const uploadMiddleware = upload.single('image');

/**
 * Upload a buffer to ImageKit and return the secure URL.
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {Promise<string>} secure URL
 */
const uploadToImageKit = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    if (!imagekit) {
      return reject(new AppError('ImageKit credentials missing from environment', 500));
    }
    
    imagekit.upload({
      file: buffer.toString('base64'), // ImageKit accepts base64 strings
      fileName: `issue-${Date.now()}`,
      folder: '/urbanpulse',
    }, (error, result) => {
      if (error) {
        console.error('ImageKit Upload Error:', error);
        return reject(new AppError('Image upload failed', 500));
      }
      resolve(result.url); // Use the provided ImageKit URL
    });
  });
};

module.exports = { uploadMiddleware, uploadToImageKit };
