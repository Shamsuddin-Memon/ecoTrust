const mongoose = require('mongoose');

const plantationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Please provide a project ID'],
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an NGO ID'],
    },
    imageUrl: {
      type: String, // legacy: first image, kept for backward compat
    },
    imageUrls: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'Maximum 10 images allowed per upload',
      },
    },
    imageMetadata: {
      fileSize: {
        type: Number,
      },
      fileType: {
        type: String,
      },
      resolution: {
        type: String,
      },
    },
    gpsLocation: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
    },
    treeCount: {
      type: Number,
      required: [true, 'Tree count is required'],
      min: [1, 'Tree count must be a positive integer'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    // 🧠 AI-READY FIELDS (MUST INCLUDE)
    aiVerified: {
      type: Boolean,
      default: false,
    },
    aiTreeCount: {
      type: Number,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    confidenceScore: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Prevent redundant populates depending on needs, add indexing if necessary
plantationSchema.index({ projectId: 1, ngoId: 1 });

module.exports = mongoose.model('Plantation', plantationSchema);
