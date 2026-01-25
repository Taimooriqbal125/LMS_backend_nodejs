const Course = require('../models/Course');

/**
 * Course Controller
 */
exports.getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.findAll();
        res.status(200).json({
            status: 'success',
            results: courses.length,
            data: { courses }
        });
    } catch (err) {
        next(err);
    }
};

exports.getCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({
                status: 'fail',
                message: 'Course not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { course }
        });
    } catch (err) {
        next(err);
    }
};

const prisma = require('../config/database');

exports.createCourse = async (req, res, next) => {
    try {
        const { createdBy } = req.body;

        // 1) Logic: If createdBy is not provided, use the logged-in user's ID
        let creatorId = createdBy ? parseInt(createdBy) : req.user.id;

        // 2) Industrial Validation: Check if this user is actually an Instructor
        const instructor = await prisma.instructor.findUnique({
            where: { userId: creatorId }
        });

        if (!instructor && req.user.userRoles.every(ur => ur.role.roleName !== 'ADMIN')) {
            return res.status(400).json({
                status: 'fail',
                message: 'A course can only be created by a valid Instructor or an Admin.'
            });
        }

        // 3) Create the course
        const newCourse = await Course.create({
            ...req.body,
            createdBy: creatorId
        });

        res.status(201).json({
            status: 'success',
            data: { course: newCourse }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateCourse = async (req, res, next) => {
    try {
        const updatedCourse = await Course.update(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { course: updatedCourse }
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        await Course.delete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Assign an Instructor to a Course
 */
exports.assignInstructor = async (req, res, next) => {
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
            where: { userId: parseInt(instructorUserId) }
        });

        if (!instructor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Instructor profile not found'
            });
        }

        const assignment = await Course.assignInstructor(courseId, instructorUserId);

        res.status(201).json({
            status: 'success',
            data: { assignment }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Remove an Instructor from a Course
 */
exports.removeInstructor = async (req, res, next) => {
    try {
        const { courseId, instructorUserId } = req.body;

        await Course.removeInstructor(courseId, instructorUserId);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
