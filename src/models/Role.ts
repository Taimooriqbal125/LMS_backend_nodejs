import prisma from '../config/database';

/**
 * Role Model Interface for DTO
 */
export interface RoleDTO {
  id: number;
  roleName: string;
  _count?: {
    userRoles: number;
  };
}

class Role {
  /**
   * Shared selection logic for consistent DTOs
   * @private
   */
  private static readonly selection = {
    id: true,
    roleName: true,
    _count: {
      select: { userRoles: true },
    },
  };

  static async findAll(): Promise<RoleDTO[]> {
    return await prisma.role.findMany({
      select: this.selection,
    });
  }

  static async findById(id: number): Promise<RoleDTO | null> {
    return await prisma.role.findUnique({
      where: { id: Number(id) },
      select: this.selection,
    });
  }

  static async findByName(name: string): Promise<RoleDTO | null> {
    return await prisma.role.findUnique({
      where: { roleName: name },
      select: this.selection,
    });
  }

  static async create(data: any): Promise<RoleDTO> {
    return await prisma.role.create({
      data,
      select: this.selection,
    });
  }

  static async update(id: number, data: any): Promise<RoleDTO> {
    return await prisma.role.update({
      where: { id: Number(id) },
      data,
      select: this.selection,
    });
  }

  static async delete(id: number) {
    return await prisma.role.delete({
      where: { id: Number(id) },
    });
  }
}

export default Role;
