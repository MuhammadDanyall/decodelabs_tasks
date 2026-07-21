const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validateUserPayload = (req, res, next) => {
  const { email, password, fullName, phoneNumber } = req.body;
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push({ field: 'email', message: 'Valid email is required.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be a string of at least 6 characters.' });
  }
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 3) {
    errors.push({ field: 'fullName', message: 'Full name is required (min 3 chars).' });
  }
  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 5) {
    errors.push({ field: 'phoneNumber', message: 'Valid phone number is required.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

const validateCustomerPayload = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name is required (min 2 chars).' });
  }
  if (!email || !validateEmail(email)) {
    errors.push({ field: 'email', message: 'Valid email is required.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

const validateOrderPayload = (req, res, next) => {
  const { amount, status, customerId } = req.body;
  const errors = [];

  const amountNum = Number(amount);
  if (amount === undefined || isNaN(amountNum) || amountNum <= 0) {
    errors.push({ field: 'amount', message: 'Amount is required and must be a number greater than 0.' });
  }
  if (status && !['pending', 'completed', 'cancelled'].includes(status.toLowerCase())) {
    errors.push({ field: 'status', message: 'Status must be one of: pending, completed, cancelled.' });
  }
  
  const customerIdNum = Number(customerId);
  if (customerId === undefined || isNaN(customerIdNum) || !Number.isInteger(customerIdNum) || customerIdNum <= 0) {
    errors.push({ field: 'customerId', message: 'Valid customerId is required.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

const validateCoursePayload = (req, res, next) => {
  const { code, title } = req.body;
  const errors = [];

  if (!code || typeof code !== 'string' || code.trim().length < 2) {
    errors.push({ field: 'code', message: 'Course code is required (min 2 chars).' });
  }
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Course title is required (min 3 chars).' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

const validateStudentPayload = (req, res, next) => {
  const { name, matricNumber } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Student name is required.' });
  }
  if (!matricNumber || typeof matricNumber !== 'string' || matricNumber.trim().length < 3) {
    errors.push({ field: 'matricNumber', message: 'Matric number is required.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

const validateEnrollmentPayload = (req, res, next) => {
  const { studentId, courseId } = req.body;
  const errors = [];

  const studentIdNum = Number(studentId);
  const courseIdNum = Number(courseId);

  if (studentId === undefined || isNaN(studentIdNum) || !Number.isInteger(studentIdNum)) {
    errors.push({ field: 'studentId', message: 'Valid studentId is required.' });
  }
  if (courseId === undefined || isNaN(courseIdNum) || !Number.isInteger(courseIdNum)) {
    errors.push({ field: 'courseId', message: 'Valid courseId is required.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

module.exports = {
  validateUserPayload,
  validateCustomerPayload,
  validateOrderPayload,
  validateCoursePayload,
  validateStudentPayload,
  validateEnrollmentPayload
};
