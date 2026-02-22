import express from 'express';
import * as societyController from '../controllers/societyController';
import * as authMiddleware from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';

const router = express.Router();

// Public routes
router.get('/getsociety/:id', societyController.getSociety);
router.get('/getallevents', societyController.getAllEvents);
router.get('/getsocietyevents/:societyId', societyController.getEventsBySociety);

// Protected routes
router.use(authMiddleware.protect);
router.get('/getallsocieties', societyController.getAllSocieties);
router.post('/joinsociety', societyController.joinSociety);
router.post('/leavesociety', societyController.leaveSociety);
router.delete(
    '/removemember',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    societyController.removeMember,
);
router.get('/myjoined', societyController.getMyJoinedSocieties);
router.get('/getmembers/:societyId', societyController.getSocietyMembers);

// Admin / Incharge only
router.patch(
    '/updatesociety/:id',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    upload.single('logoUrl'),
    societyController.updateSociety,
);
router.post(
    '/assigncabinet',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    societyController.assignCabinetMember,
);
router.post(
    '/createsociety',
    authMiddleware.restrictTo('ADMIN'),
    upload.single('logoUrl'),
    societyController.createSociety,
);
router.delete(
    '/deletesociety/:id',
    authMiddleware.restrictTo('ADMIN'),
    societyController.deleteSociety,
);
router.post(
    '/createevent',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    upload.single('posterUrl'),
    societyController.createEvent,
);
router.patch(
    '/updateevent/:id',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    upload.single('posterUrl'),
    societyController.updateEvent,
);
router.delete(
    '/deleteevent/:id',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    societyController.deleteEvent,
);

// Society Positions
router.get(
    '/getallpositions',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    societyController.getAllPositions,
);
router.get('/getposition/:id', societyController.getPosition);
router.post(
    '/createposition',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    societyController.createPosition,
);
router.delete(
    '/deleteposition/:id',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    societyController.deletePosition,
);
router.patch(
    '/updateposition/:id',
    authMiddleware.restrictTo('ADMIN', 'INSTRUCTOR'),
    societyController.updatePosition,
);

export default router;
