import { PrismaClient } from '@prisma/client';
import authUtils from '../src/utils/authUtils';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding roles...');
    const roles = ['ADMIN', 'INSTRUCTOR', 'STUDENT'];
    const roleMap: Record<string, number> = {};

    for (const roleName of roles) {
        const role = await prisma.role.upsert({
            where: { roleName },
            update: {},
            create: { roleName },
        });
        roleMap[roleName] = role.id;
        console.log(`Created/Updated role: ${roleName}`);
    }

    console.log('Seeding demo users...');
    const passwordHash = await authUtils.hashPassword('password123');

    // 1. Create HOD User (needed for Department)
    const hodUser = await prisma.user.upsert({
        where: { email: 'hod.cs@lms.com' },
        update: {},
        create: {
            email: 'hod.cs@lms.com',
            firstName: 'Head',
            lastName: 'CS',
            passwordHash,
            isEmailVerified: true,
            userRoles: {
                create: { roleId: roleMap['INSTRUCTOR'] }
            }
        }
    });

    // 2. Create Instructor User (No profile image)
    const instructorUser = await prisma.user.upsert({
        where: { email: 'instructor@lms.com' },
        update: {},
        create: {
            email: 'instructor@lms.com',
            firstName: 'John',
            lastName: 'Doe',
            passwordHash,
            isEmailVerified: true,
            userRoles: {
                create: { roleId: roleMap['INSTRUCTOR'] }
            }
        }
    });

    console.log('Seeding departments...');
    const departments = [
        { code: 'CS', name: 'Computer Science', hodUserId: hodUser.id },
        { code: 'EE', name: 'Electrical Engineering', hodUserId: hodUser.id },
    ];

    const seededDepts: Record<string, number> = {};
    for (const dept of departments) {
        const d = await prisma.department.upsert({
            where: { code: dept.code },
            update: { hodUserId: dept.hodUserId },
            create: {
                code: dept.code,
                name: dept.name,
                hodUserId: dept.hodUserId,
            },
        });
        seededDepts[dept.code] = d.id;
        console.log(`Created/Updated department: ${d.name}`);
    }

    console.log('Seeding instructor profiles...');
    // Create profiles for both HOD (who is an instructor) and the separate Instructor
    await prisma.instructor.upsert({
        where: { userId: hodUser.id },
        update: { departmentId: seededDepts['CS'] },
        create: {
            userId: hodUser.id,
            employeeNo: 'EMP001',
            departmentId: seededDepts['CS']
        }
    });

    await prisma.instructor.upsert({
        where: { userId: instructorUser.id },
        update: { departmentId: seededDepts['CS'] },
        create: {
            userId: instructorUser.id,
            employeeNo: 'EMP002',
            departmentId: seededDepts['CS']
            // profileImageUrl is null by default in User model, no image here
        }
    });

    console.log('Seeding programs...');
    const programs = [
        { code: 'BSCS', name: 'BS Computer Science', deptCode: 'CS' },
        { code: 'BSSE', name: 'BS Software Engineering', deptCode: 'CS' },
        { code: 'BSEE', name: 'BS Electrical Engineering', deptCode: 'EE' },
    ];

    for (const prog of programs) {
        await prisma.program.upsert({
            where: { code: prog.code },
            update: {},
            create: {
                code: prog.code,
                name: prog.name,
                durationYears: 4,
                departmentId: seededDepts[prog.deptCode],
            },
        });
        console.log(`Created/Updated program: ${prog.name}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
