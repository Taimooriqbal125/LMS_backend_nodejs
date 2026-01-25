const Enrollment = require('../models/Enrollment');
const prisma = require('../config/database');

/**
 * Enrollment Controller
 */
exports.enrollStudent = async (req, res, next) => {
    try {
        const { studentUserId, courseId, academicTermId } = req.body;

        // 1) Logic: If the requester is a STUDENT, they can ONLY enroll themselves
        const userRoleNames = req.user.userRoles.map(ur => ur.role.roleName);
        const isStudent = userRoleNames.includes('STUDENT');
        const isAdmin = userRoleNames.includes('ADMIN');

        let targetStudentId = studentUserId ? parseInt(studentUserId) : req.user.id;

        if (isStudent && targetStudentId !== req.user.id) {
            return res.status(403).json({
                status: 'fail',
                message: 'You can only enroll yourself. You cannot enroll other students.'
            });
        }

        // 2) Validation: provide IDs check
        if (!targetStudentId || !courseId || !academicTermId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide studentUserId, courseId, and academicTermId'
            });
        }

        // 3) Industrial Validation: Fetch Student and Course Data
        const student = await prisma.student.findUnique({
            where: { userId: targetStudentId }
        });
        const course = await prisma.course.findUnique({
            where: { id: parseInt(courseId) }
        });

        if (!student || !course) {
            return res.status(404).json({ status: 'fail', message: 'Student or Course not found' });
        }

        // 4) DEPARTMENT VALIDATION: A student can only enroll in courses from their department
        if (student.departmentId !== course.departmentId && !isAdmin) {
            return res.status(400).json({
                status: 'fail',
                message: 'You can only enroll in courses offered by your own Department.'
            });
        }

        // 5) Create Enrollment
        const enrollment = await Enrollment.create({
            ...req.body,
            studentUserId: targetStudentId
        });

        res.status(201).json({
            status: 'success',
            data: { enrollment }
        });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({
                status: 'fail',
                message: 'Student is already enrolled in this course'
            });
        }
        next(err);
    }
};

exports.getAllEnrollments = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.findAll();
        res.status(200).json({
            status: 'success',
            results: enrollments.length,
            data: { enrollments }
        });
    } catch (err) {
        next(err);
    }
};

exports.getMyEnrollments = async (req, res, next) => {
    try {
        // Use logged in user's ID
        const enrollments = await Enrollment.findByStudent(req.user.id);
        res.status(200).json({
            status: 'success',
            results: enrollments.length,
            data: { enrollments }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateEnrollmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const updated = await Enrollment.update(req.params.id, { status });
        res.status(200).json({
            status: 'success',
            data: { enrollment: updated }
        });
    } catch (err) {
        next(err);
    }
};

exports.dropEnrollment = async (req, res, next) => {
    try {
        await Enrollment.delete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
