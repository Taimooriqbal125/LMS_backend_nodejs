const prisma = require('../config/database');

/**
 * Society Model Wrapper
 */
class Society {
    static async findAll() {
        return await prisma.society.findMany({
            include: {
                incharge: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                _count: {
                    select: { members: true, events: true }
                }
            }
        });
    }

    static async findById(id) {
        return await prisma.society.findUnique({
            where: { id: parseInt(id) },
            include: {
                incharge: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                members: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true } },
                        position: true
                    }
                },
                events: true
            }
        });
    }

    static async create(data) {
        return await prisma.society.create({
            data: {
                name: data.name,
                description: data.description,
                logoUrl: data.logoUrl,
                inchargeUserId: data.inchargeUserId ? parseInt(data.inchargeUserId) : null
            }
        });
    }

    static async update(id, data) {
        return await prisma.society.update({
            where: { id: parseInt(id) },
            data
        });
    }

    static async delete(id) {
        return await prisma.society.delete({
            where: { id: parseInt(id) }
        });
    }
}

/**
 * SocietyPosition Model Wrapper
 */
class SocietyPosition {
    static async findAll() {
        return await prisma.societyPosition.findMany({
            orderBy: { displayOrder: 'asc' }
        });
    }

    static async create(data) {
        return await prisma.societyPosition.create({
            data
        });
    }
}

module.exports = { Society, SocietyPosition };
