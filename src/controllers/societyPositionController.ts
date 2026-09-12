import { Request, Response, NextFunction } from 'express';
import { SocietyPosition } from '../models/Society';

/**
 * SocietyPosition Controller
 */
export const getAllPositions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const positions = await SocietyPosition.findAll();
    return res.status(200).json({
      status: 'success',
      results: positions.length,
      data: { positions },
    });
  } catch (err) {
    return next(err);
  }
};

export const getPosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params['id']);
    const position = await SocietyPosition.findById(id);
    if (!position) {
      return res.status(404).json({
        status: 'fail',
        message: 'Position not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { position },
    });
  } catch (err) {
    return next(err);
  }
};

export const createPosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newPosition = await SocietyPosition.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: { position: newPosition },
    });
  } catch (err) {
    return next(err);
  }
};

export const updatePosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params['id']);
    const updatedPosition = await SocietyPosition.update(id, req.body);
    return res.status(200).json({
      status: 'success',
      data: { position: updatedPosition },
    });
  } catch (err) {
    return next(err);
  }
};

export const deletePosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params['id']);
    await SocietyPosition.delete(id);
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return next(err);
  }
};
