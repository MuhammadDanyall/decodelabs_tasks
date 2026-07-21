/**
 * DecodeLabs Backend API Server Entrypoint
 * Project 2: Backend API Development
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const tasksRouter = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');

// Load configurations from .env environment file if available
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming request payloads with JSON body parsers
app.use(express.json());

// Parse URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// Simple logger middleware to track API traffic in console
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[API GATEWAY LOG] ${req.method} ${req.url} - Request received at ${timestamp}`);
  next();
});

// Mount Resource API Routes
app.use('/api/tasks', tasksRouter);

/**
 * GET /api/health
 * Server diagnostics health check status endpoint.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    environment: process.env.NODE_ENV || 'production',
    system: {
      nodeVersion: process.version,
      memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      platform: process.platform
    }
  });
});

// Catch-all: Route matching failure falls through to a 404 error
app.use((req, res, next) => {
  const error = new Error(`The requested endpoint path '${req.method} ${req.url}' could not be matched on this server.`);
  error.statusCode = 404;
  next(error);
});

// Register global error interceptor middleware
app.use(errorHandler);

// Listen to port
app.listen(PORT, () => {
  console.log(`=========================================================`);
  console.log(`   DecodeLabs REST API Engine initialized successfully.`);
  console.log(`   Access URI: http://localhost:${PORT}`);
  console.log(`   Active Mode: ${process.env.NODE_ENV || 'production'}`);
  console.log(`=========================================================`);
});

module.exports = app; // Exported for automated testing
