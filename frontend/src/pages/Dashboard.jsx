import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import GradeChart from '../components/GradeChart';
import { api } from '../services/api';

export default function Dashboard() {
  const user = api.getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalGrades: 0,
    averageScore: 0,
    completedAssignments: 0
  });
  const [gradesData, setGradesData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        if (user.role === 'ADMIN' || user.role === 'TEACHER') {
          // Fetch student list & grades to compile metrics
          const students = await api.getStudents();
          const grades = await api.getGrades();
          
          let totalScorePercentageSum = 0;
          let gradesWithAssignment = 0;
          
          grades.forEach(g => {
            if (g.assignment) {
              totalScorePercentageSum += (g.score / g.assignment.maxPoints) * 100;
              gradesWithAssignment++;
            }
          });
          
          const classAvg = gradesWithAssignment > 0 
            ? Math.round(totalScorePercentageSum / gradesWithAssignment) 
            : 0;

          setStats({
            totalStudents: students.length,
            totalGrades: grades.length,
            averageScore: classAvg,
            completedAssignments: [...new Set(grades.map(g => g.assignment?.title))].filter(Boolean).length
          });
          setGradesData(grades);
        } else if (user.role === 'STUDENT') {
          // Fetch only student's own grades
          const grades = await api.getGrades();
          
          let totalScorePercentageSum = 0;
          let gradesWithAssignment = 0;
          
          grades.forEach(g => {
            if (g.assignment) {
              totalScorePercentageSum += (g.score / g.assignment.maxPoints) * 100;
              gradesWithAssignment++;
            }
          });
          
          const studentAvg = gradesWithAssignment > 0 
            ? Math.round(totalScorePercentageSum / gradesWithAssignment) 
            : 0;

          setStats({
            totalStudents: 1,
            totalGrades: grades.length,
            averageScore: studentAvg,
            completedAssignments: grades.filter(g => g.score !== null).length
          });
          setGradesData(grades);
        }
      } catch (err) {
        setErrorMessage(`Could not load dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user.role]);

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <div className="loading-spinner" style={styles.spinner}></div>
          <p style={{ color: 'var(--text-muted)', marginTop: '15px' }}>Loading Dashboard Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        {errorMessage && (
          <div className="glass-panel" style={{ padding: '16px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            {errorMessage}
          </div>
        )}

        <div style={styles.welcomeSection}>
          <h2 style={styles.welcomeTitle}>Dashboard Overview</h2>
          <p style={styles.welcomeSub}>Welcome back, {user.username}. Here is a summary of the academic records.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {user.role !== 'STUDENT' ? (
            <>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ color: 'var(--primary)', background: 'rgba(139, 92, 246, 0.15)' }}>👥</div>
                <div className="stat-info">
                  <h3>Total Students</h3>
                  <p>{stats.totalStudents}</p>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ color: 'var(--accent-teal)', background: 'var(--accent-teal-glow)' }}>📊</div>
                <div className="stat-info">
                  <h3>Grades Logged</h3>
                  <p>{stats.totalGrades}</p>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.15)' }}>📈</div>
                <div className="stat-info">
                  <h3>Class Average</h3>
                  <p>{stats.averageScore}%</p>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ color: 'var(--secondary)', background: 'rgba(217, 70, 239, 0.15)' }}>📝</div>
                <div className="stat-info">
                  <h3>Assignments</h3>
                  <p>{stats.completedAssignments}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ color: 'var(--primary)', background: 'rgba(139, 92, 246, 0.15)' }}>👤</div>
                <div className="stat-info">
                  <h3>Enrollment</h3>
                  <p>PCC Student</p>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ color: 'var(--accent-teal)', background: 'var(--accent-teal-glow)' }}>📝</div>
                <div className="stat-info">
                  <h3>Grades Count</h3>
                  <p>{stats.totalGrades}</p>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.15)' }}>🎯</div>
                <div className="stat-info">
                  <h3>Your Average</h3>
                  <p>{stats.averageScore}%</p>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ color: 'var(--secondary)', background: 'rgba(217, 70, 239, 0.15)' }}>🏆</div>
                <div className="stat-info">
                  <h3>Submissions</h3>
                  <p>{stats.completedAssignments}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts & Actions Row */}
        <div style={styles.contentRow}>
          <div style={styles.chartCol}>
            <GradeChart 
              grades={gradesData} 
              title={user.role === 'STUDENT' ? 'Your Progress by Assignment' : 'Class average per Assignment'} 
            />
          </div>
          
          <div className="glass-panel" style={styles.actionsCard}>
            <h3 style={styles.actionsTitle}>Quick Navigation</h3>
            <div style={styles.actionsList}>
              {user.role !== 'STUDENT' ? (
                <>
                  <a href="/students" style={styles.actionBtn}>
                    <span>Manage Student Profiles</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </a>
                  <a href="/grades" style={styles.actionBtn}>
                    <span>Edit Assignment Grades</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </a>
                  {user.role === 'ADMIN' && (
                    <a href="/users" style={styles.actionBtn}>
                      <span>Admin Account Controls</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </a>
                  )}
                </>
              ) : (
                <>
                  <a href="/grades" style={styles.actionBtn}>
                    <span>View Your Detailed Grades</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  welcomeSection: {
    textAlign: 'left',
    marginBottom: '10px',
  },
  welcomeTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  welcomeSub: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  contentRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    marginTop: '10px',
  },
  chartCol: {
    flex: '2 1 500px',
  },
  actionsCard: {
    flex: '1 1 280px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left',
  },
  actionsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  actionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  actionBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  }
};
