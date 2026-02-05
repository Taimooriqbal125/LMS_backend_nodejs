const express = require('express');
const societyPositionController = require('../controllers/societyPositionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes are protected and restricted to ADMIN or INSTRUCTOR
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'));

router.get('/', societyPositionController.getAllPositions);
router.post('/', societyPositionController.createPosition);

router.get('/:id', societyPositionController.getPosition);
router.patch('/:id', societyPositionController.updatePosition);
router.delete('/:id', societyPositionController.deletePosition);

module.exports = router;
