const prisma = require('../config/database');

/**
 * Program Model Wrapper
 */
class Program {
    static async findAll() {
        return await prisma.program.findMany({
            include: {
                department: true,
                _count: {
                    select: { students: true }
                }
            }
        });
    }

    static async findById(id) {
        return await prisma.program.findUnique({
            where: { id: parseInt(id) },
            include: {
                department: true
            }
        });
    }

    static async findByCode(code) {
        return await prisma.program.findUnique({
            where: { code }
        });
    }

    static async create(data) {
        return await prisma.program.create({
            data
        });
    }

    static async update(id, data) {
        return await prisma.program.update({
            where: { id: parseInt(id) },
            data
        });
    }

    static async delete(id) {
        return await prisma.program.delete({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = Program;
