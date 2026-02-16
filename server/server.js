/**
 * ============================================
 *  Server Entry Point (server.js)
 * ============================================
 *  Loads environment variables, connects to MongoDB,
 *  then starts the Express server.
 *
 *  Handles graceful shutdown on SIGTERM / SIGINT.
 */

// Load environment variables FIRST
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

/**
 * Start the server after DB connection is established.
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║   🎓 AI Study Planner API                   ║
║   Environment : ${(process.env.NODE_ENV || 'development').padEnd(28)}║
║   Port        : ${String(PORT).padEnd(28)}║
║   Status      : ${'Running ✅'.padEnd(28)}║
╚══════════════════════════════════════════════╝
      `);
    });

    // ─── Graceful Shutdown ───────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n🛑 ${signal} received. Shutting down gracefully…`);

      server.close(async () => {
        console.log('🔌 HTTP server closed');

        try {
          await mongoose.connection.close();
          console.log('🗄️  MongoDB connection closed');
        } catch (err) {
          console.error('Error closing MongoDB:', err.message);
        }

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ─── Unhandled Rejections & Exceptions ───────────────────────
    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled Rejection:', reason);
      // Let the process crash in production so the process manager restarts it
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
