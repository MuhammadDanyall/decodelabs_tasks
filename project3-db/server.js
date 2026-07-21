const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const enrollmentRoutes = require('./routes/enrollment');
const errorHandler = require('./middleware/errorHandler');

// Load configurations from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to SQL database via Prisma Client
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger middleware to print API calls in terminal console
app.use((req, res, next) => {
  console.log(`[DB-SERVER LOG] ${req.method} ${req.url}`);
  next();
});

// Mount Resource API Routes
app.use('/api/users', userRoutes);
app.use('/api', orderRoutes);       // Includes /api/customers & /api/orders
app.use('/api', enrollmentRoutes);  // Includes /api/students, /api/courses & /api/enroll

/**
 * GET /api/health
 * Simple health status endpoint.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    engine: 'Prisma + SQLite'
  });
});

// Catch-all: Route matching failure falls through to a 404 error
app.use((req, res, next) => {
  const error = new Error(`The requested endpoint path '${req.method} ${req.url}' could not be matched on this server.`);
  error.statusCode = 404;
  next(error);
});

// Register global error interceptor middleware (Pillar 4 Shield)
app.use(errorHandler);

// Listen to port
app.listen(PORT, () => {
  console.log(`=========================================================`);
  console.log(`   DecodeLabs DB Integration Service successfully online.`);
  console.log(`   Access URL: http://localhost:${PORT}`);
  console.log(`   Running Mode: ${process.env.NODE_ENV || 'production'}`);
  console.log(`=========================================================`);
});

module.exports = app; // Exported for automated integration testing
