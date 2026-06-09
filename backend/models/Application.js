const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Status workflow
  status: {
    type: String,
    enum: ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'interview_done', 'selected', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  
  // Status history for tracking
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    date: { type: Date, default: Date.now }
  }],
  
  // Documents
  resumeUrl: String,
  coverLetter: String,
  
  // Interview details
  interviewSchedule: {
    date: Date,
    time: String,
    mode: { type: String, enum: ['online', 'offline', 'telephonic'] },
    venue: String,
    meetLink: String,
    round: { type: Number, default: 1 }
  },
  
  // Company feedback
  companyFeedback: String,
  companyRating: { type: Number, min: 1, max: 5 },
  
  // Offer details (if selected)
  offerDetails: {
    package: Number,
    joiningDate: Date,
    offerLetterUrl: String,
    isAccepted: Boolean
  },
  
  // Flags
  isEligible: { type: Boolean, default: true },
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ student: 1, job: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
