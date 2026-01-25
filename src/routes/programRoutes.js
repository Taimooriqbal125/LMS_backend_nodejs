const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

router.get('/getAllprograms', programController.getAllPrograms);
router.get('/getprogram/:id', programController.getProgram);

router.post('/createprogram', authMiddleware.restrictTo('ADMIN'), programController.createProgram);
router.patch('/updateprogram/:id', authMiddleware.restrictTo('ADMIN'), programController.updateProgram);
router.delete('/deleteprogram/:id', authMiddleware.restrictTo('ADMIN'), programController.deleteProgram);

module.exports = router;
