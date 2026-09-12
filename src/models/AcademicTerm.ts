import { Prisma } from '../generated/prisma/client';
import prisma from '../config/database';

class AcademicTerm {
  static async findAll() {
    return await prisma.academicTerm.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  static async findById(id: number) {
    return await prisma.academicTerm.findUnique({
      where: { id }, // No need for parseInt if id is number
    });
  }

  static async findActive() {
    return await prisma.academicTerm.findMany({
      where: { isActive: true },
    });
  }

  // Use Prisma.AcademicTermCreateInput instead of any
  static async create(data: Prisma.AcademicTermCreateInput) {
    return await prisma.academicTerm.create({
      data: {
        ...data,
        // Prisma handles dates automatically if you pass ISO strings or Date objects
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      } as any, // Small casting if needed or handle types properly
    });
  }

  static async update(id: number, data: Prisma.AcademicTermUpdateInput) {
    return await prisma.academicTerm.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate as string) : undefined,
        endDate: data.endDate ? new Date(data.endDate as string) : undefined,
      },
    });
  }

  static async delete(id: number) {
    return await prisma.academicTerm.delete({
      where: { id },
    });
  }
}

export default AcademicTerm;
