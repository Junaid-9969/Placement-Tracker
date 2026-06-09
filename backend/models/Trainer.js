const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  profilePicture: String,
  specialization: [String],
  designation: String,
  bio: String,
  experience: Number, // years
  
  // Assigned students
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  
  // Reports submitted
  reportsSubmitted: { type: Number, default: 0 }
}, { timestamps: true });

trainerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Trainer', trainerSchema);
