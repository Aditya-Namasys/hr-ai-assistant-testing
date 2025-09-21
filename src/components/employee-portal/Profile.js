import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building, Calendar, MapPin, User, Award, Plus, X } from 'lucide-react';
import api from '../../services/api';
import '../../assets/profile-styles.css'; // We'll create this CSS file later

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      const employeeId = localStorage.getItem('employee_id');
      const userEmail = localStorage.getItem('user_email'); // Assuming email is stored
      
      if (!employeeId) {
        throw new Error("No employee ID found. Please log in again.");
      }

      // Fetch employee data from the backend
      const employeeData = await api.getEmployeeProfile(employeeId);

      // Merge real data with mock data for fields not in the Employee model, as requested
      const fullProfile = {
        id: employeeData.id,
        name: employeeData.name,
        email: userEmail || `${employeeData.name.toLowerCase().replace(' ', '.')}@example.com`, // Use stored email or generate a fallback
        phone: '+91 9876543210', // Mock data
        department: employeeData.department,
        position: employeeData.position,
        manager: employeeData.manager,
        join_date: new Date(employeeData.join_date).toLocaleDateString('en-CA'), // Format as YYYY-MM-DD
        address: 'Pune, Maharashtra', // Mock data
        salary: employeeData.salary || 65000, // Use real salary if available, else mock
        performance_rating: 4.8, // Mock data
        skills: ['React', 'Python', 'FastAPI', 'SQL', 'AWS'], // Mock data
        education: [
          { degree: 'B.Tech in Computer Science', institution: 'Pune University', year: '2018' }
        ],
        experience: [
          { role: 'Software Engineer', company: 'Tech Solutions', period: '2018-2022' }
        ]
      };
      
      setProfile(fullProfile);
      setEditedProfile(JSON.parse(JSON.stringify(fullProfile)));
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setProfile(editedProfile);
      // In a real app, you would call the API here
      // api.updateProfile(editedProfile);
    } else {
      // Start editing - already have a copy in editedProfile
    }
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
  };
  
  const handleSkillChange = (index, value) => {
    const updatedSkills = [...editedProfile.skills];
    updatedSkills[index] = value;
    setEditedProfile({
      ...editedProfile,
      skills: updatedSkills
    });
  };
  
  const addSkill = () => {
    setEditedProfile({
      ...editedProfile,
      skills: [...editedProfile.skills, '']
    });
  };
  
  const removeSkill = (index) => {
    const updatedSkills = [...editedProfile.skills];
    updatedSkills.splice(index, 1);
    setEditedProfile({
      ...editedProfile,
      skills: updatedSkills
    });
  };

  if (loading) {
    return <div className="loading-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="section-header">
        <h2 className="section-title">My Profile</h2>
        <p className="section-subtitle">View and manage your profile information</p>
      </div>

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar" style={{ backgroundColor: isEditing ? '#4a6cf7' : '#3e4c6d' }}>
            {isEditing ? editedProfile.name.charAt(0) : profile.name.charAt(0)}
          </div>
          <div className="profile-title">
            {isEditing ? (
              <input
                type="text"
                name="name"
                className="edit-profile-name"
                value={editedProfile.name}
                onChange={handleInputChange}
              />
            ) : (
              <h3 className="profile-name">{profile.name}</h3>
            )}
            {isEditing ? (
              <input
                type="text"
                name="position"
                className="edit-profile-position"
                value={editedProfile.position}
                onChange={handleInputChange}
              />
            ) : (
              <p className="profile-position">{profile.position}</p>
            )}
          </div>
          <button 
            className={`edit-profile-btn ${isEditing ? 'save-mode' : ''}`}
            onClick={handleEditToggle}
          >
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <h3 className="profile-card-title">Personal Information</h3>
            <div className="profile-info-list">
              <div className="profile-info-item">
                <Mail className="profile-info-icon" size={18} />
                <div className="profile-info-content">
                  <span className="profile-info-label">Email</span>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      className="edit-profile-value"
                      value={editedProfile.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span className="profile-info-value">{profile.email}</span>
                  )}
                </div>
              </div>
              
              <div className="profile-info-item">
                <Phone className="profile-info-icon" size={18} />
                <div className="profile-info-content">
                  <span className="profile-info-label">Phone</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      className="edit-profile-value"
                      value={editedProfile.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span className="profile-info-value">{profile.phone}</span>
                  )}
                </div>
              </div>
              
              <div className="profile-info-item">
                <MapPin className="profile-info-icon" size={18} />
                <div className="profile-info-content">
                  <span className="profile-info-label">Address</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      className="edit-profile-value"
                      value={editedProfile.address}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span className="profile-info-value">{profile.address}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="profile-card-title">Employment Details</h3>
            <div className="profile-info-list">
              <div className="profile-info-item">
                <Building className="profile-info-icon" size={18} />
                <div className="profile-info-content">
                  <span className="profile-info-label">Department</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      className="edit-profile-value"
                      value={editedProfile.department}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span className="profile-info-value">{profile.department}</span>
                  )}
                </div>
              </div>
              
              <div className="profile-info-item">
                <User className="profile-info-icon" size={18} />
                <div className="profile-info-content">
                  <span className="profile-info-label">Manager</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="manager"
                      className="edit-profile-value"
                      value={editedProfile.manager}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span className="profile-info-value">{profile.manager}</span>
                  )}
                </div>
              </div>
              
              <div className="profile-info-item">
                <Calendar className="profile-info-icon" size={18} />
                <div className="profile-info-content">
                  <span className="profile-info-label">Join Date</span>
                  {isEditing ? (
                    <input
                      type="date"
                      name="join_date"
                      className="edit-profile-value"
                      value={editedProfile.join_date}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span className="profile-info-value">{new Date(profile.join_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              
              <div className="profile-info-item">
                <Award className="profile-info-icon" size={18} />
                <div className="profile-info-content">
                  <span className="profile-info-label">Performance Rating</span>
                  <span className="profile-info-value">{profile.performance_rating}/5.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="profile-card-title">Skills</h3>
            <div className="profile-skills">
              {isEditing ? (
                <div className="edit-skills-container">
                  {editedProfile.skills.map((skill, index) => (
                    <div key={index} className="edit-skill-item">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        className="edit-skill-input"
                      />
                      <button 
                        type="button" 
                        className="remove-skill-btn"
                        onClick={() => removeSkill(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="add-skill-btn"
                    onClick={addSkill}
                  >
                    + Add Skill
                  </button>
                </div>
              ) : (
                profile.skills.map((skill, index) => (
                  <span key={index} className="profile-skill-tag">{skill}</span>
                ))
              )}
            </div>
          </div>

          <div className="profile-card">
            <h3 className="profile-card-title">Education</h3>
            <div className="profile-timeline">
              {profile.education.map((edu, index) => (
                <div key={index} className="profile-timeline-item">
                  <div className="profile-timeline-content">
                    <h4 className="profile-timeline-title">{edu.degree}</h4>
                    <p className="profile-timeline-subtitle">{edu.institution}</p>
                    <p className="profile-timeline-date">{edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <h3 className="profile-card-title">Work Experience</h3>
            <div className="profile-timeline">
              {profile.experience.map((exp, index) => (
                <div key={index} className="profile-timeline-item">
                  <div className="profile-timeline-content">
                    <h4 className="profile-timeline-title">{exp.role}</h4>
                    <p className="profile-timeline-subtitle">{exp.company}</p>
                    <p className="profile-timeline-date">{exp.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
