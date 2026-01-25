const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public route for now (or Admin only depending on your flow)
// Usually registration is public or controlled by Admin
router.post('/registerstudent', studentController.registerStudent);

router.use(authMiddleware.protect);

router.get('/getallstudents', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), studentController.getAllStudents);
router.get('/getstudent/:userId', studentController.getStudent);
router.patch('/updatestudent/:userId', authMiddleware.restrictTo('ADMIN'), studentController.updateStudent);

module.exports = router;
