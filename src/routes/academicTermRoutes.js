const express = require('express');
const router = express.Router();
const academicTermController = require('../controllers/academicTermController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

router.get('/getallterms', academicTermController.getAllTerms);
router.get('/getterm/:id', academicTermController.getTerm);

// Admin Only
router.post('/createterm', authMiddleware.restrictTo('ADMIN'), academicTermController.createTerm);
router.patch('/updateterm/:id', authMiddleware.restrictTo('ADMIN'), academicTermController.updateTerm);
router.delete('/deleteterm/:id', authMiddleware.restrictTo('ADMIN'), academicTermController.deleteTerm);

module.exports = router;
