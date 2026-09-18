import React, { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Wallet Control Form
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [reason, setReason] = useState('');
  
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/operator/users?search=${search}`);
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWalletAdjust = async (trainerId, type) => {
    if (!penaltyAmount || !reason) return alert('Enter amount and reason');
    const res = await fetch(`${API_URL}/operator/wallet/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainerId,
        type,
        amount: Number(penaltyAmount),
        reason,
        operatorName: 'Head Operator'
      })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Wallet updated! New Balance: $${data.balance}`);
      setPenaltyAmount('');
      setReason('');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Dog Training Operator Admin Dashboard</h1>
      </header>

      <div className="main-content">
        {/* User Search & Credentials Control */}
        <div className="card">
          <h2>User Management & Password Control</h2>
          <input 
            type="text" 
            placeholder="Search by Name or Phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />

          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Username</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.fullName}</td>
                  <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                  <td>{u.phone}</td>
                  <td>{u.username}</td>
                  <td><code>{u.password}</code></td>
                  <td>
                    <button onClick={() => setSelectedUser(u)} className="btn-secondary">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected User Quick Actions */}
        {selectedUser && (
          <div className="card highlight">
            <h2>Manage: {selectedUser.fullName} ({selectedUser.role})</h2>
            
            {selectedUser.role === 'TRAINER' && (
              <div className="wallet-panel">
                <h3>Trainer Wallet Adjustments & Penalties</h3>
                <div className="form-group">
                  <input 
                    type="number" 
                    placeholder="Amount ($)" 
                    value={penaltyAmount} 
                    onChange={e => setPenaltyAmount(e.target.value)}
                    className="input-field"
                  />
                  <input 
                    type="text" 
                    placeholder="Reason (e.g. Late Arrival, Early Start Reversal)" 
                    value={reason} 
                    onChange={e => setReason(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="button-group">
                  <button onClick={() => handleWalletAdjust(selectedUser._id, 'PENALTY')} className="btn-danger">Apply Penalty</button>
                  <button onClick={() => handleWalletAdjust(selectedUser._id, 'PENALTY_REVERSAL')} className="btn-success">Reverse Penalty</button>
                  <button onClick={() => handleWalletAdjust(selectedUser._id, 'MANUAL_CREDIT')} className="btn-primary">Credit Payout</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
