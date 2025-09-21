import React, { useState, useEffect, useCallback } from "react";
import {
  FaUsers,
  FaTrash,
  FaSearch,
  FaFilter,
  FaPlus,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaPlay,
  FaChartBar,
  FaFileDownload,
} from "react-icons/fa";
import InterviewStatusBadge from "./InterviewStatusBadge";
import InterviewReportViewer from "./InterviewReportViewer";
import "./EnhancedInterviewManager.css";

const API_URL = process.env.REACT_APP_API_URL;

const EnhancedInterviewManager = ({
  adminId,
  onSwitchToCreate,
  newlyCreatedInterview,
  onInterviewAdded,
}) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [interviewsPerPage] = useState(10);
  const [loadingActions, setLoadingActions] = useState({});
  const [actionFeedback, setActionFeedback] = useState({});
  const [viewingReport, setViewingReport] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (newlyCreatedInterview) {
      setInterviews((prev) => [newlyCreatedInterview, ...prev]);
      if (onInterviewAdded) {
        onInterviewAdded();
      }
    }
  }, [newlyCreatedInterview, onInterviewAdded]);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/dashboard/recent-interviews?adminId=${adminId}&status=${statusFilter}&limit=50`
      );

      if (!response.ok) {
        console.error("Failed to fetch interviews:", response.status);
        setInterviews([]);
        return;
      }

      const data = await response.json();
      if (data.success || data.interviews) {
        setInterviews(data.interviews || []);
      } else {
        setInterviews([]);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [adminId, statusFilter]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleDeleteInterview = async (interviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this interview? This action cannot be undone."
    );

    if (!confirmed) return;

    setLoadingActions((prev) => ({ ...prev, [`${interviewId}_delete`]: true }));

    try {
      const response = await fetch(`${API_URL}/api/interviews/${interviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setInterviews((prev) =>
          prev.filter((interview) => interview.id !== interviewId)
        );
        showFeedback(interviewId, "success", "Interview deleted successfully");
      } else {
        showFeedback(interviewId, "error", "Failed to delete interview");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      showFeedback(interviewId, "error", "Error deleting interview");
    } finally {
      setLoadingActions((prev) => ({
        ...prev,
        [`${interviewId}_delete`]: false,
      }));
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidate_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      interview.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.candidate_email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastInterview = currentPage * interviewsPerPage;
  const indexOfFirstInterview = indexOfLastInterview - interviewsPerPage;
  const currentInterviews = filteredInterviews.slice(
    indexOfFirstInterview,
    indexOfLastInterview
  );
  const totalPages = Math.ceil(filteredInterviews.length / interviewsPerPage);

  const showFeedback = (interviewId, type, message) => {
    setActionFeedback((prev) => ({
      ...prev,
      [interviewId]: { type, message },
    }));
    setTimeout(() => {
      setActionFeedback((prev) => ({ ...prev, [interviewId]: null }));
    }, 3000);
  };

  const handleViewInterview = async (interview) => {
    const interviewId = interview.id || interview.interview_id;
    setLoadingActions((prev) => ({ ...prev, [`${interviewId}_view`]: true }));

    try {
      const interviewLink = interview.interview_link;
      if (interviewLink) {
        const fullLink = interviewLink.startsWith("http")
          ? interviewLink
          : `${window.location.origin}${interviewLink}`;
        window.open(fullLink, "_blank");
        showFeedback(interviewId, "success", "Interview opened in new tab");
      } else {
        showFeedback(interviewId, "error", "Interview link not available");
      }
    } catch (error) {
      showFeedback(interviewId, "error", "Failed to open interview");
    } finally {
      setLoadingActions((prev) => ({
        ...prev,
        [`${interviewId}_view`]: false,
      }));
    }
  };

  const handleDownloadReport = async (interview) => {
    const interviewId = interview.id || interview.interview_id;
    setLoadingActions((prev) => ({
      ...prev,
      [`${interviewId}_download`]: true,
    }));

    try {
      const reportResponse = await fetch(
        `${API_URL}/api/admin/interview/${interviewId}/report`
      );

      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        if (reportData.success && reportData.report) {
          const htmlContent = generateHTMLReport(reportData.report, interview);
          const blob = new Blob([htmlContent], { type: "text/html" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = `interview-report-${interview.candidate_name}-${interviewId}.html`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          showFeedback(
            interviewId,
            "success",
            "Report downloaded successfully"
          );
        } else {
          throw new Error("Invalid report data received");
        }
      } else {
        throw new Error(`HTTP ${reportResponse.status}`);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      showFeedback(interviewId, "error", "Failed to download report");
    } finally {
      setLoadingActions((prev) => ({
        ...prev,
        [`${interviewId}_download`]: false,
      }));
    }
  };

  const handleViewDetails = async (interview) => {
    const interviewId = interview.id || interview.interview_id;
    setLoadingActions((prev) => ({
      ...prev,
      [`${interviewId}_details`]: true,
    }));

    try {
      const response = await fetch(
        `${API_URL}/api/interview-analysis/get-interview-analysis/${interviewId}`
      );
      if (response.ok) {
        const reportData = await response.json();
        setReportData(reportData);
        setViewingReport(interviewId);
        showFeedback(interviewId, "success", "Report loaded successfully");
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error loading interview details:", error);
      showFeedback(interviewId, "error", "Failed to load interview report");
    } finally {
      setLoadingActions((prev) => ({
        ...prev,
        [`${interviewId}_details`]: false,
      }));
    }
  };

  const EmptyState = () => (
    <div className="empty-state">
      <FaUsers className="empty-icon" />
      <h3>No Interviews Found</h3>
      <p>
        You haven't created any interviews yet, or none match your current
        filters.
      </p>
      <button className="create-first-btn" onClick={onSwitchToCreate}>
        <FaPlus />
        Create Your First Interview
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="interview-manager-loading">
        <FaSpinner className="spinner" />
        <p>Loading interviews...</p>
      </div>
    );
  }

  if (viewingReport && reportData) {
    return (
      <InterviewReportViewer
        report={reportData}
        onBack={() => {
          setViewingReport(null);
          setReportData(null);
        }}
      />
    );
  }

  return (
    <div className="enhanced-interview-manager">
      {/* Header */}
      <div className="manager-header">
        <div className="header-content">
          <h2>Interview Management</h2>
          <p>Manage and monitor all your interviews</p>
        </div>

        <button className="create-interview-btn" onClick={onSwitchToCreate}>
          <FaPlus />
          Create New Interview
        </button>
      </div>

      {/* Controls */}
      <div className="manager-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by candidate name, job title, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <FaFilter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="ready">Ready</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="manager-stats">
        <div className="stat-item">
          <span className="stat-number">{interviews.length}</span>
          <span className="stat-label">Total Interviews</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {interviews.filter((i) => i.status === "completed").length}
          </span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {interviews.filter((i) => i.status === "in_progress").length}
          </span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {interviews.filter((i) => i.status === "scheduled").length}
          </span>
          <span className="stat-label">Scheduled</span>
        </div>
      </div>

      {/* Interview List */}
      {filteredInterviews.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="interviews-table">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInterviews.map((interview) => (
                  <tr key={interview.id || interview.interview_id}>
                    <td>
                      <div className="candidate-info">
                        <strong>{interview.candidate_name}</strong>
                        <small>{interview.candidate_email}</small>
                      </div>
                    </td>
                    <td>{interview.job_title}</td>
                    <td>
                      <span
                        className={`type-badge ${
                          interview.interview_type || "quick"
                        }`}
                      >
                        {interview.interview_type || "Quick"}
                      </span>
                    </td>
                    <td>
                      <InterviewStatusBadge status={interview.status} />
                    </td>
                    <td>
                      {new Date(interview.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          title="View Interview Report"
                          onClick={() => handleViewDetails(interview)}
                          // disabled={loadingActions[`${interview.id || interview.interview_id}_details`] || interview.status !== 'completed'}
                        >
                          {loadingActions[
                            `${interview.id || interview.interview_id}_details`
                          ] ? (
                            <FaSpinner className="spinning" />
                          ) : (
                            <FaChartBar />
                          )}
                        </button>
                        {interview.interview_link && (
                          <button
                            className="action-btn primary"
                            title="Take Interview"
                            onClick={() => handleViewInterview(interview)}
                            disabled={
                              loadingActions[
                                `${interview.id || interview.interview_id}_view`
                              ]
                            }
                          >
                            {loadingActions[
                              `${interview.id || interview.interview_id}_view`
                            ] ? (
                              <FaSpinner className="spinning" />
                            ) : (
                              <FaPlay />
                            )}
                          </button>
                        )}
                        {interview.status === "completed" && (
                          <button
                            className="action-btn download"
                            title="Download Report"
                            onClick={() => handleDownloadReport(interview)}
                            disabled={
                              loadingActions[
                                `${
                                  interview.id || interview.interview_id
                                }_download`
                              ]
                            }
                          >
                            {loadingActions[
                              `${
                                interview.id || interview.interview_id
                              }_download`
                            ] ? (
                              <FaSpinner className="spinning" />
                            ) : (
                              <FaFileDownload />
                            )}
                          </button>
                        )}
                        <button
                          className="action-btn delete"
                          title="Delete Interview"
                          onClick={() =>
                            handleDeleteInterview(
                              interview.id || interview.interview_id
                            )
                          }
                          disabled={
                            loadingActions[
                              `${interview.id || interview.interview_id}_delete`
                            ]
                          }
                          style={{ marginBottom: "15px" }}
                        >
                          {loadingActions[
                            `${interview.id || interview.interview_id}_delete`
                          ] ? (
                            <FaSpinner className="spinning" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                        {actionFeedback[
                          interview.id || interview.interview_id
                        ] && (
                          <div
                            className={`action-feedback ${
                              actionFeedback[
                                interview.id || interview.interview_id
                              ].type
                            }`}
                          >
                            {actionFeedback[
                              interview.id || interview.interview_id
                            ].type === "success" ? (
                              <FaCheck />
                            ) : (
                              <FaExclamationTriangle />
                            )}
                            <span>
                              {
                                actionFeedback[
                                  interview.id || interview.interview_id
                                ].message
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const generateHTMLReport = (report, interview) => {
  const { scores, analytics, responses, behavior_stats } = report;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Report - ${interview.candidate_name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .report-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .header h1 { color: #1f2937; margin: 0; }
        .meta-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .meta-item { background: #f8fafc; padding: 15px; border-radius: 6px; }
        .meta-label { font-weight: bold; color: #4b5563; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .score-item { text-align: center; padding: 20px; background: #f0f9ff; border-radius: 8px; }
        .score-value { font-size: 2em; font-weight: bold; color: #3b82f6; }
        .score-label { color: #6b7280; font-size: 0.9em; }
        .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .analytics-item { padding: 15px; background: #f9fafb; border-radius: 6px; border-left: 4px solid #10b981; }
        .response-item { margin-bottom: 20px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .question { font-weight: bold; color: #1f2937; margin-bottom: 10px; }
        .answer { color: #4b5563; line-height: 1.6; }
        .behavior-stats { display: grid; gap: 10px; }
        .behavior-item { padding: 10px 15px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b; }
        @media print { body { margin: 0; background: white; } .report-container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>Interview Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="meta-info">
            <div class="meta-item">
                <div class="meta-label">Candidate</div>
                <div>${interview.candidate_name}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Position</div>
                <div>${interview.job_title}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Email</div>
                <div>${interview.candidate_email || "Not provided"}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Interview Date</div>
                <div>${new Date(
                  interview.created_at
                ).toLocaleDateString()}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Performance Scores</h2>
            <div class="score-grid">
                <div class="score-item">
                    <div class="score-value">${scores?.overall || "N/A"}</div>
                    <div class="score-label">Overall</div>
                </div>
                <div class="score-item">
                    <div class="score-value">${
                      scores?.technical_skills || "N/A"
                    }</div>
                    <div class="score-label">Technical</div>
                </div>
                <div class="score-item">
                    <div class="score-value">${
                      scores?.communication || "N/A"
                    }</div>
                    <div class="score-label">Communication</div>
                </div>
                <div class="score-item">
                    <div class="score-value">${
                      scores?.problem_solving || "N/A"
                    }</div>
                    <div class="score-label">Problem Solving</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>Interview Analytics</h2>
            <div class="analytics-grid">
                <div class="analytics-item">
                    <div class="meta-label">Completion Rate</div>
                    <div>${
                      analytics?.completion_rate?.toFixed(1) || "N/A"
                    }%</div>
                </div>
                <div class="analytics-item">
                    <div class="meta-label">Duration</div>
                    <div>${analytics?.interview_duration || "N/A"} minutes</div>
                </div>
                <div class="analytics-item">
                    <div class="meta-label">Response Time</div>
                    <div>${analytics?.average_response_time || "N/A"}s avg</div>
                </div>
                <div class="analytics-item">
                    <div class="meta-label">Tab Switches</div>
                    <div>${analytics?.tab_switches || 0}</div>
                </div>
            </div>
        </div>
        
        ${
          responses && responses.length > 0
            ? `
        <div class="section">
            <h2>Interview Responses</h2>
            ${responses
              .map(
                (response, index) => `
                <div class="response-item">
                    <div class="question">Q${index + 1}: ${
                  response.question_text || "Question not available"
                }</div>
                    <div class="answer">${
                      response.candidate_answer || "No response recorded"
                    }</div>
                </div>
            `
              )
              .join("")}
        </div>
        `
            : ""
        }
        
        ${
          behavior_stats && Object.keys(behavior_stats).length > 0
            ? `
        <div class="section">
            <h2>Behavior Analysis</h2>
            <div class="behavior-stats">
                ${Object.entries(behavior_stats)
                  .map(
                    ([event, count]) => `
                    <div class="behavior-item">
                        ${event.replace("_", " ")}: ${count} occurrence(s)
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
        `
            : ""
        }
        
        <div class="section">
            <h2>Summary</h2>
            <p><strong>${
              interview.candidate_name
            }</strong> completed the interview for the <strong>${
    interview.job_title
  }</strong> position with an overall score of <strong>${
    scores?.overall || "N/A"
  }/100</strong>.</p>
            <p>The interview was conducted on ${new Date(
              interview.created_at
            ).toLocaleDateString()} and took approximately ${
    analytics?.interview_duration || "N/A"
  } minutes to complete.</p>
        </div>
    </div>
</body>
</html>
  `;
};

export default EnhancedInterviewManager;
