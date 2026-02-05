const prisma = require('../config/database');
const Student = require('../models/Student');
const authUtils = require('../utils/authUtils');

/**
 * Register a new Student (Composite Logic)
 */
exports.registerStudent = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            profileImageUrl,
            agNo,
            departmentId,
            programId,
            admissionDate
        } = req.body;

        // 1) Validation
        if (!email || !password || !firstName || !agNo || !departmentId || !programId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Missing required student registration fields (firstName, email, password, agNo, departmentId, programId)'
            });
        }

        // 2) Check if email or agNo already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: 'fail', message: 'Email already exists' });
        }

        const existingStudent = await prisma.student.findUnique({ where: { agNo } });
        if (existingStudent) {
            return res.status(400).json({ status: 'fail', message: 'Ag No already exists' });
        }

        // 3) Find Student Role
        const role = await prisma.role.findUnique({ where: { roleName: 'STUDENT' } });
        if (!role) {
            return res.status(500).json({ status: 'error', message: 'Student role not found in database' });
        }

        // 4) Validate Department & Program Relationship
        const program = await prisma.program.findUnique({
            where: { id: parseInt(programId) }
        });

        if (!program || program.departmentId !== parseInt(departmentId)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid program selected or program does not belong to the selected department'
            });
        }

        // 5) HASH PASSWORD
        const hashedPassword = await authUtils.hashPassword(password);

        // 5) Generate OTP
        const otp = authUtils.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 6) Handle Image Upload
        let finalProfileImageUrl = profileImageUrl;
        if (req.file) {
            // With Cloudinary storage, req.file.path is the secure URL
            finalProfileImageUrl = req.file.path;
        }

        // 7) ATOMIC TRANSACTION
        const newStudent = await prisma.$transaction(async (tx) => {
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

            // b) Create Student Profile
            return await tx.student.create({
                data: {
                    userId: user.id,
                    agNo,
                    departmentId: parseInt(departmentId),
                    programId: parseInt(programId),
                    admissionDate: (admissionDate && admissionDate !== '') ? new Date(admissionDate) : undefined
                },
                include: {
                    user: true,
                    department: true,
                    program: true
                }
            });
        });

        // 7) Send OTP Email
        const sendEmail = require('../utils/emailService');
        await sendEmail({
            email: newStudent.user.email,
            subject: 'Email Verification OTP',
            message: `Your verification code is ${otp}. It will expire in 10 minutes.`,
        });

        // 8) Generate Token
        const token = authUtils.signToken(newStudent.userId);

        // Hide sensitive fields
        newStudent.user.passwordHash = undefined;
        newStudent.user.otp = undefined;
        newStudent.user.otpExpires = undefined;

        res.status(201).json({
            status: 'success',
            token,
            message: 'Student registered. OTP sent to email.',
            data: { student: newStudent }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get All Students
 */
exports.getAllStudents = async (req, res, next) => {
    try {
        const students = await Student.findAll();
        students.forEach(s => s.user.passwordHash = undefined);

        res.status(200).json({
            status: 'success',
            results: students.length,
            data: { students }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Specific Student
 */
exports.getStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.userId);
        if (!student) {
            return res.status(404).json({
                status: 'fail',
                message: 'Student profile not found'
            });
        }
        student.user.passwordHash = undefined;

        res.status(200).json({
            status: 'success',
            data: { student }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update Student (Industrial logic: updates both User and Student tables)
 */
exports.updateStudent = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const {
            firstName, lastName, email, profileImageUrl, // User fields
            agNo, departmentId, programId, admissionDate // Student fields
        } = req.body;

        const updated = await prisma.$transaction(async (tx) => {
            // 1) Update User fields if provided
            const userData = {};
            if (firstName) userData.firstName = firstName;
            if (lastName) userData.lastName = lastName;
            if (email) userData.email = email;
            if (profileImageUrl) userData.profileImageUrl = profileImageUrl;
            if (req.file) userData.profileImageUrl = req.file.path; // Handled by multer if applied

            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { id: parseInt(userId) },
                    data: userData
                });
            }

            // 2) Update Student fields if provided
            const studentData = {};
            if (agNo) studentData.agNo = agNo;
            if (departmentId) studentData.departmentId = parseInt(departmentId);
            if (programId) studentData.programId = parseInt(programId);
            if (admissionDate) studentData.admissionDate = new Date(admissionDate);

            return await tx.student.update({
                where: { userId: parseInt(userId) },
                data: studentData,
                include: { user: true, department: true, program: true }
            });
        });

        updated.user.passwordHash = undefined;
        res.status(200).json({
            status: 'success',
            data: { student: updated }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Deactivate Student (Soft Delete - Restricted to ADMIN)
 * Sets user status to 'inactive' instead of permanently deleting
 */
exports.deleteStudent = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Soft delete: Set user status to inactive
        const deactivatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { status: 'inactive' },
            include: {
                student: {
                    include: {
                        department: true,
                        program: true
                    }
                }
            }
        });

        // Hide sensitive fields
        deactivatedUser.passwordHash = undefined;

        res.status(200).json({
            status: 'success',
            message: 'Student deactivated successfully',
            data: { user: deactivatedUser }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Toggle Student Status (Restricted to ADMIN)
 * Toggles user status between 'active' and 'inactive'
 */
exports.toggleStudentStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        // Validate status value
        if (!status || !['active', 'inactive'].includes(status.toLowerCase())) {
            return res.status(400).json({
                status: 'fail',
                message: "Status must be either 'active' or 'inactive'"
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { status: status.toLowerCase() },
            include: {
                student: {
                    include: {
                        department: true,
                        program: true
                    }
                }
            }
        });

        // Hide sensitive fields
        updatedUser.passwordHash = undefined;

        res.status(200).json({
            status: 'success',
            message: `Student ${status.toLowerCase() === 'active' ? 'activated' : 'deactivated'} successfully`,
            data: { user: updatedUser }
        });
    } catch (err) {
        next(err);
    }
};
