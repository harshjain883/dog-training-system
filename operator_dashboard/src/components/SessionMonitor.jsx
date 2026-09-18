import React, { useState, useEffect } from 'react';

export default function SessionMonitor() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // Fetch live session feed
    const mockSessions = [
      {
        id: 'SESS_101',
        trainer: 'Alex Johnson',
        client: 'Rocky (Parent: Sarah)',
        status: 'IN_PROGRESS',
        startTime: '10:01 AM',
        startPhoto: 'https://via.placeholder.com/150',
        gpsStatus: 'Verified (42m distance)'
      },
      {
        id: 'SESS_102',
        trainer: 'David Miller',
        client: 'Bruno (Parent: Mark)',
        status: 'COMPLETED',
        startTime: '09:00 AM',
        endTime: '09:30 AM',
        startPhoto: 'https://via.placeholder.com/150',
        endPhoto: 'https://via.placeholder.com/150',
        gpsStatus: 'Verified (18m distance)'
      }
    ];
    setSessions(mockSessions);
  }, []);

  return (
    <div className="card">
      <h2>Real-Time Live Session Monitor</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Trainer</th>
            <th>Client & Pet</th>
            <th>Status</th>
            <th>GPS Status</th>
            <th>Start Photo</th>
            <th>End Photo</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.trainer}</td>
              <td>{s.client}</td>
              <td>
                <span className={`badge ${s.status}`}>{s.status}</span>
              </td>
              <td style={{ color: 'green', fontWeight: 'bold' }}>{s.gpsStatus}</td>
              <td>
                <img src={s.startPhoto} alt="Start Verification" width="50" height="50" style={{ borderRadius: '4px' }} />
              </td>
              <td>
                {s.endPhoto ? (
                  <img src={s.endPhoto} alt="End Verification" width="50" height="50" style={{ borderRadius: '4px' }} />
                ) : (
                  <em>Pending</em>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
