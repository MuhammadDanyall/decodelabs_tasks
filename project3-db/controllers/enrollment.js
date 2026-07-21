const { prisma } = require('../config/db');

/**
 * CREATE STUDENT
 * POST /api/students
 */
exports.createStudent = async (req, res, next) => {
  try {
    const { name, matricNumber } = req.body;

    const newStudent = await prisma.student.create({
      data: { name, matricNumber }
    });

    res.status(201).json({
      success: true,
      message: 'Student record created.',
      data: newStudent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE COURSE
 * POST /api/courses
 */
exports.createCourse = async (req, res, next) => {
  try {
    const { code, title } = req.body;

    const newCourse = await prisma.course.create({
      data: {
        code: code.toUpperCase().trim(),
        title
      }
    });

    res.status(201).json({
      success: true,
      message: 'Course record created.',
      data: newCourse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ENROLL STUDENT IN COURSE (Many:Many Junction Creation)
 * POST /api/enroll
 */
exports.enrollStudent = async (req, res, next) => {
  try {
    const studentId = parseInt(req.body.studentId, 10);
    const courseId = parseInt(req.body.courseId, 10);

    // Verify student exists
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return res.status(404).json({ success: false, message: `Student ID ${studentId} not found.` });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: `Course ID ${courseId} not found.` });
    }

    // Create enrollment junction row
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Enrollment completed successfully (Many:Many mapped).',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * READ COURSE ENROLLMENTS: Get all students registered in a course
 * GET /api/courses/:code/students
 */
exports.getCourseStudents = async (req, res, next) => {
  try {
    const courseCode = req.params.code.toUpperCase().trim();

    const course = await prisma.course.findUnique({
      where: { code: courseCode },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                matricNumber: true
              }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: `Course code '${courseCode}' not found.` });
    }

    // Map nested list to a flat students array
    const students = course.enrollments.map(e => e.student);

    res.status(200).json({
      success: true,
      courseId: course.id,
      code: course.code,
      title: course.title,
      enrolledStudentsCount: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * READ STUDENT COURSES: Get all courses a student is enrolled in
 * GET /api/students/:id/courses
 */
exports.getStudentCourses = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid Student ID.' });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: `Student ID ${studentId} not found.` });
    }

    const courses = student.enrollments.map(e => e.course);

    res.status(200).json({
      success: true,
      studentId: student.id,
      name: student.name,
      matricNumber: student.matricNumber,
      registeredCoursesCount: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UNENROLL STUDENT: Remove student course mapping (Many:Many delete based on Composite Key)
 * DELETE /api/enroll
 */
exports.unenrollStudent = async (req, res, next) => {
  try {
    const studentId = parseInt(req.body.studentId, 10);
    const courseId = parseInt(req.body.courseId, 10);

    if (isNaN(studentId) || isNaN(courseId)) {
      return res.status(400).json({ success: false, message: 'studentId and courseId must be valid numbers.' });
    }

    // Delete enrollment entry matching composite primary key [studentId, courseId]
    await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Student un-enrolled from course successfully (Many:Many junction purged).'
    });
  } catch (error) {
    next(error);
  }
};
