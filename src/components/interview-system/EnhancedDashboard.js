import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaChartLine, FaUsers, FaCalendarCheck, FaClock, 
  FaAward, FaCheckCircle, FaCalendarAlt,
  FaEye, FaDownload, FaFileAlt, FaExternalLinkAlt,
  FaSpinner, FaCheck, FaExclamationTriangle
} from 'react-icons/fa';
import InterviewStatusBadge from './InterviewStatusBadge';
import './EnhancedDashboard.css';

const EnhancedDashboard = ({ adminId, onSwitchToMonitor, onSwitchToCreate }) => {
  const [analytics, setAnalytics] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  // const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loadingActions, setLoadingActions] = useState({});
  const [actionFeedback, setActionFeedback] = useState({});

  const API_URL = process.env.REACT_APP_API_URL;

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const analyticsRes = await fetch(`${API_URL}/api/dashboard/analytics?adminId=${adminId}&timeRange=${timeRange}`);
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.analytics || {});

      try {
        const interviewsRes = await fetch(`${API_URL}/api/dashboard/recent-interviews?adminId=${adminId}&status=${filterStatus}&limit=10`);
        if (interviewsRes.ok) {
          const interviewsData = await interviewsRes.json();
          setRecentInterviews(interviewsData.interviews || []);
        } else {
          console.error('Failed to fetch recent interviews:', interviewsRes.status);
          setRecentInterviews([]);
        }
      } catch (error) {
        console.error('Failed to fetch recent interviews:', error);
        setRecentInterviews([]);
      }

      try {
        const upcomingRes = await fetch(`${API_URL}/api/dashboard/upcoming-interviews?adminId=${adminId}`);
        if (upcomingRes.ok) {
          const upcomingData = await upcomingRes.json();
          setUpcomingInterviews(upcomingData.interviews || []);
        } else {
          console.warn('Upcoming interviews endpoint not available:', upcomingRes.status);
          setUpcomingInterviews([]);
        }
      } catch (error) {
        console.warn('Failed to fetch upcoming interviews:', error);
        setUpcomingInterviews([]);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setAnalytics({});
      setRecentInterviews([]);
      setUpcomingInterviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [adminId, timeRange, filterStatus, API_URL]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({ title, value, trend, icon: Icon, color, subtitle }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-header">
        <div className="stat-icon">
          <Icon />
        </div>
        <div className="stat-trend">
          {trend > 0 ? (
            <span className="trend-up">+{trend}%</span>
          ) : trend < 0 ? (
            <span className="trend-down">{trend}%</span>
          ) : (
            <span className="trend-neutral">0%</span>
          )}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  const showFeedback = (interviewId, type, message) => {
    setActionFeedback(prev => ({ ...prev, [interviewId]: { type, message } }));
    setTimeout(() => {
      setActionFeedback(prev => ({ ...prev, [interviewId]: null }));
    }, 3000);
  };

  const handleViewInterview = async (interview) => {
    const interviewId = interview.id || interview.interview_id;
    setLoadingActions(prev => ({ ...prev, [`${interviewId}_view`]: true }));
    
    try {
      const interviewLink = interview.interview_link;
      if (interviewLink) {
        const fullLink = interviewLink.startsWith('http') 
          ? interviewLink 
          : `${window.location.origin}${interviewLink}`;
        window.open(fullLink, '_blank');
        showFeedback(interviewId, 'success', 'Interview opened in new tab');
      } else {
        showFeedback(interviewId, 'error', 'Interview link not available');
      }
    } catch (error) {
      showFeedback(interviewId, 'error', 'Failed to open interview');
    } finally {
      setLoadingActions(prev => ({ ...prev, [`${interviewId}_view`]: false }));
    }
  };

  const handleDownloadReport = async (interview) => {
    const interviewId = interview.id || interview.interview_id;
    setLoadingActions(prev => ({ ...prev, [`${interviewId}_download`]: true }));
    
    try {
      const response = await fetch(`${API_URL}/api/admin/interview/${interviewId}/report`);
      
      if (response.ok) {
        const reportData = await response.json();
        if (reportData.success && reportData.report) {
          const htmlContent = generateSimpleHTMLReport(reportData.report, interview);
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `interview-report-${interview.candidate_name}-${interviewId}.html`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          showFeedback(interviewId, 'success', 'Report downloaded successfully');
        } else {
          showFeedback(interviewId, 'error', 'Report not available');
        }
      } else {
        showFeedback(interviewId, 'error', 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      showFeedback(interviewId, 'error', 'Download failed');
    } finally {
      setLoadingActions(prev => ({ ...prev, [`${interviewId}_download`]: false }));
    }
  };

  const handleViewDetails = async (interview) => {
    const interviewId = interview.id || interview.interview_id;
    
    const details = `
Interview Details:

Candidate: ${interview.candidate_name}
Position: ${interview.job_title}
Email: ${interview.candidate_email || 'Not provided'}
Status: ${interview.status}
Created: ${new Date(interview.created_at).toLocaleDateString()}
Type: ${interview.interview_type || 'Quick'}

Interview ID: ${interviewId}`;
    
    alert(details);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Interview Dashboard</h1>
          <p>Overview and analytics for your interview management</p>
        </div>
        
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 3 months</option>
            <option value="1year">Last year</option>
          </select>
          
          <button className="monitor-btn" onClick={onSwitchToMonitor}>
            <FaEye />
            Go to Monitor
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <StatCard
          title="Total Interviews"
          value={analytics?.overview?.total_interviews || 0}
          trend={12}
          icon={FaUsers}
          color="primary"
          subtitle="All time"
        />
        
        <StatCard
          title="Completion Rate"
          value={analytics?.overview?.total_interviews > 0 ? 
            `${(analytics.overview.completion_rate || 0).toFixed(1)}%` : 
            'N/A'}
          trend={analytics?.overview?.completion_rate > 75 ? 8 : 
                 analytics?.overview?.completion_rate > 50 ? 3 : 
                 analytics?.overview?.total_interviews === 0 ? 0 : -3}
          icon={FaCheckCircle}
          color="success"
          subtitle={`${analytics?.overview?.completed || 0} of ${analytics?.overview?.total_interviews || 0} completed`}
        />
        
        <StatCard
          title="Avg. Performance"
          value={analytics?.performance_metrics?.avg_technical_score > 0 ? 
            `${analytics.performance_metrics.avg_technical_score.toFixed(1)}/10` : 
            'N/A'}
          trend={analytics?.performance_metrics?.avg_technical_score > 7 ? 8 : 
                 analytics?.performance_metrics?.avg_technical_score > 5 ? 3 : 
                 analytics?.performance_metrics?.avg_technical_score > 0 ? -3 : 0}
          icon={FaAward}
          color="warning"
          subtitle="Technical assessment"
        />
        
        <StatCard
          title="Active Now"
          value={analytics?.overview?.in_progress || 0}
          trend={analytics?.overview?.in_progress > 0 ? 15 : 0}
          icon={FaClock}
          color="info"
          subtitle={analytics?.overview?.in_progress > 0 ? 'In progress' : 'None active'}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="analytics-section">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Interview Activity</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color primary"></span>
                Scheduled
              </span>
              <span className="legend-item">
                <span className="legend-color success"></span>
                Completed
              </span>
            </div>
          </div>
          <div className="chart-container">
            <ActivityChart data={analytics?.recent_activity || []} />
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Interview Types</h3>
          </div>
          <div className="interview-types-chart">
            <InterviewTypesBreakdown data={analytics?.interview_types || {}} />
          </div>
        </div>
      </div>

      
      <div className="upcoming-section">
        <div className="section-header">
          <h3>
            <FaCalendarCheck />
            Upcoming Interviews
          </h3>
          <span className="count-badge">
            {upcomingInterviews ? upcomingInterviews.length : 0} scheduled
          </span>
        </div>
        
        <div className="upcoming-grid">
          {upcomingInterviews && upcomingInterviews.length > 0 ? (
            upcomingInterviews.map(interview => (
              <div key={interview.id} className="upcoming-card">
                <div className="upcoming-header">
                  <h4>{interview.candidate_name}</h4>
                  <div className="upcoming-time">
                    <FaClock />
                    {new Date(`${interview.scheduled_date} ${interview.scheduled_time}`).toLocaleString()}
                  </div>
                </div>
                <div className="upcoming-details">
                  <p><strong>Position:</strong> {interview.job_title}</p>
                  <p><strong>Duration:</strong> {interview.duration_minutes} minutes</p>
                  <p><strong>Questions:</strong> {interview.question_count}</p>
                </div>
                <div className="upcoming-actions">
                  <button className="action-btn primary">
                    <FaEye />
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <FaCalendarAlt className="empty-icon" />
              <p>No upcoming interviews scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="recent-section">
        <div className="section-header">
          <h3>
            <FaChartLine />
            Recent Interviews
          </h3>
          
          <div className="section-controls">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
        
        <div className="interviews-table">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Position</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentInterviews && recentInterviews.length > 0 ? (
                recentInterviews.map(interview => (
                  <tr key={interview.id}>
                    <td>
                      <div className="candidate-info">
                        <strong>{interview.candidate_name}</strong>
                        <small>{interview.candidate_email}</small>
                      </div>
                    </td>
                    <td>{interview.job_title}</td>
                    <td>
                      <span className={`type-badge ${interview.interview_type}`}>
                        {interview.interview_type}
                      </span>
                    </td>
                    <td>
                      <InterviewStatusBadge status={interview.status} />
                    </td>
                    <td>{new Date(interview.created_at).toLocaleDateString()}</td>
                    <td>{interview.duration_minutes}m</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn small info"
                          onClick={() => handleViewDetails(interview)}
                          title="View Details"
                          disabled={loadingActions[`${interview.id || interview.interview_id}_details`]}
                        >
                          {loadingActions[`${interview.id || interview.interview_id}_details`] ? (
                            <FaSpinner className="spinning" />
                          ) : (
                            <FaEye />
                          )}
                        </button>
                        {interview.interview_link && (
                          <button 
                            className="action-btn small primary"
                            onClick={() => handleViewInterview(interview)}
                            title="Open Interview Link"
                            disabled={loadingActions[`${interview.id || interview.interview_id}_view`]}
                          >
                            {loadingActions[`${interview.id || interview.interview_id}_view`] ? (
                              <FaSpinner className="spinning" />
                            ) : (
                              <FaExternalLinkAlt />
                            )}
                          </button>
                        )}
                        {interview.status === 'completed' && (
                          <button 
                            className="action-btn small success"
                            onClick={() => handleDownloadReport(interview)}
                            title="Download Report"
                            disabled={loadingActions[`${interview.id || interview.interview_id}_download`]}
                          >
                            {loadingActions[`${interview.id || interview.interview_id}_download`] ? (
                              <FaSpinner className="spinning" />
                            ) : (
                              <FaDownload />
                            )}
                          </button>
                        )}
                        {actionFeedback[interview.id || interview.interview_id] && (
                          <div className={`action-feedback ${actionFeedback[interview.id || interview.interview_id].type}`}>
                            {actionFeedback[interview.id || interview.interview_id].type === 'success' ? (
                              <FaCheck />
                            ) : (
                              <FaExclamationTriangle />
                            )}
                            <span>{actionFeedback[interview.id || interview.interview_id].message}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state-table">
                    <div className="empty-state">
                      <FaFileAlt className="empty-icon" />
                      <p>No recent interviews found</p>
                      <small>Interviews you create will appear here</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={onSwitchToCreate}>
            <FaUsers className="action-icon" />
            <span>Create Interview</span>
          </button>
          
          <button className="quick-action-card" onClick={onSwitchToCreate}>
            <FaFileAlt className="action-icon" />
            <span>Use Templates</span>
          </button>
          
          <button className="quick-action-card" onClick={() => window.open('/api/reports/stats', '_blank')}>
            <FaChartLine className="action-icon" />
            <span>View Reports</span>
          </button>
          
          <button className="quick-action-card" onClick={onSwitchToMonitor}>
            <FaEye className="action-icon" />
            <span>Live Monitor</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityChart = ({ data }) => (
  <div className="simple-chart">
    {data.length > 0 ? (
      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="chart-bar" style={{ height: `${item.count * 20}px` }}>
            <div className="bar-label">{item.date}</div>
            <div className="bar-value">{item.count}</div>
          </div>
        ))}
      </div>
    ) : (
      <div className="no-data">No activity data available</div>
    )}
  </div>
);

const InterviewTypesBreakdown = ({ data }) => (
  <div className="types-breakdown">
    {Object.entries(data).map(([type, count]) => (
      <div key={type} className="type-item">
        <div className="type-info">
          <span className="type-label">{type}</span>
          <span className="type-count">{count}</span>
        </div>
        <div className="type-bar">
          <div 
            className={`type-fill ${type}`} 
            style={{ width: `${(count / Math.max(...Object.values(data))) * 100}%` }}
          ></div>
        </div>
      </div>
    ))}
  </div>
);

const generateSimpleHTMLReport = (report, interview) => {
  const { scores, analytics } = report;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Report - ${interview.candidate_name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .report-container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .score-item { display: flex; justify-content: space-between; padding: 10px; background: #f8fafc; margin-bottom: 5px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>Interview Report</h1>
            <p><strong>${interview.candidate_name}</strong> - ${interview.job_title}</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
            <h3>Performance Scores</h3>
            <div class="score-item"><span>Overall Score:</span><span>${scores?.overall || 'N/A'}/100</span></div>
            <div class="score-item"><span>Technical Skills:</span><span>${scores?.technical_skills || 'N/A'}/100</span></div>
            <div class="score-item"><span>Communication:</span><span>${scores?.communication || 'N/A'}/100</span></div>
        </div>
        
        <div class="section">
            <h3>Interview Analytics</h3>
            <div class="score-item"><span>Completion Rate:</span><span>${analytics?.completion_rate?.toFixed(1) || 'N/A'}%</span></div>
            <div class="score-item"><span>Duration:</span><span>${analytics?.interview_duration || 'N/A'} minutes</span></div>
            <div class="score-item"><span>Response Time:</span><span>${analytics?.average_response_time || 'N/A'}s avg</span></div>
        </div>
    </div>
</body>
</html>
  `;
};

export default EnhancedDashboard;