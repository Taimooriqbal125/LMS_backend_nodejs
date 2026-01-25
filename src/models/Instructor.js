const prisma = require('../config/database');

/**
 * Instructor Model Wrapper
 */
class Instructor {
    static async findAll() {
        return await prisma.instructor.findMany({
            include: {
                user: true,
                department: true
            }
        });
    }

    static async findById(id) {
        return await prisma.instructor.findUnique({
            where: { userId: parseInt(id) },
            include: {
                user: true,
                department: true
            }
        });
    }

    static async findByEmployeeNo(employeeNo) {
        return await prisma.instructor.findUnique({
            where: { employeeNo },
            include: { user: true }
        });
    }

    static async create(data) {
        return await prisma.instructor.create({
            data,
            include: {
                user: true,
                department: true
            }
        });
    }

    static async update(userId, data) {
        return await prisma.instructor.update({
            where: { userId: parseInt(userId) },
            data,
            include: {
                user: true,
                department: true
            }
        });
    }

    static async delete(userId) {
        return await prisma.instructor.delete({
            where: { userId: parseInt(userId) }
        });
    }
}

module.exports = Instructor;
