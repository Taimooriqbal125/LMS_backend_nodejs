const prisma = require('../config/database');

/**
 * Department Model Wrapper
 */
class Department {
    static async findAll() {
        return await prisma.department.findMany({
            include: {
                programs: true,
                _count: {
                    select: { students: true, instructors: true }
                }
            }
        });
    }

    static async findById(id) {
        return await prisma.department.findUnique({
            where: { id: parseInt(id) },
            include: {
                programs: true,
                hod: true
            }
        });
    }

    static async findByCode(code) {
        return await prisma.department.findUnique({
            where: { code }
        });
    }

    static async create(data) {
        return await prisma.department.create({
            data
        });
    }

    static async update(id, data) {
        return await prisma.department.update({
            where: { id: parseInt(id) },
            data
        });
    }

    static async delete(id) {
        return await prisma.department.delete({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = Department;
