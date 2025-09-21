import React, { useState, useEffect } from 'react';
import { 
  FaRocket, FaCalendarAlt, FaClock, FaUsers, FaFileAlt, 
  FaPlay, FaEdit, FaCog, FaLightbulb, FaSpinner, FaCheckCircle,
  FaExclamationTriangle, FaInfoCircle, FaPlus, FaTrash
} from 'react-icons/fa';
import './InterviewCreationPortal.css';
import InterviewSuccessMessage from './InterviewSuccessMessage';

const API_URL = process.env.REACT_APP_API_URL;

const QuickInterviewForm = ({ 
  quickForm, 
  updateQuickForm, 
  handleQuickSubmit, 
  isLoading, 
  setCreationType 
}) => (
  <div className="interview-form quick-interview-form">
    <div className="form-header">
      <button 
        className="back-btn"
        onClick={() => setCreationType(null)}
      >
        ← Back
      </button>
      <h2 style={{color:"white"}}>
        <FaRocket className="form-icon" />
        Quick Interview Setup
      </h2>
      <p style={{color:"white"}}>Get started in minutes with essential settings</p>
    </div>
    
    <form onSubmit={handleQuickSubmit} className="interview-form-content">
      <div className="form-section">
        <h3>Job Information</h3>
        <div className="form-group">
          <label>Job Title *</label>
          <input
            type="text"
            value={quickForm.jobTitle}
            onChange={(e) => updateQuickForm('jobTitle', e.target.value)}
            placeholder="e.g., Senior React Developer"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Job Description *</label>
          <textarea
            value={quickForm.jobDescription}
            onChange={(e) => updateQuickForm('jobDescription', e.target.value)}
            placeholder="Brief description of the role and requirements..."
            rows={4}
            required
          />
        </div>
      </div>
      
      <div className="form-section">
        <h3>Candidate Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Candidate Name *</label>
            <input
              type="text"
              value={quickForm.candidateName}
              onChange={(e) => updateQuickForm('candidateName', e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={quickForm.candidateEmail}
              onChange={(e) => updateQuickForm('candidateEmail', e.target.value)}
              placeholder="candidate@example.com"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Interview Configuration</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Number of Questions</label>
            <select
              value={quickForm.questionCount}
              onChange={(e) => updateQuickForm('questionCount', parseInt(e.target.value))}
            >
              <option value={3}>3 Questions (Quick - 15 min)</option>
              <option value={5}>5 Questions (Standard - 30 min)</option>
              <option value={7}>7 Questions (Detailed - 45 min)</option>
              <option value={10}>10 Questions (Comprehensive - 60 min)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Expected Duration</label>
            <select
              value={quickForm.durationMinutes}
              onChange={(e) => updateQuickForm('durationMinutes', parseInt(e.target.value))}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Link Settings</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Link Duration Type</label>
            <select
              value={quickForm.linkDurationType}
              onChange={(e) => updateQuickForm('linkDurationType', e.target.value)}
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Duration Value</label>
            <input
              type="number"
              min="1"
              max={quickForm.linkDurationType === 'hours' ? 168 : 30}
              value={quickForm.linkDurationValue}
              onChange={(e) => updateQuickForm('linkDurationValue', parseInt(e.target.value))}
            />
            <small className="form-help">
              Link will expire in {quickForm.linkDurationValue} {quickForm.linkDurationType}
            </small>
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={() => setCreationType(null)}>
          Cancel
        </button>
        <button type="submit" className="create-btn" disabled={isLoading}>
          {isLoading ? <FaSpinner className="spin" /> : <FaRocket />}
          Create Quick Interview
        </button>
      </div>
    </form>
  </div>
);

const CustomQuestionsSection = ({ questions, onChange }) => {
  const addQuestion = () => {
    onChange([...questions, { type: 'technical', text: '', priority: 'medium' }]);
  };
  
  const removeQuestion = (index) => {
    onChange(questions.filter((_, i) => i !== index));
  };
  
  const updateQuestion = (index, field, value) => {
    const updated = questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    onChange(updated);
  };
  
  return (
    <div className="form-section">
      <h3>Custom Questions</h3>
      <p className="section-description">
        Add specific questions tailored to this role. These will be used in addition to AI-generated questions.
      </p>
      
      {questions.map((question, index) => (
        <div key={index} className="custom-question-item">
          <div className="question-header">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(index, 'type', e.target.value)}
              className="question-type-select"
            >
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="coding">Coding</option>
              <option value="case_study">Case Study</option>
            </select>
            
            <button
              type="button"
              onClick={() => removeQuestion(index)}
              className="remove-question-btn"
            >
              <FaTrash />
            </button>
          </div>
          
          <textarea
            value={question.text}
            onChange={(e) => updateQuestion(index, 'text', e.target.value)}
            placeholder="Enter your custom question here..."
            rows={3}
          />
        </div>
      ))}
      
      <button
        type="button"
        onClick={addQuestion}
        className="add-question-btn"
      >
        <FaPlus />
        Add Custom Question
      </button>
    </div>
  );
};

const ScheduledInterviewForm = ({ 
  scheduledForm, 
  updateScheduledForm, 
  handleScheduledSubmit, 
  isLoading, 
  setCreationType 
}) => (
  <div className="interview-form scheduled-interview-form">
    <div className="form-header">
      <button 
        className="back-btn"
        onClick={() => setCreationType(null)}
      >
        ← Back
      </button>
      <h2>
        <FaCalendarAlt className="form-icon" />
        Scheduled Interview Setup
      </h2>
      <p>Plan your interview with advanced scheduling and configuration</p>
    </div>
    
    <form onSubmit={handleScheduledSubmit} className="interview-form-content">
      <div className="form-section">
        <h3>Job Information</h3>
        <div className="form-group">
          <label>Job Title *</label>
          <input
            type="text"
            value={scheduledForm.jobTitle}
            onChange={(e) => updateScheduledForm('jobTitle', e.target.value)}
            placeholder="e.g., Senior Data Scientist"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Job Description *</label>
          <textarea
            value={scheduledForm.jobDescription}
            onChange={(e) => updateScheduledForm('jobDescription', e.target.value)}
            placeholder="Detailed description of role, requirements, and expectations..."
            rows={5}
            required
          />
        </div>
      </div>
      
      <div className="form-section">
        <h3>Candidate Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Candidate Name *</label>
            <input
              type="text"
              value={scheduledForm.candidateName}
              onChange={(e) => updateScheduledForm('candidateName', e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={scheduledForm.candidateEmail}
              onChange={(e) => updateScheduledForm('candidateEmail', e.target.value)}
              placeholder="candidate@example.com"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={scheduledForm.candidatePhone}
              onChange={(e) => updateScheduledForm('candidatePhone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="form-group">
            <label>Candidate Timezone</label>
            <select
              value={scheduledForm.candidateTimezone}
              onChange={(e) => updateScheduledForm('candidateTimezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London Time</option>
              <option value="Europe/Paris">Central European Time</option>
              <option value="Asia/Tokyo">Tokyo Time</option>
              <option value="Asia/Kolkata">India Standard Time</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Schedule Settings</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Interview Date *</label>
            <input
              type="date"
              value={scheduledForm.scheduledDate}
              onChange={(e) => updateScheduledForm('scheduledDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Interview Time *</label>
            <input
              type="time"
              value={scheduledForm.scheduledTime}
              onChange={(e) => updateScheduledForm('scheduledTime', e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="timezone-info">
          <FaInfoCircle className="info-icon" />
          Interview scheduled for {scheduledForm.candidateTimezone}. 
          Candidate will receive calendar invite and reminders.
        </div>
      </div>
      
      <div className="form-section">
        <h3>Interview Configuration</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Number of Questions</label>
            <select
              value={scheduledForm.questionCount}
              onChange={(e) => updateScheduledForm('questionCount', parseInt(e.target.value))}
            >
              <option value={3}>3 Questions (15-20 min)</option>
              <option value={5}>5 Questions (25-35 min)</option>
              <option value={7}>7 Questions (35-50 min)</option>
              <option value={10}>10 Questions (50-70 min)</option>
              <option value={15}>15 Questions (70-90 min)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Difficulty Level</label>
            <select
              value={scheduledForm.difficultyLevel}
              onChange={(e) => updateScheduledForm('difficultyLevel', e.target.value)}
            >
              <option value="easy">Easy (Junior level)</option>
              <option value="medium">Medium (Mid level)</option>
              <option value="hard">Hard (Senior level)</option>
              <option value="expert">Expert (Lead/Architect)</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Expected Duration</label>
          <select
            value={scheduledForm.durationMinutes}
            onChange={(e) => updateScheduledForm('durationMinutes', parseInt(e.target.value))}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
          </select>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Advanced Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={scheduledForm.proctoringEnabled}
                onChange={(e) => updateScheduledForm('proctoringEnabled', e.target.checked)}
              />
              <span className="checkmark"></span>
              Enable Proctoring
            </label>
            <small>Monitor tab switches and suspicious behavior</small>
          </div>
          
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={scheduledForm.recordingEnabled}
                onChange={(e) => updateScheduledForm('recordingEnabled', e.target.checked)}
              />
              <span className="checkmark"></span>
              Record Interview
            </label>
            <small>Save video/audio recording for review</small>
          </div>
          
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={scheduledForm.allowRetakes}
                onChange={(e) => updateScheduledForm('allowRetakes', e.target.checked)}
              />
              <span className="checkmark"></span>
              Allow Retakes
            </label>
            <small>Let candidate retake if technical issues occur</small>
          </div>
        </div>
        
        {scheduledForm.allowRetakes && (
          <div className="form-group">
            <label>Maximum Retakes</label>
            <select
              value={scheduledForm.maxRetakes}
              onChange={(e) => updateScheduledForm('maxRetakes', parseInt(e.target.value))}
            >
              <option value={1}>1 retake</option>
              <option value={2}>2 retakes</option>
              <option value={3}>3 retakes</option>
            </select>
          </div>
        )}
      </div>
      
      <CustomQuestionsSection 
        questions={scheduledForm.customQuestions}
        onChange={(questions) => updateScheduledForm('customQuestions', questions)}
      />
      
      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={() => setCreationType(null)}>
          Cancel
        </button>
        <button type="submit" className="create-btn" disabled={isLoading}>
          {isLoading ? <FaSpinner className="spin" /> : <FaCalendarAlt />}
          Schedule Interview
        </button>
      </div>
    </form>
  </div>
);

const InterviewCreationPortal = ({ onInterviewCreated, adminId }) => {
  const [creationType, setCreationType] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdInterviewData, setCreatedInterviewData] = useState(null);
  
  const [quickForm, setQuickForm] = useState({
    jobTitle: '',
    jobDescription: '',
    candidateName: '',
    candidateEmail: '',
    questionCount: 5,
    durationMinutes: 30,
    linkDurationType: 'hours',
    linkDurationValue: 24
  });
  
  const [scheduledForm, setScheduledForm] = useState({
    jobTitle: '',
    jobDescription: '',
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateTimezone: 'UTC',
    scheduledDate: '',
    scheduledTime: '',
    questionCount: 5,
    durationMinutes: 30,
    difficultyLevel: 'medium',
    proctoringEnabled: true,
    recordingEnabled: true,
    allowRetakes: false,
    maxRetakes: 1,
    customQuestions: []
  });
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/interview-templates`);
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const updateQuickForm = (field, value) => {
    setQuickForm(prev => ({ ...prev, [field]: value }));
  };

  const updateScheduledForm = (field, value) => {
    setScheduledForm(prev => ({ ...prev, [field]: value }));
  };
  
  const CreationTypeSelector = () => (
    <div className="creation-type-selector">
      <div className="selector-header">
        <h2>Create New Interview</h2>
        <p>Choose the type of interview you want to create</p>
      </div>
      
      <div className="creation-options">
        {/* Quick Interview Option */}
        <div 
          className="creation-option quick-option"
          onClick={() => setCreationType('quick')}
        >
          <div className="option-icon">
            <FaRocket />
          </div>
          <h3>Quick Interview</h3>
          <p>Start immediately with basic settings</p>
          <ul className="option-features">
            <li><FaPlay /> Ready to start immediately</li>
            <li><FaClock /> Flexible link duration (hours/days)</li>
            <li><FaCog /> Basic question configuration</li>
            <li><FaLightbulb /> Perfect for urgent hiring needs</li>
          </ul>
          <div className="option-time">
            <FaClock className="time-icon" />
            Setup: 2-3 minutes
          </div>
        </div>
        
        {/* Scheduled Interview Option */}
        <div 
          className="creation-option scheduled-option"
          onClick={() => setCreationType('scheduled')}
        >
          <div className="option-icon">
            <FaCalendarAlt />
          </div>
          <h3>Scheduled Interview</h3>
          <p>Plan ahead with advanced settings</p>
          <ul className="option-features">
            <li><FaCalendarAlt /> Date & time scheduling</li>
            <li><FaUsers /> Timezone management</li>
            <li><FaEdit /> Custom questions & templates</li>
            <li><FaCog /> Advanced proctoring settings</li>
          </ul>
          <div className="option-time">
            <FaClock className="time-icon" />
            Setup: 5-8 minutes
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <div className="template-quick-access">
          <h4>Or use a template:</h4>
          <div className="template-buttons">
            {templates.slice(0, 3).map(template => (
              <button
                key={template.id}
                className="template-quick-btn"
                onClick={() => handleTemplateUse(template.id)}
              >
                <FaFileAlt />
                {template.template_name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  
  
  
  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = {
        jobTitle: quickForm.jobTitle,
        jobDescription: quickForm.jobDescription,
        candidateName: quickForm.candidateName,
        candidateEmail: quickForm.candidateEmail,
        questionCount: quickForm.questionCount,
        durationMinutes: quickForm.durationMinutes,
        linkDurationType: quickForm.linkDurationType,
        linkDurationValue: quickForm.linkDurationValue,
        adminId: String(adminId)
      };

      console.log('Sending quick interview payload:', payload);

      const response = await fetch(`${API_URL}/api/interviews/quick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Quick interview response:', data);
      
      if (!response.ok) {
        console.error('Quick interview creation failed:', response.status, data);
        
        if (response.status === 422 && Array.isArray(data.detail)) {
          const validationErrors = data.detail.map(error => {
            if (error.loc && error.msg) {
              const field = error.loc[error.loc.length - 1];
              return `${field}: ${error.msg}`;
            }
            return error.msg || JSON.stringify(error);
          }).join(', ');
          throw new Error(`Validation errors: ${validationErrors}`);
        }
        
        throw new Error(data.message || data.detail || 'Failed to create interview. Please try again.');
      }
      
      setCreatedInterviewData(data);
      setShowSuccessModal(true);
      
      setQuickForm({
        jobTitle: '',
        jobDescription: '',
        candidateName: '',
        candidateEmail: '',
        questionCount: 5,
        durationMinutes: 30,
        linkDurationType: 'hours',
        linkDurationValue: 24
      });
      
      setTimeout(() => setSuccess(null), 5000);
      
      onInterviewCreated(data);
      
    } catch (error) {
      console.error('Error creating quick interview:', error);
      setError(error.message);
      
      setTimeout(() => setError(null), 8000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduledSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare the payload with correct field mapping
      const payload = {
        jobTitle: scheduledForm.jobTitle,
        jobDescription: scheduledForm.jobDescription,
        candidateName: scheduledForm.candidateName,
        candidateEmail: scheduledForm.candidateEmail,
        candidatePhone: scheduledForm.candidatePhone,
        candidateTimezone: scheduledForm.candidateTimezone,
        scheduledDate: scheduledForm.scheduledDate,
        scheduledTime: scheduledForm.scheduledTime,
        questionCount: scheduledForm.questionCount,
        durationMinutes: scheduledForm.durationMinutes,
        difficultyLevel: scheduledForm.difficultyLevel,
        proctoringEnabled: scheduledForm.proctoringEnabled,
        recordingEnabled: scheduledForm.recordingEnabled,
        allowRetakes: scheduledForm.allowRetakes,
        maxRetakes: scheduledForm.maxRetakes,
        customQuestions: scheduledForm.customQuestions,
        adminId: String(adminId)
      };

      console.log('Sending scheduled interview payload:', payload);

      const response = await fetch(`${API_URL}/api/interviews/scheduled`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Scheduled interview response:', data);
      
      if (!response.ok) {
        console.error('Scheduled interview creation failed:', response.status, data);
        
        // Handle validation errors (422)
        if (response.status === 422 && Array.isArray(data.detail)) {
          const validationErrors = data.detail.map(error => {
            if (error.loc && error.msg) {
              const field = error.loc[error.loc.length - 1];
              return `${field}: ${error.msg}`;
            }
            return error.msg || JSON.stringify(error);
          }).join(', ');
          throw new Error(`Validation errors: ${validationErrors}`);
        }
        
        throw new Error(data.message || data.detail || 'Failed to schedule interview');
      }
      
      setCreatedInterviewData(data);
      setShowSuccessModal(true);

      setScheduledForm({
        jobTitle: '',
        jobDescription: '',
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        candidateTimezone: 'UTC',
        scheduledDate: '',
        scheduledTime: '',
        questionCount: 5,
        durationMinutes: 30,
        difficultyLevel: 'medium',
        proctoringEnabled: true,
        recordingEnabled: true,
        allowRetakes: false,
        maxRetakes: 1,
        customQuestions: []
      });
      
      setTimeout(() => setSuccess(null), 5000);
      
      onInterviewCreated(data);
      
    } catch (error) {
      console.error('Error creating scheduled interview:', error);
      setError(error.message);
      
      setTimeout(() => setError(null), 8000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTemplateUse = async (templateId) => {
    try {
      const response = await fetch(`${API_URL}/api/interview-templates/${templateId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: 'Template User',
          candidateEmail: 'template@example.com',
          adminId
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create interview from template');
      }
      
      onInterviewCreated(data);
      
    } catch (error) {
      setError(error.message);
    }
  };
  
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCreatedInterviewData(null);
  };
  
  const handleViewDashboard = () => {
    setShowSuccessModal(false);
    setCreatedInterviewData(null);
    if (onInterviewCreated) {
      onInterviewCreated(createdInterviewData);
    }
  };
  
  return (
    <>
      {showSuccessModal && createdInterviewData && (
        <InterviewSuccessMessage
          interviewData={createdInterviewData}
          onClose={handleCloseSuccessModal}
          onViewDashboard={handleViewDashboard}
        />
      )}
      
      <div className="interview-creation-portal">
      {error && (
        <div className="alert alert-error">
          <FaExclamationTriangle />
          {error}
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <FaCheckCircle />
          {success}
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}
      
      {!creationType && <CreationTypeSelector />}
      {creationType === 'quick' && (
        <QuickInterviewForm 
          quickForm={quickForm}
          updateQuickForm={updateQuickForm}
          handleQuickSubmit={handleQuickSubmit}
          isLoading={isLoading}
          setCreationType={setCreationType}
        />
      )}
      {creationType === 'scheduled' && (
        <ScheduledInterviewForm 
          scheduledForm={scheduledForm}
          updateScheduledForm={updateScheduledForm}
          handleScheduledSubmit={handleScheduledSubmit}
          isLoading={isLoading}
          setCreationType={setCreationType}
        />
      )}
      </div>
    </>
  );
};

export default InterviewCreationPortal;