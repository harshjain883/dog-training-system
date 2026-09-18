import React, { useState } from 'react';

export default function UserManagement({ users, onSelectUser }) {
  const [editingUser, setEditingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const handleUpdate = async (userId) => {
    await fetch('http://localhost:5000/api/operator/user/update-credentials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password: newPassword })
    });
    alert('Password updated successfully!');
    setEditingUser(null);
  };

  return (
    <div className="card">
      <h2>User Management</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Username</th>
            <th>Password</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.fullName}</td>
              <td>{u.role}</td>
              <td>{u.phone}</td>
              <td>{u.username}</td>
              <td>
                {editingUser === u._id ? (
                  <input type="text" onChange={e => setNewPassword(e.target.value)} placeholder="New Password" />
                ) : (
                  <code>{u.password}</code>
                )}
              </td>
              <td>
                {editingUser === u._id ? (
                  <button onClick={() => handleUpdate(u._id)} className="btn-success">Save</button>
                ) : (
                  <button onClick={() => setEditingUser(u._id)} className="btn-secondary">Edit Password</button>
                )}
                <button onClick={() => onSelectUser(u)} className="btn-primary" style={{ marginLeft: 8 }}>Select</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
