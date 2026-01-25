const prisma = require('../config/database');

/**
 * SocietyEvent Model Wrapper
 */
class SocietyEvent {
    static async findAll() {
        return await prisma.societyEvent.findMany({
            include: {
                society: true,
                creator: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { eventDate: 'asc' }
        });
    }

    static async findBySociety(societyId) {
        return await prisma.societyEvent.findMany({
            where: { societyId: parseInt(societyId) },
            include: {
                creator: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { eventDate: 'asc' }
        });
    }

    static async create(data) {
        return await prisma.societyEvent.create({
            data: {
                societyId: parseInt(data.societyId),
                title: data.title,
                description: data.description,
                eventDate: new Date(data.eventDate),
                eventTime: data.eventTime,
                posterUrl: data.posterUrl,
                createdBy: parseInt(data.createdBy)
            }
        });
    }

    static async delete(id) {
        return await prisma.societyEvent.delete({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = SocietyEvent;
