import prisma from '../config/database';

/**
 * Student Model Interface for DTO
 */
export interface StudentDTO {
  userId: number;
  agNo: string;
  departmentId: number;
  programId: number;
  admissionDate: Date | null;
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
    status: string;
  };
  department?: {
    id: number;
    code: string;
    name: string;
  } | null;
  program?: {
    id: number;
    code: string;
    name: string;
  } | null;
}

class Student {
  /**
   * Shared selection logic for consistent DTOs
   * @private
   */
  private static readonly selection = {
    userId: true,
    agNo: true,
    departmentId: true,
    programId: true,
    admissionDate: true,
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        status: true,
      },
    },
    department: {
      select: { id: true, code: true, name: true },
    },
    program: {
      select: { id: true, code: true, name: true },
    },
  };

  static async findAll(): Promise<StudentDTO[]> {
    const students = await prisma.student.findMany({
      select: this.selection,
    });

    return students.map((s) => this._transformStudent(s));
  }

  static async findById(id: number): Promise<StudentDTO | null> {
    const student = await prisma.student.findUnique({
      where: { userId: Number(id) },
      select: this.selection,
    });

    return student ? this._transformStudent(student) : null;
  }

  static async findByAgNo(agNo: string): Promise<StudentDTO | null> {
    const student = await prisma.student.findUnique({
      where: { agNo },
      select: this.selection,
    });

    return student ? this._transformStudent(student) : null;
  }

  static async create(data: any): Promise<StudentDTO> {
    const student = await prisma.student.create({
      data,
      select: this.selection,
    });

    return this._transformStudent(student);
  }

  static async update(userId: number, data: any): Promise<StudentDTO> {
    const student = await prisma.student.update({
      where: { userId: Number(userId) },
      data,
      select: this.selection,
    });

    return this._transformStudent(student);
  }

  static async delete(userId: number) {
    return await prisma.student.delete({
      where: { userId: Number(userId) },
    });
  }

  /**
   * Standard DTO Transformer
   * @private
   */
  private static _transformStudent(s: any): StudentDTO {
    return {
      userId: s.userId,
      agNo: s.agNo,
      departmentId: s.departmentId,
      programId: s.programId,
      admissionDate: s.admissionDate,
      user: s.user,
      department: s.department,
      program: s.program,
    };
  }
}

export default Student;
