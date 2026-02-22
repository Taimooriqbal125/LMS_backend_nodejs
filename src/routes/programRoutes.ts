import express from 'express';
import * as programController from '../controllers/programController';
import * as authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/getallprograms', programController.getAllPrograms);

router.use(authMiddleware.protect);
// Protected routes
router.get('/getprogram/:id', programController.getProgram);
router.post(
    '/createprogram',
    authMiddleware.restrictTo('ADMIN'),
    programController.createProgram,
);
router.patch(
    '/updateprogram/:id',
    authMiddleware.restrictTo('ADMIN'),
    programController.updateProgram,
);
router.delete(
    '/deleteprogram/:id',
    authMiddleware.restrictTo('ADMIN'),
    programController.deleteProgram,
);

export default router;
