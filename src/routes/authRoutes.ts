import express from 'express';
import * as authController from '../controllers/authController';
import upload from '../middlewares/uploadMiddleware';

const router = express.Router();

router.post('/signup', upload.single('profileImageUrl'), authController.signup);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
