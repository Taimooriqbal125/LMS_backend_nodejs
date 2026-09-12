import prisma from '../config/database';

/**
 * Department Model Interface for DTO
 */
export interface DepartmentDTO {
  id: number;
  code: string;
  name: string;
  hodUserId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  programs?: any[];
  hod?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
  } | null;
  _count?: {
    students: number;
    instructors: number;
  };
}

class Department {
  /**
   * Shared selection logic for consistent DTOs
   * @private
   */
  private static readonly selection = {
    include: {
      programs: true,
      hod: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          profileImageUrl: true,
        },
      },
      _count: {
        select: { students: true, instructors: true },
      },
    },
  };

  static async findAll(): Promise<DepartmentDTO[]> {
    const departments = await prisma.department.findMany({
      ...this.selection,
    });

    return departments.map((dept) => this._transformDepartment(dept));
  }

  static async findById(id: number): Promise<DepartmentDTO | null> {
    const department = await prisma.department.findUnique({
      where: { id: Number(id) },
      ...this.selection,
    });

    return department ? this._transformDepartment(department) : null;
  }

  static async findByCode(code: string): Promise<DepartmentDTO | null> {
    const department = await prisma.department.findUnique({
      where: { code },
      ...this.selection,
    });

    return department ? this._transformDepartment(department) : null;
  }

  static async create(data: any): Promise<DepartmentDTO> {
    const department = await prisma.department.create({
      data: {
        ...data,
        hodUserId: data.hodUserId ? Number(data.hodUserId) : undefined,
      },
      ...this.selection,
    });

    return this._transformDepartment(department);
  }

  static async update(id: number, data: any): Promise<DepartmentDTO> {
    const updateData = { ...data };
    if (data.hodUserId) updateData.hodUserId = Number(data.hodUserId);

    const department = await prisma.department.update({
      where: { id: Number(id) },
      data: updateData,
      ...this.selection,
    });

    return this._transformDepartment(department);
  }

  static async delete(id: number) {
    return await prisma.department.delete({
      where: { id: Number(id) },
    });
  }

  /**
   * Standard DTO Transformer
   * @private
   */
  private static _transformDepartment(dept: any): DepartmentDTO {
    return {
      id: dept.id,
      code: dept.code,
      name: dept.name,
      hodUserId: dept.hodUserId,
      status: dept.status,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
      programs: dept.programs,
      hod: dept.hod,
      _count: dept._count,
    };
  }
}

export default Department;
