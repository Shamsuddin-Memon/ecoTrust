const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide project title'],
      trim: true,
      maxLength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
    },
    category: {
      type: String,
      required: [true, 'Please define the project category'],
      enum: ['Reforestation', 'Ocean Cleanup', 'Renewable Energy', 'Wildlife Protection', 'Other']
    },
    targetFunding: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', 'active', 'completed'],
      default: 'pending',
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
