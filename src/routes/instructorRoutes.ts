import express from 'express';
import * as instructorController from '../controllers/instructorController';
import authMiddleware from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';

const router = express.Router();

// Public route for Instructor Self-Signup
router.post(
    '/registerinstructor',
    upload.single('profileImageUrl'),
    instructorController.registerInstructor,
);

// Protected routes below
router.use(authMiddleware.protect);

router.get(
    '/getallinstructors',
    authMiddleware.restrictTo('ADMIN'),
    instructorController.getAllInstructors,
);

router.get('/getinstructor/:userId', instructorController.getInstructor);

router.patch(
    '/updateinstructor/:userId',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    instructorController.updateInstructor,
);

router.delete(
    '/deleteinstructor/:userId',
    authMiddleware.restrictTo('ADMIN'),
    instructorController.deleteInstructor,
);

export default router;
