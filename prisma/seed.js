const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const roles = [
        { roleName: 'ADMIN' },
        { roleName: 'INSTRUCTOR' },
        { roleName: 'STUDENT' },
    ];

    console.log('Seeding roles...');

    for (const role of roles) {
        // roleName is unique, so we use it to check for existing roles
        const createdRole = await prisma.role.upsert({
            where: { roleName: role.roleName },
            update: {},
            create: {
                roleName: role.roleName,
            },
        });
        console.log(`Created/Updated role: ${createdRole.roleName} (ID: ${createdRole.id})`);
    }

    // Seed Departments
    console.log('Seeding departments...');
    const departments = [
        { code: 'CS', name: 'Computer Science' },
        { code: 'EE', name: 'Electrical Engineering' },
    ];

    const seededDepts = [];
    for (const dept of departments) {
        const d = await prisma.department.upsert({
            where: { code: dept.code },
            update: {},
            create: {
                code: dept.code,
                name: dept.name,
            },
        });
        seededDepts.push(d);
        console.log(`Created/Updated department: ${d.name}`);
    }

    // Seed Programs
    console.log('Seeding programs...');
    const programs = [
        { code: 'BSCS', name: 'BS Computer Science', deptCode: 'CS' },
        { code: 'BSSE', name: 'BS Software Engineering', deptCode: 'CS' },
        { code: 'BSEE', name: 'BS Electrical Engineering', deptCode: 'EE' },
    ];

    for (const prog of programs) {
        const dept = seededDepts.find(d => d.code === prog.deptCode);
        await prisma.program.upsert({
            where: { code: prog.code },
            update: {},
            create: {
                code: prog.code,
                name: prog.name,
                durationYears: 4,
                departmentId: dept.id,
            },
        });
        console.log(`Created/Updated program: ${prog.name}`);
    }

    // Seed Society Positions
    console.log('Seeding society positions...');
    const positions = [
        { name: 'President', displayOrder: 1 },
        { name: 'Vice President', displayOrder: 2 },
        { name: 'General Secretary', displayOrder: 3 },
        { name: 'Member', displayOrder: 4 },
    ];

    for (const pos of positions) {
        await prisma.societyPosition.upsert({
            where: { name: pos.name },
            update: { displayOrder: pos.displayOrder },
            create: {
                name: pos.name,
                displayOrder: pos.displayOrder
            },
        });
        console.log(`Created/Updated position: ${pos.name}`);
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
