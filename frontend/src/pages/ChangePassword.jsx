import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validations
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.changePassword(oldPassword, newPassword);
      setSuccess(res.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div style={styles.headerRow}>
          <div style={styles.titleCol}>
            <h2 style={styles.title}>Account Settings</h2>
            <p style={styles.subtitle}>Update your login credentials securely.</p>
          </div>
        </div>

        <div className="glass-panel" style={styles.formCard}>
          <h3 style={styles.formTitle}>Change Password</h3>

          {error && (
            <div className="glass-panel" style={styles.errorAlert}>
              {error}
            </div>
          )}

          {success && (
            <div className="glass-panel" style={styles.successAlert}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="form-input"
                placeholder="Enter current password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Enter new password (min. 6 characters)"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Re-enter new password"
                required
                disabled={loading}
              />
            </div>

            <div style={styles.actions}>
              <button type="submit" className="btn-primary" disabled={loading} style={styles.submitBtn}>
                {loading ? (
                  <>
                    <div style={styles.spinner}></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  titleCol: {
    textAlign: 'left',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  formCard: {
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
    margin: '0 auto',
    textAlign: 'left',
  },
  formTitle: {
    fontSize: '18px',
    color: 'var(--text-main)',
    fontWeight: '600',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  errorAlert: {
    padding: '16px',
    color: 'var(--error)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    textAlign: 'left',
    marginBottom: '20px',
  },
  successAlert: {
    padding: '16px',
    color: 'var(--success)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    textAlign: 'left',
    marginBottom: '20px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '12px',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '12px 20px',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid var(--border-glass)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};
