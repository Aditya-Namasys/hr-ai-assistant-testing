import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Analytics.css';

const AttritionAnalysis = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [individualLoading, setIndividualLoading] = useState({});

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await api.getAttritionAnalysis(forceRefresh);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching attrition analysis data:', error);
      setAnalyticsData({ error: error.message || 'An unknown error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  if (loading) {
    return <div className="loading-container">Loading Attrition Analysis...</div>;
  }

  if (!analyticsData || analyticsData.error) {
    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Attrition Analysis Overview</h1>
        </div>
        <div className="loading-container">
          <p>Error loading attrition data.</p>
          {analyticsData && analyticsData.error && <p><strong>Reason:</strong> {analyticsData.error}</p>}
          <p>Please ensure your OpenAI API key is set in the backend's .env file and try again.</p>
          <button onClick={() => fetchData(true)} className="refresh-button">Try Again</button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(analyticsData) || analyticsData.length === 0) {
    return
    <div> No attrition analysis data available.</div >
  }

  const handleRefresh = async (employeeId) => {
    setIndividualLoading(prev => ({ ...prev, [employeeId]: true }));
    try {
      const refreshedData = await api.refreshAttritionAnalysis(employeeId);
      setAnalyticsData(currentData => 
        currentData.map(item => 
          item.employee_id === employeeId ? { ...refreshedData, employee_name: item.employee_name } : item
        )
      );
    } catch (error) {
      console.error(`Error refreshing analysis for employee ${employeeId}:`, error);
      // Optionally, show an error message to the user
    } finally {
      setIndividualLoading(prev => ({ ...prev, [employeeId]: false }));
    }
  };

  const getRiskColor = (risk) => {
    if (risk > 70) return 'risk-high';
    if (risk > 40) return 'risk-medium';
    return 'risk-low';
  };

  return (
    <div className="dashboard-container">
      <div className="section-header">
        <div className="header-content">
          <h2 className="section-title">
            AI-Powered &nbsp;Attrition &nbsp; Analysis
          </h2>
          <p className="section-subtitle">
            Identify at-risk employees and retention strategies
          </p>
        </div>
        <div className="header-actions">
          <button onClick={() => fetchData(true)} className="refresh-all-btn">
            Refresh All
          </button>
        </div>
      </div>
      <div className="dashboard-grid">
        {analyticsData.map((result) => {
          if (result.error || !result.ai_response) {
            return (
              <div key={result.employee_id} className="card error-card">
                <h3>
                  {result.employee_name || `Employee ID: ${result.employee_id}`}
                </h3>
                <p>
                  {result.error || "AI analysis data is missing or invalid."}
                </p>
              </div>
            );
          }

          const {
            risk_score,
            risk_level,
            summary,
            key_factors,
            retention_strategies,
          } = result.ai_response;

          return (
            <div key={result.employee_id} className="card">
              <div className="card-header">
                <h3>{result.employee_name}</h3>
                <div className={`risk-indicator ${getRiskColor(risk_score)}`}>
                  <span className="risk-score-value">{risk_score}%</span>
                  <small className="risk-level-label">{risk_level}</small>
                </div>
              </div>
              <div className="card-content">
                <div className="analysis-container">
                  <div className="summary-section">
                    <h4 className="section-title">Analysis Summary</h4>
                    <p className="summary-text">{summary}</p>
                  </div>

                  <div className="factors-section">
                    <h4 className="section-title">Risk Factors</h4>
                    <ul className="analysis-list">
                      {key_factors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="strategies-section">
                    <h4 className="section-title">Retention Strategies</h4>
                    <ul className="analysis-list">
                      {retention_strategies.map((strategy, index) => (
                        <li key={index}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button
                  onClick={() => handleRefresh(result.employee_id)}
                  disabled={individualLoading[result.employee_id]}
                  className="refresh-button-small"
                >
                  {individualLoading[result.employee_id]
                    ? "Refreshing..."
                    : "Refresh"}
                </button>
                <small className="last-updated">
                  Last Updated: {new Date(result.last_updated).toLocaleString()}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttritionAnalysis;
