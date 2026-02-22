import { Request, Response, NextFunction } from 'express';
import Enrollment from '../models/Enrollment';
import prisma from '../config/database';

/**
 * Enrollment Controller
 */
export const enrollStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentUserId, courseId } = req.body;
    let { academicTermId } = req.body;

    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const userRoleNames = req.user.userRoles.map((ur) => ur.role.roleName);
    const isInstructor = userRoleNames.includes('INSTRUCTOR');
    const isAdmin = userRoleNames.includes('ADMIN');

    // 1) Validation: Course Existence & Automatic Term fetching
    if (!courseId) {
      return res.status(400).json({ status: 'fail', message: 'Please provide courseId' });
    }

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
      include: { instructors: true },
    });

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }

    // Auto-fetch academicTermId from course if not provided
    if (!academicTermId) {
      academicTermId = course.academicTermId;
    }

    if (!academicTermId) {
      return res.status(400).json({
        status: 'fail',
        message: 'This course is not assigned to any academic term. Please contact Admin.',
      });
    }

    // 2) Authorization Check
    // If Instructor, they must teach the course
    if (isInstructor && !isAdmin) {
      const isAssigned = course.instructors.some((inst) => inst.instructorUserId === req.user?.id);
      if (!isAssigned) {
        return res.status(403).json({
          status: 'fail',
          message: 'You can only enroll students in courses you are assigned to teach.',
        });
      }
    }

    // 3) Target Student Identification
    const targetStudentId = studentUserId ? Number(studentUserId) : req.user.id;

    // If student is trying to enroll (if role allowed), they can only enroll themselves
    const isStudent = userRoleNames.includes('STUDENT');
    if (isStudent && !isAdmin && !isInstructor && targetStudentId !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only enroll yourself.',
      });
    }

    if (!targetStudentId) {
      return res.status(400).json({ status: 'fail', message: 'Please provide studentUserId' });
    }

    // 4) Student Existence & Department Validation
    const student = await prisma.student.findUnique({
      where: { userId: targetStudentId },
    });

    if (!student) {
      return res.status(404).json({ status: 'fail', message: 'Student profile not found' });
    }

    if (student.departmentId !== course.departmentId && !isAdmin) {
      return res.status(400).json({
        status: 'fail',
        message: 'Student can only be enrolled in courses from their own Department.',
      });
    }

    // 5) Create Enrollment
    const enrollment = await Enrollment.create({
      studentUserId: targetStudentId,
      courseId: Number(courseId),
      academicTermId: Number(academicTermId),
    });

    return res.status(201).json({
      status: 'success',
      data: { enrollment },
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(400).json({
        status: 'fail',
        message: 'Student is already enrolled in this course for this term',
      });
    }
    return next(err);
  }
};

export const getAllEnrollments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollments = await Enrollment.findAll();
    return res.status(200).json({
      status: 'success',
      results: enrollments.length,
      data: { enrollments },
    });
  } catch (err) {
    return next(err);
  }
};

export const getMyEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    // Use logged in user's ID
    const enrollments = await Enrollment.findByStudent(req.user.id);
    return res.status(200).json({
      status: 'success',
      results: enrollments.length,
      data: { enrollments },
    });
  } catch (err) {
    return next(err);
  }
};

export const updateEnrollmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const updated = await Enrollment.update(Number(req.params['id']), { status });
    return res.status(200).json({
      status: 'success',
      data: { enrollment: updated },
    });
  } catch (err) {
    return next(err);
  }
};

export const dropEnrollment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await Enrollment.findById(Number(req.params['id']));
    if (!enrollment) {
      return res.status(404).json({ status: 'fail', message: 'Enrollment not found' });
    }

    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const userRoleNames = req.user.userRoles.map((ur) => ur.role.roleName);
    const isAdmin = userRoleNames.includes('ADMIN');
    const isInstructor = userRoleNames.includes('INSTRUCTOR');

    // Logic: Admin can drop anyone. Instructor can ONLY drop students from THEIR courses.
    if (isInstructor && !isAdmin) {
      const course = await prisma.course.findFirst({
        where: {
          id: enrollment.course.id,
          instructors: {
            some: {
              instructorUserId: req.user.id,
            },
          },
        },
      });

      if (!course) {
        return res.status(403).json({
          status: 'fail',
          message: 'You can only drop students from courses you teach.',
        });
      }
    }

    await Enrollment.delete(Number(req.params['id']));
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return next(err);
  }
};
