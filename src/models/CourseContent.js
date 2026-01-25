const prisma = require('../config/database');

/**
 * CourseContent Model Wrapper
 */
class CourseContent {
    static async findAllByCourse(courseId) {
        return await prisma.courseContent.findMany({
            where: { courseId: parseInt(courseId) },
            include: {
                uploader: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    static async findById(id) {
        return await prisma.courseContent.findUnique({
            where: { id: parseInt(id) },
            include: {
                course: true,
                uploader: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            }
        });
    }

    static async create(data) {
        return await prisma.courseContent.create({
            data: {
                courseId: parseInt(data.courseId),
                title: data.title,
                description: data.description,
                youtubeUrl: data.youtubeUrl,
                uploadedBy: parseInt(data.uploadedBy)
            }
        });
    }

    static async update(id, data) {
        return await prisma.courseContent.update({
            where: { id: parseInt(id) },
            data
        });
    }

    static async delete(id) {
        return await prisma.courseContent.delete({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = CourseContent;
