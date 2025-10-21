const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookiesParser = require("cookie-parser");
const cron = require("node-cron");
const app = express();
const rateLimiter = require('./src/middlewares/rateLimiter');
const router = require("./src/routes");
const { cleanupExpiredEvents } = require('./src/utils/eventCleanup');

app.use(rateLimiter);
app.use(express.json());

// Accept frontend dev servers on localhost and configure allowed CORS origins via environment variable.
// Use `CORS_ORIGIN` if present (comma-separated), otherwise fall back to a sensible default list.
// Example (Render env var):
// CORS_ORIGIN="https://alumni-hub26.netlify.app,http://localhost:5173"
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : [
      "http://localhost:5000",    // Local development
      "http://localhost:5173",    // Vite dev server
      "https://alumni-hub26.netlify.app",  // Your Netlify deployment
      "https://main--alumni-hub26.netlify.app", // Netlify preview URL (if you have one)
      "https://sgp-7-alumini-hub.onrender.com"  // Your Render backend (for self-requests)
    ];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like curl or mobile/native apps)
    if (!origin) return callback(null, true);
    // allow if origin matches one of the allowedOrigins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // allow localhost patterns if dev ports used and not explicitly listed
    const localhostRegex = /^https?:\/\/localhost(?::\d+)?$/i;
    if (localhostRegex.test(origin)) return callback(null, true);
    // Log blocked origin for easier debugging (shows up in server logs)
    console.warn(`CORS: blocking origin -> ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static(`${__dirname}/public`));
app.use(cookiesParser());
app.use("/", router);

const PORT = process.env.PORT || 5000;

// Start MongoDB connection with retry/backoff and modern options
async function connectDBWithRetry(retries = 5, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
        // useNewUrlParser is default in v6+, avoid deprecated option
        autoIndex: true,
        // keepUnifiedTopology enabled in driver v4; let mongoose handle sensible defaults
        serverSelectionTimeoutMS: 10000, // fail fast if server is unreachable
      });
      console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
      return connectionInstance;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err.message || err);
      if (attempt < retries) {
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(res => setTimeout(res, delayMs));
        delayMs *= 2; // exponential backoff
      } else {
        console.error('All MongoDB connection attempts failed. Exiting.');
        process.exit(1);
      }
    }
  }
}

// Connect to DB, then start server and schedule cleanup
connectDBWithRetry().then((connectionInstance) => {
  const connection = mongoose.connection;
  connection.once('open', function() {
    console.log('MongoDB connection established successfully.');

    // Set up automatic event cleanup
    // Run every hour at minute 0 (0 * * * *)
    // For testing, you can use '*/5 * * * *' to run every 5 minutes
    cron.schedule('0 * * * *', () => {
      console.log('🕐 Running scheduled event cleanup...');
      cleanupExpiredEvents();
    });

    // Run cleanup immediately on startup
    console.log('🚀 Running initial event cleanup...');
    cleanupExpiredEvents();
  });

  app.listen(PORT, function () {
    console.log('Server is running on port : ', PORT);
  });
}).catch(err => {
  console.error('Failed to start server due to DB connection error:', err);
  process.exit(1);
});

module.exports = app;

// Provide a clearer response when CORS middleware rejects an origin.
// This will return 403 with a helpful message instead of a generic 500.
app.use((err, req, res, next) => {
  if (err && err.message && err.message.indexOf('Not allowed by CORS') !== -1) {
    console.warn('CORS rejection handled for origin:', req.headers.origin);
    return res.status(403).json({ error: 'CORS blocked: origin not allowed on server. Check ALLOWED_ORIGINS.' });
  }
  return next(err);
});


// One college admin to other admin for event post. Request and post. Approval system.
// Event post to all users. College specific events.
