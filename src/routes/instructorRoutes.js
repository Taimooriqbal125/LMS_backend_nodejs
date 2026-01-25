const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public route for Instructor Self-Signup
router.post('/registerinstructor', instructorController.registerInstructor);

// Protected routes below
router.use(authMiddleware.protect);

router.get('/getallinstructors', authMiddleware.restrictTo('ADMIN'), instructorController.getAllInstructors);
router.get('/getinstructor/:userId', instructorController.getInstructor);
router.patch('/updateinstructor/:userId', authMiddleware.restrictTo('ADMIN'), instructorController.updateInstructor);

module.exports = router;
