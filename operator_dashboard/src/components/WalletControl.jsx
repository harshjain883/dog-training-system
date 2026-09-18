import React, { useState } from 'react';

export default function WalletControl({ trainer }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleAction = async (type) => {
    if (!amount || !reason) return alert('Enter amount and reason');
    const res = await fetch('http://localhost:5000/api/operator/wallet/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId: trainer._id, type, amount: Number(amount), reason })
    });
    const data = await res.json();
    if (data.success) alert(`Updated! Balance: $${data.balance}`);
  };

  return (
    <div className="card highlight">
      <h3>Wallet Control: {trainer.fullName}</h3>
      <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" />
      <input type="text" placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)} className="input-field" />
      <div className="button-group">
        <button onClick={() => handleAction('PENALTY')} className="btn-danger">Impose Penalty</button>
        <button onClick={() => handleAction('PENALTY_REVERSAL')} className="btn-success">Reverse Penalty</button>
        <button onClick={() => handleAction('MANUAL_CREDIT')} className="btn-primary">Add Payout</button>
      </div>
    </div>
  );
}
