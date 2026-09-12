import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import * as authUtils from '../utils/authUtils';
import sendEmail from '../utils/emailService';
import prisma from '../config/database';

/**
 * User Controller
 */
export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll();

    return res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (err) {
    return next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    return next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    // 1) Create error if user POSTs password data
    if (req.body.passwordHash || req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updateMyPassword.',
      });
    }

    // 2) Filter out unwanted fields that are not allowed to be updated
    const filteredBody: any = {};
    const allowedFields = ['firstName', 'lastName', 'profileImageUrl'];
    Object.keys(req.body).forEach((el) => {
      if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    // 3) Update user document
    const updatedUser = await User.update(req.user.id, filteredBody);

    return res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (err) {
    return next(err);
  }
};

export const updateUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params['id']);
    const { role, roleId, status, isEmailVerified, ...otherUpdates } = req.body;

    // 1) Find the user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // 2) Handle Role Updates (if provided)
    if (role || roleId) {
      // Determine target role ID
      let targetRoleId: number;
      if (roleId) {
        targetRoleId = Number(roleId);
      } else {
        // If role name is provided, find ID
        const roleDoc = await prisma.role.findUnique({
          where: { roleName: (role as string).toUpperCase() },
        });
        if (!roleDoc) {
          return res.status(400).json({ status: 'fail', message: `Role '${role}' not found.` });
        }
        targetRoleId = roleDoc.id;
      }

      // Update UserRole
      const existingRole = await prisma.userRole.findFirst({
        where: { userId: userId, roleId: targetRoleId },
      });

      if (!existingRole) {
        await prisma.userRole.deleteMany({ where: { userId: userId } });
        await prisma.userRole.create({
          data: { userId: userId, roleId: targetRoleId },
        });
      }
    }

    // 3) Filter allowed fields for Admin Update
    const filteredBody: any = {};
    const allowedFields = [
      'firstName',
      'lastName',
      'profileImageUrl',
      'email',
      'status',
      'isEmailVerified',
    ];

    // Merge status/emailVerified if they were extracted
    if (status) filteredBody.status = status;
    if (isEmailVerified !== undefined) filteredBody.isEmailVerified = isEmailVerified;

    Object.keys(otherUpdates).forEach((el) => {
      if (allowedFields.includes(el)) filteredBody[el] = otherUpdates[el];
    });

    // 4) Update User
    const updatedUser = await User.update(userId, filteredBody);

    return res.status(200).json({
      status: 'success',
      message: 'User updated successfully by Admin',
      data: { user: updatedUser },
    });
  } catch (err) {
    return next(err);
  }
};

export const deleteMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    // In many LMS, we don't actually delete users, we 'deactivate' them
    await User.update(req.user.id, { status: 'inactive' });

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return next(err);
  }
};

export const deleteUserPermanently = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params['id']);

    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    // 1) Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // 2) Prevent deleting yourself
    if (req.user.id === userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot delete yourself using this route.',
      });
    }

    // 3) Permanent Delete
    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(204).json({
      status: 'success',
      data: null,
      message: 'User permanently deleted',
    });
  } catch (err: any) {
    // Handle Foreign Key violations if Cascade is not set
    if (err.code === 'P2003') {
      return res.status(400).json({
        status: 'fail',
        message:
          'Cannot delete user because they have associated records (e.g. HOD, Incharge) that do not cascade delete.',
      });
    }
    return next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, roleId } = req.body;

    // 1) Validation
    if (!email || !password || !roleId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email, password, and roleId',
      });
    }

    // 2) Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use',
      });
    }

    // 3) Hash password and Generate OTP
    const passwordHash = await authUtils.hashPassword(password);
    const otp = authUtils.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 4) Create user with role and OTP info
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        otp,
        otpExpires,
        isEmailVerified: false,
        userRoles: {
          create: {
            roleId: Number(roleId),
          },
        },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    // 5) Send OTP Email
    await sendEmail({
      email: newUser.email,
      subject: 'Account Verification OTP',
      message: `Your account has been created by the Admin. Your verification code is ${otp}. It will expire in 10 minutes.`,
    });

    // 6) Generate Token
    const token = authUtils.signToken(newUser.id);

    return res.status(201).json({
      status: 'success',
      token,
      message: 'User created successfully and verification OTP sent to email.',
      data: { user: newUser },
    });
  } catch (err) {
    return next(err);
  }
};
