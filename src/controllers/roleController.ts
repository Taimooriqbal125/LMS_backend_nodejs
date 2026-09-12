import { Request, Response, NextFunction } from 'express';
import Role from '../models/Role';

/**
 * Role Controller
 */
export const getAllRoles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await Role.findAll();
    return res.status(200).json({
      status: 'success',
      results: roles.length,
      data: { roles },
    });
  } catch (err) {
    return next(err);
  }
};

export const getRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await Role.findById(Number(req.params['id']));
    if (!role) {
      return res.status(404).json({
        status: 'fail',
        message: 'Role not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { role },
    });
  } catch (err) {
    return next(err);
  }
};

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newRole = await Role.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: { role: newRole },
    });
  } catch (err) {
    return next(err);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedRole = await Role.update(Number(req.params['id']), req.body);
    return res.status(200).json({
      status: 'success',
      data: { role: updatedRole },
    });
  } catch (err) {
    return next(err);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Role.delete(Number(req.params['id']));
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return next(err);
  }
};
