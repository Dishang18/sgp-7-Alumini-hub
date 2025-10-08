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

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : [
      "http://localhost:3000",    // Local development
      "http://localhost:5173",    // Vite dev server
      "https://alumni-hub26.netlify.app",  // Your Netlify deployment
      "https://main--alumni-hub26.netlify.app", // Netlify preview URL (if you have one)
      "https://sgp-7-alumini-hub.onrender.com"  // Your Render backend (for any self-requests)
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors({
  origin: allowedOrigins,
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

// mongoose.set("useFindAndModify", false);
async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      autoIndex: true,
    });
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
}
connectDB();

const connection = mongoose.connection;
connection.once("open", function () {
  console.log("MongoDB connection established successfully.");
  
  // Set up automatic event cleanup
  // Run every hour at minute 0 (0 * * * *)
  // For testing, you can use '*/5 * * * *' to run every 5 minutes
  cron.schedule('0 * * * *', () => {
    console.log("🕐 Running scheduled event cleanup...");
    cleanupExpiredEvents();
  });
  
  // Run cleanup immediately on startup
  console.log("🚀 Running initial event cleanup...");
  cleanupExpiredEvents();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Don't send stack trace in production
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack })
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, function () {
  console.log("Server is running on port : ", PORT);
});

module.exports = app;
