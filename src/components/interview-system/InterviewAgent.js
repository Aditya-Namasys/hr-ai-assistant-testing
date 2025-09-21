import React, { useState, useEffect } from "react";
import InterviewPage from "./InterviewPage";
import "./InterviewAgent.css";

const API_URL = process.env.REACT_APP_API_URL;

function InterviewAgent() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewType, setInterviewType] = useState("standard");
  const [advancedConfig, setAdvancedConfig] = useState({
    maxQuestions: 10,
    targetDuration: 30,
    difficultyPreference: "adaptive",
    focusAreas: [],
  });
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [systemHealth, setSystemHealth] = useState({
    status: "unknown",
    services: {},
  });

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/interview-agent/advanced/health`
      );
      const health = await response.json();
      setSystemHealth(health);
    } catch (error) {
      console.error("Health check failed:", error);
      setSystemHealth({
        status: "unhealthy",
        services: { interview_agent: "unavailable" },
      });
    }
  };

  const handleError = (error, context = "") => {
    console.error(`Error in ${context}:`, error);

    if (error.retry_suggested && retryCount < 3) {
      setError({
        type: error.error_type || "general_error",
        message: error.message || "An error occurred",
        canRetry: true,
        recoveryActions: error.recovery_actions || [],
      });
    } else {
      setError({
        type: error.error_type || "general_error",
        message: error.message || "An error occurred",
        canRetry: false,
        recoveryActions: error.recovery_actions || [],
      });
    }

    setIsLoading(false);
  };

  const retryOperation = async () => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    await startInterview({ preventDefault: () => {} });
  };

  const startInterview = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Check if advanced features are available
      const useAdvanced =
        interviewType === "advanced" &&
        systemHealth.status === "healthy" &&
        systemHealth.service_status?.interview_agent === "active";

      if (useAdvanced) {
        await startAdvancedInterview();
      } else {
        await startStandardInterview();
      }
    } catch (error) {
      handleError(error, "start_interview");
    }
  };

  const startStandardInterview = async () => {
    const form = new FormData();
    form.append("job_description", jobDescription);
    form.append("resume_file", resumeFile);

    const res = await fetch(`${API_URL}/start-interview`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({
        detail: "An unknown server error occurred.",
        error_type: "server_error",
      }));
      throw errorData;
    }

    const data = await res.json();
    setInterviewId(data.interview_id);
    setInitialData({
      introduction_text: data.introduction_text,
      introduction_audio: data.introduction_audio,
      question_text: data.question_text,
      audio_data: data.audio_data,
      question_number: data.question_number,
      interview_type: "standard",
    });
    setIsLoading(false);
  };

  const startAdvancedInterview = async () => {
    // First, extract resume text
    const resumeText = await extractResumeText();

    const requestData = {
      interview_id: generateInterviewId(),
      job_description: jobDescription,
      resume_text: resumeText,
      max_questions: advancedConfig.maxQuestions,
      target_duration: advancedConfig.targetDuration,
      difficulty_preference: advancedConfig.difficultyPreference,
      focus_areas: advancedConfig.focusAreas,
    };

    const res = await fetch(`${API_URL}/api/interview-agent/advanced/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

     if (!res.ok) {
      const errorData = await res.json().catch(() => ({
        detail: "Failed to start advanced interview",
        error_type: "advanced_interview_error",
      }));
      throw errorData;
    }

    const data = await res.json();
    setInterviewId(data.interview_id);
    setInitialData({
      introduction_text: data.introduction_text,
      introduction_audio: data.introduction_audio,
      question_text: data.question_text,
      audio_data: data.audio_data,
      question_number: data.question_number,
      interview_type: "advanced",
      interview_state: data.interview_state,
      response_analysis: data.response_analysis,
    });
    setIsLoading(false);
  };

  const extractResumeText = async () => {
    if (!resumeFile) throw new Error("No resume file provided");

    const formData = new FormData();
    formData.append("file", resumeFile);

    const response = await fetch(`${API_URL}/api/utils/extract-text`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to extract resume text");
    }

    const data = await response.json();
    return data.text;
  };

  const generateInterviewId = () => {
    return `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  if (initialData) {
    return <InterviewPage interviewId={interviewId} {...initialData} />;
  }

  return (
    <div className="dashboard-container">
      <div className="section-header">
        <h2 className="section-title">           Technical Interview</h2>
        <p className="section-subtitle">
          Start your AI-powered technical interview session
        </p>

        {/* System Health Indicator */}
        <div className={`system-health-indicator ${systemHealth.status}`}>
          <div className="health-status">
            <div className={`health-dot ${systemHealth.status}`}></div>
            <span>System Status: {systemHealth.status}</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-container">
          <div className="error-message">
            <h3>❌ {error.type.replace("_", " ").toUpperCase()}</h3>
            <p>{error.message}</p>
            {error.canRetry && (
              <button onClick={retryOperation} className="retry-btn">
                🔄 Retry ({3 - retryCount} attempts left)
              </button>
            )}
            {error.recoveryActions && error.recoveryActions.length > 0 && (
              <div className="recovery-actions">
                <p>Suggested actions:</p>
                <ul>
                  {error.recoveryActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="interview-setup-card fade-in">
        <form onSubmit={startInterview} className="interview-form">
          {/* Interview Type Selection */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Interview Type</span>
            </label>
            <div className="interview-type-selection">
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="standard"
                    checked={interviewType === "standard"}
                    onChange={(e) => setInterviewType(e.target.value)}
                  />
                  <span className="radio-text">Standard Interview</span>
                  <span className="radio-hint">
                    Basic AI interview with standard questions
                  </span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="advanced"
                    checked={interviewType === "advanced"}
                    onChange={(e) => setInterviewType(e.target.value)}
                    disabled={systemHealth.status !== "healthy"}
                  />
                  <span className="radio-text">Advanced Interview</span>
                  <span className="radio-hint">
                    AI interview with memory, adaptive flow, and comprehensive
                    analysis
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Configuration */}
          {interviewType === "advanced" && (
            <div className="advanced-config">
              <h3>Advanced Interview Configuration</h3>

              <div className="config-row">
                <div className="form-group">
                  <label className="form-label">Max Questions</label>
                  <input
                    type="number"
                    min="5"
                    max="20"
                    value={advancedConfig.maxQuestions}
                    onChange={(e) =>
                      setAdvancedConfig({
                        ...advancedConfig,
                        maxQuestions: parseInt(e.target.value),
                      })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Target Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="90"
                    value={advancedConfig.targetDuration}
                    onChange={(e) =>
                      setAdvancedConfig({
                        ...advancedConfig,
                        targetDuration: parseInt(e.target.value),
                      })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty Preference</label>
                <select
                  value={advancedConfig.difficultyPreference}
                  onChange={(e) =>
                    setAdvancedConfig({
                      ...advancedConfig,
                      difficultyPreference: e.target.value,
                    })
                  }
                  className="form-select"
                >
                  <option value="adaptive">Adaptive (Recommended)</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Focus Areas (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., JavaScript, React, Node.js (comma-separated)"
                  value={advancedConfig.focusAreas.join(", ")}
                  onChange={(e) =>
                    setAdvancedConfig({
                      ...advancedConfig,
                      focusAreas: e.target.value
                        .split(",")
                        .map((area) => area.trim())
                        .filter((area) => area),
                    })
                  }
                  className="form-input"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Job Description</span>
              <span className="label-required">*</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Enter the job description for this interview position..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              rows="6"
            />
            <span className="form-hint">
              Provide a detailed job description to help the AI tailor interview
              questions
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Resume Upload</span>
              <span className="label-required">*</span>
            </label>
            <div className="file-upload-container">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                required
                className="file-input"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="file-upload-label">
                <div className="file-upload-content">
                  <div className="file-upload-icon">📄</div>
                  <div className="file-upload-text">
                    {resumeFile ? (
                      <span style={{ color: "#667eea", fontWeight: "700" }}>
                        ✓ {resumeFile.name}
                      </span>
                    ) : (
                      "Choose resume file"
                    )}
                  </div>
                  <div className="file-upload-hint">
                    PDF, DOC, or DOCX format
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className="start-interview-btn"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Starting {interviewType === "advanced" ? "Advanced " : ""}
                  Interview...
                </>
              ) : (
                <>
                  <span className="btn-icon">🎯</span>
                  Start {interviewType === "advanced" ? "Advanced " : ""}
                  Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InterviewAgent;
