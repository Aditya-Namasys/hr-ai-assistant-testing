import React, { useState } from 'react';
import { FaUser, FaFileUpload, FaBriefcase, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import InterviewSuccessMessage from './InterviewSuccessMessage';

const API_URL = process.env.REACT_APP_API_URL;

function InterviewCreationForm({ onInterviewCreated, onCancel }) {
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    candidateName: '',
    candidateEmail: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createdInterview, setCreatedInterview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          resume: 'Please upload a PDF, DOC, or DOCX file'
        }));
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          resume: 'File size must be less than 10MB'
        }));
        return;
      }
      
      setResumeFile(file);
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    } else if (formData.jobDescription.trim().length < 50) {
      newErrors.jobDescription = 'Job description should be at least 50 characters';
    }
    
    if (!formData.candidateName.trim()) {
      newErrors.candidateName = 'Candidate name is required';
    }
    
    if (formData.candidateEmail && !/\S+@\S+\.\S+/.test(formData.candidateEmail)) {
      newErrors.candidateEmail = 'Please enter a valid email address';
    }
    
    if (!resumeFile) {
      newErrors.resume = 'Resume file is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('job_title', formData.jobTitle);
      formDataToSend.append('job_description', formData.jobDescription);
      formDataToSend.append('candidate_name', formData.candidateName);
      formDataToSend.append('candidate_email', formData.candidateEmail);
      formDataToSend.append('resume_file', resumeFile);
      formDataToSend.append('admin_id', localStorage.getItem('employee_id') || 'admin');
      
      const response = await fetch(`${API_URL}/admin/create-interview`, {
        method: 'POST',
        body: formDataToSen
      });
      
      const data = await response.json();
      console.log('Interview creation response:', data);
      
      if (response.ok) {
        setCreatedInterview(data);
        setShowSuccessMessage(true);
      } else {
        throw new Error(data.message || data.detail || 'Failed to create interview');
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      alert(`Failed to create interview: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessMessage(false);
    setCreatedInterview(null);
    resetForm();
    onCancel();
  };

  const handleViewDashboard = () => {
    setShowSuccessMessage(false);
    setCreatedInterview(null);
    resetForm();
    onInterviewCreated(createdInterview);
  };

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      jobDescription: '',
      candidateName: '',
      candidateEmail: ''
    });
    setResumeFile(null);
    setErrors({});
  };

  return (
    <>
      {showSuccessMessage && createdInterview && (
        <InterviewSuccessMessage
          interviewData={createdInterview}
          onClose={handleSuccessClose}
          onViewDashboard={handleViewDashboard}
        />
      )}
      <div className="interview-creation-form">
      <div className="form-header">
        <h3>Create New Interview</h3>
        <p>Set up a new AI interview session for a candidate</p>
      </div>

      <form onSubmit={handleSubmit} className="creation-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <FaBriefcase className="label-icon" />
              <span>Job Title</span>
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              placeholder="e.g., Senior Frontend Developer"
              className={`form-input ${errors.jobTitle ? 'error' : ''}`}
            />
            {errors.jobTitle && <span className="error-message">{errors.jobTitle}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <FaUser className="label-icon" />
              <span>Candidate Name</span>
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="candidateName"
              value={formData.candidateName}
              onChange={handleInputChange}
              placeholder="Enter candidate's full name"
              className={`form-input ${errors.candidateName ? 'error' : ''}`}
            />
            {errors.candidateName && <span className="error-message">{errors.candidateName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Candidate Email</span>
            <span className="optional">(Optional)</span>
          </label>
          <input
            type="email"
            name="candidateEmail"
            value={formData.candidateEmail}
            onChange={handleInputChange}
            placeholder="candidate@email.com"
            className={`form-input ${errors.candidateEmail ? 'error' : ''}`}
          />
          {errors.candidateEmail && <span className="error-message">{errors.candidateEmail}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Job Description</span>
            <span className="required">*</span>
          </label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleInputChange}
            placeholder="Provide a detailed job description including required skills, responsibilities, and qualifications..."
            rows="6"
            className={`form-textarea ${errors.jobDescription ? 'error' : ''}`}
          />
          <div className="character-count">
            {formData.jobDescription.length} characters
            {formData.jobDescription.length < 50 && ' (minimum 50 required)'}
          </div>
          {errors.jobDescription && <span className="error-message">{errors.jobDescription}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaFileUpload className="label-icon" />
            <span>Resume Upload</span>
            <span className="required">*</span>
          </label>
          <div className={`file-upload-area ${resumeFile ? 'has-file' : ''} ${errors.resume ? 'error' : ''}`}>
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="resume-upload" className="file-upload-label">
              {resumeFile ? (
                <div className="file-selected">
                  <FaCheck className="file-icon success" />
                  <div className="file-info">
                    <div className="file-name">{resumeFile.name}</div>
                    <div className="file-size">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              ) : (
                <div className="file-upload-placeholder">
                  <FaFileUpload className="file-icon" />
                  <div className="file-text">
                    <strong>Click to upload resume</strong>
                    <div className="file-hint">PDF, DOC, or DOCX (max 10MB)</div>
                  </div>
                </div>
              )}
            </label>
          </div>
          {errors.resume && <span className="error-message">{errors.resume}</span>}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
            disabled={isLoading}
          >
            <FaTimes /> Cancel
          </button>
          <button 
            type="button" 
            className="reset-btn"
            onClick={resetForm}
            disabled={isLoading}
          >
            Reset
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="spinner" />
                Creating Interview...
              </>
            ) : (
              <>
                <FaCheck />
                Create Interview
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}

export default InterviewCreationForm;