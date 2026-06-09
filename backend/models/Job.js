const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  jobType: {
    type: String,
    enum: ['full_time', 'internship', 'part_time', 'contract'],
    default: 'full_time'
  },
  location: String,
  workMode: {
    type: String,
    enum: ['onsite', 'remote', 'hybrid'],
    default: 'onsite'
  },
  package: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' }
  },
  stipend: Number, // for internships
  
  // Required Skills
  requiredSkills: [{ type: String, trim: true }],
  preferredSkills: [String],
  
  // Eligibility Criteria
  eligibility: {
    minCGPA: { type: Number, default: 0 },
    maxBacklogs: { type: Number, default: 0 },
    allowedBranches: [{
      type: String,
      enum: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AIDS', 'AIML', 'DS', 'IOT', 'Other', 'ALL']
    }],
    graduationYears: [Number],
    tenthMinPercent: Number,
    twelfthMinPercent: Number
  },
  
  // Job Details
  openings: { type: Number, default: 1 },
  deadline: { type: Date, required: true },
  
  // Selection Process
  selectionProcess: [String],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'filled'],
    default: 'active'
  },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Interview
  interviewDate: Date,
  interviewMode: { type: String, enum: ['online', 'offline', 'telephonic'] },
  interviewVenue: String,
  
  // Stats
  applicationCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ 'eligibility.allowedBranches': 1 });

module.exports = mongoose.model('Job', jobSchema);
