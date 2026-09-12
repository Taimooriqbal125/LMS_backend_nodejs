import { Request, Response, NextFunction } from 'express';
import CourseContent from '../models/CourseContent';
import prisma from '../config/database';

/**
 * Course Content Controller
 */
export const uploadContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, title, description, youtubeUrl } = req.body;

    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    // 1) Validation
    if (!courseId || !title) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide courseId and title',
      });
    }

    // 2) Check if Course exists and if user is authorized (Instructor of this course or Admin)
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
      include: { instructors: true },
    });

    if (!course) {
      return res.status(404).json({ status: 'fail', message: 'Course not found' });
    }

    const isAdmin = req.user.userRoles.some((ur) => ur.role.roleName === 'ADMIN');
    const isCourseInstructor = course.instructors.some(
      (inst) => inst.instructorUserId === req.user?.id,
    );
    const isCourseCreator = course.createdBy === req.user.id;

    if (!isAdmin && !isCourseInstructor && !isCourseCreator) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to upload content to this course.',
      });
    }

    // 3) Create content
    const content = await CourseContent.create({
      courseId: Number(courseId),
      title,
      description,
      youtubeUrl,
      uploadedBy: req.user.id,
    });

    return res.status(201).json({
      status: 'success',
      data: { content },
    });
  } catch (err) {
    return next(err);
  }
};

export const getCourseContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params['courseId']);

    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    // 1) Logic: Check if Course exists at all
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid course ID. This course does not exist.',
      });
    }

    // 2) Industrial Access Control: Check if student is enrolled OR if user is staff
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentUserId_courseId: {
          studentUserId: req.user.id,
          courseId: courseId,
        },
      },
    });

    const isAdmin = req.user.userRoles.some((ur) => ur.role.roleName === 'ADMIN');
    const isInstructor = req.user.userRoles.some((ur) => ur.role.roleName === 'INSTRUCTOR');

    if (!enrollment && !isAdmin && !isInstructor) {
      return res.status(403).json({
        status: 'fail',
        message: 'You must be enrolled in this course to view its content.',
      });
    }

    const contents = await CourseContent.findAllByCourse(courseId);

    return res.status(200).json({
      status: 'success',
      results: contents.length,
      data: { contents },
    });
  } catch (err) {
    return next(err);
  }
};

export const deleteContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contentId = Number(req.params['id']);
    // Logic to check authorization before deleting could be added here
    await CourseContent.delete(contentId);
    return res.status(200).json({
      status: 'success',
      message: 'Successfully Deleted Content',
      data: null,
    });
  } catch (err) {
    return next(err);
  }
};
