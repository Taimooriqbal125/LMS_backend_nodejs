import prisma from '../config/database';

/**
 * Course Model Interface for DTO
 */
export interface CourseDTO {
  id: number;
  code: string;
  title: string;
  description: string | null;
  creditHours: number;
  isActive: boolean;
  department?: { id: number; code: string; name: string };
  academicTerm?: { id: number; name: string } | null;
  instructors?: any[];
  students?: any[];
  _count?: { contents: number; enrollments: number };
}

class Course {
  /**
   * Shared selection logic for consistent DTOs
   * @private
   */
  private static readonly selection = {
    id: true,
    code: true,
    title: true,
    description: true,
    creditHours: true,
    isActive: true,
    department: {
      select: { id: true, code: true, name: true },
    },
    academicTerm: {
      select: { id: true, name: true },
    },
    _count: {
      select: { contents: true, enrollments: true },
    },
    instructors: {
      select: {
        instructor: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    },
  };

  static async findAll(): Promise<CourseDTO[]> {
    const courses = await prisma.course.findMany({
      select: this.selection,
    });

    return courses.map((course) => this._transformCourse(course));
  }

  static async findById(id: number): Promise<CourseDTO | null> {
    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
      select: this.selection,
    });

    return course ? this._transformCourse(course) : null;
  }

  static async create(data: any): Promise<CourseDTO> {
    const course = await prisma.course.create({
      data: {
        code: data.code,
        title: data.title,
        description: data.description,
        creditHours: Number(data.creditHours),
        departmentId: Number(data.departmentId),
        createdBy: Number(data.createdBy),
        academicTermId: data.academicTermId ? Number(data.academicTermId) : null,
        isActive: data.isActive === 'true' || data.isActive === true,
      },
      select: this.selection,
    });

    return this._transformCourse(course);
  }

  static async update(id: number, data: any): Promise<CourseDTO> {
    const updateData: any = { ...data };
    if (data.creditHours) updateData.creditHours = Number(data.creditHours);
    if (data.departmentId) updateData.departmentId = Number(data.departmentId);
    if (data.academicTermId) updateData.academicTermId = Number(data.academicTermId);

    const course = await prisma.course.update({
      where: { id: Number(id) },
      data: updateData,
      select: this.selection,
    });

    return this._transformCourse(course);
  }

  static async delete(id: number) {
    return await prisma.course.delete({
      where: { id: Number(id) },
    });
  }

  static async findByInstructor(instructorUserId: number): Promise<CourseDTO[]> {
    const courses = await prisma.course.findMany({
      where: {
        instructors: { some: { instructorUserId: Number(instructorUserId) } },
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        creditHours: true,
        department: { select: { id: true, code: true, name: true } },
        academicTerm: { select: { id: true, name: true } },
        enrollments: {
          select: {
            id: true,
            student: {
              select: {
                agNo: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profileImageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return courses.map((course) => this._transformCourse(course));
  }

  static async findByDepartment(departmentId: number): Promise<CourseDTO[]> {
    const courses = await prisma.course.findMany({
      where: {
        departmentId: Number(departmentId),
        isActive: true,
      },
      select: this.selection,
    });

    return courses.map((course) => this._transformCourse(course));
  }

  static async assignInstructor(courseId: number, instructorUserId: number) {
    return await prisma.courseInstructor.create({
      data: {
        courseId: Number(courseId),
        instructorUserId: Number(instructorUserId),
      },
    });
  }

  static async removeInstructor(courseId: number, instructorUserId: number) {
    return await prisma.courseInstructor.delete({
      where: {
        courseId_instructorUserId: {
          courseId: Number(courseId),
          instructorUserId: Number(instructorUserId),
        },
      },
    });
  }

  /**
   * Standard DTO Transformer
   * @private
   */
  private static _transformCourse(course: any): CourseDTO {
    return {
      id: course.id,
      code: course.code,
      title: course.title,
      description: course.description,
      creditHours: course.creditHours,
      isActive: course.isActive,
      department: course.department,
      academicTerm: course.academicTerm,
      _count: course._count,
      instructors: course.instructors
        ? course.instructors.map((ci: any) => ci.instructor.user)
        : undefined,
      students: course.enrollments
        ? course.enrollments.map((e: any) => ({
            ...e.student.user,
            agNo: e.student.agNo,
            enrollmentId: e.id,
          }))
        : undefined,
    };
  }
}

export default Course;
