const prisma = require('../config/database');
const Instructor = require('../models/Instructor');
const authUtils = require('../utils/authUtils');

/**
 * Register a new Instructor (Composite Logic)
 */
exports.registerInstructor = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            profileImageUrl,
            employeeNo,
            departmentId
        } = req.body;

        // 1) Validation
        if (!email || !password || !firstName || !employeeNo || !departmentId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Missing required instructor registration fields (firstName, email, password, employeeNo, departmentId)'
            });
        }

        // 2) Check if email or employeeNo already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: 'fail', message: 'Email already exists' });
        }

        const existingInstructor = await prisma.instructor.findUnique({ where: { employeeNo } });
        if (existingInstructor) {
            return res.status(400).json({ status: 'fail', message: 'Employee No already exists' });
        }

        // 3) Find Instructor Role
        const role = await prisma.role.findUnique({ where: { roleName: 'INSTRUCTOR' } });
        if (!role) {
            return res.status(500).json({ status: 'error', message: 'Instructor role not found in database' });
        }

        // 4) HASH PASSWORD
        const hashedPassword = await authUtils.hashPassword(password);

        // 5) ATOMIC TRANSACTION
        const newInstructor = await prisma.$transaction(async (tx) => {
            // a) Create User
            const user = await tx.user.create({
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
                }
            });

            // b) Create Instructor Profile
            return await tx.instructor.create({
                data: {
                    userId: user.id,
                    employeeNo,
                    departmentId: parseInt(departmentId)
                },
                include: {
                    user: true,
                    department: true
                }
            });
        });

        // 6) Generate Token
        const token = authUtils.signToken(newInstructor.userId);

        // Hide password hash
        newInstructor.user.passwordHash = undefined;

        res.status(201).json({
            status: 'success',
            token,
            data: { instructor: newInstructor }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get All Instructors
 */
exports.getAllInstructors = async (req, res, next) => {
    try {
        const instructors = await Instructor.findAll();
        instructors.forEach(inst => inst.user.passwordHash = undefined);

        res.status(200).json({
            status: 'success',
            results: instructors.length,
            data: { instructors }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Specific Instructor
 */
exports.getInstructor = async (req, res, next) => {
    try {
        const instructor = await Instructor.findById(req.params.userId);
        if (!instructor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Instructor profile not found'
            });
        }
        instructor.user.passwordHash = undefined;

        res.status(200).json({
            status: 'success',
            data: { instructor }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update Instructor
 */
exports.updateInstructor = async (req, res, next) => {
    try {
        const updatedInstructor = await Instructor.update(req.params.userId, req.body);
        updatedInstructor.user.passwordHash = undefined;

        res.status(200).json({
            status: 'success',
            data: { instructor: updatedInstructor }
        });
    } catch (err) {
        next(err);
    }
};
