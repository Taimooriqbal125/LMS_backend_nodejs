const express = require('express');
const router = express.Router();
const societyController = require('../controllers/societyController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/getallsocieties', societyController.getAllSocieties);
router.get('/getsociety/:id', societyController.getSociety);
router.get('/getallevents', societyController.getAllEvents);
router.get('/getallpositions', societyController.getAllPositions);

// Protected routes
router.use(authMiddleware.protect);

router.post('/joinsociety', societyController.joinSociety);
router.get('/getmembers/:societyId', societyController.getSocietyMembers);

// Admin / Incharge only
router.patch('/updatesociety/:id', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), upload.single('logoUrl'), societyController.updateSociety);
router.post('/assign-cabinet', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), societyController.assignCabinetMember);
router.post('/createsociety', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), upload.single('logoUrl'), societyController.createSociety);
router.post('/createevent', authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'), societyController.createEvent);

module.exports = router;
