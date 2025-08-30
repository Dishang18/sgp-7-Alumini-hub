const express = require("express");
const cors = require("cors");
const connectDB = require("./Connection");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log("db connected successfully");

    // ✅ require routes only after DB connection is ready
    const alumniRoutes = require("./routes/alumniRoutes");
    const startupRoutes = require("./routes/startupRoutes");
    const collegeRoutes = require("./routes/collegeRoutes");

    app.use("/api/alumni", alumniRoutes);
    app.use("/api/startup", startupRoutes);
    app.use("/api/college", collegeRoutes);

    app.listen(port, () =>
      console.log(`server is running on port ${port}`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
