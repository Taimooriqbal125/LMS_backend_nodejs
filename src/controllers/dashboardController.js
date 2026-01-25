const prisma = require('../config/database');

/**
 * Dashboard Controller
 */
exports.getGlobalStats = async (req, res, next) => {
    try {
        const [
            totalStudents,
            totalInstructors,
            totalCourses,
            totalDepartments,
            totalSocieties,
            totalEvents,
            recentUsers
        ] = await Promise.all([
            prisma.student.count(),
            prisma.instructor.count(),
            prisma.course.count(),
            prisma.department.count(),
            prisma.society.count(),
            prisma.societyEvent.count(),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, firstName: true, email: true, createdAt: true }
            })
        ]);

        const upcomingEvents = await prisma.societyEvent.findMany({
            where: {
                eventDate: { gte: new Date() }
            },
            take: 5,
            orderBy: { eventDate: 'asc' },
            include: { society: { select: { name: true } } }
        });

        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    totalStudents,
                    totalInstructors,
                    totalCourses,
                    totalDepartments,
                    totalSocieties,
                    totalEvents
                },
                recentUsers,
                upcomingEvents
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getStudentSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [enrollments, memberships] = await Promise.all([
            prisma.enrollment.findMany({
                where: { studentUserId: userId },
                include: { course: true }
            }),
            prisma.societyMember.findMany({
                where: { userId },
                include: { society: true, position: true }
            })
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                coursesEnrolled: enrollments.length,
                societiesJoined: memberships.length,
                enrollments,
                memberships
            }
        });
    } catch (err) {
        next(err);
    }
};
