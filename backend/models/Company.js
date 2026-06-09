const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: { type: String, required: true, trim: true },
  description: String,
  sector: {
    type: String,
    enum: ['IT', 'Finance', 'Healthcare', 'Manufacturing', 'E-commerce', 'Consulting', 'Telecom', 'Other']
  },
  website: String,
  logo: String,
  founded: Number,
  employeeCount: String,
  
  // HR Details
  hrName: { type: String, required: true },
  hrEmail: { type: String, required: true },
  hrPhone: String,
  hrDesignation: String,

  // Address
  headquarters: {
    city: String,
    state: String,
    country: { type: String, default: 'India' }
  },
  officeLocations: [String],

  // Verification
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,

  // Social
  linkedinUrl: String,
  glassdoorUrl: String,

  // Stats
  totalJobsPosted: { type: Number, default: 0 },
  totalHired: { type: Number, default: 0 }
}, { timestamps: true });

companySchema.index({ companyName: 'text', sector: 1 });

module.exports = mongoose.model('Company', companySchema);
