const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment');
const { validateStudentPayload, validateCoursePayload, validateEnrollmentPayload } = require('../middleware/validation');

// CREATE: Insert Student
router.post('/students', validateStudentPayload, enrollmentController.createStudent);

// CREATE: Insert Course
router.post('/courses', validateCoursePayload, enrollmentController.createCourse);

// CREATE: Map Enrollment (Many:Many junction relation)
router.post('/enroll', validateEnrollmentPayload, enrollmentController.enrollStudent);

// DELETE: Unenroll (purge junction row)
router.delete('/enroll', validateEnrollmentPayload, enrollmentController.unenrollStudent);

// READ: Get course participants list
router.get('/courses/:code/students', enrollmentController.getCourseStudents);

// READ: Get student courses registrations list
router.get('/students/:id/courses', enrollmentController.getStudentCourses);

module.exports = router;
