import express from 'express';
import * as courseContentController from '../controllers/courseContentController';
import * as authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware.protect);

// View content (Enrolled Students or Staff)
router.get('/getcontent/:courseId', courseContentController.getCourseContent);

// Upload content (Instructors or Admins)
router.post(
    '/uploadcontent',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    courseContentController.uploadContent,
);

// Delete content
router.delete(
    '/deletecontent/:id',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    courseContentController.deleteContent,
);

export default router;
