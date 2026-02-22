import express from 'express';
import * as userController from '../controllers/userController';
const authMiddleware = require('../middlewares/authMiddleware'); // Temporary until authMiddleware is migrated

const router = express.Router();

// All routes below are protected
router.use(authMiddleware.protect);

router.get('/getUser', userController.getUser); // Usually we use a specific 'me' logic, but using ID for now
router.patch('/updateUser', userController.update);

// Admin only routes
router.delete(
    '/deleteUser/:id',
    authMiddleware.restrictTo('ADMIN'),
    userController.deleteUserPermanently,
);
router.patch(
    '/updateUser/:id',
    authMiddleware.restrictTo('ADMIN'),
    userController.updateUserByAdmin,
);
router.post('/createUser', authMiddleware.restrictTo('ADMIN'), userController.createUser);
router.get('/getAllUsers', authMiddleware.restrictTo('ADMIN'), userController.getAllUsers);

export default router;
