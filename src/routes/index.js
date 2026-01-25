const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const departmentRoutes = require('./departmentRoutes');
const programRoutes = require('./programRoutes');
const studentRoutes = require('./studentRoutes');
const instructorRoutes = require('./instructorRoutes');
const academicTermRoutes = require('./academicTermRoutes');
const courseRoutes = require('./courseRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const courseContentRoutes = require('./courseContentRoutes');
const societyRoutes = require('./societyRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// LMS Routes will be added here
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

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the LMS API' });
});

module.exports = router;
