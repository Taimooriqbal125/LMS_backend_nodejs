import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client';
import prisma from '../config/database';
import Instructor from '../models/Instructor';
import * as authUtils from '../utils/authUtils';
import sendEmail from '../utils/emailService';

/**
 * Register a new Instructor (Composite Logic)
 */
export const registerInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, profileImageUrl, employeeNo, departmentId } =
      req.body;

    // 1) Validation
    if (!email || !password || !firstName || !employeeNo || !departmentId) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Missing required instructor registration fields (firstName, email, password, employeeNo, departmentId)',
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
      return res
        .status(500)
        .json({ status: 'error', message: 'Instructor role not found in database' });
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
    const newInstructor = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
              roleId: role.id,
            },
          },
        },
      });

      // b) Create Instructor Profile
      return await tx.instructor.create({
        data: {
          userId: user.id,
          employeeNo,
          departmentId: Number(departmentId),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImageUrl: true,
              status: true,
            },
          },
          department: {
            select: { id: true, code: true, name: true, hodUserId: true },
          },
        },
      });
    });

    // 7) Send OTP Email
    await sendEmail({
      email: newInstructor.user.email,
      subject: 'Email Verification OTP',
      message: `Your verification code is ${otp}. It will expire in 10 minutes.`,
    });

    // 8) Generate Token
    const token = authUtils.signToken(newInstructor.userId);

    return res.status(201).json({
      status: 'success',
      token,
      message: 'Instructor registered. OTP sent to email.',
      data: { instructor: newInstructor },
    });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Get All Instructors
 */
export const getAllInstructors = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const instructors = await Instructor.findAll();
    return res.status(200).json({
      status: 'success',
      results: instructors.length,
      data: { instructors },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get Specific Instructor
 */
export const getInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructor = await Instructor.findById(Number(req.params['userId']));
    if (!instructor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Instructor profile not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { instructor },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Update Instructor (Industrial logic: updates both User and Instructor tables)
 */
export const updateInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params['userId']);
    const {
      firstName,
      lastName,
      email,
      profileImageUrl, // User fields
      employeeNo,
      departmentId, // Instructor fields
    } = req.body;

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1) Update User fields if provided
      const userData: any = {};
      if (firstName) userData.firstName = firstName;
      if (lastName) userData.lastName = lastName;
      if (email) userData.email = email;
      if (profileImageUrl) userData.profileImageUrl = profileImageUrl;
      if (req.file) userData.profileImageUrl = req.file.path;

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userData,
        });
      }

      // 2) Update Instructor fields if provided
      const instructorData: any = {};
      if (employeeNo) instructorData.employeeNo = employeeNo;
      if (departmentId) instructorData.departmentId = Number(departmentId);

      return await tx.instructor.update({
        where: { userId: userId },
        data: instructorData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImageUrl: true,
              status: true,
            },
          },
          department: {
            select: { id: true, code: true, name: true, hodUserId: true },
          },
        },
      });
    });

    return res.status(200).json({
      status: 'success',
      data: { instructor: updated },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Delete Instructor (Restricted to ADMIN)
 * Deletes from both Instructor and User tables
 */
export const deleteInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params['userId']);

    // Delete User Account (Instructor profile will be auto-deleted due to Cascade)
    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return next(err);
  }
};
