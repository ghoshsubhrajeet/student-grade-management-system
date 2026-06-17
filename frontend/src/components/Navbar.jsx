import React from 'react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const user = api.getCurrentUser();
  const { theme, toggleTheme } = useTheme();

  const getRoleBadgeClass = (role) => {
    if (!role) return '';
    if (role === 'ADMIN') return 'badge-admin';
    if (role === 'TEACHER') return 'badge-teacher';
    return 'badge-student';
  };

  return (
    <header className="glass-panel" style={styles.header}>
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>PCC</div>
        <div>
          <h1 style={styles.title}>Grade Portal</h1>
          <p style={styles.subtitle}>Pasadena City College</p>
        </div>
      </div>
      
      <div style={styles.userSection}>
        <button 
          onClick={toggleTheme} 
          className="btn-secondary" 
          style={styles.themeBtn} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {user && (
          <>
            <div style={styles.userInfo}>
              <span style={styles.username}>{user.username}</span>
              <span className={`badge ${getRoleBadgeClass(user.role)}`}>{user.role}</span>
            </div>
            <button onClick={() => api.logout()} className="btn-secondary" style={styles.logoutBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '0 0 16px 16px',
    margin: '0 0 20px 0',
    borderTop: 'none',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    boxShadow: '0 4px 10px var(--primary-glow)',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    lineHeight: '1.2',
    color: 'var(--text-main)',
    letterSpacing: 'normal',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  username: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-main)',
  },
  logoutBtn: {
    padding: '8px 14px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  themeBtn: {
    padding: '8px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }
};
