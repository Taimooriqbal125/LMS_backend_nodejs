import prisma from '../config/database';

/**
 * SocietyEvent Model Interface for DTO
 */
export interface SocietyEventDTO {
    id: number;
    societyId: number;
    title: string;
    description: string | null;
    eventDate: Date;
    eventTime: string;
    posterUrl: string | null;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
    society?: {
        id: number;
        name: string;
        inchargeUserId: number | null;
    };
    creator?: {
        id: number;
        firstName: string | null;
        lastName: string | null;
    };
}

class SocietyEvent {
    static async findAll(): Promise<SocietyEventDTO[]> {
        return await prisma.societyEvent.findMany({
            include: {
                society: {
                    select: { id: true, name: true, inchargeUserId: true },
                },
                creator: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { eventDate: 'asc' },
        });
    }

    static async findBySociety(societyId: number): Promise<SocietyEventDTO[]> {
        return await prisma.societyEvent.findMany({
            where: { societyId: Number(societyId) },
            include: {
                creator: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { eventDate: 'asc' },
        });
    }

    static async findById(id: number): Promise<SocietyEventDTO | null> {
        return await prisma.societyEvent.findUnique({
            where: { id: Number(id) },
            include: {
                society: {
                    select: { id: true, name: true, inchargeUserId: true },
                },
                creator: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }

    static async create(data: {
        societyId: number;
        title: string;
        description?: string;
        eventDate: string | Date;
        eventTime: string;
        posterUrl?: string;
        createdBy: number;
    }): Promise<SocietyEventDTO> {
        return await prisma.societyEvent.create({
            data: {
                societyId: Number(data.societyId),
                title: data.title,
                description: data.description,
                eventDate: new Date(data.eventDate),
                eventTime: data.eventTime,
                posterUrl: data.posterUrl,
                createdBy: Number(data.createdBy),
            },
        });
    }

    static async delete(id: number) {
        return await prisma.societyEvent.delete({
            where: { id: Number(id) },
        });
    }

    static async update(id: number, data: any): Promise<SocietyEventDTO> {
        const updateData: any = {};
        if (data.societyId) updateData.societyId = Number(data.societyId);
        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;
        if (data.eventDate) updateData.eventDate = new Date(data.eventDate);
        if (data.eventTime) updateData.eventTime = data.eventTime;
        if (data.posterUrl) updateData.posterUrl = data.posterUrl;

        return await prisma.societyEvent.update({
            where: { id: Number(id) },
            data: updateData,
        });
    }
}

export default SocietyEvent;
