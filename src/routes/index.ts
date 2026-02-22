import express, { Request, Response } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import departmentRoutes from './departmentRoutes';
import programRoutes from './programRoutes';
import studentRoutes from './studentRoutes';
import instructorRoutes from './instructorRoutes';
import academicTermRoutes from './academicTermRoutes';
import courseRoutes from './courseRoutes';
import enrollmentRoutes from './enrollmentRoutes';
import courseContentRoutes from './courseContentRoutes';
import societyRoutes from './societyRoutes';
import dashboardRoutes from './dashboardRoutes';
import roleRoutes from './roleRoutes';
import societyPositionRoutes from './societyPositionRoutes';

const router = express.Router();

// LMS Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/programs', programRoutes);
router.use('/students', studentRoutes);
router.use('/instructors', instructorRoutes);
router.use('/terms', academicTermRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/contents', courseContentRoutes);
router.use('/societies', societyRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/roles', roleRoutes);
router.use('/positions', societyPositionRoutes);

router.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Welcome to the LMS API' });
});

export default router;
