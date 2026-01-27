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

        // Handle Image Upload with Cloudinary
        if (req.file) {
            req.body.logoUrl = req.file.path;
        }

        const newSociety = await Society.create(req.body);
        res.status(201).json({ status: 'success', data: { society: newSociety } });
    } catch (err) { next(err); }
};

exports.updateSociety = async (req, res, next) => {
    try {
        const { inchargeUserId } = req.body;

        if (inchargeUserId) {
            const instructor = await prisma.instructor.findUnique({
                where: { userId: parseInt(inchargeUserId) }
            });

            if (!instructor) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Only a valid Instructor can be assigned as the Incharge.'
                });
            }
        }

        // Handle Logo Update
        if (req.file) {
            req.body.logoUrl = req.file.path;
        }

        const updatedSociety = await Society.update(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: { society: updatedSociety } });
    } catch (err) { next(err); }
};

// --- Members ---

/**
 * Assign a Cabinet Member (Admin/Instructor Only)
 */
exports.assignCabinetMember = async (req, res, next) => {
    try {
        const { societyId, userId, positionId } = req.body;

        if (!societyId || !userId || !positionId) {
            return res.status(400).json({ status: 'fail', message: 'Please provide societyId, userId, and positionId' });
        }

        // 1) Verify the position is a cabinet position (1=President, 2=VP, 3=Sec)
        if (parseInt(positionId) === 4) {
            return res.status(400).json({ status: 'fail', message: 'Use joinsociety for regular members.' });
        }

        // 2) Check if user exists
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });

        // 3) Industrial Validation: Ensure the user is a STUDENT
        const student = await prisma.student.findUnique({
            where: { userId: parseInt(userId) }
        });

        if (!student) {
            return res.status(400).json({
                status: 'fail',
                message: 'Only Students can be assigned to cabinet positions (President, VP, etc.).'
            });
        }

        const member = await SocietyMember.addMember(societyId, userId, positionId);
        res.status(201).json({ status: 'success', message: 'Cabinet member assigned successfully', data: { member } });
    } catch (err) {
        if (err.code === 'P2002') {
            // If already a member, update their position
            const existing = await prisma.societyMember.findFirst({
                where: { societyId: parseInt(req.body.societyId), userId: parseInt(req.body.userId) }
            });
            const updated = await SocietyMember.updatePosition(existing.id, req.body.positionId);
            return res.status(200).json({ status: 'success', message: 'Member position updated', data: { member: updated } });
        }
        next(err);
    }
};

exports.joinSociety = async (req, res, next) => {
    try {
        const { societyId } = req.body;

        // Students can ONLY join as regular 'Member' (ID: 4)
        const member = await SocietyMember.addMember(societyId, req.user.id, 4);

        res.status(201).json({ status: 'success', data: { member } });
    } catch (err) {
        if (err.code === 'P2002') return res.status(400).json({ status: 'fail', message: 'You are already a member of this society' });
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

        // Authorization check
        const society = await Society.findById(societyId);
        if (!society) return res.status(404).json({ status: 'fail', message: 'Society not found' });

        const isAdmin = req.user.userRoles.some(ur => ur.role.roleName === 'ADMIN');
        const isIncharge = society.inchargeUserId === req.user.id;

        if (!isAdmin && !isIncharge) {
            return res.status(403).json({ status: 'fail', message: 'Unauthorized to create events' });
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
