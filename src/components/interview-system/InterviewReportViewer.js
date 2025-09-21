import React from "react";
import { FaArrowLeft, FaUser, FaBriefcase, FaClock } from "react-icons/fa";
import "./InterviewReportViewer.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function InterviewReportViewer({ report, onBack }) {
  if (!report) {
    return (
      <div className="report-error">
        <h3>Report not available</h3>
        <button onClick={onBack} className="back-btn">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }

  const {
    candidate_name,
    job_description,
    overall_score,
    technical_skills,
    communication,
    problem_solving,
    confidence,
    cultural_fit,
    collaboration,
    adaptability,
    integrity_and_professionalism,
    strengths,
    weaknesses,
    red_flags,
    notable_moments,
    role_fit_notes,
    created_at,
  } = report;

  // Function to color code overall score circle
  const getScoreColor = (score) => {
    if (score >= 80) return "excellent";
    if (score >= 70) return "good";
    if (score >= 60) return "average";
    return "poor";
  };

  // Data for horizontal bar chart
  const performanceData = [
    { name: "Technical Skills", score: technical_skills || 0 },
    { name: "Communication", score: communication || 0 },
    { name: "Problem Solving", score: problem_solving || 0 },
    { name: "Confidence", score: confidence || 0 },
  ];
  const behavioralData = [
    { name: "Cultural Fit", value: cultural_fit || 0 },
    { name: "Collaboration", value: collaboration || 0 },
    { name: "Adaptability", value: adaptability || 0 },
    {
      name: "Integrity & Professionalism",
      value: integrity_and_professionalism || 0,
    },
  ];
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  return (
    <div className="report-viewer">
      {/* Header */}
      <div className="report-header">
        <div className="report-nav">
          <button onClick={onBack} className="back-btn">
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
        <div className="report-title">
          <h2>Interview Report</h2>
          <div className="report-meta">
            <span className="candidate-name">
              <FaUser /> {candidate_name}
            </span>
            <span className="job-title">
              <FaBriefcase /> {job_description}
            </span>
            <span className="completion-date">
              <FaClock /> Completed:{" "}
              {created_at ? new Date(created_at).toLocaleString() : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="report-content">
        {/* Overall Performance */}
        <div className="report-section">
          <h3>Overall Performance</h3>
          <div className="overall-score">
            {/* Circle */}
            <div className={`score-circle ${getScoreColor(overall_score)}`}>
              <div className="score-number">{overall_score}</div>
              <div className="score-label">Overall Score</div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="score-breakdown">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={performanceData}
                  layout="vertical"
                  style={{ fontSize: "17px" }}
                  margin={{ top: 20, right: 15, left: -5, bottom: 20 }} // increase left margin
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150} // make space for long names
                    tick={{ fontSize: 14 }} // smaller font
                  />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4c6fafff" radius={[5, 5, 5, 5]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Behavioral Competencies */}
        <div className="report-section">
          <h3>Behavioral Competencies</h3>

          {/* Pie Chart */}
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={behavioralData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {behavioralData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Comments & Analysis */}
        <div className="report-section">
          <h3>Comments & Analysis</h3>
          <div>
            <strong>Strengths:</strong>
            <ul>
              {strengths && strengths.length > 0 ? (
                strengths.map((s, i) => <li key={i}>{s}</li>)
              ) : (
                <li>None</li>
              )}
            </ul>
            <strong>Weaknesses:</strong>
            <ul>
              {weaknesses && weaknesses.length > 0 ? (
                weaknesses.map((w, i) => <li key={i}>{w}</li>)
              ) : (
                <li>None</li>
              )}
            </ul>
            <strong>Red Flags:</strong>
            <ul>
              {red_flags && red_flags.length > 0 ? (
                red_flags.map((r, i) => <li key={i}>{r}</li>)
              ) : (
                <li>None</li>
              )}
            </ul>
            <strong>Notable Moments:</strong>
            <ul>
              {notable_moments && notable_moments.length > 0 ? (
                notable_moments.map((n, i) => <li key={i}>{n}</li>)
              ) : (
                <li>None</li>
              )}
            </ul>
            <strong>Role Fit Notes:</strong>
            <div>{role_fit_notes || "N/A"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewReportViewer;
