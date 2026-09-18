const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  ledger: [{
    type: { type: String, enum: ['EARNING', 'PENALTY', 'PENALTY_REVERSAL', 'MANUAL_ADJUSTMENT'], required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    performedBy: { type: String, default: 'SYSTEM' }
  }]
});

module.exports = mongoose.model('Wallet', walletSchema);
