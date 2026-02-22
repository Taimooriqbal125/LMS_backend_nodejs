import prisma from '../config/database';

/**
 * Society Model Interface for DTO
 */
export interface SocietyDTO {
    id: number;
    name: string;
    description: string | null;
    logoUrl: string | null;
    inchargeUserId: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    incharge?: {
        id: number;
        firstName: string | null;
        lastName: string | null;
        email: string;
    };
    members?: Array<{
        id: number;
        firstName: string | null;
        lastName: string | null;
        position: string;
    }>;
    memberCount?: number;
    eventCount?: number;
}

/**
 * SocietyPosition Model Interface for DTO
 */
export interface SocietyPositionDTO {
    id: number;
    name: string;
    displayOrder: number;
    _count?: {
        members: number;
    };
}

class Society {
    /**
     * Shared selection logic for consistent DTOs
     * @private
     */
    private static readonly selection = {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        inchargeUserId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        incharge: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        },
        _count: {
            select: { members: true, events: true },
        },
    };

    static async findAll(where: any = {}): Promise<SocietyDTO[]> {
        const societies = await prisma.society.findMany({
            where,
            select: this.selection,
        });
        return societies.map((s: any) => this._transformSociety(s));
    }

    static async findByIncharge(userId: number): Promise<SocietyDTO[]> {
        const societies = await prisma.society.findMany({
            where: {
                inchargeUserId: Number(userId),
                isActive: true,
            },
            select: this.selection,
        });
        return societies.map((s: any) => this._transformSociety(s));
    }

    static async findById(id: number): Promise<SocietyDTO | null> {
        const society = await prisma.society.findUnique({
            where: { id: Number(id) },
            include: {
                incharge: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                members: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true } },
                        position: true,
                    },
                },
                events: true,
                _count: {
                    select: { members: true, events: true },
                },
            },
        });
        return society ? this._transformSociety(society) : null;
    }

    static async create(data: {
        name: string;
        description?: string;
        logoUrl?: string;
        inchargeUserId?: number | null;
    }): Promise<SocietyDTO> {
        const society = await prisma.society.create({
            data: {
                ...data,
                inchargeUserId: data.inchargeUserId ? Number(data.inchargeUserId) : null,
            },
            select: this.selection,
        });
        return this._transformSociety(society);
    }

    static async update(id: number, data: any): Promise<SocietyDTO> {
        const society = await prisma.society.update({
            where: { id: Number(id) },
            data,
            select: this.selection,
        });
        return this._transformSociety(society);
    }

    static async delete(id: number) {
        return await prisma.society.delete({
            where: { id: Number(id) },
        });
    }

    /**
     * Standard DTO Transformer
     * @private
     */
    private static _transformSociety(society: any): SocietyDTO {
        if (!society) return null as any;

        return {
            id: society.id,
            name: society.name,
            description: society.description,
            logoUrl: society.logoUrl,
            inchargeUserId: society.inchargeUserId,
            isActive: society.isActive,
            createdAt: society.createdAt,
            updatedAt: society.updatedAt,
            incharge: society.incharge || undefined,
            members: society.members
                ? society.members.map((m: any) => ({
                    id: m.id,
                    firstName: m.user.firstName,
                    lastName: m.user.lastName,
                    position: m.position.name,
                }))
                : undefined,
            memberCount: society._count?.members,
            eventCount: society._count?.events,
        };
    }
}

class SocietyPosition {
    static async findAll(): Promise<SocietyPositionDTO[]> {
        return await prisma.societyPosition.findMany({
            orderBy: { displayOrder: 'asc' },
            include: {
                _count: {
                    select: { members: true },
                },
            },
        });
    }

    static async findById(id: number): Promise<SocietyPositionDTO | null> {
        return await prisma.societyPosition.findUnique({
            where: { id: Number(id) },
            include: {
                _count: {
                    select: { members: true },
                },
            },
        });
    }

    static async findByName(name: string): Promise<SocietyPositionDTO | null> {
        return await prisma.societyPosition.findUnique({
            where: { name },
        });
    }

    static async create(data: { name: string; displayOrder: number }): Promise<SocietyPositionDTO> {
        return await prisma.societyPosition.create({
            data: {
                ...data,
                displayOrder: Number(data.displayOrder),
            },
        });
    }

    static async update(id: number, data: any): Promise<SocietyPositionDTO> {
        return await prisma.societyPosition.update({
            where: { id: Number(id) },
            data,
        });
    }

    static async delete(id: number) {
        return await prisma.societyPosition.delete({
            where: { id: Number(id) },
        });
    }
}

export { Society, SocietyPosition };
