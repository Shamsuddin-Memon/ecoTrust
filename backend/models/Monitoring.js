const mongoose = require('mongoose');

const monitoringSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    plantationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      required: [true, 'Plantation ID is required'],
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'NGO ID is required'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Monitoring image is required'],
    },
    aiTreeCount: {
      type: Number,
      required: [true, 'AI tree count is required'],
    },
    initialTreeCount: {
      type: Number,
      required: [true, 'Initial tree count is required'],
    },
    survivalRate: {
      type: Number,
      required: [true, 'Survival rate is required'],
    },
    status: {
      type: String,
      enum: ['normal', 'warning', 'critical'],
      default: 'normal',
    },
  },
  {
    timestamps: true,
  }
);

monitoringSchema.index({ projectId: 1, plantationId: 1 });

module.exports = mongoose.model('Monitoring', monitoringSchema);
