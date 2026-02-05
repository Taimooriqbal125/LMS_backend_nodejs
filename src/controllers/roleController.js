const Role = require('../models/Role');

/**
 * Role Controller
 */
exports.getAllRoles = async (req, res, next) => {
    try {
        const roles = await Role.findAll();
        res.status(200).json({
            status: 'success',
            results: roles.length,
            data: { roles }
        });
    } catch (err) {
        next(err);
    }
};

exports.getRole = async (req, res, next) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                status: 'fail',
                message: 'Role not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { role }
        });
    } catch (err) {
        next(err);
    }
};

exports.createRole = async (req, res, next) => {
    try {
        const newRole = await Role.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { role: newRole }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        const updatedRole = await Role.update(req.params.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { role: updatedRole }
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteRole = async (req, res, next) => {
    try {
        await Role.delete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
