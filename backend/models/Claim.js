const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Claimant name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Claimant email is required'],
      lowercase: true,
      trim: true,
    },
    claimAmount: {
      type: Number,
      required: [true, 'Claim amount is required'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    insurerComments: {
      type: String,
      default: '',
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Claim', claimSchema);