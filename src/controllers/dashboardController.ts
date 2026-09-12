import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

/**
 * Dashboard Controller
 */

export const getGlobalStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalStudents,
      totalInstructors,
      totalCourses,
      totalDepartments,
      totalSocieties,
      totalEvents,
      recentUsers,
      activeUsersToday,
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
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const upcomingEvents = await prisma.societyEvent.findMany({
      where: {
        eventDate: { gte: new Date() },
      },
      take: 5,
      orderBy: { eventDate: 'asc' },
      include: { society: { select: { name: true } } },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalStudents,
          totalInstructors,
          totalCourses,
          totalDepartments,
          totalSocieties,
          totalEvents,
          activeUsersToday,
        },
        recentUsers,
        upcomingEvents,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const getStudentSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    const userId = req.user.id;

    // 1) Fetch Student Profile, Enrollments, and Memberships in Parallel
    const [student, enrollments, memberships] = await Promise.all([
      prisma.student.findUnique({
        where: { userId },
        select: {
          agNo: true,
          department: { select: { code: true, name: true } },
          program: { select: { name: true } },
          user: {
            select: { firstName: true, lastName: true, email: true, profileImageUrl: true },
          },
        },
      }),
      prisma.enrollment.findMany({
        where: { studentUserId: userId },
        select: {
          id: true,
          status: true,
          course: {
            select: { title: true, code: true, creditHours: true },
          },
          academicTerm: {
            select: { name: true },
          },
        },
      }),
      prisma.societyMember.findMany({
        where: { userId },
        select: {
          id: true,
          society: { select: { name: true, logoUrl: true } },
          position: { select: { name: true } },
        },
      }),
    ]);

    if (!student) {
      return res.status(404).json({ status: 'fail', message: 'Student profile not found' });
    }

    // 2) Calculate Total Credit Hours
    const totalCreditHours = enrollments.reduce((sum: number, entry: any) => {
      return sum + (entry.course?.creditHours || 0);
    }, 0);

    // 3) Final Response (Clean & Optimized)
    return res.status(200).json({
      status: 'success',
      data: {
        student: {
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          email: student.user.email,
          profileImageUrl: student.user.profileImageUrl,
          agNo: student.agNo,
          department: student.department.name,
          program: student.program.name,
        },
        stats: {
          coursesEnrolled: enrollments.length,
          societiesJoined: memberships.length,
          totalCreditHours,
        },
        enrollments,
        memberships,
      },
    });
  } catch (err) {
    return next(err);
  }
};
