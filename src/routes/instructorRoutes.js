const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public route for Instructor Self-Signup
router.post('/registerinstructor', upload.single('profileImageUrl'), instructorController.registerInstructor);

// Protected routes below
router.use(authMiddleware.protect);

router.get('/getallinstructors', authMiddleware.restrictTo('ADMIN'), instructorController.getAllInstructors);
router.get('/getinstructor/:userId', instructorController.getInstructor);
router.patch('/updateinstructor/:userId', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), instructorController.updateInstructor);
router.delete('/deleteinstructor/:userId', authMiddleware.restrictTo('ADMIN'), instructorController.deleteInstructor);

module.exports = router;
