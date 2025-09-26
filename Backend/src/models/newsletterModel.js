const mongoose = require("mongoose");

const NewsletterSchema = new mongoose.Schema({
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

const Newsletter = mongoose.model("Newsletter", NewsletterSchema);
module.exports = Newsletter;
