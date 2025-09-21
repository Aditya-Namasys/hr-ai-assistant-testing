import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, Circle, AlertCircle, Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';
import '../../assets/goals-styles.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    status: 'Not Started'
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const mockGoals = [
        {
          id: 1,
          title: 'Complete HR Gen AI POC',
          description: 'Develop and deliver a working prototype of the HR Gen AI application with all core features.',
          deadline: '2024-12-31',
          status: 'In Progress',
          progress: 75
        },
        {
          id: 2,
          title: 'Learn React Advanced Patterns',
          description: 'Study and implement advanced React patterns like render props, HOCs, and hooks.',
          deadline: '2024-08-15',
          status: 'In Progress',
          progress: 40
        },
        {
          id: 3,
          title: 'Complete AWS Certification',
          description: 'Prepare for and pass the AWS Solutions Architect Associate certification exam.',
          deadline: '2024-10-30',
          status: 'Not Started',
          progress: 0
        },
        {
          id: 4,
          title: 'Improve Team Documentation',
          description: 'Create comprehensive documentation for all team projects and processes.',
          deadline: '2024-07-31',
          status: 'Completed',
          progress: 100
        }
      ];
      
      setGoals(mockGoals);
      setLoading(false);
    } catch (error) {
      console.error('Error loading goals:', error);
      setError('Failed to load goals. Please try again later.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {

        const updatedGoals = goals.map(goal => {
          if (goal.id === editingId) {
            return {
              ...goal,
              ...formData,
              progress: formData.status === 'Completed' ? 100 : formData.status === 'In Progress' ? 50 : 0
            };
          }
          return goal;
        });
        
        setGoals(updatedGoals);
      } else {

        const newGoal = {
          id: goals.length + 1,
          ...formData,
          progress: formData.status === 'Completed' ? 100 : formData.status === 'In Progress' ? 50 : 0
        };
        
        setGoals([newGoal, ...goals]);
      }
      
      setFormVisible(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        status: 'Not Started'
      });
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle size={18} className="status-icon completed" />;
      case 'In Progress':
        return <AlertCircle size={18} className="status-icon in-progress" />;
      case 'Not Started':
        return <Circle size={18} className="status-icon not-started" />;
      default:
        return null;
    }
  };

  const updateGoalStatus = (id, newStatus) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        const progress = newStatus === 'Completed' ? 100 : newStatus === 'In Progress' ? 50 : 0;
        return { ...goal, status: newStatus, progress };
      }
      return goal;
    }));
  };
  
  const handleEditGoal = (goal) => {
    setFormData({
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline,
      status: goal.status
    });
    setIsEditing(true);
    setEditingId(goal.id);
    setFormVisible(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleDeleteGoal = (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {

      setGoals(goals.filter(goal => goal.id !== id));
    }
  };

  if (loading) {
    return <div className="loading-container">Loading goals...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="section-header">
        <h2 className="section-title">My Goals</h2>
        <p className="section-subtitle">Track your personal and professional goals</p>
      </div>

      <div className="goals-actions">
        <button 
          className="primary-btn" 
          onClick={() => {
            if (formVisible && (isEditing || formData.title || formData.description)) {
              if (window.confirm('Are you sure you want to discard your changes?')) {
                setFormVisible(false);
                setIsEditing(false);
                setEditingId(null);
                setFormData({
                  title: '',
                  description: '',
                  deadline: '',
                  status: 'Not Started'
                });
              }
            } else {

              setFormVisible(!formVisible);
              if (formVisible) {
                setIsEditing(false);
                setEditingId(null);
                setFormData({
                  title: '',
                  description: '',
                  deadline: '',
                  status: 'Not Started'
                });
              }
            }
          }}
        >
          {formVisible ? 'Cancel' : 'Add New Goal'}
        </button>
      </div>

      {formVisible && (
        <div className="goal-form-container">
          <form onSubmit={handleSubmit} className="goal-form">
            <h3 className="form-title">{isEditing ? 'Edit Goal' : 'Create New Goal'}</h3>
            
            <div className="form-group">
              <label>Goal Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter goal title"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea 
                name="description" 
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="Describe your goal"
                className="form-control"
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <Calendar size={16} className="form-icon" />
                  Deadline
                </label>
                <input 
                  type="date" 
                  name="deadline" 
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>
                  <Clock size={16} className="form-icon" />
                  Status
                </label>
                <select 
                  name="status" 
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {isEditing ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-grid">
        {goals.map((goal) => (
          <div key={goal.id} className={`card ${goal.status.toLowerCase().replace(' ', '-')}`}>
            <div className="card-header">
              <div className="goal-status">
                {getStatusIcon(goal.status)}
                <span className={`status-text ${goal.status.toLowerCase().replace(' ', '-')}`}>
                  {goal.status}
                </span>
              </div>
              <div className="goal-card-actions">
                <button 
                  className="goal-action-btn edit"
                  onClick={() => handleEditGoal(goal)}
                  title="Edit Goal"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="goal-action-btn delete"
                  onClick={() => handleDeleteGoal(goal.id)}
                  title="Delete Goal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="goal-card-body">
              <h3 className="goal-title">{goal.title}</h3>
              <p className="goal-description">{goal.description}</p>
              
              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{goal.progress}%</span>
              </div>
            </div>
            
            <div className="goal-card-footer">
              <div className="goal-deadline">
                <Calendar size={16} className="goal-icon" />
                <span className="deadline-label">Deadline:</span>
                <span className="deadline-date">{new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
              
              <div className="goal-status-selector">
                <select 
                  value={goal.status} 
                  onChange={(e) => updateGoalStatus(goal.id, e.target.value)}
                  className="goal-status-select"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Goals;
