const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const prisma = require('../config/database');

/**
 * Protection Middleware
 * Verifies if the request has a valid JWT token
 */
exports.protect = async (req, res, next) => {
    try {
        // 1) Getting token and check if it's there
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'You are not logged in! Please log in to get access.',
            });
        }

        // 2) Verification token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) Check if user still exists and include roles
        const currentUser = await prisma.user.findUnique({
            where: { id: parseInt(decoded.id) },
            include: {
                userRoles: {
                    include: { role: true }
                }
            },
        });

        if (!currentUser) {
            return res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token no longer exists.',
            });
        }

        // 4) GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    } catch (err) {
        next(err);
    }
};

/**
 * Authorization Middleware (Roles)
 * Restricts access based on user role name (e.g., 'ADMIN')
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if any of the user's roles match the required roles (case-insensitive)
        const userRoleNames = req.user.userRoles.map(ur => ur.role.roleName.toUpperCase());

        const hasPermission = roles.some(role => userRoleNames.includes(role.toUpperCase()));

        if (!hasPermission) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action',
            });
        }
        next();
    };
};
