import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaUsers, 
  FaCalendarCheck, 
  FaClock, 
  FaCheckCircle, 
  FaEye, 
  FaLink, 
  FaFileAlt, 
  FaChartLine,
  FaExclamationTriangle,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import InterviewCreationForm from './InterviewCreationForm';
import InterviewReportViewer from './InterviewReportViewer';
import './AdminInterviewManager.css';

const API_URL = process.env.REACT_APP_API_URL;

function AdminInterviewManager() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    created: 0,
    in_progress: 0,
    completed: 0
  });

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'monitoring') {
      fetchInterviews();
    }
  }, [activeTab, statusFilter]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`${API_URL}/admin/interviews?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setInterviews(data.interviews);
        calculateStats(data.interviews);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
    setLoading(false);
  };

  const calculateStats = (interviewsList) => {
    const stats = interviewsList.reduce((acc, interview) => {
      acc.total++;
      acc[interview.status] = (acc[interview.status] || 0) + 1;
      return acc;
    }, { total: 0, created: 0, in_progress: 0, completed: 0 });
    
    setStats(stats);
  };

  const handleInterviewCreated = (newInterview) => {
    setInterviews(prev => [newInterview, ...prev]);
    setActiveTab('dashboard');
    fetchInterviews();
  };

  const handleViewReport = async (interviewId) => {
    try {
      const response = await fetch(`${API_URL}/admin/interview/${interviewId}/report`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedInterview(data.report);
        setActiveTab('report');
      } else {
        alert('Report not available for this interview');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Failed to fetch interview report');
    }
  };

  const copyInterviewLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      alert('Interview link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created': return <FaClock className="status-icon created" />;
      case 'in_progress': return <FaUsers className="status-icon in-progress" />;
      case 'completed': return <FaCheckCircle className="status-icon completed" />;
      default: return <FaExclamationTriangle className="status-icon unknown" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'created': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredInterviews = interviews.filter(interview =>
    (interview.candidate_name && interview.candidate_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (interview.job_title && interview.job_title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const StatCard = ({ icon, title, value, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );

  const InterviewCard = ({ interview }) => (
    <div className="interview-card">
      <div className="interview-header">
        <div className="interview-title">
          <h4>{interview.job_title}</h4>
          <div className="interview-status">
            {getStatusIcon(interview.status)}
            <span>{getStatusText(interview.status)}</span>
          </div>
        </div>
        <div className="interview-actions">
          {interview.status === 'completed' && (
            <button 
              className="interview-action-btn report-btn"
              onClick={() => handleViewReport(interview.id)}
              title="View Report"
            >
              <FaFileAlt />
            </button>
          )}
          <button 
            className="interview-action-btn link-btn"
            onClick={() => copyInterviewLink(interview.interview_link)}
            title="Copy Interview Link"
          >
            <FaLink />
          </button>
        </div>
      </div>
      
      <div className="interview-details">
        <div className="candidate-info">
          <strong>Candidate:</strong> {interview.candidate_name}
          {interview.candidate_email && (
            <span className="candidate-email">({interview.candidate_email})</span>
          )}
        </div>
        
        <div className="interview-meta">
          <div className="meta-item">
            <strong>Created:</strong> {formatDate(interview.created_at)}
          </div>
          {interview.started_at && (
            <div className="meta-item">
              <strong>Started:</strong> {formatDate(interview.started_at)}
            </div>
          )}
          {interview.completed_at && (
            <div className="meta-item">
              <strong>Completed:</strong> {formatDate(interview.completed_at)}
            </div>
          )}
        </div>
        
        {interview.status === 'in_progress' && (
          <div className="progress-info">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(interview.completed_questions / interview.total_questions) * 100}%` 
                }}
              />
            </div>
            <span className="progress-text">
              {interview.completed_questions} / {interview.total_questions} questions
            </span>
          </div>
        )}
        
        {interview.tab_switches > 0 && (
          <div className="warning-info">
            <FaExclamationTriangle className="warning-icon" />
            <span>{interview.tab_switches} tab switch(es) detected</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard-section">
      <div className="dashboard-header">
        <h3>Interview Dashboard</h3>
        <button 
          className="create-interview-btn"
          onClick={() => setActiveTab('create')}
        >
          <FaPlus /> Create New Interview
        </button>
      </div>
      
      <div className="stats-grid">
        <StatCard 
          icon={<FaUsers />} 
          title="Total Interviews" 
          value={stats.total} 
          color="blue"
        />
        <StatCard 
          icon={<FaClock />} 
          title="Not Started" 
          value={stats.created} 
          color="orange"
        />
        <StatCard 
          icon={<FaCalendarCheck />} 
          title="In Progress" 
          value={stats.in_progress} 
          color="yellow"
        />
        <StatCard 
          icon={<FaCheckCircle />} 
          title="Completed" 
          value={stats.completed} 
          color="green"
        />
      </div>
      
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by candidate name or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="status-filter">
          <FaFilter className="filter-icon" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="created">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      <div className="interviews-grid">
        {loading ? (
          <div className="loading-state">Loading interviews...</div>
        ) : filteredInterviews.length === 0 ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>No interviews found</h3>
            <p>Create your first interview to get started.</p>
            <button 
              className="create-first-btn"
              onClick={() => setActiveTab('create')}
            >
              <FaPlus /> Create Interview
            </button>
          </div>
        ) : (
          filteredInterviews.map(interview => (
            <InterviewCard key={interview.id} interview={interview} />
          ))
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <InterviewCreationForm 
            onInterviewCreated={handleInterviewCreated}
            onCancel={() => setActiveTab('dashboard')}
          />
        );
      case 'report':
        return (
          <InterviewReportViewer 
            report={selectedInterview}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'monitoring':
        return renderDashboard();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section-header">
        <h2 className="section-title">AI Interview Management</h2>
        <p className="section-subtitle">Create, monitor, and analyze AI-powered interviews</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FaChartLine /> Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <FaPlus /> Create Interview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          <FaEye /> Monitor
        </button>
      </div>

      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminInterviewManager;