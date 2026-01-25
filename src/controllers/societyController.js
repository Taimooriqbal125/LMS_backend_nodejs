const { Society, SocietyPosition } = require('../models/Society');
const SocietyMember = require('../models/SocietyMember');
const SocietyEvent = require('../models/SocietyEvent');
const prisma = require('../config/database');

/**
 * Society Controller
 */

// --- Societies ---

exports.getAllSocieties = async (req, res, next) => {
    try {
        const societies = await Society.findAll();
        res.status(200).json({ status: 'success', results: societies.length, data: { societies } });
    } catch (err) { next(err); }
};

exports.getSociety = async (req, res, next) => {
    try {
        const society = await Society.findById(req.params.id);
        if (!society) return res.status(404).json({ status: 'fail', message: 'Society not found' });
        res.status(200).json({ status: 'success', data: { society } });
    } catch (err) { next(err); }
};

exports.createSociety = async (req, res, next) => {
    try {
        const { inchargeUserId } = req.body;

        if (inchargeUserId) {
            // Industrial Validation: Check if this user is actually an Instructor
            const instructor = await prisma.instructor.findUnique({
                where: { userId: parseInt(inchargeUserId) }
            });

            if (!instructor) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Only a valid Instructor can be assigned as the Incharge of a society.'
                });
            }
        }

        const newSociety = await Society.create(req.body);
        res.status(201).json({ status: 'success', data: { society: newSociety } });
    } catch (err) { next(err); }
};

// --- Members ---

exports.joinSociety = async (req, res, next) => {
    try {
        const { societyId, positionId } = req.body;
        // Default to 'Member' position if not provided, or handle in frontend
        // For industrial logic, we check if position exists
        const member = await SocietyMember.addMember(societyId, req.user.id, positionId || 1);
        res.status(201).json({ status: 'success', data: { member } });
    } catch (err) {
        if (err.code === 'P2002') return res.status(400).json({ status: 'fail', message: 'Already a member with this position' });
        next(err);
    }
};

exports.getSocietyMembers = async (req, res, next) => {
    try {
        const members = await SocietyMember.findBySociety(req.params.societyId);
        res.status(200).json({ status: 'success', results: members.length, data: { members } });
    } catch (err) { next(err); }
};

// --- Events ---

exports.createEvent = async (req, res, next) => {
    try {
        const { societyId } = req.body;

        // Authorization check: Is user Admin or Society Incharge or President?
        const society = await Society.findById(societyId);
        if (!society) return res.status(404).json({ status: 'fail', message: 'Society not found' });

        const isAdmin = req.user.userRoles.some(ur => ur.role.roleName === 'ADMIN');
        const isIncharge = society.inchargeUserId === req.user.id;

        if (!isAdmin && !isIncharge) {
            // Further check if user is President (could add more complex check here)
            return res.status(403).json({ status: 'fail', message: 'Unauthorized to create events for this society' });
        }

        const event = await SocietyEvent.create({ ...req.body, createdBy: req.user.id });
        res.status(201).json({ status: 'success', data: { event } });
    } catch (err) { next(err); }
};

exports.getAllEvents = async (req, res, next) => {
    try {
        const events = await SocietyEvent.findAll();
        res.status(200).json({ status: 'success', results: events.length, data: { events } });
    } catch (err) { next(err); }
};

// --- Positions ---

exports.getAllPositions = async (req, res, next) => {
    try {
        const positions = await SocietyPosition.findAll();
        res.status(200).json({ status: 'success', data: { positions } });
    } catch (err) { next(err); }
};
