const prisma = require('../config/database');

/**
 * Student Model Wrapper
 */
class Student {
    static async findAll() {
        return await prisma.student.findMany({
            include: {
                user: true,
                department: true,
                program: true
            }
        });
    }

    static async findById(id) {
        return await prisma.student.findUnique({
            where: { userId: parseInt(id) },
            include: {
                user: true,
                department: true,
                program: true
            }
        });
    }

    static async findByAgNo(agNo) {
        return await prisma.student.findUnique({
            where: { agNo },
            include: { user: true }
        });
    }

    static async create(data) {
        return await prisma.student.create({
            data,
            include: {
                user: true,
                department: true,
                program: true
            }
        });
    }

    static async update(userId, data) {
        return await prisma.student.update({
            where: { userId: parseInt(userId) },
            data,
            include: {
                user: true,
                department: true,
                program: true
            }
        });
    }

    static async delete(userId) {
        return await prisma.student.delete({
            where: { userId: parseInt(userId) }
        });
    }
}

module.exports = Student;
