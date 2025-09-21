import React, { useState } from 'react';
import { FileText, MessageSquare, Shield, Tag, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import './GrievanceSubmitForm.css';
import api from '../../services/api';

const GrievanceType = {
    HARASSMENT: "Harassment",
    WORKLOAD: "Workload",
    SALARY_DISCREPANCY: "Salary Discrepancy",
    INTERPERSONAL_CONFLICT: "Interpersonal Conflict",
    POLICY_VIOLATION: "Policy Violation",
    HEALTH_SAFETY: "Health & Safety",
    DISCRIMINATION: "Discrimination",
    OTHER: "Other"
};

function GrievanceSubmitForm() {
    const [formData, setFormData] = useState({
        grievance_type: 'Other',
        description: '',
        attachments: [],
        confidential: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAttachmentChange = (e) => {
        setFormData(prev => ({
            ...prev,
            attachments: e.target.value.split(',').map(item => item.trim()).filter(item => item),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        if (formData.description.length < 20) {
            setError('Description must be at least 20 characters long.');
            setIsLoading(false);
            return;
        }

        try {
            const submissionData = {
                grievance_type: formData.grievance_type,
                description: formData.description,
                confidential: formData.confidential,
                attachments: formData.attachments.join(', '),
            };

            const response = await api.submitGrievance(submissionData);
            setSuccessMessage(`Grievance submitted successfully! Your reference ID is: ${response.id}`);
            setFormData({
                grievance_type: 'Other',
                description: '',
                attachments: [],
                confidential: false
            });
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to submit grievance. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="section-header">
                <h2 className="section-title">Submit a Grievance</h2>
                <p className="section-subtitle">Your voice matters. Share your concerns with us securely.</p>
            </div>
            
            <div className="card">
                
                <form onSubmit={handleSubmit} className="grievance-form">
                    <div className="input-group">
                        <Tag className="input-icon" size={20} />
                        <select name="grievance_type" value={formData.grievance_type} onChange={handleChange} className="form-input">
                            {Object.entries(GrievanceType).map(([key, value]) => (
                                <option key={key} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <MessageSquare className="input-icon" size={20} />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Describe your grievance in detail (min 20 characters)..."
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FileText className="input-icon" size={20} />
                        <input
                            type="text"
                            name="attachments"
                            value={formData.attachments.join(', ')}
                            onChange={handleAttachmentChange}
                            className="form-input"
                            placeholder="Attachment URLs (optional, comma-separated)"
                        />
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            name="confidential"
                            id="confidential-checkbox"
                            checked={formData.confidential}
                            onChange={handleChange}
                            className="form-checkbox"
                        />
                         <Shield className="checkbox-icon" size={20} />
                        <label htmlFor="confidential-checkbox" className="checkbox-label">
                            Mark this grievance as confidential
                        </label>
                    </div>

                    {error && (
                        <div className="alert error-alert">
                            <AlertCircle className="alert-icon" />
                            <p>{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="alert success-alert">
                            <CheckCircle className="alert-icon" />
                            <p>{successMessage}</p>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="submit-btn">
                        {isLoading ? (
                            <>
                                <Loader className="spinner" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Grievance'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default GrievanceSubmitForm;
