const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

// Instantiate the Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

/**
 * Validates connection to the database.
 */
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('=========================================================');
    console.log('   Prisma Client connected successfully to SQLite DB.');
    console.log('=========================================================');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
