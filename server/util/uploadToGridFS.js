const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();

let gfsBucket;

// Connect to MongoDB
const conn = mongoose.createConnection(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

conn.once("open", () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

/**
 * Upload file buffer to GridFS
 * @param {object} file - multer file object
 * @returns {string} - file ID as string
 */
const uploadToGridFS = async (file) => {
  return new Promise((resolve, reject) => {
    if (!gfsBucket) return reject("GridFSBucket not initialized");

    const fileName = generateFileName();
    const uploadStream = gfsBucket.openUploadStream(fileName, {
      contentType: file.mimetype,
    });

    uploadStream.end(file.buffer);

    uploadStream.on("finish", () => {
      resolve(uploadStream.id.toString()); // ✅ access file ID correctly
    });

    uploadStream.on("error", (err) => reject(err));
  });
};

module.exports = uploadToGridFS;
