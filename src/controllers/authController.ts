import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import * as authUtils from '../utils/authUtils';
import sendEmail from '../utils/emailService';

/**
 * Signup Controller
 */
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, roleName, profileImageUrl } = req.body;

    if (!email || !password || !firstName || !roleName) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Please provide firstName, email, password, and roleName (ADMIN, INSTRUCTOR, or STUDENT)',
      });
    }

    // 1) Check if role exists
    const role = await prisma.role.findUnique({
      where: { roleName: (roleName as string).toUpperCase() },
    });

    if (!role) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid role name provided',
      });
    }

    // 2) Hash password
    const hashedPassword = await authUtils.hashPassword(password);

    // 3) Generate OTP
    const otp = authUtils.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Handle Image Upload
    let finalProfileImageUrl = profileImageUrl;
    if (req.file) {
      finalProfileImageUrl = req.file.path;
    }

    // 4) Create user with linked role and OTP
    const user = await prisma.user.create({
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
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    // 5) Send OTP Email
    await sendEmail({
      email: user.email,
      subject: 'Email Verification OTP',
      message: `Your verification code is ${otp}. It will expire in 10 minutes.`,
    });

    // Generate tokens
    const token = authUtils.signToken(user.id); // access token
    const refreshToken = authUtils.signRefreshToken(user.id); // refresh token

    // Save refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return res.status(201).json({
      status: 'success',
      token,
      refreshToken,
      message: 'OTP sent to email. Please verify your email.',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          isEmailVerified: user.isEmailVerified,
          userRoles: user.userRoles,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Login Controller
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
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
          include: { role: true },
        },
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

    // 3) Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: 'fail',
        message: 'Please verify your email to login.',
      });
    }

    // 4) Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 5) Generate token
    const token = authUtils.signToken(user.id);

    return res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          status: user.status,
          userRoles: user.userRoles,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Verify OTP Controller
 */
export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and OTP',
      });
    }

    // 1) Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      user.otp !== String(otp).trim() ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired OTP',
      });
    }

    // 2) Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        otp: null,
        otpExpires: null,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Email verified successfully!',
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Resend OTP Controller
 */
export const resendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email',
      });
    }

    // 1) Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // 2) Generate and Save new OTP
    const otp = authUtils.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpires },
    });

    // 3) Send Email
    await sendEmail({
      email: user.email,
      subject: 'Email Verification OTP (Resend)',
      message: `Your new verification code is ${otp}. It will expire in 10 minutes.`,
    });

    return res.status(200).json({
      status: 'success',
      message: 'A new OTP has been sent to your email.',
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Forgot Password Controller
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email',
      });
    }

    // 1) Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'There is no user with that email address.',
      });
    }

    // 2) Generate and Save OTP
    const otp = authUtils.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOtp: otp,
        passwordResetOtpExpires: otpExpires,
      },
    });

    // 3) Send Email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP (Valid for 10 min)',
      message: `Your password reset code is ${otp}.`,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Reset Password Controller
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email, otp, and newPassword',
      });
    }

    // 1) Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      user.passwordResetOtp !== String(otp).trim() ||
      !user.passwordResetOtpExpires ||
      user.passwordResetOtpExpires < new Date()
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired',
      });
    }

    // 2) Hash new password and update user
    const hashedPassword = await authUtils.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        passwordResetOtp: null,
        passwordResetOtpExpires: null,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successful! You can now login with your new password.',
    });
  } catch (err) {
    return next(err);
  }
};
