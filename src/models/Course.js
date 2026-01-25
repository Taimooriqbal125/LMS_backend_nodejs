const prisma = require('../config/database');

/**
 * Course Model Wrapper
 */
class Course {
    static async findAll() {
        return await prisma.course.findMany({
            include: {
                department: true,
                creator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                academicTerm: true,
                _count: {
                    select: { contents: true, enrollments: true }
                }
            }
        });
    }

    static async findById(id) {
        return await prisma.course.findUnique({
            where: { id: parseInt(id) },
            include: {
                department: true,
                creator: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                academicTerm: true,
                instructors: {
                    include: { instructor: { include: { user: true } } }
                }
            }
        });
    }

    static async create(data) {
        return await prisma.course.create({
            data: {
                ...data,
                creditHours: parseInt(data.creditHours),
                departmentId: parseInt(data.departmentId),
                createdBy: parseInt(data.createdBy),
                academicTermId: data.academicTermId ? parseInt(data.academicTermId) : null
            },
            include: {
                department: true,
                creator: true
            }
        });
    }

    static async update(id, data) {
        const updateData = { ...data };
        if (data.creditHours) updateData.creditHours = parseInt(data.creditHours);
        if (data.departmentId) updateData.departmentId = parseInt(data.departmentId);
        if (data.academicTermId) updateData.academicTermId = parseInt(data.academicTermId);

        return await prisma.course.update({
            where: { id: parseInt(id) },
            data: updateData
        });
    }

    static async delete(id) {
        return await prisma.course.delete({
            where: { id: parseInt(id) }
        });
    }

    // --- Junction Table Operations ---

    static async assignInstructor(courseId, instructorUserId) {
        return await prisma.courseInstructor.create({
            data: {
                courseId: parseInt(courseId),
                instructorUserId: parseInt(instructorUserId)
            },
            include: {
                course: true,
                instructor: {
                    include: { user: true }
                }
            }
        });
    }

    static async removeInstructor(courseId, instructorUserId) {
        return await prisma.courseInstructor.delete({
            where: {
                courseId_instructorUserId: {
                    courseId: parseInt(courseId),
                    instructorUserId: parseInt(instructorUserId)
                }
            }
        });
    }
}

module.exports = Course;
