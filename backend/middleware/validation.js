/**
 * Request Validation Middleware
 * DecodeLabs Backend API
 */

/**
 * Validates request payload fields for creating or updating tasks.
 * Enforces data types, lengths, ranges, and structures.
 */
const validateTask = (req, res, next) => {
  const { title, category, status, progress, desc, spec, deliverables, timeline } = req.body;
  const errors = [];

  // Title Validation: string, min length 3
  if (title === undefined || typeof title !== 'string' || title.trim().length < 3) {
    errors.push({
      field: 'title',
      message: 'Title is required, must be a string, and must be at least 3 characters long.'
    });
  }

  // Category Validation: string, enum list
  const validCategories = ['architecture', 'interactivity', 'polish'];
  if (category === undefined || typeof category !== 'string' || !validCategories.includes(category.toLowerCase().trim())) {
    errors.push({
      field: 'category',
      message: `Category is required and must be one of: ${validCategories.join(', ')}`
    });
  }

  // Status Validation: string, enum list
  const validStatuses = ['completed', 'in-progress', 'pending'];
  if (status === undefined || typeof status !== 'string' || !validStatuses.includes(status.toLowerCase().trim())) {
    errors.push({
      field: 'status',
      message: `Status is required and must be one of: ${validStatuses.join(', ')}`
    });
  }

  // Progress Validation: integer, bounds 0 to 100
  const progressNum = Number(progress);
  if (progress === undefined || isNaN(progressNum) || !Number.isInteger(progressNum) || progressNum < 0 || progressNum > 100) {
    errors.push({
      field: 'progress',
      message: 'Progress is required and must be an integer between 0 and 100.'
    });
  }

  // Description Validation: string, min length 10
  if (desc === undefined || typeof desc !== 'string' || desc.trim().length < 10) {
    errors.push({
      field: 'desc',
      message: 'Description is required and must be a string of at least 10 characters.'
    });
  }

  // Specifications Validation: array of non-empty strings
  if (spec === undefined || !Array.isArray(spec) || spec.length === 0 || !spec.every(s => typeof s === 'string' && s.trim().length > 0)) {
    errors.push({
      field: 'spec',
      message: 'Spec must be a non-empty array of valid strings.'
    });
  }

  // Deliverables Validation: string, non-empty
  if (deliverables === undefined || typeof deliverables !== 'string' || deliverables.trim().length === 0) {
    errors.push({
      field: 'deliverables',
      message: 'Deliverables description is required and must be a non-empty string.'
    });
  }

  // Return errors if any validations failed
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Request payload validation failed.',
      errors
    });
  }

  // Sanitize data and map to a specialized sanitized body object
  req.sanitizedBody = {
    title: title.trim(),
    category: category.toLowerCase().trim(),
    status: status.toLowerCase().trim(),
    progress: progressNum,
    desc: desc.trim(),
    spec: spec.map(s => s.trim()),
    deliverables: deliverables.trim(),
    timeline: timeline && typeof timeline === 'string' ? timeline.trim() : 'Sprint 3 (Planning)'
  };

  next();
};

module.exports = {
  validateTask
};
