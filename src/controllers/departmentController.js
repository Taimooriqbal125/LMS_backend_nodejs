const Department = require('../models/Department');

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
