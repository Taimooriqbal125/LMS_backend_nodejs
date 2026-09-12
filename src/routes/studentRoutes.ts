import express from 'express';
import * as studentController from '../controllers/studentController';
import authMiddleware from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';

const router = express.Router();

// Usually registration is public or controlled by Admin
router.post('/registerstudent', upload.single('profileImage'), studentController.registerStudent);

router.use(authMiddleware.protect);

router.get(
  '/getallstudents',
  authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
  studentController.getAllStudents,
);

router.get('/getstudent/:userId', studentController.getStudent);

router.patch(
  '/updatestudent/:userId',
  authMiddleware.restrictTo('ADMIN', 'STUDENT'),
  upload.single('profileImage'),
  studentController.updateStudent,
);

router.delete(
  '/deletestudent/:userId',
  authMiddleware.restrictTo('ADMIN'),
  studentController.deleteStudent,
);

router.patch(
  '/togglestatus/:userId',
  authMiddleware.restrictTo('ADMIN'),
  studentController.toggleStudentStatus,
);

export default router;
