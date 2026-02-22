import prisma from '../config/database';

/**
 * SocietyMember Model Interface for DTO
 */
export interface SocietyMemberDTO {
    id: number;
    societyId: number;
    userId: number;
    positionId: number;
    isActive: boolean;
    user?: {
        id: number;
        firstName: string | null;
        lastName: string | null;
        email: string;
        profileImageUrl: string | null;
        student?: {
            agNo: string;
        } | null;
    };
    position?: {
        id: number;
        name: string;
    };
    society?: {
        id: number;
        name: string;
    };
}

class SocietyMember {
    static async addMember(
        societyId: number,
        userId: number,
        positionId: number,
    ): Promise<SocietyMemberDTO> {
        return await prisma.societyMember.create({
            data: {
                societyId: Number(societyId),
                userId: Number(userId),
                positionId: Number(positionId),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profileImageUrl: true,
                        student: { select: { agNo: true } },
                    },
                },
                position: true,
                society: true,
            },
        });
    }

    static async updatePosition(id: number, positionId: number): Promise<SocietyMemberDTO> {
        return await prisma.societyMember.update({
            where: { id: Number(id) },
            data: { positionId: Number(positionId) },
        });
    }

    static async removeMember(id: number) {
        return await prisma.societyMember.delete({
            where: { id: Number(id) },
        });
    }

    static async findBySociety(societyId: number): Promise<SocietyMemberDTO[]> {
        return await prisma.societyMember.findMany({
            where: { societyId: Number(societyId) },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profileImageUrl: true,
                        student: { select: { agNo: true } },
                    },
                },
                position: true,
            },
        });
    }

    static async findByUser(userId: number): Promise<SocietyMemberDTO[]> {
        return await prisma.societyMember.findMany({
            where: { userId: Number(userId) },
            include: {
                society: true,
                position: true,
            },
        });
    }
}

export default SocietyMember;
