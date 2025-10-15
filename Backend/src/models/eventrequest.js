const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventRequestSchema = new Schema({
  requester: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to User model (collegeadmin)
    required: true
  },
  targetCollegeAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to User model (collegeadmin)
    required: true
  },
  eventDetails: {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    targetAudience: [{
      type: String,
      enum: ['student', 'alumni', 'professor', 'collegeadmin'],
      default: ['student']
    }],
    branch: {
      type: String,
      trim: true,
      maxlength: 50
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  approvedEventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event' // Reference to the created event if approved
  }
}, { timestamps: true });

module.exports = mongoose.model('EventRequest', eventRequestSchema);

