import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock, Edit, Trash2, AlertCircle, User, FileText } from 'lucide-react';
import api from '../../services/api';
import '../../assets/leave-styles.css';

const LeaveManagement = ({ role }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    leave_type: 'Annual Leave',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);

      const mockLeaves = [
        {
          id: 1,
          employee_name: 'Aditya Bhavar',
          leave_type: 'Annual Leave',
          start_date: '2024-06-15',
          end_date: '2024-06-18',
          days: 3,
          status: 'Approved',
          reason: 'Family vacation'
        },
        {
          id: 2,
          employee_name: 'Rohan Patel',
          leave_type: 'Sick Leave',
          start_date: '2024-05-10',
          end_date: '2024-05-12',
          days: 2,
          status: 'Approved',
          reason: 'Not feeling well'
        },
        {
          id: 3,
          employee_name: 'Isha Mehta',
          leave_type: 'Personal Leave',
          start_date: '2024-07-05',
          end_date: '2024-07-05',
          days: 1,
          status: 'Pending',
          reason: 'Personal work'
        },
        {
          id: 4,
          employee_name: 'Kunal Verma',
          leave_type: 'Annual Leave',
          start_date: '2024-08-20',
          end_date: '2024-08-25',
          days: 5,
          status: 'Pending',
          reason: 'Family function'
        },
        {
          id: 5,
          employee_name: 'Sneha Nair',
          leave_type: 'Sick Leave',
          start_date: '2024-04-15',
          end_date: '2024-04-16',
          days: 1,
          status: 'Rejected',
          reason: 'Doctor appointment'
        }
      ];
      
      setLeaves(mockLeaves);
      setLoading(false);
    } catch (error) {
      console.error('Error loading leaves:', error);
      setError('Failed to load leave data. Please try again later.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const updatedLeaves = leaves.map(leave => {
          if (leave.id === editingId) {
            return {
              ...leave,
              ...formData,
              days: calculateDays(formData.start_date, formData.end_date)
            };
          }
          return leave;
        });
        
        setLeaves(updatedLeaves);
      } else {

        const newLeave = {
          id: leaves.length + 1,
          employee_name: 'Aditya Bhavar',
          ...formData,
          days: calculateDays(formData.start_date, formData.end_date),
          status: 'Pending'
        };
        
        setLeaves([newLeave, ...leaves]);
      }
      
      setFormVisible(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        leave_type: 'Annual Leave',
        start_date: '',
        end_date: '',
        reason: ''
      });
    } catch (error) {
      console.error('Error saving leave:', error);
      alert('Failed to save leave request. Please try again.');
    }
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <Check size={16} className="status-icon approved" />;
      case 'Rejected':
        return <X size={16} className="status-icon rejected" />;
      case 'Pending':
        return <Clock size={16} className="status-icon pending" />;
      default:
        return null;
    }
  };

  const handleApprove = (id) => {
    setLeaves(leaves.map(leave => 
      leave.id === id ? { ...leave, status: 'Approved' } : leave
    ));
  };

  const handleReject = (id) => {
    setLeaves(leaves.map(leave => 
      leave.id === id ? { ...leave, status: 'Rejected' } : leave
    ));
  };
  
  const handleEditLeave = (leave) => {
    setFormData({
      leave_type: leave.leave_type,
      start_date: leave.start_date,
      end_date: leave.end_date,
      reason: leave.reason
    });
    setIsEditing(true);
    setEditingId(leave.id);
    setFormVisible(true);
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleDeleteLeave = (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      setLeaves(leaves.filter(leave => leave.id !== id));
    }
  };
  
  const filteredLeaves = filterStatus === 'All' 
    ? leaves 
    : leaves.filter(leave => leave.status === filterStatus);

  if (loading) {
    return <div className="loading-container">Loading leave data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="section-header">
        <h2 className="section-title">{role === 'admin' ? 'Leave Management' : 'My Leaves'}</h2>
        <p className="section-subtitle">
          {role === 'admin' ? 'Manage employee leave requests' : 'View and request leaves'}
        </p>
      </div>

      <div className="leave-actions-bar">
        {role !== 'admin' && (
          <button 
            className="primary-btn" 
            onClick={() => {
              if (formVisible && (isEditing || formData.reason)) {
                if (window.confirm('Are you sure you want to discard your changes?')) {
                  setFormVisible(false);
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({
                    leave_type: 'Annual Leave',
                    start_date: '',
                    end_date: '',
                    reason: ''
                  });
                }
              } else {
                setFormVisible(!formVisible);
                if (formVisible) {
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({
                    leave_type: 'Annual Leave',
                    start_date: '',
                    end_date: '',
                    reason: ''
                  });
                }
              }
            }}
          >
            <Calendar size={16} className="btn-icon" />
            {formVisible ? 'Cancel' : 'Request Leave'}
          </button>
        )}
        
        <div className="leave-filters">
          <label className="filter-label">Filter by status:</label>
          <select 
            className="status-filter" 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {formVisible && (
        <div className="leave-form-container">
          <form onSubmit={handleSubmit} className="leave-form">
            <h3 className="form-title">{isEditing ? 'Edit Leave Request' : 'New Leave Request'}</h3>
            
            <div className="form-group">
              <label>
                <FileText size={16} className="form-icon" />
                Leave Type
              </label>
              <select 
                name="leave_type" 
                value={formData.leave_type}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                <option value="Bereavement Leave">Bereavement Leave</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <Calendar size={16} className="form-icon" />
                  Start Date
                </label>
                <input 
                  type="date" 
                  name="start_date" 
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>
                  <Calendar size={16} className="form-icon" />
                  End Date
                </label>
                <input 
                  type="date" 
                  name="end_date" 
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  min={formData.start_date}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>
                <AlertCircle size={16} className="form-icon" />
                Reason
              </label>
              <textarea 
                name="reason" 
                value={formData.reason}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="Please provide a reason for your leave request"
                className="form-control"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {isEditing ? 'Update Request' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="leaves-table-container">
        {filteredLeaves.length === 0 ? (
          <div className="no-leaves-message">
            <AlertCircle size={48} className="no-data-icon" />
            <p>No leave requests found{filterStatus !== 'All' ? ` with status: ${filterStatus}` : ''}.</p>
            {!formVisible && role !== 'admin' && (
              <button 
                className="primary-btn small" 
                onClick={() => setFormVisible(true)}
              >
                Request Leave
              </button>
            )}
          </div>
        ) : (
          <table className="leaves-table">
            <thead>
              <tr>
                {role === 'admin' && <th>Employee</th>}
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave) => (
                <tr key={leave.id} className={`leave-row ${leave.status.toLowerCase()}`}>
                  {role === 'admin' && <td>
                    <div className="employee-cell">
                      <User size={16} className="employee-icon" />
                      {leave.employee_name}
                    </div>
                  </td>}
                  <td>{leave.leave_type}</td>
                  <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                  <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                  <td className="days-cell">{leave.days}</td>
                  <td>
                    <div className="leave-status">
                      {getStatusIcon(leave.status)}
                      <span className={`status-text ${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </div>
                  </td>
                  <td className="reason-cell">
                    <div className="reason-content">{leave.reason}</div>
                  </td>
                  <td className="actions-cell">
                    {role === 'admin' && leave.status === 'Pending' ? (
                      <div className="leave-actions-cell">
                        <button 
                          className="action-btn approve" 
                          onClick={() => handleApprove(leave.id)}
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          className="action-btn reject" 
                          onClick={() => handleReject(leave.id)}
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : role !== 'admin' ? (
                      <div className="leave-actions-cell">
                        {leave.status === 'Pending' && (
                          <>
                            <button 
                              className="action-btn edit" 
                              onClick={() => handleEditLeave(leave)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="action-btn delete" 
                              onClick={() => handleDeleteLeave(leave.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="no-actions">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
