const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

// Global Stats (Admin/Instructor)
router.get('/stats', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), dashboardController.getGlobalStats);

// Student Summary (Specific to logged in student)
router.get('/my-summary', dashboardController.getStudentSummary);

module.exports = router;
