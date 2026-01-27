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

        // 5) Generate OTP
        const otp = authUtils.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 6) Handle Image Upload
        let finalProfileImageUrl = profileImageUrl;
        if (req.file) {
            finalProfileImageUrl = req.file.path;
        }

        // 7) ATOMIC TRANSACTION
        const newInstructor = await prisma.$transaction(async (tx) => {
            // a) Create User
            const user = await tx.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    passwordHash: hashedPassword,
                    profileImageUrl: finalProfileImageUrl,
                    otp,
                    otpExpires,
                    isEmailVerified: false,
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

        // 7) Send OTP Email
        const sendEmail = require('../utils/emailService');
        await sendEmail({
            email: newInstructor.user.email,
            subject: 'Email Verification OTP',
            message: `Your verification code is ${otp}. It will expire in 10 minutes.`,
        });

        // 8) Generate Token
        const token = authUtils.signToken(newInstructor.userId);

        // Hide sensitive fields
        newInstructor.user.passwordHash = undefined;
        newInstructor.user.otp = undefined;
        newInstructor.user.otpExpires = undefined;

        res.status(201).json({
            status: 'success',
            token,
            message: 'Instructor registered. OTP sent to email.',
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
 * Update Instructor (Industrial logic: updates both User and Instructor tables)
 */
exports.updateInstructor = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const {
            firstName, lastName, email, profileImageUrl, // User fields
            employeeNo, departmentId // Instructor fields
        } = req.body;

        const updated = await prisma.$transaction(async (tx) => {
            // 1) Update User fields if provided
            const userData = {};
            if (firstName) userData.firstName = firstName;
            if (lastName) userData.lastName = lastName;
            if (email) userData.email = email;
            if (profileImageUrl) userData.profileImageUrl = profileImageUrl;
            if (req.file) userData.profileImageUrl = req.file.path;

            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { id: parseInt(userId) },
                    data: userData
                });
            }

            // 2) Update Instructor fields if provided
            const instructorData = {};
            if (employeeNo) instructorData.employeeNo = employeeNo;
            if (departmentId) instructorData.departmentId = parseInt(departmentId);

            return await tx.instructor.update({
                where: { userId: parseInt(userId) },
                data: instructorData,
                include: { user: true, department: true }
            });
        });

        updated.user.passwordHash = undefined;
        res.status(200).json({
            status: 'success',
            data: { instructor: updated }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete Instructor (Restricted to ADMIN)
 * Deletes from both Instructor and User tables
 */
exports.deleteInstructor = async (req, res, next) => {
    try {
        const { userId } = req.params;

        await prisma.$transaction(async (tx) => {
            // 1) Delete Instructor Profile
            await tx.instructor.delete({
                where: { userId: parseInt(userId) }
            });

            // 2) Delete User Account
            await tx.user.delete({
                where: { id: parseInt(userId) }
            });
        });

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};
