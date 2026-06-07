import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CsvImporter from '../components/CsvImporter';
import { api } from '../services/api';

export default function GradeList() {
  const user = api.getCurrentUser();
  const isStudent = user?.role === 'STUDENT';

  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImporter, setShowImporter] = useState(false);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const data = await api.getGrades();
      setGrades(data);
    } catch (err) {
      setError(`Failed to fetch grades: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const openEditModal = (grade) => {
    setEditingGrade(grade);
    setScore(grade.score.toString() || '0');
    setFeedback(grade.feedback || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingGrade) return;

    const parsedScore = parseFloat(score);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > editingGrade.assignment.maxPoints) {
      setError(`Error: Score must be between 0 and ${editingGrade.assignment.maxPoints}.`);
      return;
    }

    try {
      setError('');
      await api.updateGrade(editingGrade.id, parsedScore, feedback);
      setShowEditModal(false);
      fetchGrades();
    } catch (err) {
      setError(`Update failed: ${err.message}`);
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return '#10b981'; // A - Green
    if (percentage >= 80) return 'var(--accent-teal)'; // B - Cyan
    if (percentage >= 70) return 'var(--primary)'; // C - Violet
    if (percentage >= 60) return 'var(--warning)'; // D - Orange
    return 'var(--error)'; // F - Red
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div style={styles.headerRow}>
          <div style={styles.titleCol}>
            <h2 style={styles.title}>{isStudent ? 'Your Scorecard' : 'Grades Registry'}</h2>
            <p style={styles.subtitle}>
              {isStudent 
                ? 'Check your recorded marks, percentages, and assignments feedback.' 
                : 'Manage student scores, write custom feedback, or ingest CSV files.'}
            </p>
          </div>
          {!isStudent && (
            <button 
              onClick={() => setShowImporter(!showImporter)} 
              className="btn-secondary"
              style={showImporter ? styles.activeImportBtn : {}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {showImporter ? 'Hide Importer' : 'Ingest CSV'}
            </button>
          )}
        </div>

        {error && (
          <div className="glass-panel" style={styles.errorAlert}>
            {error}
          </div>
        )}

        {/* Optional CSV Importer panel */}
        {showImporter && !isStudent && (
          <div style={{ marginBottom: '20px' }}>
            <CsvImporter onUploadSuccess={fetchGrades} />
          </div>
        )}

        {/* Grades content */}
        <div className="glass-panel" style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingState}>
              <div className="loading-spinner"></div>
            </div>
          ) : grades.length === 0 ? (
            <div style={styles.emptyState}>No grade records found.</div>
          ) : isStudent ? (
            /* Student scorecard layout */
            <div style={styles.scorecardGrid}>
              {grades.map(grade => {
                const max = grade.assignment?.maxPoints || 100;
                const percentage = Math.round((grade.score / max) * 100);
                return (
                  <div key={grade.id} className="glass-panel" style={styles.scorecard}>
                    <div style={styles.scorecardHeader}>
                      <span style={styles.courseBadge}>{grade.assignment?.course?.courseCode || 'Course'}</span>
                      <span style={{ ...styles.percentageText, color: getPercentageColor(percentage) }}>
                        {percentage}%
                      </span>
                    </div>
                    <h4 style={styles.assignmentTitle}>{grade.assignment?.title || 'Assignment'}</h4>
                    <p style={styles.scoreText}>
                      Score: <strong style={{ color: '#fff' }}>{grade.score}</strong> / {max}
                    </p>
                    {grade.feedback ? (
                      <div style={styles.feedbackBox}>
                        <strong style={{ fontSize: '11px', color: 'var(--text-muted)' }}>INSTRUCTOR FEEDBACK:</strong>
                        <p style={styles.feedbackText}>{grade.feedback}</p>
                      </div>
                    ) : (
                      <p style={styles.noFeedback}>No feedback submitted yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Teacher/Admin table layout */
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Assignment Title</th>
                    <th>Score</th>
                    <th>Max Points</th>
                    <th>Percentage</th>
                    <th>Feedback</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map(grade => {
                    const max = grade.assignment?.maxPoints || 100;
                    const percentage = Math.round((grade.score / max) * 100);
                    const studentName = grade.student 
                      ? `${grade.student.firstName} ${grade.student.lastName}`
                      : 'Unknown';
                    
                    return (
                      <tr key={grade.id}>
                        <td style={{ fontWeight: '500' }}>{studentName}</td>
                        <td>{grade.assignment?.course?.courseCode || 'N/A'}</td>
                        <td>{grade.assignment?.title || 'N/A'}</td>
                        <td style={{ fontWeight: '600', color: '#fff' }}>{grade.score}</td>
                        <td>{max}</td>
                        <td>
                          <span style={{ ...styles.gridPercentage, color: getPercentageColor(percentage) }}>
                            {percentage}%
                          </span>
                        </td>
                        <td>
                          <span style={styles.gridFeedback} title={grade.feedback}>
                            {grade.feedback || <span style={{ color: 'var(--text-dark)' }}>None</span>}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => openEditModal(grade)} 
                            className="btn-secondary"
                            style={styles.editBtn}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Grade
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal dialog for editing a grade */}
        {showEditModal && editingGrade && (
          <div className="modal-overlay">
            <div className="glass-panel modal-content" style={styles.modal}>
              <h3 style={styles.modalTitle}>Grade Assessment</h3>
              <p style={styles.modalSub}>{editingGrade.student?.firstName} {editingGrade.student?.lastName} - {editingGrade.assignment?.title}</p>
              
              <form onSubmit={handleEditSubmit} style={styles.modalForm}>
                <div className="form-group">
                  <label>Score (Max: {editingGrade.assignment?.maxPoints})</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max={editingGrade.assignment?.maxPoints}
                    value={score} 
                    onChange={(e) => setScore(e.target.value)} 
                    className="form-input" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Instructor Feedback</label>
                  <textarea 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)} 
                    className="form-input" 
                    rows="4"
                    style={{ resize: 'vertical' }}
                    placeholder="Enter written assessment comments..."
                  />
                </div>

                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Submit Score
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
  activeImportBtn: {
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: '#fff',
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
  scorecardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  scorecard: {
    padding: '20px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  scorecardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseBadge: {
    fontSize: '11px',
    fontWeight: '600',
    background: 'var(--bg-input)',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid var(--border-glass)',
    color: 'var(--accent-teal)',
  },
  percentageText: {
    fontSize: '18px',
    fontWeight: '700',
  },
  assignmentTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  scoreText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  feedbackBox: {
    marginTop: '8px',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.01)',
    borderRadius: '6px',
    borderLeft: '2px solid var(--primary)',
  },
  feedbackText: {
    fontSize: '13px',
    color: 'var(--text-main)',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  noFeedback: {
    fontSize: '13px',
    color: 'var(--text-dark)',
    fontStyle: 'italic',
  },
  gridPercentage: {
    fontWeight: '700',
  },
  gridFeedback: {
    maxWidth: '180px',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  editBtn: {
    padding: '4px 10px',
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  modal: {
    maxWidth: '440px',
  },
  modalTitle: {
    fontSize: '18px',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '4px',
    textAlign: 'left',
  },
  modalSub: {
    fontSize: '13px',
    color: 'var(--text-muted)',
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
