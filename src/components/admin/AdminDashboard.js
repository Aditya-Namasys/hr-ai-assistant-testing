import React, { useState, useEffect } from 'react';
import { Users, FileText, Clock, TrendingUp, ChevronRight, Award, BarChart, Calendar } from 'lucide-react';
import api from '../../services/api';
import '../../assets/dashboard-styles.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard('admin');
      setDashboardData(data);
      setError(null);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for better display
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
        <h2 className="section-title">Admin &nbsp; Dashboard</h2>
        <p className="section-subtitle">
          Manage all HR operations and employee data
        </p>
      </div>

      {/* Stats Cards */}
      {dashboardData && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <Users className="stat-icon" color="white" size={24} />
              <div className="stat-info">
                <div className="stat-value">
                  {dashboardData.total_employees}
                  <span
                    className="stat-value-trend trend-up"
                    style={{ color: "white" }}
                  >
                    +2.5%
                  </span>
                </div>
                <p className="stat-label2">Total &nbsp; Employees</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <FileText className="stat-icon" color="white" size={24} />
              <div className="stat-info">
                <div className="stat-value">
                  {dashboardData.departments?.length || 0}
                  <span
                    className="stat-value-trend trend-up"
                    style={{ color: "white" }}
                  >
                    +1
                  </span>
                </div>
                <p className="stat-label2">Departments</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <Clock className="stat-icon" color="white" size={24} />
              <div className="stat-info">
                <div className="stat-value">
                  {dashboardData.pending_approvals || 0}
                  <span
                    className="stat-value-trend trend-down"
                    style={{ color: "white" }}
                  >
                    -12%
                  </span>
                </div>
                <p className="stat-label2">Pending &nbsp;Approvals</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <TrendingUp className="stat-icon" color="white" size={24} />
              <div className="stat-info">
                <div className="stat-value">
                  {dashboardData.avg_performance || 0}
                  <span
                    className="stat-value-trend trend-up"
                    style={{ color: "white" }}
                  >
                    +0.3
                  </span>
                </div>
                <p className="stat-label2">Avg &nbsp; Performance</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <p className="list-item-title">
                      {leave.employee_name || `Employee #${leave.employee_id}`}
                    </p>
                    <p className="list-item-subtitle">
                      {leave.leave_type} - {leave.days} days
                      <span className="list-item-date">
                        {formatDate(leave.start_date)} -{" "}
                        {formatDate(leave.end_date)}
                      </span>
                    </p>
                  </div>
                  <div
                    className={`badge ${
                      leave.status === "Approved"
                        ? "badge-green"
                        : leave.status === "Rejected"
                        ? "badge-red"
                        : "badge-yellow"
                    }`}
                  >
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

        {/* Top Performers */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Performers</h3>
            <button className="card-action-btn">View All</button>
          </div>
          <div className="list">
            {dashboardData?.top_performers?.length > 0 ? (
              dashboardData.top_performers.map((performer, index) => (
                <div key={index} className="list-item">
                  <div className="list-item-content">
                    <div className="performer-info">
                      <div className="performer-avatar">
                        {performer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="list-item-title">{performer.name}</p>
                        <p className="list-item-subtitle">
                          {performer.department}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rating">
                    <Award size={16} color="#e3dfd9ff" />
                    <span>{performer.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No performance data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Department Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Department Overview</h3>
            <button className="card-action-btn">View All</button>
          </div>
          <div className="list">
            {dashboardData?.departments?.length > 0 ? (
              dashboardData.departments.map((dept, index) => (
                <div key={index} className="list-item">
                  <div className="list-item-content">
                    <div className="dept-info">
                      <div className="dept-icon">
                        <span>{dept.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="list-item-title">{dept}</p>
                        <p className="list-item-subtitle">
                          {dashboardData.department_counts?.[dept] || 0}{" "}
                          employees
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="dept-performance">
                    <BarChart size={16} color="#3b82f6" />
                    <span>
                      {dashboardData.performance_by_dept?.[dept] || "-"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No departments found</p>
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
                      <Calendar size={16} color="#ef4444" />
                      <div>
                        <p className="list-item-title">{holiday.name}</p>
                        <p className="list-item-subtitle">
                          {formatDate(holiday.date)}
                        </p>
                      </div>
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

export default AdminDashboard;