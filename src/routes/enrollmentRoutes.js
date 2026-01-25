const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

// Student can see their own enrollments
router.get('/getmyenrollments', enrollmentController.getMyEnrollments);

// High-level management
router.get('/getallenrollments', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), enrollmentController.getAllEnrollments);

// Enrollment Actions
router.post('/enrollstudent', enrollmentController.enrollStudent);
router.patch('/updateenrollment/:id', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), enrollmentController.updateEnrollmentStatus);
router.delete('/dropenrollment/:id', authMiddleware.restrictTo('ADMIN'), enrollmentController.dropEnrollment);

module.exports = router;
