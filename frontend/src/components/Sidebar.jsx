import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';

export default function Sidebar() {
  const location = useLocation();
  const user = api.getCurrentUser();
  
  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const getLinkStyle = (path) => {
    return {
      ...styles.navLink,
      ...(isActive(path) ? styles.navLinkActive : {}),
    };
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <span style={styles.logoText}>Menu Controls</span>
      </div>

      <nav style={styles.nav}>
        <Link to="/dashboard" style={getLinkStyle('/dashboard')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9"></rect>
            <rect x="14" y="3" width="7" height="5"></rect>
            <rect x="14" y="12" width="7" height="9"></rect>
            <rect x="3" y="16" width="7" height="5"></rect>
          </svg>
          Dashboard
        </Link>

        {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
          <Link to="/students" style={getLinkStyle('/students')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Student Profiles
          </Link>
        )}

        <Link to="/grades" style={getLinkStyle('/grades')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Course Grades
        </Link>

        {user.role === 'ADMIN' && (
          <Link to="/users" style={getLinkStyle('/users')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Account Controls
          </Link>
        )}
      </nav>

      <div style={styles.footer}>
        <div style={styles.footerDot}></div>
        <span style={styles.footerText}>Secure SSL/TLS</span>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    background: 'var(--bg-sidebar)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid var(--border-glass)',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 100,
  },
  logoContainer: {
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-glass)',
    marginBottom: '24px',
  },
  logoText: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    background: 'linear-gradient(135deg, var(--primary), rgba(139, 92, 246, 0.4))',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-glass)',
  },
  footerDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--success)',
    boxShadow: '0 0 8px var(--success)',
  },
  footerText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  }
};
