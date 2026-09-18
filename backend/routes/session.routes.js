const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');

// --- 1. 24-HOUR PRIOR PAUSE / CANCEL LOGIC ---
router.post('/request-cancellation', async (req, res) => {
  const { sessionId, requestTime } = req.body;
  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const timeDifferenceHours = (new Date(session.scheduledStartTime) - new Date(requestTime)) / (1000 * 60 * 60);

    if (timeDifferenceHours < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation failed: 24-hour prior notice is required to avoid penalty/charge.'
      });
    }

    session.status = 'CANCELLED';
    await session.save();
    res.json({ success: true, message: 'Session cancelled without penalty.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 2. MASKED CALL / CHAT BRIDGE INITIATOR ---
router.post('/masked-contact', async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'User not found' });

    // Returns a masked virtual bridge number (e.g., Twilio/Exotel Proxy)
    res.json({
      success: true,
      maskedVirtualNumber: "+18005550199",
      sessionToken: `BRIDGE_${senderId}_${receiverId}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 3. SUBMIT DOG PROGRESS REPORT ---
router.post('/progress-report', async (req, res) => {
  const { sessionId, behaviorScore, notes, skillsMastered } = req.body;
  try {
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { progressReport: { behaviorScore, notes, skillsMastered } },
      { new: true }
    );
    res.json({ success: true, message: 'Progress report updated', session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
