import React, { useState, useEffect } from 'react';
import { Calendar, Target, TrendingUp, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import '../../assets/dashboard-styles.css';

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard('employee');
      setDashboardData(data);
      setError(null);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={loadDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          Welcome back, {dashboardData?.name || 'Employee'}!
        </h2>
        <p className="section-subtitle">
          {dashboardData?.position} • {dashboardData?.department}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <Calendar className="stat-icon" color="#3b82f6" size={24} />
            <div className="stat-info">
              <div className="stat-value">
                {dashboardData?.leave_balance || 0}
                <span className="stat-value-trend trend-up">+2 days</span>
              </div>
              <p className="stat-label">Leave Balance</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <Target className="stat-icon" color="#10b981" size={24} />
            <div className="stat-info">
              <div className="stat-value">
                {dashboardData?.active_goals || 0}
                <span className="stat-value-trend trend-up">+1</span>
              </div>
              <p className="stat-label">Active Goals</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <TrendingUp className="stat-icon" color="#8b5cf6" size={24} />
            <div className="stat-info">
              <div className="stat-value">
                {dashboardData?.performance?.avg_rating || 0}
                <span className="stat-value-trend trend-up">+0.2</span>
              </div>
              <p className="stat-label">Performance Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-grid">
        {/* Recent Leave Requests */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Leave Requests</h3>
            <button className="card-action-btn">View All</button>
          </div>
          <div className="list">
            {dashboardData?.recent_leaves?.length > 0 ? (
              dashboardData.recent_leaves.map((leave, index) => (
                <div key={index} className="list-item">
                  <div className="list-item-content">
                    <p className="list-item-title">{leave.leave_type}</p>
                    <p className="list-item-subtitle">
                      {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                      <span className="list-item-date">{leave.days} days</span>
                    </p>
                  </div>
                  <div className={`badge ${leave.status === 'Approved' ? 'badge-green' : leave.status === 'Rejected' ? 'badge-red' : 'badge-yellow'}`}>
                    {leave.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No recent leave requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions-container">
            <button className="action-btn action-btn-blue">
              <div className="action-btn-content">
                <div className="action-btn-icon">
                  <Calendar color="#3b82f6" size={18} />
                </div>
                <span className="action-btn-text">Request Leave</span>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <ChevronRight size={16} color="#9ca3af" />
              </div>
            </button>
            
            <button className="action-btn action-btn-green">
              <div className="action-btn-content">
                <div className="action-btn-icon">
                  <Target color="#10b981" size={18} />
                </div>
                <span className="action-btn-text">Update Goals</span>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <ChevronRight size={16} color="#9ca3af" />
              </div>
            </button>
            
            <button className="action-btn action-btn-purple">
              <div className="action-btn-content">
                <div className="action-btn-icon">
                  <Calendar color="#8b5cf6" size={18} />
                </div>
                <span className="action-btn-text">View Policies</span>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <ChevronRight size={16} color="#9ca3af" />
              </div>
            </button>
          </div>
        </div>

        {/* Goals */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Current Goals</h3>
            <button className="card-action-btn">View All</button>
          </div>
          <div className="list">
            {dashboardData?.goals?.length > 0 ? (
              dashboardData.goals.map((goal, index) => (
                <div key={index} className="list-item">
                  <div className="list-item-content">
                    <p className="list-item-title">{goal.title}</p>
                    <p className="list-item-subtitle">
                      Progress: {goal.progress}%
                      {goal.deadline && (
                        <span className="list-item-date">Due: {formatDate(goal.deadline)}</span>
                      )}
                    </p>
                  </div>
                  <div className={`badge ${goal.status === 'Completed' ? 'badge-green' : goal.status === 'At Risk' ? 'badge-red' : 'badge-yellow'}`}>
                    {goal.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No active goals</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Holidays</h3>
          </div>
          <div className="list">
            {dashboardData?.upcoming_holidays?.length > 0 ? (
              dashboardData.upcoming_holidays.map((holiday, index) => (
                <div key={index} className="list-item">
                  <div className="list-item-content">
                    <div className="holiday-info">
                      <p className="list-item-title">{holiday.name}</p>
                      <p className="list-item-subtitle">{formatDate(holiday.date)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No upcoming holidays</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;