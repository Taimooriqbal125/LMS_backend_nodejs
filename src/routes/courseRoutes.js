const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

router.get('/getallcourses', courseController.getAllCourses);
router.get('/getcourse/:id', courseController.getCourse);

// Only Admins and Instructors can create/edit courses
router.post('/createcourse', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), courseController.createCourse);
router.patch('/updatecourse/:id', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), courseController.updateCourse);
router.delete('/deletecourse/:id', authMiddleware.restrictTo('ADMIN'), courseController.deleteCourse);

// Assignments
router.post('/assigninstructor', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), courseController.assignInstructor);
router.post('/removeinstructor', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), courseController.removeInstructor);

module.exports = router;
