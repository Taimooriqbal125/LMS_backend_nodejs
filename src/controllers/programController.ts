import { Request, Response, NextFunction } from 'express';
import Program from '../models/Program';

/**
 * Program Controller
 */
export const getAllPrograms = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const programs = await Program.findAll();
        return res.status(200).json({
            status: 'success',
            results: programs.length,
            data: { programs },
        });
    } catch (err) {
        return next(err);
    }
};

export const getProgram = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const program = await Program.findById(Number(req.params['id']));
        if (!program) {
            return res.status(404).json({
                status: 'fail',
                message: 'Program not found',
            });
        }
        return res.status(200).json({
            status: 'success',
            data: { program },
        });
    } catch (err) {
        return next(err);
    }
};

export const createProgram = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newProgram = await Program.create(req.body);
        return res.status(201).json({
            status: 'success',
            data: { program: newProgram },
        });
    } catch (err) {
        return next(err);
    }
};

export const updateProgram = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedProgram = await Program.update(Number(req.params['id']), req.body);
        return res.status(200).json({
            status: 'success',
            data: { program: updatedProgram },
        });
    } catch (err) {
        return next(err);
    }
};

export const deleteProgram = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await Program.delete(Number(req.params['id']));
        return res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err: any) {
        // Foreign key constraint violation (code P2003 in Prisma)
        if (err.code === 'P2003') {
            return res.status(400).json({
                status: 'fail',
                message:
                    'Cannot delete this program because it has students or other records associated with it.',
            });
        }
        return next(err);
    }
};
