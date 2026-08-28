import React, { useEffect, useState } from 'react';


export default function StatusPage({ initialRef }) {
  const [refInput, setRefInput] = useState(initialRef || '');
  const [activeRef, setActiveRef] = useState(initialRef || '');
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = (ref) => {
    if (!ref || !ref.trim()) return;
    setLoading(true);
    setError('');
    setStatusData(null);

    fetch(`http://localhost:3000/api/status/${encodeURIComponent(ref.trim())}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Application reference number not found. Please check your number.');
        }
        return res.json();
      })
      .then((data) => {
        setStatusData(data);
        window.location.hash = `#/status/${encodeURIComponent(ref.trim())}`;
      })
      .catch((err) => {
        setError(err.message || 'Status check failed.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (initialRef) {
      setRefInput(initialRef);
      setActiveRef(initialRef);
      fetchStatus(initialRef);
    }
  }, [initialRef]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveRef(refInput);
    fetchStatus(refInput);
  };

  return (
    <section className="section-card" style={{ maxWidth: '700px', margin: '20px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ margin: 0 }}>Check Application Status</h2>
        <button type="button" className="link-button" onClick={() => (window.location.hash = '#')}>
          Back to Application
        </button>
      </div>

      <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
        Enter your <strong>Final Reference Number</strong> (e.g., <code>IND-XXXXXX</code>) or <strong>Temporary Session ID</strong> to view real-time processing status.
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          value={refInput}
          onChange={(e) => setRefInput(e.target.value)}
          placeholder="Enter Final Reference Number (e.g. IND-A1B2C3)"
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={!refInput.trim() || loading}>
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </form>

      {error && <div className="error-box" style={{ marginBottom: '20px' }}>⚠️ {error}</div>}

      {statusData && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '3px', padding: '20px' }}>
          {/* Header Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Reference Number</span>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--civic)' }}>{statusData.finalReferenceNumber}</div>
            </div>
            <div
              style={{
                background: '#e9f0f8',
                color: 'var(--civic)',
                fontWeight: 'bold',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                border: '1px solid var(--line)',
              }}
            >
              ● {statusData.applicationStatus}
            </div>
          </div>

          {/* AI Status Explanation Card */}
          <div style={{ background: '#ffffff', border: '1px solid var(--line)', borderRadius: '3px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--civic)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
              🤖 Status Update & Guidance
            </div>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--text)', lineHeight: '1.5' }}>
              {statusData.explanation}
            </p>
          </div>

          {/* Wait-Time Estimate Card */}
          <div style={{ background: '#ffffff', border: '1px solid var(--line)', borderRadius: '3px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--success)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
              ⏱ Processing Time Estimate
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)' }}>
              {statusData.waitTimeEstimate}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              Based on visa category standards and current workload.
            </div>
          </div>

          {/* Timestamp */}
          {statusData.submittedAt && (
            <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'right' }}>
              Submitted on: {new Date(statusData.submittedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
