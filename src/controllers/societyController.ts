import { Request, Response, NextFunction } from 'express';
import { Society, SocietyPosition } from '../models/Society';
import SocietyMember from '../models/SocietyMember';
import SocietyEvent from '../models/SocietyEvent';
import prisma from '../config/database';

/**
 * Society Controller
 */

// --- Societies ---

export const getAllSocieties = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { inchargeUserId, isActive } = req.query;
        const filters: any = {};

        // 1. Filter by Status (Defaults to active if not specified, but flexible)
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        } else {
            filters.isActive = true; // Default to active
        }

        // 2. Filter by Incharge (Supports 'me' shortcut)
        if (inchargeUserId === 'me') {
            if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
            filters.inchargeUserId = req.user.id;
        } else if (inchargeUserId) {
            filters.inchargeUserId = Number(inchargeUserId);
        }

        const societies = await Society.findAll(filters);
        return res.status(200).json({ status: 'success', results: societies.length, data: { societies } });
    } catch (err) {
        return next(err);
    }
};

export const getSociety = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const society = await Society.findById(Number(req.params['id']));
        if (!society) return res.status(404).json({ status: 'fail', message: 'Society not found' });
        return res.status(200).json({ status: 'success', data: { society } });
    } catch (err) {
        return next(err);
    }
};

export const createSociety = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { inchargeUserId } = req.body;

        if (inchargeUserId) {
            // Industrial Validation: Check if this user is actually an Instructor
            const instructor = await prisma.instructor.findUnique({
                where: { userId: Number(inchargeUserId) },
            });

            if (!instructor) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Only a valid Instructor can be assigned as the Incharge of a society.',
                });
            }

            // check if this instructor is already incharge of another active society
            const existingSociety = await prisma.society.findFirst({
                where: {
                    inchargeUserId: Number(inchargeUserId),
                    isActive: true,
                },
            });

            if (existingSociety) {
                return res.status(400).json({
                    status: 'fail',
                    message: `This instructor is already the incharge of the active society: ${existingSociety.name}.`,
                });
            }
        }

        // Handle Image Upload with Cloudinary
        if (req.file) {
            req.body.logoUrl = req.file.path;
        }

        const newSociety = await Society.create(req.body);
        return res.status(201).json({ status: 'success', data: { society: newSociety } });
    } catch (err) {
        return next(err);
    }
};

export const updateSociety = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { inchargeUserId, name } = req.body;
        const societyId = Number(req.params['id']);

        // Check for duplicate name (excluding current society)
        if (name) {
            const duplicateSociety = await prisma.society.findFirst({
                where: {
                    name,
                    NOT: { id: societyId },
                },
            });

            if (duplicateSociety) {
                return res.status(400).json({
                    status: 'fail',
                    message: `Society with name '${name}' already exists.`,
                });
            }
        }

        if (inchargeUserId) {
            const instructor = await prisma.instructor.findUnique({
                where: { userId: Number(inchargeUserId) },
            });

            if (!instructor) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Only a valid Instructor can be assigned as the Incharge.',
                });
            }

            // check if this instructor is already incharge of another active society
            const existingSociety = await prisma.society.findFirst({
                where: {
                    inchargeUserId: Number(inchargeUserId),
                    isActive: true, // Only check active ones
                    NOT: { id: societyId },
                },
            });

            if (existingSociety) {
                return res.status(400).json({
                    status: 'fail',
                    message: `This instructor is already the incharge of the active society: ${existingSociety.name}.`,
                });
            }
        }

        // Handle Logo Update
        if (req.file) {
            req.body.logoUrl = req.file.path;
        }

        const updatedSociety = await Society.update(societyId, req.body);
        return res.status(200).json({ status: 'success', data: { society: updatedSociety } });
    } catch (err) {
        return next(err);
    }
};

// --- Members ---

/**
 * Assign a Cabinet Member (Admin/Instructor Only)
 */
export const assignCabinetMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { societyId, userId, positionId } = req.body;

        if (!societyId || !userId || !positionId) {
            return res.status(400).json({ status: 'fail', message: 'Please provide societyId, userId, and positionId' });
        }

        // 1) Verify the position is a cabinet position (Lookup 'Member' dynamically)
        const memberPosition = await SocietyPosition.findByName('Member');
        if (memberPosition && Number(positionId) === memberPosition.id) {
            return res.status(400).json({ status: 'fail', message: 'Use joinsociety for regular members.' });
        }

        // 2) Check if user exists
        const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
        if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });

        // 3) Industrial Validation: Ensure the user is a STUDENT
        const student = await prisma.student.findUnique({
            where: { userId: Number(userId) },
        });

        if (!student) {
            return res.status(400).json({
                status: 'fail',
                message: 'Only Students can be assigned to cabinet positions (President, VP, etc.).',
            });
        }

        const member = await SocietyMember.addMember(societyId, userId, positionId);
        return res.status(201).json({ status: 'success', message: 'Cabinet member assigned successfully', data: { member } });
    } catch (err: any) {
        if (err.code === 'P2002') {
            // If already a member, update their position
            const existing = await prisma.societyMember.findFirst({
                where: { societyId: Number(req.body.societyId), userId: Number(req.body.userId) },
            });
            if (existing) {
                const updated = await SocietyMember.updatePosition(existing.id, req.body.positionId);
                return res.status(200).json({ status: 'success', message: 'Member position updated', data: { member: updated } });
            }
        }
        return next(err);
    }
};

export const joinSociety = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { societyId } = req.body;

        if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

        if (!societyId) {
            return res.status(400).json({ status: 'fail', message: 'Please provide societyId' });
        }

        societyId = Number(societyId);
        if (isNaN(societyId)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid societyId format' });
        }

        // Students can ONLY join as regular 'Member' (Find ID by name)
        const memberPosition = await SocietyPosition.findByName('Member');
        if (!memberPosition) {
            return res.status(500).json({ status: 'error', message: "Default 'Member' position not found in database. Please contact Admin." });
        }

        const member = await SocietyMember.addMember(societyId, req.user.id, memberPosition.id);

        return res.status(201).json({ status: 'success', data: { member } });
    } catch (err: any) {
        if (err.code === 'P2002') return res.status(400).json({ status: 'fail', message: 'You are already a member of this society' });
        return next(err);
    }
};

export const leaveSociety = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { societyId } = req.body;

        if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

        if (!societyId) {
            return res.status(400).json({ status: 'fail', message: 'Please provide societyId' });
        }

        societyId = Number(societyId);
        if (isNaN(societyId)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid societyId format' });
        }

        // Find the membership record for the logged-in user in this society
        const membership = await prisma.societyMember.findFirst({
            where: {
                societyId: societyId,
                userId: req.user.id,
            },
        });

        if (!membership) {
            return res.status(404).json({ status: 'fail', message: 'You are not a member of this society' });
        }

        // Delete the membership record
        await SocietyMember.removeMember(membership.id);

        return res.status(200).json({ status: 'success', message: 'You have successfully left the society' });
    } catch (err) {
        return next(err);
    }
};

/**
 * Remove a member from society (Admin/Incharge Only)
 */
export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { societyId, userId } = req.body;

        if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

        if (!societyId || !userId) {
            return res.status(400).json({ status: 'fail', message: 'Please provide societyId and userId' });
        }

        // 1) Check if society exists
        const society = await Society.findById(Number(societyId));
        if (!society) return res.status(404).json({ status: 'fail', message: 'Society not found' });

        // 2) Authorization: Admin or Society Incharge
        const isAdmin = req.user.userRoles.some((ur) => ur.role.roleName === 'ADMIN');
        const isIncharge = society.inchargeUserId === req.user.id;

        if (!isAdmin && !isIncharge) {
            return res.status(403).json({ status: 'fail', message: 'Unauthorized to remove members from this society' });
        }

        // 3) Check if user is a member
        const membership = await prisma.societyMember.findFirst({
            where: {
                societyId: Number(societyId),
                userId: Number(userId),
            },
        });

        if (!membership) {
            return res.status(404).json({ status: 'fail', message: 'User is not a member of this society' });
        }

        // 4) Execute Removal
        await SocietyMember.removeMember(membership.id);

        return res.status(200).json({ status: 'success', message: 'Member removed successfully' });
    } catch (err) {
        return next(err);
    }
};

export const getMyJoinedSocieties = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
        const memberships = await SocietyMember.findByUser(req.user.id);
        return res.status(200).json({ status: 'success', results: memberships.length, data: { memberships } });
    } catch (err) {
        return next(err);
    }
};

export const getSocietyMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const members = await SocietyMember.findBySociety(Number(req.params['societyId']));
        return res.status(200).json({ status: 'success', results: members.length, data: { members } });
    } catch (err) {
        return next(err);
    }
};


// --- Events ---

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { societyId } = req.body;

        if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

        // Authorization check
        const society = await Society.findById(Number(societyId));
        if (!society) return res.status(404).json({ status: 'fail', message: 'Society not found' });

        const isAdmin = req.user.userRoles.some((ur) => ur.role.roleName === 'ADMIN');
        const isIncharge = society.inchargeUserId === req.user.id;

        if (!isAdmin && !isIncharge) {
            return res.status(403).json({ status: 'fail', message: 'Unauthorized to create events' });
        }

        // Handle Image Upload
        if (req.file) {
            req.body.posterUrl = req.file.path;
        }

        const event = await SocietyEvent.create({ ...req.body, createdBy: req.user.id });
        return res.status(201).json({ status: 'success', data: { event } });
    } catch (err) {
        return next(err);
    }
};

export const getAllEvents = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const events = await SocietyEvent.findAll();
        return res.status(200).json({ status: 'success', results: events.length, data: { events } });
    } catch (err) {
        return next(err);
    }
};

export const getEventsBySociety = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const events = await SocietyEvent.findBySociety(Number(req.params['societyId']));
        return res.status(200).json({ status: 'success', results: events.length, data: { events } });
    } catch (err) {
        return next(err);
    }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const event = await SocietyEvent.findById(Number(req.params['id']));
        if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });

        if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

        // Authorization: Admin or Society Incharge
        const isAdmin = req.user.userRoles.some((ur) => ur.role.roleName === 'ADMIN');
        const isIncharge = event.society?.inchargeUserId === req.user.id;

        if (!isAdmin && !isIncharge) {
            return res.status(403).json({ status: 'fail', message: 'Unauthorized to update this event' });
        }

        // Handle Image Upload
        if (req.file) {
            req.body.posterUrl = req.file.path;
        }

        const updatedEvent = await SocietyEvent.update(Number(req.params['id']), req.body);
        return res.status(200).json({ status: 'success', data: { event: updatedEvent } });
    } catch (err) {
        return next(err);
    }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const event = await SocietyEvent.findById(Number(req.params['id']));
        if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });

        if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

        // Authorization: Admin or Society Incharge
        const isAdmin = req.user.userRoles.some((ur) => ur.role.roleName === 'ADMIN');
        const isIncharge = event.society?.inchargeUserId === req.user.id;

        if (!isAdmin && !isIncharge) {
            return res.status(403).json({ status: 'fail', message: 'Unauthorized to delete this event' });
        }

        await SocietyEvent.delete(Number(req.params['id']));
        return res.status(204).json({ status: 'success', data: null, message: 'Event deleted successfully' });
    } catch (err) {
        return next(err);
    }
};

// --- Positions ---

export const getAllPositions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const positions = await SocietyPosition.findAll();
        return res.status(200).json({ status: 'success', data: { positions } });
    } catch (err) {
        return next(err);
    }
};

export const createPosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, displayOrder } = req.body;

        if (!name || displayOrder === undefined) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide name and displayOrder',
            });
        }

        // Check for duplicate position name
        const existingPosition = await prisma.societyPosition.findUnique({
            where: { name },
        });

        if (existingPosition) {
            return res.status(400).json({
                status: 'fail',
                message: `Position with name '${name}' already exists.`,
            });
        }

        const position = await SocietyPosition.create({
            name,
            displayOrder: Number(displayOrder),
        });

        return res.status(201).json({
            status: 'success',
            message: 'Position created successfully',
            data: { position },
        });
    } catch (err) {
        return next(err);
    }
};

export const deletePosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const position = await SocietyPosition.findById(Number(req.params['id']));

        if (!position) {
            return res.status(404).json({
                status: 'fail',
                message: 'Position not found',
            });
        }

        // Check if any members are assigned to this position
        if (position._count && position._count.members > 0) {
            return res.status(400).json({
                status: 'fail',
                message: `Cannot delete position. ${position._count.members} member(s) are currently assigned to this position.`,
            });
        }

        await SocietyPosition.delete(Number(req.params['id']));

        return res.status(204).json({
            status: 'success',
            data: null,
            message: 'Position deleted successfully',
        });
    } catch (err) {
        return next(err);
    }
};

export const getPosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const position = await SocietyPosition.findById(Number(req.params['id']));

        if (!position) {
            return res.status(404).json({
                status: 'fail',
                message: 'Position not found',
            });
        }

        return res.status(200).json({
            status: 'success',
            data: { position },
        });
    } catch (err) {
        return next(err);
    }
};

export const updatePosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, displayOrder } = req.body;
        const positionId = Number(req.params['id']);

        // Check if position exists
        const position = await SocietyPosition.findById(positionId);
        if (!position) {
            return res.status(404).json({
                status: 'fail',
                message: 'Position not found',
            });
        }

        // Check for duplicate name (excluding current position)
        if (name) {
            const duplicatePosition = await prisma.societyPosition.findFirst({
                where: {
                    name,
                    NOT: { id: positionId },
                },
            });

            if (duplicatePosition) {
                return res.status(400).json({
                    status: 'fail',
                    message: `Position with name '${name}' already exists.`,
                });
            }
        }

        // Update position
        const updateData: any = {};
        if (name) updateData.name = name;
        if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);

        const updatedPosition = await prisma.societyPosition.update({
            where: { id: positionId },
            data: updateData,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Position updated successfully',
            data: { position: updatedPosition },
        });
    } catch (err) {
        return next(err);
    }
};

export const deleteSociety = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const society = await Society.findById(Number(req.params['id']));
        if (!society) return res.status(404).json({ status: 'fail', message: 'Society not found' });

        // Soft delete: set isActive to false AND remove incharge so they can be assigned elsewhere
        await Society.update(Number(req.params['id']), {
            isActive: false,
            inchargeUserId: null,
        });

        return res.status(204).json({
            status: 'success',
            data: null,
            message: 'Society deleted successfully',
        });
    } catch (err) {
        return next(err);
    }
};
