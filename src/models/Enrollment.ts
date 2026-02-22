import prisma from '../config/database';

/**
 * Enrollment Model Interface for DTO
 */
export interface EnrollmentDTO {
    id: number;
    studentUserId: number;
    enrolledAt: Date;
    status: string;
    course: {
        id: number;
        code: string;
        title: string;
        creditHours: number;
        description: string | null;
    };
    academicTerm: {
        id: number;
        name: string;
    };
}

class Enrollment {
    /**
     * Shared selection logic for consistent DTOs
     * @private
     */
    private static readonly selection = {
        id: true,
        studentUserId: true,
        enrolledAt: true,
        status: true,
        course: {
            select: { id: true, code: true, title: true, creditHours: true, description: true },
        },
        academicTerm: {
            select: { id: true, name: true },
        },
    };

    static async findAll(): Promise<EnrollmentDTO[]> {
        const enrollments = await prisma.enrollment.findMany({
            select: this.selection,
        });
        return enrollments.map((enr) => this._transformEnrollment(enr));
    }

    static async findById(id: number): Promise<EnrollmentDTO | null> {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: Number(id) },
            select: this.selection,
        });
        return enrollment ? this._transformEnrollment(enrollment) : null;
    }

    static async findByStudent(studentUserId: number): Promise<EnrollmentDTO[]> {
        const enrollments = await prisma.enrollment.findMany({
            where: { studentUserId: Number(studentUserId) },
            select: this.selection,
        });
        return enrollments.map((enr) => this._transformEnrollment(enr));
    }

    static async create(data: {
        studentUserId: number;
        courseId: number;
        academicTermId: number;
        status?: string;
    }): Promise<EnrollmentDTO> {
        const enrollment = await prisma.enrollment.create({
            data: {
                studentUserId: Number(data.studentUserId),
                courseId: Number(data.courseId),
                academicTermId: Number(data.academicTermId),
                status: data.status || 'enrolled',
            },
            select: this.selection,
        });
        return this._transformEnrollment(enrollment);
    }

    static async update(id: number, data: any): Promise<EnrollmentDTO> {
        const enrollment = await prisma.enrollment.update({
            where: { id: Number(id) },
            data,
            select: this.selection,
        });
        return this._transformEnrollment(enrollment);
    }

    static async delete(id: number) {
        return await prisma.enrollment.delete({
            where: { id: Number(id) },
        });
    }

    /**
     * Standard DTO Transformer
     * @private
     */
    private static _transformEnrollment(enr: any): EnrollmentDTO {
        return {
            id: enr.id,
            studentUserId: enr.studentUserId,
            enrolledAt: enr.enrolledAt,
            status: enr.status || 'enrolled',
            course: enr.course,
            academicTerm: enr.academicTerm,
        };
    }
}

export default Enrollment;
