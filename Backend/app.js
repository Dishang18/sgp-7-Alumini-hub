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

// Accept frontend dev servers on any localhost port in development
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like curl or mobile/native apps)
    if (!origin) return callback(null, true);
    // Allow any localhost origin (http://localhost:PORT) to support Vite dev servers on different ports
    const localhostRegex = /^https?:\/\/localhost(?::\d+)?$/i;
    if (localhostRegex.test(origin)) {
      return callback(null, true);
    }
    // If origin is not localhost, reject (keeps CORS safe for non-local requests)
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

app.listen(PORT, function () {
  console.log("Server is running on port : ", PORT);
});

module.exports = app;


// One college admin to other admin for event post. Request and post. Approval system.
// Event post to all users. College specific events.
