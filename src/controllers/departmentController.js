const Department = require('../models/Department');
    const prisma = require('../config/database');

/**
 * Department Controller
 */
exports.getAllDepartments = async (req, res, next) => {
    try {
        const departments = await Department.findAll();
        res.status(200).json({
            status: 'success',
            results: departments.length,
            data: { departments }
        });
    } catch (err) {
        next(err);
    }
};

exports.getDepartment = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({
                status: 'fail',
                message: 'Department not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { department }
        });
    } catch (err) {
        next(err);
    }
};

exports.createDepartment = async (req, res, next) => {
    try {
        const newDepartment = await Department.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { department: newDepartment }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateDepartment = async (req, res, next) => {
    try {
        const updatedDepartment = await Department.update(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { department: updatedDepartment }
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteDepartment = async (req, res, next) => {
    try {
        await Department.delete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Assign HOD to Department (Restricted to ADMIN)
 * Assigns an instructor as Head of Department
 */
exports.assignHOD = async (req, res, next) => {

    try {
        const { id } = req.params; // Department ID
        const { instructorUserId } = req.body;

        // 1) Validate instructorUserId is provided
        if (!instructorUserId) {
            return res.status(400).json({
                status: 'fail',
                message: 'instructorUserId is required'
            });
        }

        // 2) Check if department exists
        const department = await prisma.department.findUnique({
            where: { id: parseInt(id) }
        });

        if (!department) {
            return res.status(404).json({
                status: 'fail',
                message: 'Department not found'
            });
        }

        // 3) Check if user exists and is an instructor
        const instructor = await prisma.instructor.findUnique({
            where: { userId: parseInt(instructorUserId) },
            include: { user: true }
        });

        if (!instructor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Instructor not found. Only instructors can be assigned as HOD.'
            });
        }

        // 4) Optionally: Check if instructor belongs to this department
        if (instructor.departmentId !== parseInt(id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Instructor does not belong to this department'
            });
        }

        // 5) Assign HOD
        const updatedDepartment = await prisma.department.update({
            where: { id: parseInt(id) },
            data: { hodUserId: parseInt(instructorUserId) },
            include: {
                hod: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        res.status(200).json({
            status: 'success',
            message: `${instructor.user.firstName} ${instructor.user.lastName} has been assigned as HOD`,
            data: { department: updatedDepartment }
        });
    } catch (err) {
        next(err);
    }
};
