import prisma from '../config/database';

/**
 * Program Model Interface for DTO
 */
export interface ProgramDTO {
    id: number;
    code: string;
    name: string;
    departmentId: number;
    durationYears: number;
    createdAt: Date;
    updatedAt: Date;
    department?: {
        id: number;
        code: string;
        name: string;
    };
    _count?: {
        students: number;
    };
}

class Program {
    /**
     * Shared selection logic for consistent DTOs
     * @private
     */
    private static readonly selection = {
        id: true,
        code: true,
        name: true,
        departmentId: true,
        durationYears: true,
        createdAt: true,
        updatedAt: true,
        department: {
            select: {
                id: true,
                code: true,
                name: true,
            },
        },
        _count: {
            select: { students: true },
        },
    };

    static async findAll(): Promise<ProgramDTO[]> {
        return await prisma.program.findMany({
            select: this.selection,
        });
    }

    static async findById(id: number): Promise<ProgramDTO | null> {
        return await prisma.program.findUnique({
            where: { id: Number(id) },
            select: this.selection,
        });
    }

    static async findByCode(code: string): Promise<ProgramDTO | null> {
        return await prisma.program.findUnique({
            where: { code },
            select: this.selection,
        });
    }

    static async create(data: {
        code: string;
        name: string;
        description?: string;
        departmentId: number;
        durationYears: number;
    }): Promise<ProgramDTO> {
        return await prisma.program.create({
            data: {
                ...data,
                departmentId: Number(data.departmentId),
                durationYears: Number(data.durationYears),
            },
            select: this.selection,
        });
    }

    static async update(
        id: number,
        data: {
            code?: string;
            name?: string;
            description?: string;
            departmentId?: number;
            durationYears?: number;
        },
    ): Promise<ProgramDTO> {
        return await prisma.program.update({
            where: { id: Number(id) },
            data: {
                ...data,
                departmentId: data.departmentId ? Number(data.departmentId) : undefined,
                durationYears: data.durationYears ? Number(data.durationYears) : undefined,
            },
            select: this.selection,
        });
    }

    static async delete(id: number) {
        return await prisma.program.delete({
            where: { id: Number(id) },
        });
    }
}

export default Program;
