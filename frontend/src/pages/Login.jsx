import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.login(username, password);
      // If remember me is checked, we can save user preferences or ignore for simplicity
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>PCC</div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your Pasadena City College portal</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              placeholder="e.g. admin or name@pasadena.edu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={styles.rememberSection}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              Remember me
            </label>
            <button 
              type="button" 
              onClick={() => setShowForgotModal(true)} 
              style={styles.forgotLink}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={styles.submitBtn}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      {showForgotModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={styles.modal}>
            <h3 style={styles.modalTitle}>Password Recovery</h3>
            <p style={styles.modalText}>
              For security reasons, user accounts are managed directly by Pasadena City College Information Systems.
            </p>
            <p style={styles.modalTextBold}>
              Please contact the IT Administrator to reset your password.
            </p>
            <div style={styles.modalActions}>
              <button onClick={() => setShowForgotModal(false)} className="btn-primary" style={styles.modalBtn}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px',
    textAlign: 'center',
  },
  header: {
    marginBottom: '32px',
  },
  logo: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '22px',
    boxShadow: '0 4px 14px var(--primary-glow)',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'left',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  rememberSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    fontSize: '14px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
    accentColor: 'var(--primary)',
  },
  forgotLink: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    padding: 0,
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    justifyContent: 'center',
    fontSize: '16px',
  },
  modal: {
    maxWidth: '400px',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: '18px',
    color: '#fff',
    marginBottom: '16px',
    fontWeight: '600',
  },
  modalText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  modalTextBold: {
    fontSize: '14px',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '24px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'center',
  },
  modalBtn: {
    padding: '8px 24px',
  }
};
