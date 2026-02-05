const User = require('../models/User');

/**
 * User Controller
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();

        // Safety: Remove passwords from output
        users.forEach(u => u.passwordHash = undefined);

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users },
        });
    } catch (err) {
        next(err);
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }

        user.passwordHash = undefined;

        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        // 1) Create error if user POSTs password data
        if (req.body.passwordHash) {
            return res.status(400).json({
                status: 'fail',
                message: 'This route is not for password updates. Please use /updateMyPassword.',
            });
        }

        // 2) Filter out unwanted fields that are not allowed to be updated
        const filteredBody = {};
        const allowedFields = ['firstName', 'lastName', 'profileImageUrl'];
        Object.keys(req.body).forEach(el => {
            if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
        });

        // 3) Update user document
        const updatedUser = await User.update(req.user.id, filteredBody);

        res.status(200).json({
            status: 'success',
            data: { user: updatedUser },
        });
    } catch (err) {
        next(err);
    }
};

exports.delete = async (req, res, next) => {
    try {
        // In many LMS, we don't actually delete users, we 'deactivate' them
        await User.update(req.user.id, { status: 'inactive' });

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        next(err);
    }
};
