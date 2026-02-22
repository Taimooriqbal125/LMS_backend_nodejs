import express from 'express';
import * as dashboardController from '../controllers/dashboardController';
import * as authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware.protect);

// Global Stats (Admin/Instructor)
router.get(
    '/stats',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    dashboardController.getGlobalStats,
);

// Student Summary (Specific to logged in student)
router.get('/mysummary', dashboardController.getStudentSummary);

export default router;
