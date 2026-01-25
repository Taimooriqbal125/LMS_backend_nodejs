const prisma = require('../config/database');

/**
 * Enrollment Model Wrapper
 */
class Enrollment {
    static async findAll() {
        return await prisma.enrollment.findMany({
            include: {
                student: { include: { user: true } },
                course: true,
                academicTerm: true
            }
        });
    }

    static async findById(id) {
        return await prisma.enrollment.findUnique({
            where: { id: parseInt(id) },
            include: {
                student: { include: { user: true } },
                course: true,
                academicTerm: true
            }
        });
    }

    static async findByStudent(studentUserId) {
        return await prisma.enrollment.findMany({
            where: { studentUserId: parseInt(studentUserId) },
            include: {
                course: true,
                academicTerm: true
            }
        });
    }

    static async create(data) {
        return await prisma.enrollment.create({
            data: {
                studentUserId: parseInt(data.studentUserId),
                courseId: parseInt(data.courseId),
                academicTermId: parseInt(data.academicTermId),
                status: data.status || 'enrolled'
            },
            include: {
                course: true,
                academicTerm: true
            }
        });
    }

    static async update(id, data) {
        return await prisma.enrollment.update({
            where: { id: parseInt(id) },
            data
        });
    }

    static async delete(id) {
        return await prisma.enrollment.delete({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = Enrollment;
