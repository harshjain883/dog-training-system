const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledStartTime: { type: Date, required: true },
  durationMinutes: { type: Number, default: 30 },
  
  status: { 
    type: String, 
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], 
    default: 'SCHEDULED' 
  },
  
  verification: {
    startPhotoUrl: { type: String },
    startGeo: { latitude: Number, longitude: Number },
    actualStartTime: { type: Date },
    
    endPhotoUrl: { type: String },
    endGeo: { latitude: Number, longitude: Number },
    actualEndTime: { type: Date }
  },
  
  progressReport: {
    behaviorScore: { type: Number, min: 1, max: 5 },
    notes: { type: String },
    skillsMastered: [{ type: String }]
  },

  payoutAmount: { type: Number, default: 500 } // Base earnings per session
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
