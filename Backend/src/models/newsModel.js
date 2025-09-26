const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel',
    required: true
  },
  createdByModel: {
    type: String,
  enum: ['Professor', 'CollegeAdmin'],
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const News = mongoose.model("News", NewsSchema);
module.exports = News;
