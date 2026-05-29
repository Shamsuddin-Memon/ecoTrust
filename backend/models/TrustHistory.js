const mongoose = require('mongoose');

const trustHistorySchema = new mongoose.Schema(
  {
    ngoUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    plantationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      default: null,
    },
    oldScore: {
      type: Number,
      required: true,
    },
    newScore: {
      type: Number,
      required: true,
    },
    change: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TrustHistory', trustHistorySchema);
