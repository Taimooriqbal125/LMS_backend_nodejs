import express from 'express';
import * as enrollmentController from '../controllers/enrollmentController';
const authMiddleware = require('../middlewares/authMiddleware'); // Temporary until authMiddleware is migrated

const router = express.Router();

router.use(authMiddleware.protect);

// Student can see their own enrollments
router.get('/getmyenrollments', enrollmentController.getMyEnrollments);

// High-level management
router.get(
    '/getallenrollments',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    enrollmentController.getAllEnrollments,
);

// Enrollment Actions
router.post(
    '/enrollstudent',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    enrollmentController.enrollStudent,
);
router.patch(
    '/updateenrollment/:id',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    enrollmentController.updateEnrollmentStatus,
);
router.delete(
    '/dropenrollment/:id',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    enrollmentController.dropEnrollment,
);

export default router;
