const prisma = require('../config/database');

/**
 * SocietyMember Model Wrapper
 */
class SocietyMember {
    static async addMember(societyId, userId, positionId) {
        return await prisma.societyMember.create({
            data: {
                societyId: parseInt(societyId),
                userId: parseInt(userId),
                positionId: parseInt(positionId)
            },
            include: {
                user: true,
                position: true,
                society: true
            }
        });
    }

    static async updatePosition(id, positionId) {
        return await prisma.societyMember.update({
            where: { id: parseInt(id) },
            data: { positionId: parseInt(positionId) }
        });
    }

    static async removeMember(id) {
        return await prisma.societyMember.delete({
            where: { id: parseInt(id) }
        });
    }

    static async findBySociety(societyId) {
        return await prisma.societyMember.findMany({
            where: { societyId: parseInt(societyId) },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                position: true
            }
        });
    }
}

module.exports = SocietyMember;
