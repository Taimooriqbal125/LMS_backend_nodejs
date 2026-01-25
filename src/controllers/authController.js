const prisma = require('../config/database');
const authUtils = require('../utils/authUtils');

/**
 * Signup Controller
 */
exports.signup = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, roleName, profileImageUrl } = req.body;

        if (!email || !password || !firstName || !roleName) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide firstName, email, password, and roleName (ADMIN, INSTRUCTOR, or STUDENT)',
            });
        }

        // 1) Check if role exists
        const role = await prisma.role.findUnique({
            where: { roleName: roleName.toUpperCase() },
        });

        if (!role) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid role name provided',
            });
        }

        // 2) Hash password
        const hashedPassword = await authUtils.hashPassword(password);

        // 3) Create user with linked role
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                passwordHash: hashedPassword,
                profileImageUrl,
                userRoles: {
                    create: {
                        roleId: role.id
                    }
                }
            },
            include: {
                userRoles: {
                    include: { role: true }
                },
            },
        });

        // 4) Generate token
        const token = authUtils.signToken(newUser.id);

        // 5) Remove sensitive data from output
        newUser.passwordHash = undefined;

        res.status(201).json({
            status: 'success',
            token,
            data: { user: newUser },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Login Controller
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password',
            });
        }

        // 1) Find user and include role
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: { role: true }
                }
            },
        });

        if (!user || !(await authUtils.comparePasswords(password, user.passwordHash))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password',
            });
        }

        // 2) Check User Status
        if (user.status !== 'active') {
            return res.status(403).json({
                status: 'fail',
                message: 'Your account is currently inactive. Please contact support.',
            });
        }

        // 3) Update last login time
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // 4) Generate token
        const token = authUtils.signToken(user.id);

        user.passwordHash = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: { user },
        });
    } catch (err) {
        next(err);
    }
};
