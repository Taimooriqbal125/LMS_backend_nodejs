import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 1) Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2) Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (_req, _file) => {
        return {
            folder: 'lms_uploads',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            transformation: [{ width: 800, height: 800, crop: 'limit' }],
        };
    },
});

// 3) Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Increased to 5MB for documents
});

export default upload;
