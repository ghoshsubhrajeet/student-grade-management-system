import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setRole('STUDENT');
    setShowModal(true);
  };

  const openEditModal = (userItem) => {
    setEditingUser(userItem);
    setUsername(userItem.username || '');
    setPassword(''); // Leave password blank initially
    setRole(userItem.role || 'STUDENT');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setError('Username is required.');
      return;
    }

    try {
      setError('');
      if (editingUser) {
        // Prepare payload for update
        const payload = { role };
        if (password) {
          payload.password = password; // Only update password if provided
        }
        await api.updateUser(editingUser.id, payload);
      } else {
        // Create new user (register)
        if (!password) {
          setError('Password is required for new registration.');
          return;
        }
        await api.registerUser(username, password, role);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(`Operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user account? This cannot be undone.')) {
      try {
        setError('');
        await api.deleteUser(id);
        fetchUsers();
      } catch (err) {
        setError(`Delete failed: ${err.message}`);
      }
    }
  };

  const getRoleBadgeClass = (userRole) => {
    if (userRole === 'ADMIN') return 'badge-admin';
    if (userRole === 'TEACHER') return 'badge-teacher';
    return 'badge-student';
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div style={styles.headerRow}>
          <div style={styles.titleCol}>
            <h2 style={styles.title}>Account Control Console</h2>
            <p style={styles.subtitle}>Register application credentials, manage user roles, and update passwords.</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="16" y1="11" x2="22" y2="11"></line>
            </svg>
            Register Account
          </button>
        </div>

        {error && (
          <div className="glass-panel" style={styles.errorAlert}>
            {error}
          </div>
        )}

        <div className="glass-panel" style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingState}>
              <div className="loading-spinner"></div>
            </div>
          ) : users.length === 0 ? (
            <div style={styles.emptyState}>No user credentials found.</div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username / Email</th>
                    <th>Access Role</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{u.id}</td>
                      <td style={{ fontWeight: '500', color: 'var(--text-main)' }}>{u.username}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(u.role)}`}>{u.role}</span>
                      </td>
                      <td style={styles.actionsCell}>
                        <button 
                          onClick={() => openEditModal(u)} 
                          className="btn-secondary" 
                          style={styles.actionBtn}
                          title="Edit User Configuration"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                          Configure
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)} 
                          className="btn-danger" 
                          style={styles.actionBtnDanger}
                          title="Delete User Account"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal dialog for user creation / configuration */}
        {showModal && (
          <div className="modal-overlay">
            <div className="glass-panel modal-content" style={styles.modal}>
              <h3 style={styles.modalTitle}>
                {editingUser ? 'Configure Account Settings' : 'Create Access Credentials'}
              </h3>
              
              <form onSubmit={handleSubmit} style={styles.modalForm}>
                <div className="form-group">
                  <label>Username (Email Address)</label>
                  <input 
                    type="email" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="form-input" 
                    required 
                    disabled={!!editingUser} 
                    placeholder="e.g. user@pcc.edu"
                  />
                </div>

                <div className="form-group">
                  <label>
                    {editingUser ? 'Reset Password (Leave blank to keep current)' : 'Password *'}
                  </label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="form-input" 
                    required={!editingUser} 
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-group">
                  <label>Access Role Authority</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    className="form-input"
                    style={{ background: 'var(--bg-input)' }}
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingUser ? 'Save Config' : 'Register User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
  errorAlert: {
    padding: '16px',
    color: 'var(--error)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    textAlign: 'left',
    marginBottom: '20px',
  },
  tableCard: {
    padding: '24px',
  },
  loadingState: {
    padding: '60px 0',
    display: 'flex',
    justifyContent: 'center',
  },
  emptyState: {
    padding: '60px 0',
    color: 'var(--text-muted)',
    fontSize: '15px',
    textAlign: 'center',
  },
  actionsCell: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  actionBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionBtnDanger: {
    padding: '6px 10px',
    fontSize: '13px',
  },
  modal: {
    maxWidth: '440px',
  },
  modalTitle: {
    fontSize: '18px',
    color: 'var(--text-main)',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'left',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
  }
};
