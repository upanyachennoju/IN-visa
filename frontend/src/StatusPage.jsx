import { useEffect, useState } from 'react';

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
      <h2>Check Application Status</h2>
      <p style={{ color: '#4a5568', marginBottom: '20px' }}>
        Enter your <strong>Final Reference Number</strong> (e.g., <code>IND-XXXXXX</code>) or <strong>Temporary Session ID</strong> to view real-time processing status.
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          value={refInput}
          onChange={(e) => setRefInput(e.target.value)}
          placeholder="Enter Final Reference Number (e.g. IND-A1B2C3)"
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            borderRadius: '6px',
            border: '1px solid #cbd5e0',
          }}
        />
        <button
          type="submit"
          disabled={!refInput.trim() || loading}
          style={{
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 'bold',
            background: '#2b6cb0',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </form>

      {error && (
        <div style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {statusData && (
        <div style={{ background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          {/* Header Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#718096' }}>Reference Number</span>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748' }}>{statusData.finalReferenceNumber}</div>
            </div>
            <div
              style={{
                background: '#ebf8ff',
                color: '#2b6cb0',
                fontWeight: 'bold',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                letterSpacing: '0.5px',
                border: '1px solid #bee3f8',
              }}
            >
              ● {statusData.applicationStatus}
            </div>
          </div>

          {/* AI Status Explanation Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2b6cb0', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
              🤖 Status Update & Guidance
            </div>
            <p style={{ margin: 0, fontSize: '15px', color: '#2d3748', lineHeight: '1.5' }}>
              {statusData.explanation}
            </p>
          </div>

          {/* Wait-Time Estimate Card */}
          <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#276749', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
              ⏱ Processing Time Estimate
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#22543d' }}>
              {statusData.waitTimeEstimate}
            </div>
            <div style={{ fontSize: '12px', color: '#38a169', marginTop: '4px' }}>
              Based on visa category standards and current workload.
            </div>
          </div>

          {/* Timestamp */}
          {statusData.submittedAt && (
            <div style={{ fontSize: '12px', color: '#718096', textAlign: 'right' }}>
              Submitted on: {new Date(statusData.submittedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
