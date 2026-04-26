const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the NGO name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please provide the location'],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, 'Please provide contact information'],
      trim: true,
    },
    mission: {
      type: String,
      required: [true, 'Please provide the mission/vision statement'],
    },
    documents: {
      type: String,
      required: [true, 'Please upload your NGO verification document'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NGO', ngoSchema);
