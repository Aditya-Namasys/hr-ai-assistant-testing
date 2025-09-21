import React, { useState, useEffect } from 'react';
import { 
  FaFileAlt, 
  FaDownload, 
  FaCog, 
  FaSpinner,
  FaPlus,
  FaMinus,
  FaBriefcase,
  FaGraduationCap,
  FaTools,
  FaCertificate,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock
} from 'react-icons/fa';
import './JDCreator.css';

const API_URL = process.env.REACT_APP_API_URL;

const JDCreator = ({ adminId }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    location: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    minimumExperience: 3,
    maximumExperience: 5,
    salaryRange: {
      min: '',
      max: '',
      currency: 'INR'
    },
    primarySkills: [''],
    secondarySkills: [''],
    requiredQualifications: [''],
    preferredQualifications: [''],
    responsibilities: [''],
    benefits: [''],
    companyOverview: '',
    additionalRequirements: ''
  });

  const [generatedJD, setGeneratedJD] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [jdTemplate, setJdTemplate] = useState('standard');

  useEffect(() => {
    // Initialize with some default values
    setFormData(prev => ({
      ...prev,
      primarySkills: ['JavaScript', 'React', 'Node.js'],
      secondarySkills: ['MongoDB', 'AWS'],
      requiredQualifications: ['Bachelor\'s degree in Computer Science or related field'],
      preferredQualifications: ['Experience with cloud platforms'],
      responsibilities: [
        'Develop and maintain web applications',
        'Collaborate with cross-functional teams',
        'Write clean, maintainable code'
      ],
      benefits: [
        'Health insurance',
        'Flexible working hours'
      ]
    }));
  }, []);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parentField]: {
          ...prev[parentField],
          [childField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, idx) => idx === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, idx) => idx !== index)
      }));
    }
  };

  const handleGenerateJD = async () => {
    if (!formData.jobTitle.trim()) {
      alert('Please enter a job title');
      return;
    }

    setProcessing(true);
    
    try {
      const requestBody = {
        job_title: formData.jobTitle,
        department: formData.department,
        location: formData.location,
        employment_type: formData.employmentType,
        experience_level: formData.experienceLevel,
        minimum_experience: formData.minimumExperience,
        maximum_experience: formData.maximumExperience,
        salary_range: formData.salaryRange,
        primary_skills: formData.primarySkills.filter(skill => skill.trim()),
        secondary_skills: formData.secondarySkills.filter(skill => skill.trim()),
        required_qualifications: formData.requiredQualifications.filter(qual => qual.trim()),
        preferred_qualifications: formData.preferredQualifications.filter(qual => qual.trim()),
        responsibilities: formData.responsibilities.filter(resp => resp.trim()),
        benefits: formData.benefits.filter(benefit => benefit.trim()),
        company_overview: formData.companyOverview,
        additional_requirements: formData.additionalRequirements,
        template_type: jdTemplate
      };

      const response = await fetch(`${API_URL}/api/jd-creator/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate job description');
      }

      const result = await response.json();
      setGeneratedJD(result.job_description);
      
    } catch (error) {
      console.error('JD generation failed:', error);
      alert(`Error: ${error.message}`);
      
      // Fallback to client-side generation if API fails
      generateClientSideJD();
    } finally {
      setProcessing(false);
    }
  };

  const generateClientSideJD = () => {
    const jd = `# ${formData.jobTitle}
${formData.department ? `**Department:** ${formData.department}` : ''}
${formData.location ? `**Location:** ${formData.location}` : ''}
**Employment Type:** ${formData.employmentType}
**Experience Level:** ${formData.experienceLevel}

## Job Overview
We are seeking a ${formData.experienceLevel.toLowerCase()} ${formData.jobTitle} to join our ${formData.department || 'team'}. This is an excellent opportunity for a ${formData.employmentType.toLowerCase()} professional with ${formData.minimumExperience}-${formData.maximumExperience} years of experience.

${formData.companyOverview ? `## About Us\n${formData.companyOverview}\n` : ''}

## Key Responsibilities
${formData.responsibilities.filter(r => r.trim()).map(resp => `• ${resp}`).join('\n')}

## Required Qualifications
${formData.requiredQualifications.filter(q => q.trim()).map(qual => `• ${qual}`).join('\n')}
• ${formData.minimumExperience}-${formData.maximumExperience} years of relevant experience

## Required Skills
${formData.primarySkills.filter(s => s.trim()).map(skill => `• ${skill}`).join('\n')}

${formData.preferredQualifications.filter(q => q.trim()).length > 0 ? `## Preferred Qualifications\n${formData.preferredQualifications.filter(q => q.trim()).map(qual => `• ${qual}`).join('\n')}\n` : ''}

${formData.secondarySkills.filter(s => s.trim()).length > 0 ? `## Preferred Skills\n${formData.secondarySkills.filter(s => s.trim()).map(skill => `• ${skill}`).join('\n')}\n` : ''}

${formData.benefits.filter(b => b.trim()).length > 0 ? `## What We Offer\n${formData.benefits.filter(b => b.trim()).map(benefit => `• ${benefit}`).join('\n')}\n` : ''}

${formData.salaryRange.min && formData.salaryRange.max ? `## Compensation\nSalary Range: ${formData.salaryRange.currency} ${formData.salaryRange.min} - ${formData.salaryRange.max}\n` : ''}

${formData.additionalRequirements ? `## Additional Requirements\n${formData.additionalRequirements}\n` : ''}

---
*This job description is generated automatically and may be customized based on specific requirements.*`;

    setGeneratedJD(jd);
  };

  const downloadJD = () => {
    if (!generatedJD) return;

    const blob = new Blob([generatedJD], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.jobTitle.replace(/\s+/g, '_')}_JD_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (generatedJD) {
      navigator.clipboard.writeText(generatedJD);
      alert('Job description copied to clipboard!');
    }
  };
const inputStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  width: "100%",
  fontSize: "14px",
  marginBottom: "8px",
  outline: "none",
  transition: "all 0.2s ease-in-out",
  backgroundColor:"#dde2e9ff"
};

const selectStyle = {
    padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  width: "100%",
  fontSize: "14px",
  marginBottom: "8px",
  outline: "none",
  transition: "all 0.2s ease-in-out",
  backgroundColor: "#fff",
};

const textAreaStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  width: "100%",
  fontSize: "14px",
  marginBottom: "8px",
  outline: "none",
  transition: "all 0.2s ease-in-out",
  backgroundColor: "#fff",
};

  return (
    <div className="jd-creator">
      <div className="jd-creator-content">
        <div className="form-section">
          <div className="form-scroll-container">
            <div className="basic-info-section">
              <h2 style={{ color: "black" }}>
                <FaFileAlt size={ 26} className="header-icon" />
                Automatic Job Description Creator
              </h2>
              <p>
                Generate professional job descriptions using AI-powered
                templates
              </p>
              <br></br>
              <h3>
                <FaBriefcase /> Basic Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      handleInputChange("jobTitle", e.target.value)
                    }
                    placeholder="e.g., Senior Full Stack Developer"
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    placeholder="e.g., Engineering, IT, Marketing"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FaMapMarkerAlt /> Location
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="e.g., Delhi / Remote"
                  />
                </div>
                <div className="form-group">
                  <label>Employment Type</label>
                  <select
                    style={selectStyle}
                    value={formData.employmentType}
                    onChange={(e) =>
                      handleInputChange("employmentType", e.target.value)
                    }
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="experience-section">
              <h3>
                <FaClock /> Experience Requirements
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    style={selectStyle}
                    value={formData.experienceLevel}
                    onChange={(e) =>
                      handleInputChange("experienceLevel", e.target.value)
                    }
                  >
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior-level">Senior-level</option>
                    <option value="Lead/Principal">Lead/Principal</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Minimum Experience (years)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    max="20"
                    value={formData.minimumExperience}
                    onChange={(e) =>
                      handleInputChange(
                        "minimumExperience",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Experience (years)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    max="25"
                    value={formData.maximumExperience}
                    onChange={(e) =>
                      handleInputChange(
                        "maximumExperience",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="skills-section">
              <h3>
                <FaTools /> Skills & Qualifications
              </h3>

              <div className="array-input-section">
                <h4>Primary Skills (Required)</h4>
                {formData.primarySkills.map((skill, index) => (
                  <div key={index} className="array-input-row">
                    <input
                      style={inputStyle}
                      type="text"
                      value={skill}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "primarySkills",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="e.g., JavaScript, Python, AWS"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem("primarySkills", index)}
                      disabled={formData.primarySkills.length === 1}
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => addArrayItem("primarySkills")}
                >
                  <FaPlus /> Add Primary Skill
                </button>
              </div>

              <div className="array-input-section">
                <h4>Secondary Skills (Preferred)</h4>
                {formData.secondarySkills.map((skill, index) => (
                  <div key={index} className="array-input-row">
                    <input
                      style={inputStyle}
                      type="text"
                      value={skill}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "secondarySkills",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="e.g., Docker, Kubernetes, GraphQL"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem("secondarySkills", index)}
                      disabled={formData.secondarySkills.length === 1}
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => addArrayItem("secondarySkills")}
                >
                  <FaPlus /> Add Secondary Skill
                </button>
              </div>
            </div>

            <div className="qualifications-section">
              <h3>
                <FaGraduationCap /> Qualifications
              </h3>

              <div className="array-input-section">
                <h4>Required Qualifications</h4>
                {formData.requiredQualifications.map((qual, index) => (
                  <div key={index} className="array-input-row">
                    <input
                      style={inputStyle}
                      type="text"
                      value={qual}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "requiredQualifications",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="e.g., Bachelor's degree in Computer Science"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() =>
                        removeArrayItem("requiredQualifications", index)
                      }
                      disabled={formData.requiredQualifications.length === 1}
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => addArrayItem("requiredQualifications")}
                >
                  <FaPlus /> Add Required Qualification
                </button>
              </div>

              <div className="array-input-section">
                <h4>Preferred Qualifications</h4>
                {formData.preferredQualifications.map((qual, index) => (
                  <div key={index} className="array-input-row">
                    <input
                      style={inputStyle}
                      type="text"
                      value={qual}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "preferredQualifications",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="e.g., Master's degree, Cloud certifications"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() =>
                        removeArrayItem("preferredQualifications", index)
                      }
                      disabled={formData.preferredQualifications.length === 1}
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => addArrayItem("preferredQualifications")}
                >
                  <FaPlus /> Add Preferred Qualification
                </button>
              </div>
            </div>

            <div className="responsibilities-section">
              <h3>Key Responsibilities</h3>
              <div className="array-input-section">
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="array-input-row">
                    <input
                      style={inputStyle}
                      type="text"
                      value={resp}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "responsibilities",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="e.g., Develop and maintain web applications"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArrayItem("responsibilities", index)}
                      disabled={formData.responsibilities.length === 1}
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => addArrayItem("responsibilities")}
                >
                  <FaPlus /> Add Responsibility
                </button>
              </div>
            </div>

            {showAdvancedSettings && (
              <>
                <div className="salary-section">
                  <h3>
                    <FaDollarSign /> Compensation
                  </h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        style={selectStyle}
                        value={formData.salaryRange.currency}
                        onChange={(e) =>
                          handleInputChange(
                            "salaryRange.currency",
                            e.target.value
                          )
                        }
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Minimum Salary</label>
                      <input
                        style={inputStyle}
                        type="number"
                        value={formData.salaryRange.min}
                        onChange={(e) =>
                          handleInputChange("salaryRange.min", e.target.value)
                        }
                        placeholder="50000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Maximum Salary</label>
                      <input
                        type="number"
                        value={formData.salaryRange.max}
                        onChange={(e) =>
                          handleInputChange("salaryRange.max", e.target.value)
                        }
                        placeholder="80000"
                      />
                    </div>
                  </div>
                </div>

                <div className="benefits-section">
                  <h3>Benefits & Perks</h3>
                  <div className="array-input-section">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="array-input-row">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) =>
                            handleArrayInputChange(
                              "benefits",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="e.g., Health insurance, Flexible hours"
                        />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeArrayItem("benefits", index)}
                          disabled={formData.benefits.length === 1}
                        >
                          <FaMinus />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-btn"
                      onClick={() => addArrayItem("benefits")}
                    >
                      <FaPlus /> Add Benefit
                    </button>
                  </div>
                </div>

                <div className="company-section">
                  <h3>Company Overview</h3>
                  <div className="form-group">
                    <label>About the Company</label>
                    <textarea
                      value={formData.companyOverview}
                      onChange={(e) =>
                        handleInputChange("companyOverview", e.target.value)
                      }
                      placeholder="Brief description of your company, culture, and mission..."
                      rows="4"
                    />
                  </div>
                </div>

                <div className="additional-section">
                  <h3>Additional Requirements</h3>
                  <div className="form-group">
                    <textarea
                      value={formData.additionalRequirements}
                      onChange={(e) =>
                        handleInputChange(
                          "additionalRequirements",
                          e.target.value
                        )
                      }
                      placeholder="Any additional requirements, travel, security clearance, etc..."
                      rows="3"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="settings-section">
              <div className="settings-header">
                <h3>
                  <FaCog /> Generation Settings
                </h3>
                <button
                  className="toggle-advanced"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  {showAdvancedSettings ? "Hide" : "Show"} Advanced Options
                </button>
              </div>

              <div className="form-group">
                <label>JD Template Style</label>
                <select
                  style={selectStyle}
                  value={jdTemplate}
                  onChange={(e) => setJdTemplate(e.target.value)}
                >
                  <option value="standard">Standard Professional</option>
                  <option value="modern">Modern & Engaging</option>
                  <option value="technical">Technical Focused</option>
                  <option value="startup">Startup Culture</option>
                  <option value="detailed">Comprehensive Detailed</option>
                </select>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="primary-btn generate-btn"
                onClick={handleGenerateJD}
                disabled={processing || !formData.jobTitle.trim()}
              >
                {processing ? (
                  <>
                    <FaSpinner className="spin" />
                    Generating JD...
                  </>
                ) : (
                  <>
                    <FaFileAlt />
                    Generate Job Description
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <div className="preview-header">
            <h3>Job Description Preview</h3>
            {generatedJD && (
              <div className="preview-actions">
                <button
                  className="secondary-btn"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
                <button
                  className="secondary-btn"
                  onClick={downloadJD}
                  title="Download as Markdown file"
                >
                  <FaDownload /> Download
                </button>
              </div>
            )}
          </div>

          <div className="preview-content">
            {generatedJD ? (
              <pre className="jd-preview">{generatedJD}</pre>
            ) : (
              <div className="empty-preview">
                <FaFileAlt size={48} />
                <p>
                  Fill in the form and click "Generate Job Description" to see
                  the preview here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JDCreator;