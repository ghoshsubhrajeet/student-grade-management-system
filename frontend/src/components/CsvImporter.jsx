import React, { useState, useRef } from 'react';
import { api } from '../services/api';

export default function CsvImporter({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setMessage('');
      } else {
        setMessage('Error: Please select a valid CSV file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage('');
    setLogs([]);
    
    try {
      const response = await api.importCsv(file);
      setMessage(response.message || 'Import successful!');
      if (response.logs) {
        setLogs(response.logs);
      }
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const getLogColor = (log) => {
    if (log.toLowerCase().includes('error')) return '#ef4444';
    if (log.toLowerCase().includes('created') || log.toLowerCase().includes('saved')) return '#10b981';
    if (log.toLowerCase().includes('updated')) return '#6366f1';
    return '#f1f5f9';
  };

  return (
    <div className="glass-panel" style={styles.container}>
      <h3 style={styles.title}>CSV Grade Ingestion</h3>
      
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        style={{
          ...styles.dropzone,
          borderColor: isDragOver ? 'var(--primary)' : 'var(--border-glass)',
          backgroundColor: isDragOver ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-input)'
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv" 
          style={{ display: 'none' }} 
        />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={styles.uploadIcon}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p style={styles.dropText}>
          {file ? `Selected file: ${file.name}` : 'Drag and drop your CSV file here, or click to browse'}
        </p>
        <span style={styles.helpText}>Supported format: PCC Grade Import standard (.csv)</span>
      </div>

      {file && (
        <div style={styles.actions}>
          <button 
            onClick={handleUpload} 
            disabled={loading} 
            className="btn-primary"
            style={styles.btn}
          >
            {loading ? (
              <span className="loading-spinner" style={styles.spinner}></span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16"></polyline>
                <line x1="12" y1="12" x2="12" y2="21"></line>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                <polyline points="16 16 12 12 8 16"></polyline>
              </svg>
            )}
            {loading ? 'Processing File...' : 'Upload & Parse CSV'}
          </button>
        </div>
      )}

      {message && (
        <div style={{
          ...styles.message,
          color: message.startsWith('Error') ? 'var(--error)' : 'var(--success)',
          borderColor: message.startsWith('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          backgroundColor: message.startsWith('Error') ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
        }}>
          {message}
        </div>
      )}

      {logs.length > 0 && (
        <div style={styles.logSection}>
          <div style={styles.logHeader}>
            <span>Ingestion Run Logs</span>
            <button onClick={() => setLogs([])} style={styles.clearBtn}>Clear</button>
          </div>
          <div style={styles.console}>
            {logs.map((log, index) => (
              <div key={index} style={{ ...styles.logLine, color: getLogColor(log) }}>
                <span style={styles.logTimestamp}>[Line {index + 1}]</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-main)',
    margin: 0,
  },
  dropzone: {
    border: '2px dashed var(--border-glass)',
    borderRadius: '12px',
    padding: '36px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
  },
  uploadIcon: {
    marginBottom: '4px',
  },
  dropText: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-main)',
  },
  helpText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
  },
  btn: {
    padding: '12px 24px',
    fontSize: '14px',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '14px',
  },
  logSection: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    cursor: 'pointer',
    fontSize: '12px',
  },
  console: {
    background: 'rgb(8, 10, 15)',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    padding: '12px 16px',
    maxHeight: '180px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.6',
    textAlign: 'left',
  },
  logLine: {
    marginBottom: '6px',
  },
  logTimestamp: {
    color: 'var(--text-dark)',
  }
};
