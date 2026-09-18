const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Admin plain visibility handled via decrypted/operator endpoint
  phone: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['TRAINER', 'CLIENT', 'OPERATOR'], required: true },
  authMode: { type: String, enum: ['PASSWORD', 'OTP'], default: 'PASSWORD' }, // Future-proof toggle
  
  // Client Specifics
  homeLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String }
  },
  activePackage: {
    packageName: { type: String, default: 'Basic Obedience' },
    scheduleType: { type: String, enum: ['MWF', 'TTS', 'DAILY'], default: 'MWF' },
    totalSessions: { type: Number, default: 12 },
    completedSessions: { type: Number, default: 0 },
    paused: { type: Boolean, default: false }
  },
  
  // Trainer Specifics
  assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
