import { Request, Response, NextFunction } from 'express';
import Department from '../models/Department';
import prisma from '../config/database';

/**
 * Department Controller
 */
export const getAllDepartments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await Department.findAll();
    return res.status(200).json({
      status: 'success',
      results: departments.length,
      data: { departments },
    });
  } catch (err) {
    return next(err);
  }
};

export const getDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const department = await Department.findById(Number(req.params['id']));
    if (!department) {
      return res.status(404).json({
        status: 'fail',
        message: 'Department not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { department },
    });
  } catch (err) {
    return next(err);
  }
};

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newDepartment = await Department.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: { department: newDepartment },
    });
  } catch (err) {
    return next(err);
  }
};

export const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedDepartment = await Department.update(Number(req.params['id']), req.body);
    return res.status(200).json({
      status: 'success',
      data: { department: updatedDepartment },
    });
  } catch (err) {
    return next(err);
  }
};

export const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Department.delete(Number(req.params['id']));
    return res.status(200).json({
      status: 'success',
      message: 'Department successfully deleted',
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Assign HOD to Department (Restricted to ADMIN)
 * Assigns an instructor as Head of Department
 */
export const assignHOD = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params['id']); // Department ID
    const { instructorUserId } = req.body;

    // 1) Validate instructorUserId is provided
    if (!instructorUserId) {
      return res.status(400).json({
        status: 'fail',
        message: 'instructorUserId is required',
      });
    }

    // 2) Check if department exists
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      return res.status(404).json({
        status: 'fail',
        message: 'Department not found',
      });
    }

    // 3) Check if user exists and is an instructor
    const instructor = await prisma.instructor.findUnique({
      where: { userId: Number(instructorUserId) },
      include: { user: true },
    });

    if (!instructor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Instructor not found. Only instructors can be assigned as HOD.',
      });
    }

    // 4) Optionally: Check if instructor belongs to this department
    if (instructor.departmentId !== id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Instructor does not belong to this department',
      });
    }

    // 5) Assign HOD
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: { hodUserId: Number(instructorUserId) },
      include: {
        hod: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: 'success',
      message: `${instructor.user.firstName} ${instructor.user.lastName} has been assigned as HOD`,
      data: { department: updatedDepartment },
    });
  } catch (err) {
    return next(err);
  }
};
