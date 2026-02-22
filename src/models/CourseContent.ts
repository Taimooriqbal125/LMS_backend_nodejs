import prisma from '../config/database';

/**
 * CourseContent Model Interface for DTO
 */
export interface CourseContentDTO {
    id: number;
    courseId: number;
    title: string;
    description: string | null;
    youtubeUrl: string | null;
    uploadedBy: number;
    createdAt: Date;
    updatedAt: Date;
    creator?: {
        id: number;
        firstName: string | null;
        lastName: string | null;
        email: string;
        profileImageUrl: string | null;
    };
    instructors?: Array<{
        id: number;
        firstName: string | null;
        lastName: string | null;
        email: string;
        profileImageUrl: string | null;
    }>;
}

class CourseContent {
    /**
     * Shared selection logic for consistent DTOs
     * @private
     */
    private static readonly selection = {
        id: true,
        courseId: true,
        title: true,
        description: true,
        youtubeUrl: true,
        uploadedBy: true,
        createdAt: true,
        updatedAt: true,
        uploader: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImageUrl: true,
            },
        },
        course: {
            include: {
                instructors: {
                    include: {
                        instructor: {
                            include: {
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
        },
    };

    static async findAllByCourse(courseId: number): Promise<CourseContentDTO[]> {
        const contents = await prisma.courseContent.findMany({
            where: { courseId: Number(courseId) },
            select: this.selection,
            orderBy: { createdAt: 'asc' },
        });

        return contents.map((content) => this._transformContent(content));
    }

    static async findById(id: number): Promise<CourseContentDTO | null> {
        const content = await prisma.courseContent.findUnique({
            where: { id: Number(id) },
            select: this.selection,
        });

        return content ? this._transformContent(content) : null;
    }

    static async create(data: {
        courseId: number;
        title: string;
        description?: string;
        youtubeUrl?: string;
        uploadedBy: number;
    }): Promise<CourseContentDTO> {
        const content = await prisma.courseContent.create({
            data: {
                courseId: Number(data.courseId),
                title: data.title,
                description: data.description,
                youtubeUrl: data.youtubeUrl,
                uploadedBy: Number(data.uploadedBy),
            },
            select: this.selection,
        });

        return this._transformContent(content);
    }

    static async update(id: number, data: any): Promise<CourseContentDTO> {
        const content = await prisma.courseContent.update({
            where: { id: Number(id) },
            data,
            select: this.selection,
        });

        return this._transformContent(content);
    }

    static async delete(id: number) {
        return await prisma.courseContent.delete({
            where: { id: Number(id) },
        });
    }

    /**
     * Standard DTO Transformer
     * @private
     */
    private static _transformContent(content: any): CourseContentDTO {
        return {
            id: content.id,
            courseId: content.courseId,
            title: content.title,
            description: content.description,
            youtubeUrl: content.youtubeUrl,
            uploadedBy: content.uploadedBy,
            createdAt: content.createdAt,
            updatedAt: content.updatedAt,
            creator: content.uploader,
            instructors:
                content.course && content.course.instructors
                    ? content.course.instructors.map((ci: any) => ci.instructor.user)
                    : [],
        };
    }
}

export default CourseContent;
