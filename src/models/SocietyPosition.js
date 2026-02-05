const prisma = require('../config/database');

/**
 * SocietyPosition Model Wrapper
 */
class SocietyPosition {
    static async findAll() {
        return await prisma.societyPosition.findMany({
            orderBy: {
                displayOrder: 'asc'
            },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });
    }

    static async findById(id) {
        return await prisma.societyPosition.findUnique({
            where: { id: parseInt(id) }
        });
    }

    static async create(data) {
        return await prisma.societyPosition.create({
            data
        });
    }

    static async update(id, data) {
        return await prisma.societyPosition.update({
            where: { id: parseInt(id) },
            data
        });
    }

    static async delete(id) {
        return await prisma.societyPosition.delete({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = SocietyPosition;
