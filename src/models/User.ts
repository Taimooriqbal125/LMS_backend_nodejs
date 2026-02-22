import prisma from '../config/database';

/**
 * User Model Interface for DTO
 */
export interface UserDTO {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
    status: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    userRoles?: Array<{
        role: {
            id: number;
            roleName: string;
        };
    }>;
}

class User {
    /**
     * Shared selection logic for consistent DTOs
     * @private
     */
    private static readonly selection = {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
            include: { role: true },
        },
    };

    static async findAll(): Promise<UserDTO[]> {
        const users = await prisma.user.findMany({
            select: this.selection,
        });

        return users.map((u) => this._transformUser(u));
    }

    static async findById(id: number): Promise<UserDTO | null> {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: this.selection,
        });

        return user ? this._transformUser(user) : null;
    }

    static async findByEmail(email: string): Promise<UserDTO | null> {
        const user = await prisma.user.findUnique({
            where: { email },
            select: this.selection,
        });

        return user ? this._transformUser(user) : null;
    }

    static async create(data: any): Promise<UserDTO> {
        const user = await prisma.user.create({
            data,
            select: this.selection,
        });

        return this._transformUser(user);
    }

    static async update(id: number, data: any): Promise<UserDTO> {
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data,
            select: this.selection,
        });

        return this._transformUser(user);
    }

    static async delete(id: number) {
        return await prisma.user.delete({
            where: { id: Number(id) },
        });
    }

    /**
     * Standard DTO Transformer
     * @private
     */
    private static _transformUser(u: any): UserDTO {
        return {
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            profileImageUrl: u.profileImageUrl,
            status: u.status,
            isEmailVerified: u.isEmailVerified,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
            userRoles: u.userRoles,
        };
    }
}

export default User;
