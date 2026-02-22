import express from 'express';
import * as societyPositionController from '../controllers/societyPositionController';
import * as authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// All routes are protected and restricted to ADMIN or INSTRUCTOR
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'));

router.get('/', societyPositionController.getAllPositions);
router.post('/', societyPositionController.createPosition);

router.get('/:id', societyPositionController.getPosition);
router.patch('/:id', societyPositionController.updatePosition);
router.delete('/:id', societyPositionController.deletePosition);

export default router;
