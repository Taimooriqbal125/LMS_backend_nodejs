const prisma = require('../config/database');

/**
 * AcademicTerm Model Wrapper
 */
class AcademicTerm {
    static async findAll() {
        return await prisma.academicTerm.findMany({
            orderBy: { startDate: 'desc' }
        });
    }

    static async findById(id) {
        return await prisma.academicTerm.findUnique({
            where: { id: parseInt(id) }
        });
    }

    static async findActive() {
        return await prisma.academicTerm.findMany({
            where: { isActive: true }
        });
    }

    static async create(data) {
        return await prisma.academicTerm.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate)
            }
        });
    }

    static async update(id, data) {
        const updateData = { ...data };
        if (data.startDate) updateData.startDate = new Date(data.startDate);
        if (data.endDate) updateData.endDate = new Date(data.endDate);

        return await prisma.academicTerm.update({
            where: { id: parseInt(id) },
            data: updateData
        });
    }

    static async delete(id) {
        return await prisma.academicTerm.delete({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = AcademicTerm;
