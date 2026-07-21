/**
 * Task Management Router - CRUD API Endpoints
 * DecodeLabs Backend API
 */

const express = require('express');
const router = express.Router();
const { validateTask } = require('../middleware/validation');

// --- IN-MEMORY DATA STORE ---
// Initialized with standard internship roadmap milestones
let tasks = [
  {
    id: 1,
    title: "Semantic Scaffolding",
    category: "architecture",
    status: "completed",
    progress: 100,
    desc: "Constructing a standard document with appropriate HTML5 landmark elements for SEO and WCAG compatibility.",
    spec: [
      "Implementation of core regions: <header>, <nav>, <aside>, <main>, <footer>",
      "Ensured nesting hierarchy is grammatically correct and meaningful",
      "Wired skip-to-content links for accessibility compliance",
      "Avoided generic container layouts where semantic markers apply"
    ],
    deliverables: "Validated HTML5 structure with zero semantic structural errors.",
    timeline: "Sprint 1 (Completed)"
  },
  {
    id: 2,
    title: "Responsive CSS Grid",
    category: "architecture",
    status: "completed",
    progress: 100,
    desc: "Establishing a strict 2D macro grid layout for viewport transitions, maintaining header and footer alignment.",
    spec: [
      "Defined grid template areas for header, sidebar, main, and footer",
      "Created mobile-first layout transforming from 1-column to 2-columns",
      "Applied grid template columns mapping for collapsed and expanded views",
      "Leveraged CSS alignment properties to avoid spacer wrapper elements"
    ],
    deliverables: "Grid areas declaration with clean responsiveness.",
    timeline: "Sprint 1 (Completed)"
  },
  {
    id: 3,
    title: "Fluid Typography",
    category: "architecture",
    status: "in-progress",
    progress: 60,
    desc: "Leveraging the clamp function to auto-scale fonts smoothly between viewport ranges, replacing hard media rules.",
    spec: [
      "Calculated minimum and maximum boundaries for headers using clamp()",
      "Integrated viewport relative units (vw) into responsive calculations",
      "Created structured typography hierarchy with consistent line heights",
      "Validated resizing behavior to ensure scale remains within design constraints"
    ],
    deliverables: "Fluid sizing variables mapped across standard headers.",
    timeline: "Sprint 2 (Active)"
  },
  {
    id: 4,
    title: "Off-canvas Drawer",
    category: "interactivity",
    status: "completed",
    progress: 100,
    desc: "Developing a clean off-canvas drawer transition for small screens using responsive toggles and focus traps.",
    spec: [
      "Configured CSS transition mappings using hardware-accelerated transforms",
      "Implemented aria-expanded toggles and screen reader state visibility",
      "Prevented layout focus leaks when navigation drawer is collapsed",
      "Created click-away overlay behavior mapping for better UX"
    ],
    deliverables: "Interactive sidebar navigation with responsive toggle trigger.",
    timeline: "Sprint 2 (Completed)"
  },
  {
    id: 5,
    title: "Warmth Theme",
    category: "polish",
    status: "in-progress",
    progress: 40,
    desc: "Refining contrast tokens for light and dark modes, mapping variables to HSL grounding tones.",
    spec: [
      "Configured custom properties variables for background, text, and border",
      "Selected soft contrast palette: Mocha Mousse, Ethereal Blue, Moonlit Grey",
      "Optimized contrast ratios for text accessibility (WCAG AA standard)",
      "Added localStorage listeners to preserve selected theme across page views"
    ],
    deliverables: "CSS custom properties mapping with dark theme class modifiers.",
    timeline: "Sprint 3 (Upcoming)"
  },
  {
    id: 6,
    title: "UI State Filters",
    category: "interactivity",
    status: "pending",
    progress: 0,
    desc: "Binding JS click events to filter grid cards via category parameters, managing layout state reflows.",
    spec: [
      "Created categories mapping: Architecture, Interactivity, Aesthetic Polish",
      "Constructed filter triggers using tablist attributes",
      "Toggled DOM element visibility classes dynamically using target attributes",
      "Optimized rendering updates to prevent layout shifts during shifts"
    ],
    deliverables: "Dynamic state updates and filter selectors active.",
    timeline: "Sprint 3 (Planning)"
  }
];

// --- API ENDPOINTS ---

/**
 * GET /api/tasks
 * Retrieves list of tasks. Supports filtering by query parameters (category, status).
 */
router.get('/', (req, res) => {
  let result = [...tasks];
  const { category, status } = req.query;

  if (category) {
    result = result.filter(t => t.category === category.toLowerCase().trim());
  }

  if (status) {
    result = result.filter(t => t.status === status.toLowerCase().trim());
  }

  res.status(200).json({
    success: true,
    count: result.length,
    data: result
  });
});

/**
 * GET /api/tasks/:id
 * Retrieves a single task item by its ID.
 */
router.get('/:id', (req, res, next) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    const error = new Error(`Task with ID ${req.params.id} could not be found.`);
    error.statusCode = 404;
    return next(error);
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

/**
 * POST /api/tasks
 * Creates a new task. Requires request body validation.
 */
router.post('/', validateTask, (req, res) => {
  const sanitized = req.sanitizedBody;
  
  // Auto-increment ID generator
  const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  
  const newTask = {
    id: nextId,
    ...sanitized
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: newTask
  });
});

/**
 * PUT /api/tasks/:id
 * Updates an existing task by ID. Requires request body validation.
 */
router.put('/:id', validateTask, (req, res, next) => {
  const taskId = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    const error = new Error(`Task with ID ${req.params.id} does not exist to update.`);
    error.statusCode = 404;
    return next(error);
  }

  const sanitized = req.sanitizedBody;
  const updatedTask = {
    id: taskId,
    ...sanitized
  };

  // Replace data item in memory
  tasks[taskIndex] = updatedTask;

  res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    data: updatedTask
  });
});

/**
 * DELETE /api/tasks/:id
 * Deletes a task by ID.
 */
router.delete('/:id', (req, res, next) => {
  const taskId = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    const error = new Error(`Task with ID ${req.params.id} does not exist to delete.`);
    error.statusCode = 404;
    return next(error);
  }

  // Remove item from in-memory array
  tasks.splice(taskIndex, 1);

  res.status(200).json({
    success: true,
    message: `Task with ID ${taskId} successfully deleted.`
  });
});

module.exports = router;
