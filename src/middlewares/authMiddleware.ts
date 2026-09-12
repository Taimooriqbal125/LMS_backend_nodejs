import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Protection Middleware
 * Verifies if the request has a valid JWT token
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Getting token and check if it's there
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.',
      });
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    // 3) Check if user still exists and include roles
    const currentUser = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
      include: {
        userRoles: {
          include: { role: true },
        },
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
    return next();
  } catch (err) {
    return next(err);
  }
};

/**
 * Authorization Middleware (Roles)
 * Restricts access based on user role name (e.g., 'ADMIN')
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.userRoles) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }

    // Check if any of the user's roles match the required roles (case-insensitive)
    const userRoleNames = req.user.userRoles.map((ur) => ur.role.roleName.toUpperCase());

    const hasPermission = roles.some((role) => userRoleNames.includes(role.toUpperCase()));

    if (!hasPermission) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }
    return next();
  };
};

export default {
  protect,
  restrictTo,
};
