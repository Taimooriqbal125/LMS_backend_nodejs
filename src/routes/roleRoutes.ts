import express from 'express';
import * as roleController from '../controllers/roleController';
const authMiddleware = require('../middlewares/authMiddleware'); // Temporary until authMiddleware is migrated

const router = express.Router();

// All routes are protected and restricted to ADMIN or INSTRUCTOR
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'));

router.get('/getallroles', roleController.getAllRoles);
router.post('/createrole', roleController.createRole);

router.get('/getrole/:id', roleController.getRole);
router.patch('/updaterole/:id', roleController.updateRole);
router.delete('/deleterole/:id', roleController.deleteRole);

export default router;
