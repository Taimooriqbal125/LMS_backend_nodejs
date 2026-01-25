const express = require('express');
const router = express.Router();
const courseContentController = require('../controllers/courseContentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

// View content (Enrolled Students or Staff)
router.get('/getcontent/:courseId', courseContentController.getCourseContent);

// Upload content (Instructors or Admins)
router.post('/uploadcontent', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), courseContentController.uploadContent);

// Delete content
router.delete('/deletecontent/:id', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), courseContentController.deleteContent);

module.exports = router;
