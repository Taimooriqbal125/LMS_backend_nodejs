import prisma from '../config/database';

/**
 * Instructor Model Interface for DTO
 */
export interface InstructorDTO {
    id: number;
    userId: number;
    employeeNo: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
    status: string;
    isHod: boolean;
    department?: {
        id: number;
        code: string;
        name: string;
    } | null;
}

class Instructor {
    /**
     * Shared selection logic for consistent DTOs
     * @private
     */
    private static readonly selection = {
        userId: true,
        employeeNo: true,
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
            select: { id: true, code: true, name: true, hodUserId: true },
        },
    };

    static async findAll(): Promise<InstructorDTO[]> {
        const instructors = await prisma.instructor.findMany({
            select: this.selection,
        });

        return instructors.map((inst) => this._transformInstructor(inst));
    }

    static async findById(id: number): Promise<InstructorDTO | null> {
        const instructor = await prisma.instructor.findUnique({
            where: { userId: Number(id) },
            select: this.selection,
        });

        return instructor ? this._transformInstructor(instructor) : null;
    }

    static async findByEmployeeNo(employeeNo: string): Promise<InstructorDTO | null> {
        const instructor = await prisma.instructor.findUnique({
            where: { employeeNo },
            select: this.selection,
        });

        return instructor ? this._transformInstructor(instructor) : null;
    }

    static async create(data: any): Promise<InstructorDTO> {
        const instructor = await prisma.instructor.create({
            data,
            select: this.selection,
        });

        return this._transformInstructor(instructor);
    }

    static async update(userId: number, data: any): Promise<InstructorDTO> {
        const instructor = await prisma.instructor.update({
            where: { userId: Number(userId) },
            data,
            select: this.selection,
        });

        return this._transformInstructor(instructor);
    }

    static async delete(userId: number) {
        return await prisma.instructor.delete({
            where: { userId: Number(userId) },
        });
    }

    /**
     * Standard DTO Transformer
     * @private
     */
    private static _transformInstructor(instructor: any): InstructorDTO {
        if (!instructor) return null as any;

        const { user, ...rest } = instructor;
        const isHod = instructor.department?.hodUserId === instructor.userId;

        return {
            ...rest,
            ...user,
            id: instructor.userId, // Ensure ID is consistent
            isHod,
        };
    }
}

export default Instructor;
