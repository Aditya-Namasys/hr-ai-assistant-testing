import React, { useState, useEffect } from 'react';
import { 
  FaUpload, 
  FaDownload, 
  FaSearch, 
  FaEye, 
  FaCalendarPlus,
  FaFileUpload,
  FaSpinner,
  FaChartBar,
  FaUsers,
  FaClipboardList,
  FaCog
} from 'react-icons/fa';
import './ResumeScorer.css';

const API_URL = process.env.REACT_APP_API_URL;

const getScoreBadgeClass = (score) => {
  if (score >= 80) return 'score-badge high';
  if (score >= 60) return 'score-badge medium';
  return 'score-badge low';
};

const BulkInterviewSchedulingForm = ({ candidates, onSchedule, onCancel, isLoading, jobDescription }) => {
  const [interviewDate, setInterviewDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [schedulingResults, setSchedulingResults] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setInterviewDate(tomorrow.toISOString().split('T')[0]);
    setStartTime('13:00');

    if (interviewDate && startTime && candidates.length > 0) {
      generateSchedulePreview();
    }
  }, [interviewDate, startTime, duration, candidates]);

  const generateSchedulePreview = () => {
    if (!interviewDate || !startTime) return;
    
    const schedules = [];
    const baseDateTime = new Date(`${interviewDate}T${startTime}`);
    
    candidates.forEach((candidate, index) => {
      const startDateTime = new Date(baseDateTime.getTime() + (index * duration * 60000));
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
      
      schedules.push({
        candidate: candidate.candidate_name,
        email: candidate.email_id,
        score: candidate.score,
        startTime: startDateTime,
        endTime: endDateTime,
        timeSlot: `${startDateTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })} - ${endDateTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`
      });
    });
    
    setSchedulingResults(schedules);
    setShowPreview(true);
  };

  const handleScheduleAll = () => {
    onSchedule(schedulingResults.map(schedule => ({
      candidate: candidates.find(c => c.candidate_name === schedule.candidate),
      startTime: schedule.startTime.toISOString(),
      endTime: schedule.endTime.toISOString()
    })));
  };

  return (
    <div className="bulk-interview-scheduling-form">
      <div className="bulk-candidates-summary">
        <h4>Bulk Interview Scheduling - {candidates.length} Candidates</h4>
        <div className="candidates-list">
          {candidates.slice(0, 5).map((candidate, index) => (
            <div key={index} className="candidate-item">
              <span className="candidate-name">{candidate.candidate_name}</span>
              <span className={getScoreBadgeClass(candidate.score)}>
                {candidate.score.toFixed(1)}
              </span>
            </div>
          ))}
          {candidates.length > 5 && (
            <div className="candidate-item more-candidates">
              +{candidates.length - 5} more candidates
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Interview Date *</label>
        <input
          type="date"
          value={interviewDate}
          onChange={(e) => setInterviewDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="form-group">
        <label>Start Time *</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <small className="help-text">
          Interviews will be scheduled starting from this time with {duration}-minute intervals
        </small>
      </div>

      <div className="form-group">
        <label>Duration per Interview (minutes)</label>
        <select
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>60 minutes</option>
          <option value={90}>90 minutes</option>
        </select>
      </div>

      {showPreview && schedulingResults.length > 0 && (
        <div className="schedule-preview">
          <h5>Schedule Preview</h5>
          <div className="preview-list">
            {schedulingResults.map((schedule, index) => (
              <div key={index} className="preview-item">
                <div className="preview-candidate">
                  <strong>{schedule.candidate}</strong>
                  <span className="preview-email">{schedule.email}</span>
                </div>
                <div className="preview-time">
                  {schedule.timeSlot}
                </div>
                <div className={getScoreBadgeClass(schedule.score)}>
                  {schedule.score.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
          <div className="schedule-summary">
            <p>Total Duration: {(candidates.length * duration)} minutes ({Math.ceil((candidates.length * duration) / 60)} hours)</p>
            <p>End Time: {schedulingResults[schedulingResults.length - 1]?.endTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button 
          type="button" 
          className="secondary-btn" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button 
          type="button" 
          className="primary-btn" 
          onClick={handleScheduleAll}
          disabled={isLoading || !interviewDate || !startTime || schedulingResults.length === 0}
        >
          {isLoading ? (
            <>
              <FaSpinner className="spin" />
              Scheduling {candidates.length} Interviews...
            </>
          ) : (
            <>
              <FaCalendarPlus />
              Schedule All {candidates.length} Interviews
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const InterviewSchedulingForm = ({ candidate, onSchedule, onCancel, isLoading, jobDescription }) => {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setInterviewDate(tomorrow.toISOString().split('T')[0]);
    setInterviewTime('10:00');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${interviewDate}T${interviewTime}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    onSchedule({
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="interview-scheduling-form">
      <div className="candidate-summary">
        <h4>Candidate: {candidate.candidate_name}</h4>
        <p>Score: {candidate.score.toFixed(1)}/100</p>
        <p>Email: {candidate.email_id}</p>
        <p>Position: {jobDescription.split('\n')[0] || 'Interview'}</p>
      </div>

      <div className="form-group">
        <label>Interview Date *</label>
        <input
          type="date"
          value={interviewDate}
          onChange={(e) => setInterviewDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="form-group">
        <label>Interview Time *</label>
        <input
          type="time"
          value={interviewTime}
          onChange={(e) => setInterviewTime(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Duration (minutes)</label>
        <select
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>60 minutes</option>
          <option value={90}>90 minutes</option>
        </select>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="secondary-btn" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="primary-btn" 
          disabled={isLoading || !interviewDate || !interviewTime}
        >
          {isLoading ? (
            <>
              <FaSpinner className="spin" />
              Scheduling...
            </>
          ) : (
            <>
              <FaCalendarPlus />
              Schedule Interview
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const ResumeScorer = () => {
  const [activeTab, setActiveTab] = useState('bulk-score');
  const [jobDescription, setJobDescription] = useState('');
  const [scoringCriteria, setScoringCriteria] = useState({
    experience: 30,
    skills: 30,
    education: 20,
    certifications: 20
  });
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [summaryStats, setSummaryStats] = useState(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(true);
  const [advancedOptions, setAdvancedOptions] = useState({
    schedule_interviews: false,
    send_emails: [],
    top_candidates_count: 5,
    interview_date: '',
    interview_start_time: '13:00',
    interview_duration: 30
  });

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showBulkInterviewModal, setShowBulkInterviewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCandidatesForBulk, setSelectedCandidatesForBulk] = useState([]);
  const [interviewScheduling, setInterviewScheduling] = useState(false);
  const [bulkInterviewScheduling, setBulkInterviewScheduling] = useState(false);
  const [bulkEmailSending, setBulkEmailSending] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadMode, setUploadMode] = useState('folder');
  const [processingStatus, setProcessingStatus] = useState(null);
 
  const sampleJobDescription = `Lead Power BI Developer
Overview:
We are seeking an experienced Power BI Developer with at least 4 years of proven expertise in business intelligence and data analytics. The ideal candidate will excel in creating interactive dashboards and insightful reports using Power BI, and must be proficient in SQL for robust data extraction and manipulation.

Key Responsibilities:
- Dashboard & Report Development: Create, design, and maintain interactive dashboards and reports using Power BI
- Data Analysis & Visualization: Transform data into actionable insights through effective visualizations
- SQL & Data Management: Write and optimize complex SQL queries, ensure data integrity
- Data Modeling & DAX: Develop and manage data models, create measures using DAX
- Performance Optimization: Monitor and fine-tune Power BI reports for optimal performance

Minimum Qualifications:
- Bachelor's degree in Computer Science, Information Technology, or related field
- 4+ years of experience in Power BI development and data analytics
- Strong proficiency in SQL and experience with relational databases
- Experience with data modeling, DAX, and Power Query
- Familiarity with ETL processes and data warehousing concepts`;

  useEffect(() => {
    if (!jobDescription) {
      setJobDescription(sampleJobDescription);
    }
    // Set default interview date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setAdvancedOptions(prev => ({
      ...prev,
      interview_date: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  const handleBulkScoring = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }

    if (!API_URL) {
      alert('API URL is not configured. Please check your environment settings.');
      return;
    }
    if (uploadMode === 'upload' && uploadedFiles.length === 0) {
      alert('Please upload resume files first');
      return;
    }

    const totalPercentage = Object.values(scoringCriteria).reduce((a, b) => a + b, 0);
    if (Math.abs(totalPercentage - 100) > 1) {
      alert(`Scoring criteria must add up to 100%. Current total: ${totalPercentage}%`);
      return;
    }

    setProcessing(true);
    setUploadProgress(0);
    setProcessingStatus(null);

    try {
      let response;

      if (uploadMode === 'upload') {
        response = await processBulkUploadedFiles();
      } else {

        response = await processFolderBasedFiles();
      }

      const data = await response.json();
      
      setResults(data.results || []);
      setSummaryStats(data.summary_stats || {});
      setUploadProgress(100);

      // Add summary popup
      const shortlisted = (data.results || []).filter(c => c.score >= 80 && c.email_id);
      const rejected = (data.results || []).filter(c => c.score < 80 && c.email_id);

      let emailsSent = 0;
      if (advancedOptions.send_emails.includes('selected')) {
        emailsSent += shortlisted.length;
      }
      if (advancedOptions.send_emails.includes('rejected')) {
        emailsSent += rejected.length;
      }

      alert(
        `Bulk Resume Scoring Complete!\n\n` +
        `Shortlisted: ${shortlisted.length}\n` +
        `Rejected: ${rejected.length}\n` +
        `Emails Sent: ${emailsSent}`
      );

      // Handle interview scheduling
      if (advancedOptions.schedule_interviews && data.results && data.results.length > 0) {
        const topCandidates = data.results
          .filter(candidate => candidate.score >= 80 && candidate.email_id)
          .sort((a, b) => b.score - a.score)
          .slice(0, advancedOptions.top_candidates_count);

        if (topCandidates.length > 0 && advancedOptions.interview_date && advancedOptions.interview_start_time) {
          console.log('Auto-scheduling interviews for top candidates:', topCandidates.map(c => c.candidate_name));
          try {
            await createBulkMeetingsFromAdvanced(topCandidates);
          } catch (error) {
            console.error('Failed to create bulk meetings from advanced settings:', error);
            alert(`⚠️ Resume processing completed, but calendar invite scheduling failed: ${error.message}`);
          }
        } else if (advancedOptions.schedule_interviews) {
          console.log('No eligible candidates found for auto-scheduling (need score 80+ and email)');
          alert(`✅ Resume processing completed!\n⚠️ No calendar invites sent - no candidates met criteria (score 80+ with email)`);
        }
      }

      // Handle email sending
      if (advancedOptions.send_emails && data.results && data.results.length > 0) {
        const topCandidatesForEmail = data.results
          .filter(candidate => candidate.score >= 80)
          .sort((a, b) => b.score - a.score)
          .slice(0, advancedOptions.top_candidates_count);

        if (topCandidatesForEmail.length > 0) {
          console.log('Sending emails for top candidates:', topCandidatesForEmail.map(c => c.candidate_name));
          try {
           // await sendBulkEmails(topCandidatesForEmail, jobDescription);
          } catch (error) {
            console.error('Failed to send bulk emails:', error);
            alert(`⚠️ Resume processing completed, but email sending failed: ${error.message}`);
          }
        } else {
          console.log('No eligible candidates found for email sending (need score 80+)');
          alert(`✅ Resume processing completed!\n⚠️ No emails sent - no candidates met criteria (score 80+)`);
        }
      }

      if (data.meeting_scheduled) {
        const scheduledCount = data.meeting_details?.scheduled_count || 0;
        alert(`✅ Successfully processed ${data.total_resumes_processed} resumes!\n${scheduledCount > 0 ? `📅 Sent ${scheduledCount} calendar invites for top candidates` : ''}`);
      }
      
      setTimeout(() => {
        setUploadProgress(0);
        setProcessingStatus(null);
      }, 3000);

    } catch (error) {
      console.error('Bulk scoring failed:', error);
      const errorMessage = error.message || 'Failed to process resumes. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const processBulkUploadedFiles = async () => {
    setProcessingStatus({ current: 0, total: uploadedFiles.length });
    
    const results = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      
      try {
        setProcessingStatus({ current: i + 1, total: uploadedFiles.length, fileName: file.name });
        setUploadProgress(((i + 0.1) / uploadedFiles.length) * 100);

        const result = await processSingleFile(file);
        results.push(result);
        
        setUploadProgress(((i + 1) / uploadedFiles.length) * 100);

      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        results.push({
          filename: file.name,
          candidate_name: "Processing Failed",
          score: 0.0,
          score_reason: `Processing error: ${error.message}`,
          recommendation: "Manual review required",
          processed_at: new Date()
        });
        
        setUploadProgress(((i + 1) / uploadedFiles.length) * 100);
      }
    }

    setProcessingStatus({ current: uploadedFiles.length, total: uploadedFiles.length, message: 'All files processed!' });
    setUploadProgress(100);

    results.sort((a, b) => b.score - a.score);

    const scores = results.filter(r => r.score > 0).map(r => r.score);
    const summaryStats = {
      average_score: scores.length ? scores.reduce((a, b) => a + b) / scores.length : 0,
      highest_score: scores.length ? Math.max(...scores) : 0,
      lowest_score: scores.length ? Math.min(...scores) : 0,
      candidates_above_70: scores.filter(s => s >= 70).length,
      candidates_above_80: scores.filter(s => s >= 80).length,
      processing_success_rate: (scores.length / results.length) * 100
    };

    return {
      json: async () => ({
        results,
        summary_stats: summaryStats,
        total_resumes_processed: results.length,
        processing_time_seconds: 0
      })
    };
  };

  const processSingleFile = async (file) => {
    const formData = new FormData();
    formData.append('resume_file', file);
    formData.append('job_description', jobDescription);
    formData.append('scoring_criteria', JSON.stringify({
      experience: scoringCriteria.experience / 100,
      skills: scoringCriteria.skills / 100,
      education: scoringCriteria.education / 100,
      certifications: scoringCriteria.certifications / 100
    }));
    formData.append('send_emails', JSON.stringify(advancedOptions.send_emails));
    formData.append('upload_type', 'bulk');

    const response = await fetch(`${API_URL}/api/resume-scorer/single-score`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Processing failed');
    }

    return await response.json();
  };

  const processFolderBasedFiles = async () => {
    const requestBody = {
      job_description: jobDescription,
      max_resumes: 20,
      scoring_criteria: {
        experience: scoringCriteria.experience / 100,
        skills: scoringCriteria.skills / 100,
        education: scoringCriteria.education / 100,
        certifications: scoringCriteria.certifications / 100
      },
      schedule_interviews: advancedOptions.schedule_interviews,
      send_emails: advancedOptions.send_emails,
      top_candidates_count: advancedOptions.top_candidates_count,
      interview_date: advancedOptions.interview_date,
      interview_start_time: advancedOptions.interview_start_time,
      interview_duration: advancedOptions.interview_duration,

      hardcoded_meeting_config: {
        to_emails: ["mayank.gupta@namasys.ai", "aditya.bhavar@namasys.ai"],
        cc_emails: ["rathina.kumar@namasys.ai"]
      }
    };

    let progressMessages = [
      'Loading resumes from server folder...',
      'Analyzing resume content...',
      'Extracting candidate information...',
      'Scoring resumes against job requirements...',
      'Calculating match percentages...',
      'Ranking candidates...',
      'Finalizing results...'
    ];
    
    let messageIndex = 0;
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev < 85) {
          const increment = Math.random() * 15 + 5;
          const newProgress = Math.min(prev + increment, 85);
          
          const progressPercent = newProgress / 85;
          const targetMessageIndex = Math.floor(progressPercent * progressMessages.length);
          if (targetMessageIndex > messageIndex && targetMessageIndex < progressMessages.length) {
            messageIndex = targetMessageIndex;
            setProcessingStatus({ 
              current: Math.floor(newProgress / 5), 
              total: 20, 
              message: progressMessages[messageIndex] 
            });
          }
          
          return newProgress;
        }
        return prev;
      });
    }, 1200);

    try {
      const response = await fetch(`${API_URL}/api/resume-scorer/bulk-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      setProcessingStatus({ current: 20, total: 20, message: 'Processing complete!' });
      setUploadProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingStatus({ current: 20, total: 20, message: 'Preparing results...' });
      setUploadProgress(95);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProcessingStatus({ current: 20, total: 20, message: 'Done!' });
      setUploadProgress(100);
      
      return response;

    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  const handleSingleFileUpload = async (file) => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }

    if (!API_URL) {
      alert('API URL is not configured. Please check your environment settings.');
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append('resume_file', file);
      formData.append('job_description', jobDescription);
      formData.append('scoring_criteria', JSON.stringify({
        experience: scoringCriteria.experience / 100,
        skills: scoringCriteria.skills / 100,
        education: scoringCriteria.education / 100,
        certifications: scoringCriteria.certifications / 100
      }));
      formData.append('send_emails', JSON.stringify(advancedOptions.send_emails));
      formData.append('upload_type', 'single');

      const response = await fetch(`${API_URL}/api/resume-scorer/single-score`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setResults([result]);
      
    } catch (error) {
      console.error('Single file scoring failed:', error);
      const errorMessage = error.message || 'Failed to score resume. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (activeTab === 'single-score' && files.length === 1) {
      handleSingleFileUpload(files[0]);
    } else if (activeTab === 'bulk-score') {
      handleBulkFileUpload(files);
    }
  };

  const handleBulkFileUpload = (files) => {
    const validFiles = files.filter(file => {
      const validExtensions = ['pdf', 'docx', 'doc'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      return validExtensions.includes(fileExtension);
    });

    if (validFiles.length === 0) {
      alert('Please select valid resume files (PDF, DOCX, or DOC format)');
      return;
    }

    if (validFiles.length !== files.length) {
      const invalidCount = files.length - validFiles.length;
      alert(`${invalidCount} file(s) were skipped due to invalid format. Only PDF, DOCX, and DOC files are supported.`);
    }

    setUploadedFiles(validFiles);
    setUploadMode('upload');
    
    const fileCountText = `${validFiles.length} resume file${validFiles.length === 1 ? '' : 's'} selected`;
    console.log(fileCountText, validFiles.map(f => f.name));
  };

  const removeUploadedFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setUploadMode('folder');
    }
  };

  const downloadCSV = () => {
    if (!results.length) return;

    const csvContent = [
      ['Filename', 'Candidate Name', 'Score', 'Email', 'Phone', 'Recommendation', 'Skills', 'Experience Years'].join(','),
      ...results.map(result => [
        result.filename,
        result.candidate_name,
        result.score,
        result.email_id || 'N/A',
        result.phone_number || 'N/A',
        result.recommendation,
        (result.extracted_skills || []).join('; '),
        result.experience_years || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_scores_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredResults = results
    .filter(result => {
      const matchesSearch = result.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.filename.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesScore = scoreFilter === 'all' ||
                          (scoreFilter === 'high' && result.score >= 80) ||
                          (scoreFilter === 'medium' && result.score >= 60 && result.score < 80) ||
                          (scoreFilter === 'low' && result.score < 60);
      
      return matchesSearch && matchesScore;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };

  const handleScheduleInterview = async (candidate) => {
    if (!candidate.email_id) {
      alert('Cannot schedule interview: No email address found for this candidate');
      return;
    }

    setSelectedCandidate(candidate);
    setShowInterviewModal(true);
  };

  const handleBulkScheduleInterview = () => {
    const topCandidates = filteredResults
      .filter(candidate => candidate.email_id && candidate.score >= 70)
      .slice(0, 10);
    
    if (topCandidates.length === 0) {
      alert('No eligible candidates found for bulk scheduling.\nCriteria: Score 70+ and valid email address');
      return;
    }

    setSelectedCandidatesForBulk(topCandidates);
    setShowBulkInterviewModal(true);
  };

  const createBulkMeetingsFromAdvanced = async (topCandidates) => {
    console.log('Creating bulk calendar invites from advanced settings for candidates:', topCandidates);
    
    const baseDateTime = new Date(`${advancedOptions.interview_date}T${advancedOptions.interview_start_time}`);
    const responses = [];
    const errors = [];
    
    for (let index = 0; index < topCandidates.length; index++) {
      const candidate = topCandidates[index];
      
      const startDateTime = new Date(baseDateTime.getTime() + (index * advancedOptions.interview_duration * 60000));
      const endDateTime = new Date(startDateTime.getTime() + advancedOptions.interview_duration * 60000);
      
      try {
        const calendarInviteData = {
          subject: `Interview - ${candidate.candidate_name} (Score: ${candidate.score.toFixed(1)})`,
          body: `Candidate Interview scheduled for ${candidate.candidate_name}\n\nCandidate Details:\n- Score: ${candidate.score}/100\n- Skills: ${(candidate.extracted_skills || []).join(', ')}\n- Experience: ${candidate.experience_years || 'Not specified'} years\n- Recommendation: ${candidate.recommendation}\n\nJob Position: ${jobDescription.split('\n')[0] || 'Position Interview'}\n\nAuto-scheduled from bulk processing at ${new Date().toLocaleString()}`,
          attendees: ["mayank.gupta@namasys.ai", "aditya.bhavar@namasys.ai", "rathina.kumar@namasys.ai"],
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          from_email: "rathina.kumar@namasys.ai",
          is_online_meeting: true
        };

        console.log(`Creating calendar invite ${index + 1}/${topCandidates.length} for ${candidate.candidate_name}:`, calendarInviteData);

        const response = await fetch(`${API_URL}/api/calendar-service/send-calendar-invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarInviteData),
        });

        const result = response.headers.get('content-type')?.includes('application/json') 
          ? await response.json() 
          : await response.text();

        if (response.ok && (typeof result === 'object' ? result.success : true)) {
          responses.push({ 
            candidate: candidate.candidate_name, 
            success: true, 
            timeSlot: `${startDateTime.toLocaleTimeString()} - ${endDateTime.toLocaleTimeString()}`,
            meetingUrl: typeof result === 'object' ? result.online_meeting_url : null
          });
        } else {
          errors.push({ 
            candidate: candidate.candidate_name, 
            error: typeof result === 'object' ? result.message || result.error || 'Failed to schedule' : result
          });
        }
      } catch (error) {
        errors.push({ candidate: candidate.candidate_name, error: error.message });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const successCount = responses.length;
    const errorCount = errors.length;
    
    let message = `Bulk Calendar Invite Results:\n📅 ${successCount} calendar invite${successCount !== 1 ? 's' : ''} sent successfully`;
    if (errorCount > 0) {
      message += `\n❌ ${errorCount} invite${errorCount !== 1 ? 's' : ''} failed`;
    }
    if (successCount > 0) {
      message += `\n\nScheduled interviews:\n${responses.map(r => `• ${r.candidate} at ${r.timeSlot}`).join('\n')}`;
    }
    
    alert(message);
    console.log('Bulk calendar invite creation results:', { responses, errors });
  };

  // const sendBulkEmails = async (topCandidates, jobDescription) => {
  //   console.log('Sending bulk emails for candidates:', topCandidates);
    
  //   setBulkEmailSending(true);
    
  //   try {
  //     const requestBody = {
  //       candidates: topCandidates,
  //       job_description: jobDescription,
  //       subject: "Exciting Opportunity - We're Impressed with Your Profile!",
  //       from_email: "rathina.kumar@namasys.ai",
  //       to_emails: ["mayank.gupta@namasys.ai", "aditya.bhavar@namasys.ai"],
  //       cc_emails: ["rathina.kumar@namasys.ai"]
  //     };

  //     const response = await fetch(`${API_URL}/api/email-service/send-candidate-emails`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(requestBody),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       throw new Error(errorData.detail || 'Failed to send emails');
  //     }

  //     const result = await response.json();
      
  //     if (result.success) {
  //       const successCount = result.emails_sent;
  //       let message = `✅ Successfully sent candidate summary emails!\n📧 ${successCount} email${successCount !== 1 ? 's' : ''} sent successfully`;
        
  //       if (result.top_candidates_count) {
  //         message += `\n👥 ${result.top_candidates_count} top candidates included in summary`;
  //       }
        
  //       if (result.failed_recipients && result.failed_recipients.length > 0) {
  //         message += `\n⚠️ Failed to send to: ${result.failed_recipients.join(', ')}`;
  //       }
        
  //       message += `\n\n🧪 Testing Mode:\nEmails sent to: mayank.gupta@namasys.ai, aditya.bhavar@namasys.ai\nCC: rathina.kumar@namasys.ai`;
        
  //       alert(message);
  //     } else {
  //       throw new Error(result.message || 'Failed to send emails');
  //     }
      
  //   } catch (error) {
  //     console.error('Bulk email sending failed:', error);
  //     throw error;
  //   } finally {
  //     setBulkEmailSending(false);
  //   }
  // };
  
  const scheduleBulkInterviewAPI = async (scheduleData) => {
    if (!API_URL) {
      alert('API URL is not configured');
      return;
    }

    setBulkInterviewScheduling(true);
    
    try {
      const responses = [];
      const errors = [];
      
      for (const schedule of scheduleData) {
        try {
          const calendarInviteData = {
            subject: `Interview - ${schedule.candidate.candidate_name} (Score: ${schedule.candidate.score.toFixed(1)})`,
            body: `Candidate Interview scheduled for ${schedule.candidate.candidate_name}\n\nCandidate Details:\n- Score: ${schedule.candidate.score}/100\n- Skills: ${(schedule.candidate.extracted_skills || []).join(', ')}\n- Experience: ${schedule.candidate.experience_years || 'Not specified'} years\n- Recommendation: ${schedule.candidate.recommendation}\n\nJob Position: ${jobDescription.split('\n')[0] || 'Position Interview'}\n\nTime Slot: ${new Date(schedule.startTime).toLocaleString()} - ${new Date(schedule.endTime).toLocaleString()}\n\nThis is scheduled through the bulk interview scheduler using hardcoded emails for testing.`,
            attendees: ["mayank.gupta@namasys.ai", "aditya.bhavar@namasys.ai", "rathina.kumar@namasys.ai"],
            start_time: schedule.startTime,
            end_time: schedule.endTime,
            from_email: "rathina.kumar@namasys.ai",
            is_online_meeting: true
          };

          console.log(`Creating calendar invite for ${schedule.candidate.candidate_name}:`, calendarInviteData);

          const response = await fetch(`${API_URL}/api/calendar-service/send-calendar-invite`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(calendarInviteData),
          });

          const result = response.headers.get('content-type')?.includes('application/json') 
            ? await response.json() 
            : await response.text();

          if (response.ok && (typeof result === 'object' ? result.success : true)) {
            responses.push({ 
              candidate: schedule.candidate.candidate_name, 
              success: true, 
              result,
              timeSlot: `${new Date(schedule.startTime).toLocaleTimeString()} - ${new Date(schedule.endTime).toLocaleTimeString()}`,
              meetingUrl: typeof result === 'object' ? result.online_meeting_url : null
            });
          } else {
            errors.push({ 
              candidate: schedule.candidate_name, 
              error: typeof result === 'object' ? result.message || result.error || 'Failed to schedule' : result
            });
          }
        } catch (error) {
          errors.push({ candidate: schedule.candidate_name, error: error.message });
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const successCount = responses.length;
      const errorCount = errors.length;
      
      if (successCount > 0) {
        let message = `📅 Successfully sent ${successCount} calendar invite${successCount > 1 ? 's' : ''}!`;
        if (errorCount > 0) {
          message += `\n⚠️ ${errorCount} invite${errorCount > 1 ? 's' : ''} failed to send.`;
          console.error('Bulk calendar scheduling errors:', errors);
        }
        alert(message);
        setShowBulkInterviewModal(false);
      } else {
        alert(`❌ Failed to send any calendar invites.\nErrors: ${errors.map(e => `${e.candidate}: ${e.error}`).join('\n')}`);
      }

    } catch (error) {
      console.error('Bulk calendar invite scheduling failed:', error);
      alert(`❌ Failed to schedule bulk calendar invites: ${error.message}`);
    } finally {
      setBulkInterviewScheduling(false);
    }
  };

  const scheduleInterviewAPI = async (interviewDetails) => {
    if (!API_URL) {
      alert('API URL is not configured');
      return;
    }

    setInterviewScheduling(true);
    
    try {
      const calendarInviteData = {
        subject: `Individual Interview - ${selectedCandidate.candidate_name} (Score: ${selectedCandidate.score.toFixed(1)})`,
        body: `Individual Interview scheduled for ${selectedCandidate.candidate_name}\n\nCandidate Details:\n- Score: ${selectedCandidate.score}/100\n- Skills: ${(selectedCandidate.extracted_skills || []).join(', ')}\n- Experience: ${selectedCandidate.experience_years || 'Not specified'} years\n- Recommendation: ${selectedCandidate.recommendation}\n\nJob Position: ${jobDescription.split('\n')[0] || 'Position Interview'}\n\nNote: This is a test calendar invite using hardcoded emails for functionality testing.`,
        attendees: ["mayank.gupta@namasys.ai", "aditya.bhavar@namasys.ai", "rathina.kumar@namasys.ai"],
        start_time: interviewDetails.startTime,
        end_time: interviewDetails.endTime,
        from_email: "rathina.kumar@namasys.ai",
        is_online_meeting: true
      };

      const response = await fetch(`${API_URL}/api/calendar-service/send-calendar-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarInviteData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to schedule calendar invite');
      }

      const result = await response.json();
      
      if (result.success) {
        alert(`📅 Calendar invite sent successfully for ${selectedCandidate.candidate_name}!\n${result.online_meeting_url ? `Meeting URL: ${result.online_meeting_url}` : 'Check your email for meeting details'}`);
        setShowInterviewModal(false);
      } else {
        throw new Error(result.message || 'Failed to send calendar invite');
      }

    } catch (error) {
      console.error('Calendar invite scheduling failed:', error);
      alert(`❌ Failed to send calendar invite: ${error.message}`);
    } finally {
      setInterviewScheduling(false);
    }
  };


  return (
    <div className="resume-scorer">
     

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'bulk-score' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk-score')}
        >
          <FaUsers /> Bulk Scoring
        </button>
        <button 
          className={`tab-btn ${activeTab === 'single-score' ? 'active' : ''}`}
          onClick={() => setActiveTab('single-score')}
        >
          <FaFileUpload /> Single Resume
        </button>
        <button 
          className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <FaChartBar /> Results ({results.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'bulk-score' && (
          <div className="bulk-score-tab">
            <div className="input-section">
              <div className="resume-source-section">
                <h3>Resume Source</h3>
                <div className="upload-mode-selector">
                  <button 
                    className={`mode-btn ${uploadMode === 'folder' ? 'active' : ''}`}
                    onClick={() => {
                      setUploadMode('folder');
                      setUploadedFiles([]);
                    }}
                  >
                    📁 Use Server Folder
                  </button>
                  <button 
                    className={`mode-btn ${uploadMode === 'upload' ? 'active' : ''}`}
                    onClick={() => setUploadMode('upload')}
                  >
                    📤 Upload Files
                  </button>
                </div>

                {uploadMode === 'folder' }
                
                {/* && (
                  <div className="folder-info">
                    <p>📁 Using default resume collection from server</p>
                    <small>Pre-loaded sample resumes will be processed for testing.</small>
                  </div>
                )} */}

                {uploadMode === 'upload' && (
                  <div className="file-upload-section">
                    <input
                      type="file"
                      id="bulk-resume-upload"
                      accept=".pdf,.docx,.doc"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="bulk-resume-upload" className="bulk-upload-label">
                      <FaUpload className="upload-icon" />
                      <div className="upload-text">
                        <span>Click to select multiple resume files</span>
                        <small>Supported formats: PDF, DOCX, DOC (Max: 50 files)</small>
                      </div>
                    </label>

                    {uploadedFiles.length > 0 && (
                      <div className="uploaded-files-list">
                        <h4>Selected Files ({uploadedFiles.length})</h4>
                        <div className="file-list">
                          {uploadedFiles.slice(0, 10).map((file, index) => (
                            <div key={index} className="file-item">
                              <span className="file-name">{file.name}</span>
                              <button 
                                className="remove-file-btn"
                                onClick={() => removeUploadedFile(index)}
                                title="Remove file"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {uploadedFiles.length > 10 && (
                            <div className="file-item more-files">
                              <span>... and {uploadedFiles.length - 10} more files</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="job-description-section">
                <label>Job Description *</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Enter detailed job description..."
                  rows="8"
                  className="job-description-input"
                />
              </div>

              <div className="settings-section">
                <div className="settings-header">
                  <h3>
                    <FaCog /> Scoring Configuration
                  </h3>
                  <button 
                    className="toggle-advanced"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  >
                    {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
                  </button>
                </div>

                <div className="scoring-criteria">
                  <div className="criteria-grid">
                    <div className="criteria-item">
                      <label>Experience ({scoringCriteria.experience}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={scoringCriteria.experience}
                        onChange={(e) => setScoringCriteria({
                          ...scoringCriteria,
                          experience: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div className="criteria-item">
                      <label>Skills ({scoringCriteria.skills}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={scoringCriteria.skills}
                        onChange={(e) => setScoringCriteria({
                          ...scoringCriteria,
                          skills: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div className="criteria-item">
                      <label>Education ({scoringCriteria.education}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={scoringCriteria.education}
                        onChange={(e) => setScoringCriteria({
                          ...scoringCriteria,
                          education: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div className="criteria-item">
                      <label>Certifications ({scoringCriteria.certifications}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={scoringCriteria.certifications}
                        onChange={(e) => setScoringCriteria({
                          ...scoringCriteria,
                          certifications: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                  <div className="criteria-total">
                    Total: {Object.values(scoringCriteria).reduce((a, b) => a + b, 0)}%
                  </div>
                </div>

                {showAdvancedSettings && (
                  <div className="advanced-settings">
                    <div className="setting-row">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={advancedOptions.schedule_interviews}
                          onChange={(e) => setAdvancedOptions({
                            ...advancedOptions, 
                            schedule_interviews: e.target.checked
                          })}
                        />
                        Send calendar invites for top candidates (Score 80+)
                      </label>
                    </div>
                    
                    <div className="setting-row">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={advancedOptions.send_emails.includes('selected')}
                          onChange={e => setAdvancedOptions({
                            ...advancedOptions,
                            send_emails: e.target.checked
                              ? [...advancedOptions.send_emails, 'selected']
                              : advancedOptions.send_emails.filter(val => val !== 'selected')
                          })}
                        />
                        Send emails to top candidates (Score 80+)
                      </label>
                    </div>

                    <div className="setting-row">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={advancedOptions.send_emails.includes('rejected')}
                          onChange={e => setAdvancedOptions({
                            ...advancedOptions,
                            send_emails: e.target.checked
                              ? [...advancedOptions.send_emails, 'rejected']
                              : advancedOptions.send_emails.filter(val => val !== 'rejected')
                          })}
                        />
                        Send rejection emails to unshortlisted candidates (Score &lt; 80)
                      </label>
                    </div>

                    {advancedOptions.send_emails && (
                      <div className="bulk-email-options">
                        <h4>Bulk Email Notification</h4>
                        <div className="email-preview-info">
                          <p><strong>Email Recipients (Testing Mode):</strong></p>
                          <p>📧 To: mayank.gupta@namasys.ai, aditya.bhavar@namasys.ai</p>
                          <p>📧 CC: rathina.kumar@namasys.ai</p>
                          <br/>
                          {/* <p><strong>Email Content:</strong></p>
                          <p>✅ Top candidates summary with scores and skills</p>
                          <p>✅ Job requirements overview</p>
                          <p>✅ Professional HTML formatted email</p>
                          <br/> */}
                          <div style={{
                            padding: '0.75rem',
                            background: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                          }}>
                            <p><strong>🧪 Testing Mode:</strong></p>
                            <p>Emails will be sent to hardcoded testing addresses only.</p>
                            <p>Original candidate emails are not used during testing.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {advancedOptions.schedule_interviews && (
                      <div className="bulk-scheduling-options">
                        <h4>Bulk Calendar Invites</h4>
                        
                        <div className="scheduling-grid">
                          <div className="setting-row">
                            <label>
                              Max candidates to invite:
                              <input 
                                type="number" 
                                min="1" 
                                max="10" 
                                value={advancedOptions.top_candidates_count}
                                onChange={(e) => setAdvancedOptions({
                                  ...advancedOptions, 
                                  top_candidates_count: parseInt(e.target.value)
                                })}
                                style={{marginLeft: '10px', width: '60px'}}
                              />
                            </label>
                          </div>
                          
                          <div className="setting-row">
                            <label>
                              Interview Date:
                              <input 
                                type="date" 
                                value={advancedOptions.interview_date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setAdvancedOptions({
                                  ...advancedOptions, 
                                  interview_date: e.target.value
                                })}
                                style={{marginLeft: '10px'}}
                              />
                            </label>
                          </div>
                          
                          <div className="setting-row">
                            <label>
                              Start Time:
                              <input 
                                type="time" 
                                value={advancedOptions.interview_start_time}
                                onChange={(e) => setAdvancedOptions({
                                  ...advancedOptions, 
                                  interview_start_time: e.target.value
                                })}
                                style={{marginLeft: '10px'}}
                              />
                            </label>
                          </div>
                          
                          <div className="setting-row">
                            <label>
                              Duration per Interview:
                              <select 
                                value={advancedOptions.interview_duration}
                                onChange={(e) => setAdvancedOptions({
                                  ...advancedOptions, 
                                  interview_duration: parseInt(e.target.value)
                                })}
                                style={{marginLeft: '10px'}}
                              >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>60 minutes</option>
                                <option value={90}>90 minutes</option>
                              </select>
                            </label>
                          </div>
                          
                          <div className="scheduling-preview">
                            {advancedOptions.interview_date && advancedOptions.interview_start_time && (
                              <div className="preview-info">
                                <p><strong>Calendar Invite Preview:</strong></p>
                                <p>Date: {new Date(advancedOptions.interview_date).toLocaleDateString()}</p>
                                <p>Starting at: {advancedOptions.interview_start_time}</p>
                                <p>Duration: {advancedOptions.interview_duration} minutes each</p>
                                <p>Max invites: {advancedOptions.top_candidates_count}</p>
                                {(() => {
                                  const startTime = new Date(`${advancedOptions.interview_date}T${advancedOptions.interview_start_time}`);
                                  const endTime = new Date(startTime.getTime() + (advancedOptions.top_candidates_count * advancedOptions.interview_duration * 60000));
                                  return <p> Estimated end: {endTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</p>;
                                })()}
                                
                                <div style={{
                                  marginTop: '1rem',
                                  padding: '0.75rem',
                                  background: '#fff3cd',
                                  border: '1px solid #ffeaa7',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem'
                                }}>
                                  <p><strong>🧪 Testing Mode:</strong></p>
                                  <p>To: mayank.gupta@namasys.ai, aditya.bhavar@namasys.ai</p>
                                  <p>CC: rathina.kumar@namasys.ai</p>
                                  <p style={{margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#856404'}}>
                                    Calendar invites will be sent to these hardcoded emails for testing purposes, not to actual candidate emails.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* {!advancedOptions.schedule_interviews && (
                      <div className="setting-row">
                        <label>
                          Max candidates to schedule:
                          <input 
                            type="number" 
                            min="1" 
                            max="10" 
                            value={advancedOptions.top_candidates_count}
                            onChange={(e) => setAdvancedOptions({
                              ...advancedOptions, 
                              top_candidates_count: parseInt(e.target.value)
                            })}
                            style={{marginLeft: '10px', width: '60px'}}
                            disabled={true}
                            title="Enable scheduling to configure this option"
                          />
                        </label>
                      </div>
                    )} */}
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button 
                  className="primary-btn process-btn"
                  onClick={handleBulkScoring}
                  disabled={processing || !jobDescription.trim()}
                >
                  {processing ? (
                    <>
                      <FaSpinner className="spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      Process Resumes
                    </>
                  )}
                </button>
              </div>

              {processing && (
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  {processingStatus ? (
                    <div className="progress-details">
                      {processingStatus.fileName ? (
                        <>
                          <p>Processing resume {processingStatus.current} of {processingStatus.total}</p>
                          <p className="current-file">Current: {processingStatus.fileName}</p>
                        </>
                      ) : processingStatus.message ? (
                        <>
                          <p>Processing {processingStatus.current} of {processingStatus.total} resumes</p>
                          <p className="current-file">{processingStatus.message}</p>
                        </>
                      ) : (
                        <p>Processing resume {processingStatus.current} of {processingStatus.total}</p>
                      )}
                      <p className="progress-percentage">{Math.round(uploadProgress)}% Complete</p>
                    </div>
                  ) : (
                    <p>Processing resumes... {Math.round(uploadProgress)}%</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'single-score' && (
          <div className="single-score-tab">
            <div className="upload-section">
              <div className="upload-area">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="resume-upload" className="upload-label">
                  <FaUpload className="upload-icon" />
                  <span>Click to upload resume (PDF, DOCX, DOC)</span>
                  <small>Maximum file size: 10MB</small>
                </label>
              </div>

              <div className="job-description-section">
                <label>Job Description *</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Enter job description for matching..."
                  rows="6"
                  className="job-description-input"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="results-tab">
            {summaryStats && (
              <div className="summary-stats">
                <div className="stat-card">
                  <div className="stat-value">{summaryStats.average_score?.toFixed(1) || 0}</div>
                  <div className="stat-label">Average Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{summaryStats.candidates_above_80 || 0}</div>
                  <div className="stat-label">Top Candidates (80+)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{summaryStats.candidates_above_70 || 0}</div>
                  <div className="stat-label">Good Candidates (70+)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{results.length}</div>
                  <div className="stat-label">Total Processed</div>
                </div>
              </div>
            )}

            <div className="results-controls">
              <div className="search-filter-section">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select 
                  value={scoreFilter} 
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Scores</option>
                  <option value="high">High (80+)</option>
                  <option value="medium">Medium (60-79)</option>
                  <option value="low">Low (&lt;60)</option>
                </select>

                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="score">Sort by Score</option>
                  <option value="candidate_name">Sort by Name</option>
                  <option value="filename">Sort by Filename</option>
                </select>

                <button
                  className="sort-order-btn"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              <div className="action-buttons">
                <button 
                  className="secondary-btn"
                  onClick={downloadCSV}
                  disabled={!results.length}
                >
                  <FaDownload />
                  Export CSV
                </button>
                
                {results.length > 0 && (
                  <button 
                    className="secondary-btn"
                    onClick={() => window.open(`${API_URL}/api/resume-scorer/download-latest-csv`, '_blank')}
                  >
                    <FaDownload />
                    Download Latest
                  </button>
                )}
                
                {filteredResults.filter(r => r.email_id && r.score >= 70).length > 0 && (
                  <button 
                    className="primary-btn bulk-schedule-btn"
                    onClick={handleBulkScheduleInterview}
                    disabled={true}
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  >
                    <FaCalendarPlus />
                    Bulk Schedule Top Candidates
                  </button>
                )}
              </div>
            </div>

            <div className="results-table-container">
              {filteredResults.length > 0 ? (
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Score</th>
                      <th>Contact</th>
                      <th>Experience</th>
                      <th>Skills</th>
                      <th>Recommendation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result, index) => (
                      <tr key={index}>
                        <td>
                          <div className="candidate-info">
                            <strong>{result.candidate_name}</strong>
                            <small>{result.filename}</small>
                          </div>
                        </td>
                        <td>
                          <div className={getScoreBadgeClass(result.score)}>
                            {result.score.toFixed(1)}
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            {result.email_id && <div>📧 {result.email_id}</div>}
                            {result.phone_number && <div>📞 {result.phone_number}</div>}
                          </div>
                        </td>
                        <td>
                          {result.experience_years ? `${result.experience_years} years` : 'Not specified'}
                        </td>
                        <td>
                          <div className="skills-list">
                            {(result.extracted_skills || []).slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="skill-tag">{skill}</span>
                            ))}
                            {(result.extracted_skills || []).length > 3 && (
                              <span className="skill-tag more">+{(result.extracted_skills || []).length - 3} more</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`recommendation ${result.recommendation.toLowerCase().includes('hire') ? 'positive' : 'neutral'}`}>
                            {result.recommendation}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            <button 
                              className="action-btn view-btn" 
                              title="View Details"
                              onClick={() => handleViewDetails(result)}
                              disabled={true}
                              style={{ opacity: 0.5, cursor: 'not-allowed' }}
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="action-btn schedule-btn" 
                              title="Schedule Interview"
                              onClick={() => handleScheduleInterview(result)}
                              disabled={true}
                              style={{ opacity: 0.5, cursor: 'not-allowed' }}
                            >
                              <FaCalendarPlus />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-results">
                  <p>No results to display. Process some resumes to see scores here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Candidate Details Modal */}
      {showDetailsModal && selectedCandidate && (
        <div className="modal-overlay candidate-details-modal" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Candidate Details - {selectedCandidate.candidate_name}</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="candidate-details-grid">
                {/* Left Column - Basic Info and Scoring */}
                <div className="details-left-column">
                  <div className="detail-section">
                    <h4>👤 Basic Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Name:</span>
                        <span className="info-value">{selectedCandidate.candidate_name}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">File:</span>
                        <span className="info-value">{selectedCandidate.filename}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{selectedCandidate.email_id || 'Not provided'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{selectedCandidate.phone_number || 'Not provided'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Experience:</span>
                        <span className="info-value">{selectedCandidate.experience_years ? `${selectedCandidate.experience_years} years` : 'Not specified'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Education:</span>
                        <span className="info-value">{selectedCandidate.education_level || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Scoring Details</h4>
                    <div className="score-display">
                      <div className={getScoreBadgeClass(selectedCandidate.score) + ' large-score'}>
                        {selectedCandidate.score.toFixed(1)}/100
                      </div>
                      <div className="score-breakdown">
                        <p><strong>Reasoning:</strong></p>
                        <div className="score-reason">{selectedCandidate.score_reason}</div>
                        <p><strong>Recommendation:</strong> 
                          <span className={`recommendation ${selectedCandidate.recommendation.toLowerCase().includes('hire') ? 'positive' : 'neutral'}`}>
                            {selectedCandidate.recommendation}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Skills, Certifications, Strengths, Weaknesses */}
                <div className="details-right-column">
                  {selectedCandidate.extracted_skills && selectedCandidate.extracted_skills.length > 0 && (
                    <div className="detail-section">
                      <h4>🛠️ Skills</h4>
                      <div className="skills-grid">
                        {selectedCandidate.extracted_skills.map((skill, idx) => (
                          <span key={idx} className="skill-tag enhanced">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCandidate.certifications && selectedCandidate.certifications.length > 0 && (
                    <div className="detail-section">
                      <h4>🏆 Certifications</h4>
                      <div className="certifications-list">
                        {selectedCandidate.certifications.map((cert, idx) => (
                          <div key={idx} className="certification-item">📜 {cert}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="strengths-weaknesses-grid">
                    {selectedCandidate.strengths && selectedCandidate.strengths.length > 0 && (
                      <div className="detail-section">
                        <h4>Strengths</h4>
                        <ul className="enhanced-list strengths-list">
                          {selectedCandidate.strengths.map((strength, idx) => (
                            <li key={idx}>✅ {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedCandidate.weaknesses && selectedCandidate.weaknesses.length > 0 && (
                      <div className="detail-section">
                        <h4>Areas for Improvement</h4>
                        <ul className="enhanced-list weaknesses-list">
                          {selectedCandidate.weaknesses.map((weakness, idx) => (
                            <li key={idx}>🔄 {weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="secondary-btn" 
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              {selectedCandidate.email_id && (
                <button 
                  className="primary-btn" 
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleScheduleInterview(selectedCandidate);
                  }}
                  disabled={true}
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                >
                  <FaCalendarPlus /> Schedule Interview
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewModal && selectedCandidate && (
        <div className="modal-overlay" onClick={() => setShowInterviewModal(false)}>
          <div className="modal-content interview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Interview - {selectedCandidate.candidate_name}</h3>
              <button className="close-btn" onClick={() => setShowInterviewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <InterviewSchedulingForm
                candidate={selectedCandidate}
                onSchedule={scheduleInterviewAPI}
                onCancel={() => setShowInterviewModal(false)}
                isLoading={interviewScheduling}
                jobDescription={jobDescription}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Interview Scheduling Modal */}
      {showBulkInterviewModal && selectedCandidatesForBulk.length > 0 && (
        <div className="modal-overlay bulk-interview-modal" onClick={() => setShowBulkInterviewModal(false)}>
          <div className="modal-content bulk-interview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Bulk Interview Scheduling</h3>
              <button className="close-btn" onClick={() => setShowBulkInterviewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <BulkInterviewSchedulingForm
                candidates={selectedCandidatesForBulk}
                onSchedule={scheduleBulkInterviewAPI}
                onCancel={() => setShowBulkInterviewModal(false)}
                isLoading={bulkInterviewScheduling}
                jobDescription={jobDescription}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeScorer;