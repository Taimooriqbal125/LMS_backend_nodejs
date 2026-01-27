const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1) Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2) Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lms_profiles',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optimize images
    }
});

// 3) Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = upload;
