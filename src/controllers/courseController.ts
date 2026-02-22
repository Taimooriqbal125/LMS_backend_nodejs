import { Request, Response, NextFunction } from 'express';
import Course from '../models/Course';
import prisma from '../config/database';

/**
 * Course Controller
 */
export const getAllCourses = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await Course.findAll();
        return res.status(200).json({
            status: 'success',
            results: courses.length,
            data: { courses }
        });
    } catch (err) {
        return next(err);
    }
};

export const getCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await Course.findById(Number(req.params['id']));
        if (!course) {
            return res.status(404).json({
                status: 'fail',
                message: 'Course not found'
            });
        }
        return res.status(200).json({
            status: 'success',
            data: { course }
        });
    } catch (err) {
        return next(err);
    }
};

/**
 * Get Courses based on the logged-in Instructor
 */
export const getInstructorCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
        }

        const courses = await Course.findByInstructor(req.user.id);

        return res.status(200).json({
            status: 'success',
            results: courses.length,
            data: { courses }
        });
    } catch (err) {
        return next(err);
    }
};

export const getDepartmentCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
        }

        // 1) Find the student profile to get their departmentId
        const student = await prisma.student.findUnique({
            where: { userId: req.user.id }
        });

        if (!student) {
            return res.status(404).json({
                status: 'fail',
                message: 'Student profile not found. This feature is for students only.'
            });
        }

        // 2) Fetch courses for that department
        const courses = await Course.findByDepartment(student.departmentId);

        return res.status(200).json({
            status: 'success',
            results: courses.length,
            data: { courses }
        });
    } catch (err) {
        return next(err);
    }
};

export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
        }

        const { title, code, description, creditHours, departmentId, academicTermId } = req.body;

        // 1) Validation: Required Fields
        if (!title || !code || !description || !creditHours || !departmentId || !academicTermId) {
            return res.status(400).json({
                status: 'fail',
                message: 'All fields are required.'
            });
        }

        // 2) Validation: Uniqueness check for Title or Code
        const existingResult = await prisma.course.findFirst({
            where: {
                OR: [{ title }, { code }]
            }
        });

        if (existingResult) {
            const message = existingResult.code === code
                ? 'Course code already exists.'
                : 'A course with this title already exists.';
            return res.status(400).json({ status: 'fail', message });
        }

        // 3) Create the course (Security: Always use req.user.id from the token)
        const newCourse = await Course.create({
            title,
            code,
            description,
            creditHours,
            departmentId,
            academicTermId,
            createdBy: req.user.id
        });

        return res.status(201).json({
            status: 'success',
            data: { course: newCourse }
        });
    } catch (err) {
        return next(err);
    }
};

export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title } = req.body;

        // 1) If title is being updated, check for uniqueness
        if (title) {
            const existingCourse = await prisma.course.findFirst({
                where: {
                    title,
                    NOT: { id: Number(req.params['id']) }
                }
            });

            if (existingCourse) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Another course with this title already exists.'
                });
            }
        }

        const updatedCourse = await Course.update(Number(req.params['id']), req.body);
        return res.status(200).json({
            status: 'success',
            data: { course: updatedCourse }
        });
    } catch (err) {
        return next(err);
    }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await Course.delete(Number(req.params['id']));
        return res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        return next(err);
    }
};

/**
 * Assign an Instructor to a Course
 */
export const assignInstructor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, instructorUserId } = req.body;

        if (!courseId || !instructorUserId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide courseId and instructorUserId'
            });
        }

        // Check if instructor profile exists
        const instructor = await prisma.instructor.findUnique({
            where: { userId: Number(instructorUserId) }
        });

        if (!instructor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Instructor profile not found'
            });
        }

        const assignment = await Course.assignInstructor(Number(courseId), Number(instructorUserId));

        return res.status(201).json({
            status: 'success',
            data: { assignment }
        });
    } catch (err) {
        return next(err);
    }
};

/**
 * Remove an Instructor from a Course
 */
export const removeInstructor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, instructorUserId } = req.body;

        await Course.removeInstructor(Number(courseId), Number(instructorUserId));

        return res.status(204).json({
            status: 'success',
            data: null,
            message: 'Instructor removed successfully'
        });
    } catch (err) {
        return next(err);
    }
};
