const prisma = require('../config/database');

/**
 * User Model Wrapper
 */
class User {
    static async findAll() {
        return await prisma.user.findMany({
            include: {
                userRoles: {
                    include: { role: true }
                }
            },
        });
    }

    static async findById(id) {
        return await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                userRoles: {
                    include: { role: true }
                }
            },
        });
    }

    static async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: { role: true }
                }
            },
        });
    }

    static async create(data) {
        return await prisma.user.create({
            data,
            include: {
                userRoles: {
                    include: { role: true }
                }
            },
        });
    }

    static async update(id, data) {
        return await prisma.user.update({
            where: { id: parseInt(id) },
            data,
            include: {
                userRoles: {
                    include: { role: true }
                }
            },
        });
    }

    static async delete(id) {
        return await prisma.user.delete({
            where: { id: parseInt(id) },
        });
    }
}

module.exports = User;
