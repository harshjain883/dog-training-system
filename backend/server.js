const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Session = require('./models/Session');
const Wallet = require('./models/Wallet');

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dog_training_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Database Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- HELPER: HAVERSINE FORMULA FOR GPS GEOFENCING ---
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ username }, { phone: username }] });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }
    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Switchable Auth Engine Hook (OTP Readiness)
app.post('/api/auth/toggle-otp', async (req, res) => {
  const { userId, authMode } = req.body;
  await User.findByIdAndUpdate(userId, { authMode });
  res.json({ success: true, message: `Authentication mode switched to ${authMode}` });
});

// ==========================================
// 2. SESSION EXECUTION & GPS GEOFENCING ROUTES
// ==========================================
app.post('/api/sessions/start', async (req, res) => {
  const { sessionId, trainerLat, trainerLng, photoUrl } = req.body;

  try {
    const session = await Session.findById(sessionId).populate('clientId');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const clientLoc = session.clientId.homeLocation;
    const distance = calculateDistanceMeters(trainerLat, trainerLng, clientLoc.latitude, clientLoc.longitude);

    if (distance > 100) {
      return res.status(400).json({
        success: false,
        message: `Geofence check failed. You are ${Math.round(distance)} meters away. Must be within 100m.`
      });
    }

    session.status = 'IN_PROGRESS';
    session.verification.startPhotoUrl = photoUrl || 'http://example.com/live_start.jpg';
    session.verification.startGeo = { latitude: trainerLat, longitude: trainerLng };
    session.verification.actualStartTime = new Date();
    await session.save();

    res.json({ success: true, message: 'Session started successfully', session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sessions/end', async (req, res) => {
  const { sessionId, trainerLat, trainerLng, photoUrl, progressReport } = req.body;

  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'COMPLETED';
    session.verification.endPhotoUrl = photoUrl || 'http://example.com/live_end.jpg';
    session.verification.endGeo = { latitude: trainerLat, longitude: trainerLng };
    session.verification.actualEndTime = new Date();
    if (progressReport) session.progressReport = progressReport;
    await session.save();

    // Increment client completed session count
    await User.findByIdAndUpdate(session.clientId, {
      $inc: { 'activePackage.completedSessions': 1 }
    });

    // Auto-credit Trainer Wallet
    let wallet = await Wallet.findOne({ trainerId: session.trainerId });
    if (!wallet) wallet = new Wallet({ trainerId: session.trainerId });

    wallet.balance += session.payoutAmount;
    wallet.ledger.push({
      type: 'EARNING',
      amount: session.payoutAmount,
      reason: `Completed Session ID: ${session._id}`,
      performedBy: 'AUTOMATED_SYSTEM'
    });
    await wallet.save();

    res.json({ success: true, message: 'Session ended and wallet credited.', session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. OPERATOR CONTROL & WALLET ADJUSTMENTS
// ==========================================
app.get('/api/operator/users', async (req, res) => {
  const { search } = req.query;
  let query = {};
  if (search) {
    query = {
      $or: [
        { fullName: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') }
      ]
    };
  }
  const users = await User.find(query);
  res.json({ success: true, users });
});

app.put('/api/operator/user/update-credentials', async (req, res) => {
  const { userId, username, password } = req.body;
  const user = await User.findByIdAndUpdate(userId, { username, password }, { new: true });
  res.json({ success: true, message: 'Credentials updated successfully', user });
});

app.post('/api/operator/wallet/adjust', async (req, res) => {
  const { trainerId, type, amount, reason, operatorName } = req.body;
  try {
    let wallet = await Wallet.findOne({ trainerId });
    if (!wallet) wallet = new Wallet({ trainerId });

    if (type === 'PENALTY' || type === 'MANUAL_DEDUCTION') {
      wallet.balance -= amount;
    } else if (type === 'PENALTY_REVERSAL' || type === 'MANUAL_CREDIT') {
      wallet.balance += amount;
    }

    wallet.ledger.push({
      type: type === 'PENALTY' ? 'PENALTY' : (type === 'PENALTY_REVERSAL' ? 'PENALTY_REVERSAL' : 'MANUAL_ADJUSTMENT'),
      amount,
      reason,
      performedBy: operatorName || 'ADMIN_OPERATOR'
    });

    await wallet.save();
    res.json({ success: true, balance: wallet.balance, ledger: wallet.ledger });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/operator/client/package-adjust', async (req, res) => {
  const { clientId, totalSessions, completedSessions } = req.body;
  const user = await User.findByIdAndUpdate(
    clientId,
    { 
      'activePackage.totalSessions': totalSessions,
      'activePackage.completedSessions': completedSessions
    },
    { new: true }
  );
  res.json({ success: true, activePackage: user.activePackage });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
