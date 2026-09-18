const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');

// Search Users
router.get('/users', async (req, res) => {
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

// Update Credentials
router.put('/user/update-credentials', async (req, res) => {
  const { userId, username, password } = req.body;
  const user = await User.findByIdAndUpdate(userId, { username, password }, { new: true });
  res.json({ success: true, message: 'Credentials updated', user });
});

// Adjust Wallet
router.post('/wallet/adjust', async (req, res) => {
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
      performedBy: operatorName || 'ADMIN'
    });

    await wallet.save();
    res.json({ success: true, balance: wallet.balance, ledger: wallet.ledger });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
