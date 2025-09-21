import React, { useState } from 'react';
import './ChurnAnalysis.css'; 

const ChurnRiskCalculator = () => {
    const [formData, setFormData] = useState({ satisfaction: '', performance: '', tenure: '' });
    const [risk, setRisk] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setRisk(null);
        try {
            // Mock calculation
            const { satisfaction, performance, tenure } = formData;
            const calculatedRisk = ((10 - (satisfaction * 2)) + (5 - performance) + (5 - tenure)) / 15;
            setTimeout(() => {
                setRisk(Math.max(0, Math.min(1, calculatedRisk)).toFixed(2));
                setLoading(false);
            }, 500);
        } catch (error) {
            setLoading(false);
        }
    };

    const getRiskColor = (r) => {
        if (r > 0.7) return 'var(--churn-risk-high)';
        if (r > 0.4) return 'var(--churn-risk-medium)';
        return 'var(--churn-risk-low)';
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Manual Churn Risk Calculator</h3>
            </div>
            <div className="list">
            <form onSubmit={handleSubmit} className="calculator-form">
                <div className="form-group">
                    <label>Employee Satisfaction (1-5)</label>
                    <input type="number" name="satisfaction" value={formData.satisfaction} onChange={handleChange} min="1" max="5" required />
                </div>
                <div className="form-group">
                    <label>Last Performance Score (1-5)</label>
                    <input type="number" name="performance" value={formData.performance} onChange={handleChange} min="1" max="5" required />
                </div>
                <div className="form-group">
                    <label>Tenure (in years)</label>
                    <input type="number" name="tenure" value={formData.tenure} onChange={handleChange} min="0" step="0.1" required />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Calculating...' : 'Calculate Risk'}
                </button>
            </form>
            {risk !== null && (
                <div className="risk-result-container">
                    <div className="risk-score-display">
                        Predicted Churn Risk: 
                        <span className="score" style={{ color: getRiskColor(risk) }}>
                            {(risk * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="risk-progress-bar">
                        <div 
                            className="risk-progress-bar-inner"
                            style={{ 
                                width: `${risk * 100}%`, 
                                backgroundColor: getRiskColor(risk) 
                            }}
                        ></div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default ChurnRiskCalculator;
