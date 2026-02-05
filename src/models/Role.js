const prisma = require('../config/database');

/**
 * Role Model Wrapper
 */
class Role {
    static async findAll() {
        return await prisma.role.findMany({
            include: {
                _count: {
                    select: { userRoles: true }
                }
            }
        });
    }

    static async findById(id) {
        return await prisma.role.findUnique({
            where: { id: parseInt(id) }
        });
    }

    static async findByName(name) {
        return await prisma.role.findUnique({
            where: { roleName: name }
        });
    }

    static async create(data) {
        return await prisma.role.create({
            data
        });
    }

    static async update(id, data) {
        return await prisma.role.update({
            where: { id: parseInt(id) },
            data
        });
    }

    static async delete(id) {
        return await prisma.role.delete({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = Role;
