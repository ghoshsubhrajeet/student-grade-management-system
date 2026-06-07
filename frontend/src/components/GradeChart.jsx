import React from 'react';

export default function GradeChart({ grades, title }) {
  if (!grades || grades.length === 0) {
    return (
      <div className="glass-panel" style={styles.container}>
        <h3 style={styles.title}>{title || 'Grade Overview'}</h3>
        <div style={styles.emptyState}>No grade data available to display.</div>
      </div>
    );
  }

  // Calculate chart statistics
  // Let's summarize scores by assignment
  const assignmentStats = {};
  grades.forEach(g => {
    if (!g.assignment) return;
    const key = g.assignment.title;
    if (!assignmentStats[key]) {
      assignmentStats[key] = {
        title: key,
        totalScore: 0,
        totalMax: 0,
        count: 0
      };
    }
    assignmentStats[key].totalScore += g.score;
    assignmentStats[key].totalMax += g.assignment.maxPoints;
    assignmentStats[key].count += 1;
  });

  const chartData = Object.values(assignmentStats).map(stat => ({
    label: stat.title,
    percentage: Math.round((stat.totalScore / stat.totalMax) * 100),
    avgScore: (stat.totalScore / stat.count).toFixed(1),
    maxPoints: (stat.totalMax / stat.count).toFixed(1)
  }));

  // SVG parameters
  const width = 600;
  const height = 280;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 50;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const barWidth = chartData.length > 0 ? Math.min(60, (chartWidth / chartData.length) * 0.6) : 40;
  const gap = chartData.length > 1 ? (chartWidth - (barWidth * chartData.length)) / (chartData.length - 1) : 0;

  return (
    <div className="glass-panel" style={styles.container}>
      <h3 style={styles.title}>{title || 'Performance Distribution'}</h3>
      <div style={styles.chartWrapper}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={styles.svg}>
          {/* Grid lines & Y-Axis values */}
          {[0, 25, 50, 75, 100].map((val, idx) => {
            const y = paddingTop + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="rgba(255,255,255,0.06)" 
                  strokeDasharray="4,4"
                />
                <text 
                  x={paddingLeft - 12} 
                  y={y + 4} 
                  fill="var(--text-muted)" 
                  fontSize="11" 
                  textAnchor="end"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Render Bars */}
          {chartData.map((data, idx) => {
            const x = paddingLeft + idx * (barWidth + gap) + (gap / 2 || 0);
            const barHeight = (data.percentage / 100) * chartHeight;
            const y = paddingTop + chartHeight - barHeight;
            
            // Pick a gradient color based on percentage
            let colorStart = '#ef4444'; // Red
            let colorEnd = '#f87171';
            if (data.percentage >= 80) {
              colorStart = 'var(--accent-teal)'; // Teal
              colorEnd = '#34d399';
            } else if (data.percentage >= 60) {
              colorStart = 'var(--primary)'; // Purple
              colorEnd = 'var(--secondary)';
            }

            return (
              <g key={idx} className="chart-bar-group">
                <defs>
                  <linearGradient id={`grad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={colorStart} />
                    <stop offset="100%" stopColor={colorEnd} stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                {/* Background bar */}
                <rect 
                  x={x} 
                  y={paddingTop} 
                  width={barWidth} 
                  height={chartHeight} 
                  fill="rgba(255,255,255,0.02)" 
                  rx="6"
                />
                {/* Active value bar */}
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  fill={`url(#grad-${idx})`}
                  rx="6"
                />
                {/* Label values on top of bar */}
                <text 
                  x={x + barWidth / 2} 
                  y={y - 8} 
                  fill="#fff" 
                  fontSize="12" 
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {data.percentage}%
                </text>
                {/* X-axis labels */}
                <text 
                  x={x + barWidth / 2} 
                  y={paddingTop + chartHeight + 20} 
                  fill="var(--text-muted)" 
                  fontSize="11" 
                  textAnchor="middle"
                  style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
                >
                  {data.label.length > 10 ? `${data.label.substring(0, 8)}..` : data.label}
                  <title>{data.label}</title>
                </text>
              </g>
            );
          })}

          {/* Base Axis Line */}
          <line 
            x1={paddingLeft} 
            y1={paddingTop + chartHeight} 
            x2={width - paddingRight} 
            y2={paddingTop + chartHeight} 
            stroke="var(--border-glass)" 
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  chartWrapper: {
    flexGrow: 1,
    minHeight: '200px',
  },
  svg: {
    display: 'block',
    maxHeight: '300px',
  },
  emptyState: {
    padding: '40px 0',
    color: 'var(--text-muted)',
    fontSize: '14px',
    textAlign: 'center',
  }
};
