import { Request, Response, NextFunction } from 'express';
import AcademicTerm from '../models/AcademicTerm';

/**
 * AcademicTerm Controller
 */
export const getAllTerms = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const terms = await AcademicTerm.findAll();
        return res.status(200).json({
            status: 'success',
            results: terms.length,
            data: { terms },
        });
    } catch (err) {
        return next(err);
    }
};

export const getTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const term = await AcademicTerm.findById(Number(req.params['id']));
        if (!term) {
            return res.status(404).json({
                status: 'fail',
                message: 'Academic Term not found',
            });
        }
        return res.status(200).json({
            status: 'success',
            data: { term },
        });
    } catch (err) {
        return next(err);
    }
};

export const createTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newTerm = await AcademicTerm.create(req.body);
        return res.status(201).json({
            status: 'success',
            data: { term: newTerm },
        });
    } catch (err) {
        return next(err);
    }
};

export const updateTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedTerm = await AcademicTerm.update(Number(req.params['id']), req.body);
        return res.status(200).json({
            status: 'success',
            data: { term: updatedTerm },
        });
    } catch (err) {
        return next(err);
    }
};

export const deleteTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AcademicTerm.delete(Number(req.params['id']));
        return res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        return next(err);
    }
};
