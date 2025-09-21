import React from 'react';
import { 
  FaCheckCircle, FaClock, FaCalendarAlt, FaHourglass, 
  FaExclamationTriangle, FaPlay, FaTimes 
} from 'react-icons/fa';

const InterviewStatusBadge = ({ status }) => {
  const statusConfig = {
    'completed': { 
      color: 'success', 
      icon: FaCheckCircle, 
      text: 'Completed',
      description: 'Interview finished successfully'
    },
    'in_progress': { 
      color: 'warning', 
      icon: FaClock, 
      text: 'In Progress',
      description: 'Interview is currently active'
    },
    'scheduled': { 
      color: 'info', 
      icon: FaCalendarAlt, 
      text: 'Scheduled',
      description: 'Interview scheduled for future date'
    },
    'ready': { 
      color: 'primary', 
      icon: FaHourglass, 
      text: 'Ready',
      description: 'Ready to start interview'
    },
    'expired': { 
      color: 'danger', 
      icon: FaExclamationTriangle, 
      text: 'Expired',
      description: 'Interview link has expired'
    },
    'cancelled': { 
      color: 'secondary', 
      icon: FaTimes, 
      text: 'Cancelled',
      description: 'Interview was cancelled'
    },
    'pending': { 
      color: 'warning', 
      icon: FaPlay, 
      text: 'Pending',
      description: 'Waiting to be started'
    }
  };

  const config = statusConfig[status] || statusConfig['ready'];
  const Icon = config.icon;

  return (
    <span 
      className={`status-badge ${config.color}`}
      title={config.description}
    >
      <Icon className="status-icon" />
      {config.text}
    </span>
  );
};

export default InterviewStatusBadge;