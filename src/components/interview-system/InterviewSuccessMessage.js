import React, { useState } from 'react';
import { FaCheckCircle, FaCopy, FaTimes, FaCalendarAlt, FaUser } from 'react-icons/fa';
import './InterviewSuccessMessage.css';

function InterviewSuccessMessage({ 
  interviewData, 
  onClose, 
  onViewDashboard 
}) {
  const [linkCopied, setLinkCopied] = useState(false);

  console.log('InterviewSuccessMessage rendered with data:', interviewData);

  const copyLink = async () => {
    try {
      const linkToCopy = interviewData.interview_link || interviewData.interviewLink || `https://namasys-hr-ai-assistant.vercel.app/interview/${interviewData.id || 'example'}`;
      await navigator.clipboard.writeText(linkToCopy);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {

      const date = new Date();
      date.setHours(date.getHours() + 24);
      dateString = date.toISOString();
    }
    
    const date = new Date(dateString);
    const dateOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    const datePart = date.toLocaleDateString('en-US', dateOptions);
    const timePart = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${datePart} at ${timePart}`;
  };

  return (
    <div className="success-message-overlay">
      <div className="success-message-container">
        <button 
          className="close-btn" 
          onClick={onClose}
          title="Close"
        >
          <FaTimes />
        </button>
        
        <div className="success-header">
          <FaCheckCircle className="success-icon" />
          <h2>Interview Created Successfully!</h2>
          <p>The AI interview has been set up and is ready for the candidate.</p>
        </div>

        <div className="interview-details">
          <div className="detail-row">
            <FaUser className="detail-icon" />
            <div className="detail-content">
              <label>Candidate</label>
              <span>{interviewData.candidate_name || interviewData.candidateName || 'Candidate'}</span>
            </div>
          </div>
          
          <div className="detail-row">
            <FaCalendarAlt className="detail-icon" />
            <div className="detail-content">
              <label>Expires On</label>
              <span>{formatDate(interviewData.expires_at || interviewData.expiresAt)}</span>
            </div>
          </div>
        </div>

        <div className="interview-link-section">
          <label>Interview Link</label>
          <div className="link-container">
            <input 
              type="text" 
              value={interviewData.interview_link || interviewData.interviewLink || `https://namasys-hr-ai-assistant.vercel.app/interview/${interviewData.id || 'example'}`} 
              readOnly 
              className="link-input"
            />
            <button 
              className={`copy-btn ${linkCopied ? 'copied' : ''}`}
              onClick={copyLink}
              title="Copy Link"
            >
              <FaCopy />
              {linkCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="link-note">
            Share this link with the candidate to start their interview. 
            The link will expire on the date shown above.
          </p>
        </div>

        <div className="action-buttons">
          <button 
            className="dashboard-btn"
            onClick={onViewDashboard}
          >
            View Dashboard
          </button>
          <button 
            className="close-action-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewSuccessMessage;