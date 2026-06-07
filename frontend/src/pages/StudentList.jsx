import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';

export default function StudentList() {
  const user = api.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      setError(`Failed to fetch students: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setAddress('');
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFirstName(student.firstName || '');
    setLastName(student.lastName || '');
    setEmail(student.email || '');
    setPhoneNumber(student.phoneNumber || '');
    setAddress(student.address || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setError('');
      if (editingStudent) {
        // Prepare payload for update
        const payload = {
          firstName,
          lastName,
          email,
          phoneNumber: isAdmin ? phoneNumber : editingStudent.phoneNumber,
          address: isAdmin ? address : editingStudent.address
        };
        await api.updateStudent(editingStudent.id, payload);
      } else {
        // Create new student
        const payload = {
          firstName,
          lastName,
          email,
          phoneNumber,
          address
        };
        await api.createStudent(payload);
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      setError(`Operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student profile?')) {
      try {
        setError('');
        await api.deleteStudent(id);
        fetchStudents();
      } catch (err) {
        setError(`Delete failed: ${err.message}`);
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || student.email.toLowerCase().includes(search);
  });

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div style={styles.headerRow}>
          <div style={styles.titleCol}>
            <h2 style={styles.title}>Student Profiles</h2>
            <p style={styles.subtitle}>View and manage records of registered students.</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Student
          </button>
        </div>

        {error && (
          <div className="glass-panel" style={styles.errorAlert}>
            {error}
          </div>
        )}

        <div className="glass-panel" style={styles.tableCard}>
          {/* Toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.searchWrapper}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={styles.searchIcon}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={styles.loadingState}>
              <div className="loading-spinner"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={styles.emptyState}>No student records found.</div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Address</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: '500' }}>{student.firstName}</td>
                      <td>{student.lastName}</td>
                      <td>{student.email}</td>
                      <td>
                        {student.phoneNumber || <span style={{ color: 'var(--text-dark)' }}>N/A</span>}
                      </td>
                      <td>
                        {student.address || <span style={{ color: 'var(--text-dark)' }}>N/A</span>}
                      </td>
                      <td style={styles.actionsCell}>
                        <button 
                          onClick={() => openEditModal(student)} 
                          className="btn-secondary" 
                          style={styles.actionBtn}
                          title="Edit Student Profile"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Edit
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(student.id)} 
                            className="btn-danger" 
                            style={styles.actionBtnDanger}
                            title="Delete Student Profile"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal dialog for Edit/Create */}
        {showModal && (
          <div className="modal-overlay">
            <div className="glass-panel modal-content" style={styles.modal}>
              <h3 style={styles.modalTitle}>{editingStudent ? 'Edit Student Details' : 'Register New Student'}</h3>
              
              <form onSubmit={handleSubmit} style={styles.modalForm}>
                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>First Name *</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      className="form-input" 
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Last Name *</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      className="form-input" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="form-input" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label style={styles.labelWithBadge}>
                    Phone Number 
                    {!isAdmin && <span style={styles.lockBadge} title="Requires Admin authorization">🔒 Restricted</span>}
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. (626) 585-7111"
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    className="form-input" 
                    disabled={!isAdmin && !!editingStudent} 
                  />
                </div>

                <div className="form-group">
                  <label style={styles.labelWithBadge}>
                    Physical Address 
                    {!isAdmin && <span style={styles.lockBadge} title="Requires Admin authorization">🔒 Restricted</span>}
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1570 E Colorado Blvd, Pasadena, CA"
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    className="form-input" 
                    disabled={!isAdmin && !!editingStudent} 
                  />
                </div>

                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingStudent ? 'Save Changes' : 'Register Profile'}
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
    color: '#fff',
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
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  searchWrapper: {
    position: 'relative',
    flex: '0 1 360px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
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
    maxWidth: '520px',
    padding: '28px',
  },
  modalTitle: {
    fontSize: '18px',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'left',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  labelWithBadge: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockBadge: {
    fontSize: '11px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
  }
};
