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
            enrollmentDate
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

        // 4) HASH PASSWORD
        const hashedPassword = await authUtils.hashPassword(password);

        // 5) ATOMIC TRANSACTION
        const newStudent = await prisma.$transaction(async (tx) => {
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

            // b) Create Student Profile
            return await tx.student.create({
                data: {
                    userId: user.id,
                    agNo,
                    departmentId: parseInt(departmentId),
                    programId: parseInt(programId),
                    enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date()
                },
                include: {
                    user: true,
                    department: true,
                    program: true
                }
            });
        });

        // 6) Generate Token
        const token = authUtils.signToken(newStudent.userId);

        // Hide password hash
        newStudent.user.passwordHash = undefined;

        res.status(201).json({
            status: 'success',
            token,
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
 * Update Student
 */
exports.updateStudent = async (req, res, next) => {
    try {
        const updatedStudent = await Student.update(req.params.userId, req.body);
        updatedStudent.user.passwordHash = undefined;

        res.status(200).json({
            status: 'success',
            data: { student: updatedStudent }
        });
    } catch (err) {
        next(err);
    }
};
