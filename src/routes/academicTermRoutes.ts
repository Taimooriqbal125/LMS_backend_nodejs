import express from 'express';
import * as academicTermController from '../controllers/academicTermController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/getallterms', academicTermController.getAllTerms);
router.get('/getterm/:id', academicTermController.getTerm);

// Admin Only
router.post('/createterm', authMiddleware.restrictTo('ADMIN'), academicTermController.createTerm);
router.patch(
  '/updateterm/:id',
  authMiddleware.restrictTo('ADMIN'),
  academicTermController.updateTerm,
);
router.delete(
  '/deleteterm/:id',
  authMiddleware.restrictTo('ADMIN'),
  academicTermController.deleteTerm,
);

export default router;
