const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

router.get('/getdepartments', departmentController.getAllDepartments);
router.get('/getdepartment/:id', departmentController.getDepartment);

router.post('/createdepartment', authMiddleware.restrictTo('ADMIN'), departmentController.createDepartment);
router.patch('/updatedepartment/:id', authMiddleware.restrictTo('ADMIN'), departmentController.updateDepartment);
router.delete('/deletedepartment/:id', authMiddleware.restrictTo('ADMIN'), departmentController.deleteDepartment);

module.exports = router;
