import express from 'express';
import * as courseController from '../controllers/courseController';
const authMiddleware = require('../middlewares/authMiddleware'); // Temporary until authMiddleware is migrated

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/getallcourses', courseController.getAllCourses);
router.get('/getcourse/:id', courseController.getCourse);
router.get('/mydepartmentcourses', courseController.getDepartmentCourses);
router.get('/mytaughtcourses', authMiddleware.restrictTo('INSTRUCTOR', 'ADMIN'), courseController.getInstructorCourses);

// Only Admins and Instructors can create/edit courses
router.post('/createcourse', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), courseController.createCourse);
router.patch('/updatecourse/:id', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), courseController.updateCourse);
router.delete('/deletecourse/:id', authMiddleware.restrictTo('ADMIN'), courseController.deleteCourse);

// Assignments
router.post('/assigninstructor', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), courseController.assignInstructor);
router.delete('/removeinstructor', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), courseController.removeInstructor);

export default router;
