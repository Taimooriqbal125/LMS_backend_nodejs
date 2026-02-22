import express from 'express';
import * as departmentController from '../controllers/departmentController';
const authMiddleware = require('../middlewares/authMiddleware'); // Temporary until authMiddleware is migrated

const router = express.Router();
// Public routes
router.get('/getalldepartments', departmentController.getAllDepartments);

router.use(authMiddleware.protect);
// Protected routes
router.get('/getdepartment/:id', departmentController.getDepartment);

// Admin Only
router.post(
    '/createdepartment',
    authMiddleware.restrictTo('ADMIN'),
    departmentController.createDepartment,
);

router.patch(
    '/updatedepartment/:id',
    authMiddleware.restrictTo('ADMIN'),
    departmentController.updateDepartment,
);

router.delete(
    '/deletedepartment/:id',
    authMiddleware.restrictTo('ADMIN'),
    departmentController.deleteDepartment,
);

// Assign HOD
router.patch(
    '/assignhod/:id',
    authMiddleware.restrictTo('ADMIN'),
    departmentController.assignHOD,
);

export default router;
