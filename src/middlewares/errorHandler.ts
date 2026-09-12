import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Prisma } from '../generated/prisma/client';

/**
 * Global Error Handler Middleware
 */
export const errorHandler: ErrorRequestHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    console.error('ERROR 💥:', err);

    // Prisma: Client-side errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Record does not exist
        if (err.code === 'P2025') {
            return res.status(404).json({
                status: 'fail',
                message: 'Resource not found',
            });
        }

        // Unique constraint failed
        if (err.code === 'P2002') {
            return res.status(409).json({
                status: 'fail',
                message: 'Duplicate field value. This record already exists.',
            });
        }

        // Foreign key constraint failed
        if (err.code === 'P2003') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid reference. Please check associated IDs.',
            });
        }
    }

    // Operational errors (custom errors flagged in code)
    if (err.isOperational) {
        return res.status(err.statusCode || 400).json({
            status: 'fail',
            message: err.message,
        });
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid token. Please log in again!',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Your token has expired! Please log in again.',
        });
    }

    // Unknown errors (Production safety)
    return res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server',
    });
};
