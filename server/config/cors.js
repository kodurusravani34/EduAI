/**
 * ============================================
 *  CORS Configuration
 * ============================================
 *  Reads allowed origins from the CORS_ORIGINS env var
 *  (comma-separated). Falls back to localhost origins
 *  in development.
 */

const getCorsOptions = () => {
  const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000'];

  const origins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : defaultOrigins;

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (origins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // Pre-flight cache: 24 hours
  };
};

module.exports = getCorsOptions;
