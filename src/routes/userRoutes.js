const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes below are protected
router.use(authMiddleware.protect);

router.get('/getUser', userController.getUser); // Usually we use a specific 'me' logic, but using ID for now
router.patch('/updateUser', userController.update);
router.delete('/deleteUser', userController.delete);

// Admin only routes
router.use(authMiddleware.restrictTo('ADMIN'));

router.get('/getAllUsers', userController.getAllUsers);

module.exports = router;
