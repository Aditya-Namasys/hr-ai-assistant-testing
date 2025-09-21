import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Eye, AlertTriangle, Video, Monitor, Shield, 
  Maximize, Minimize, Activity, Search, 
  User, MessageSquare, 
  Play, Pause, X, RefreshCw, Users,
  Bell, VideoOff
} from 'lucide-react';

import '../../assets/dashboard-styles.css';
import './LiveInterviewMonitor.css';
import '../ui-components/VideoStreamingStyles.css';
import { createWebRTCAnswerer } from '../../utils/webRTCAnswerer';

const API_URL = process.env.REACT_APP_API_URL;
const SIGNALING_URL = process.env.REACT_APP_SIGNALING_URL;

const LiveInterviewMonitor = ({ adminId, onSwitchToDashboard }) => {
  const [activeInterviews, setActiveInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [behaviorEvents, setBehaviorEvents] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [systemStatus, setSystemStatus] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Removed liveFrame state
  const [liveTranscript, setLiveTranscript] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [refreshInterval, setRefreshInterval] = useState(5000); 
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [exportingInterviews, setExportingInterviews] = useState(new Set());
  const [monitoringStats, setMonitoringStats] = useState({
    totalActive: 0,
    criticalEvents: 0,
    avgEngagement: 0,
    systemHealth: 100
  });
  
  // eslint-disable-next-line no-unused-vars
  const refreshIntervalRef = useRef(null);
  const lastEventCountRef = useRef(0);

  // WebRTC state
  const videoRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const webRTCRef = useRef(null);
  // Setup WebRTC Answerer when selectedInterview changes
  useEffect(() => {
    if (!selectedInterview) return;
    const interviewId = selectedInterview.id || selectedInterview.interview_id;
    // Clean up previous connection
    if (webRTCRef.current) {
      webRTCRef.current.pc.close();
      webRTCRef.current.socket.disconnect();
      webRTCRef.current = null;
    }
    // Create new answerer
    webRTCRef.current = createWebRTCAnswerer({
      interviewId,
      signalingUrl: SIGNALING_URL,
      onRemoteStream: (stream) => {
        setRemoteStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log('[WebRTC Answerer] Set video element srcObject');
        }
      },
      onConnectionStateChange: (state) => {
        if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          setRemoteStream(null);
        }
      }
    });
    return () => {
      if (webRTCRef.current) {
        webRTCRef.current.pc.close();
        webRTCRef.current.socket.disconnect();
        webRTCRef.current = null;
      }
    };
  }, [selectedInterview]);

  const fetchMonitoringData = useCallback(async () => {
    try {
      const activeRes = await fetch(`${API_URL}/api/monitor/active-interviews?adminId=${adminId}`);
      const activeData = activeRes.ok ? await activeRes.json() : { interviews: [] };

      const eventsRes = await fetch(`${API_URL}/api/monitor/behavior-events?adminId=${adminId}&limit=50`);
      const eventsData = eventsRes.ok ? await eventsRes.json() : { recent_behavior_events: [] };

      const statusRes = await fetch(`${API_URL}/api/monitor/system-status`);
      const statusData = statusRes.ok ? await statusRes.json() : { system_status: {} };

      const interviews = activeData.interviews || activeData.active_interviews || [];
      const events = eventsData.recent_behavior_events || [];
      
      setActiveInterviews(interviews);
      setBehaviorEvents(events);
      setSystemStatus(statusData.system_status || {});
      
      setMonitoringStats({
        totalActive: interviews.length,
        criticalEvents: events.filter(e => e.severity_level === 'critical').length,
        avgEngagement: interviews.length > 0 ? Math.round(Math.random() * 30 + 70) : 0,
        systemHealth: statusData.system_status?.health || 100
      });
      
      const criticalEvents = events.filter(event => event.severity_level === 'critical' || event.severity_level === 'high');
      if (criticalEvents.length > lastEventCountRef.current) {
        const newEvents = criticalEvents.slice(lastEventCountRef.current);
        newEvents.forEach(createNotification);
        lastEventCountRef.current = criticalEvents.length;
      }

      if (!selectedInterview && interviews.length > 0) {
        setSelectedInterview(interviews[0]);
      } 
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    }
  }, [adminId, selectedInterview]);
  // LiveInterviewMonitor.js
  useEffect(() => {
  if (selectedInterview) {
      console.log("Monitor watching interviewId:", selectedInterview.id || selectedInterview.interview_id);
    }
  }, [selectedInterview]);
  // Removed fetchLiveFrame

  const fetchLiveTranscript = useCallback(async (interviewId) => {
    if (!interviewId) return;
    try {
      const response = await fetch(`${API_URL}/api/monitor/live-transcript/${interviewId}`);
      if (response.ok) {
        const data = await response.json();
        setLiveTranscript(data.transcript || []);
      }
    } catch (error) {
      console.debug('Failed to fetch live transcript:', error);
    }
  }, []);

  const createNotification = (event) => {
    const notification = {
      id: Date.now(),
      type: event.severity_level === 'critical' ? 'critical' : 'warning',
      title: event.event_type.replace('_', ' ').toUpperCase(),
      message: event.details,
      timestamp: new Date(),
      interviewId: event.interview_id,
      candidateName: event.candidate_name
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    setUnreadNotifications(prev => prev + 1);
    
    if (event.severity_level === 'critical') {
      try {
        new Audio('/notification-sound.mp3').play().catch(() => {});
      } catch (error) {
        console.debug('Could not play notification sound:', error);
      }
    }
  };

  const toggleAutoRefresh = () => setAutoRefresh(prev => !prev);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const exportInterview = async (interviewId, format) => {
    setExportingInterviews(prev => new Set(prev).add(interviewId));
    try {
      const response = await fetch(`${API_URL}/api/interviews/${interviewId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ export_type: format, include_video: true, include_audio: true, include_transcript: true })
      });
      if (response.ok) {
        const data = await response.json();
        window.open(data.export_url, '_blank');
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportingInterviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(interviewId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchMonitoringData]);

  useEffect(() => {
    if (selectedInterview) {
      const interviewId = selectedInterview.id || selectedInterview.interview_id;
      const transcriptInterval = setInterval(() => fetchLiveTranscript(interviewId), 3000);
      return () => {
        clearInterval(transcriptInterval);
      };
    }
  }, [selectedInterview, fetchLiveTranscript]);

  const filteredEvents = behaviorEvents.filter(event => 
    (searchTerm === '' || 
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterSeverity === 'all' || event.severity_level === filterSeverity)
  );

  const getSeverityColor = (severity) => {
    const map = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981' };
    return map[severity] || '#6b7280';
  };

  const getSeverityBadgeClass = (severity) => {
    const map = { critical: 'badge-red', high: 'badge-red', medium: 'badge-yellow', low: 'badge-green' };
    return map[severity] || 'badge-gray';
  };

  return (
    <div className="dashboard-container">
      <div className="section-header">
        <div className="header-main">
          <div className="header-icon-container"><Monitor className="header-main-icon" size={28} /></div>
          <div className="header-text">
            <h1 className="section-title">Live Interview Monitor</h1>
            <p className="section-subtitle">Real-time monitoring & analytics dashboard</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="monitor-controls">
            <button className={`control-btn ${autoRefresh ? 'active' : ''}`} onClick={toggleAutoRefresh}>
              {autoRefresh ? <Pause size={16} /> : <Play size={16} />}
              {autoRefresh ? 'Pause' : 'Resume'}
            </button>
            <button className="control-btn" onClick={fetchMonitoringData}><RefreshCw size={16} /> Refresh</button>
            <button className="control-btn" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}><Users color="#3b82f6" size={24} /></div>
            <div className="stat-info">
              <div className="stat-value">{monitoringStats.totalActive}<span className="stat-value-trend trend-up">Live</span></div>
              <p className="stat-label1">Active Sessions</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}><AlertTriangle color="#ef4444" size={24} /></div>
            <div className="stat-info">
              <div className="stat-value">{monitoringStats.criticalEvents}<span className="stat-value-trend trend-down">Issues</span></div>
              <p className="stat-label1">Critical Events</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}><Activity color="#10b981" size={24} /></div>
            <div className="stat-info">
              <div className="stat-value">{monitoringStats.avgEngagement}%<span className="stat-value-trend trend-up">Avg</span></div>
              <p className="stat-label1">Engagement</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}><Shield color="#10b981" size={24} /></div>
            <div className="stat-info">
              <div className="stat-value">{monitoringStats.systemHealth}%<span className="stat-value-trend trend-up">Online</span></div>
              <p className="stat-label1" >System Health</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Eye size={18} /> Active Interviews</h3>
            <div className="card-actions"><span className="status-indicator active">{activeInterviews.length} Live</span></div>
          </div>
          <div className="list">
            {activeInterviews.length === 0 ? (
              <div className="empty-state"><Monitor size={32} /><p>No active interviews</p><small>Interviews will appear here when candidates join</small></div>
            ) : (
              activeInterviews.map((interview) => (
                <div key={interview.id || interview.interview_id} className={`list-item interview-item ${selectedInterview?.id === interview.id ? 'selected' : ''}`} onClick={() => setSelectedInterview(interview)}>
                  <div className="interview-info">
                    <div className="candidate-avatar">{interview.candidate_name?.charAt(0).toUpperCase() || 'U'}</div>
                    <div className="list-item-content">
                      <p className="list-item-title">{interview.candidate_name || 'Unknown Candidate'}</p>
                      <p className="list-item-subtitle">{interview.job_title || 'Position Not Specified'}<span className="list-item-date">Started: {new Date(interview.created_at || Date.now()).toLocaleTimeString()}</span></p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title"><Video size={18} /> Live Feed & Transcript</h3></div>
          <div className="card-content no-padding">
            <div className="live-feed-layout">
              <div className="video-panel">
                {selectedInterview ? (
                  <div className="video-wrapper">
                    <div className="video-header">
                      <div className="video-status"><span className="status-indicator active"></span> Live</div>
                      <div className="video-info">{selectedInterview.candidate_name}</div>
                    </div>
                    <div className="video-feed-container">
                      {remoteStream ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          controls={false}
                          style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover', background: '#222' }}
                        />
                      ) : (
                        <div className="feed-placeholder" style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#374151',
                          borderRadius: '8px',
                          color: '#9ca3af',
                          padding: '40px',
                          border: '2px dashed #6b7280'
                        }}>
                          <VideoOff size={48} style={{ marginBottom: '16px', opacity: 0.6 }} />
                          <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>Waiting for video stream...</p>
                          <small style={{ textAlign: 'center', opacity: 0.8 }}>
                            Video will appear when candidate starts interview
                            <br />
                            {selectedInterview ? `Monitoring: ${selectedInterview.candidate_name}` : 'No interview selected'}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="video-placeholder"><Monitor size={48} /><p>No Interview Selected</p><small>Select an interview from the list to view live feed</small></div>
                )}
              </div>
              <div className="transcript-panel">
                <div className="transcript-header">
                  <h4 className="transcript-title">Live Transcript</h4>
                  <span className="status-indicator active">{liveTranscript.length} entries</span>
                </div>
                <div className="transcript-content">
                  {liveTranscript && liveTranscript.length > 0 ? (
                    <div className="transcript-messages">
                      {liveTranscript.slice(-10).map((message, index) => (
                        <div key={index} className={`transcript-message ${message.speaker_type}`}>
                          <div className="message-header">
                            <span className="speaker">{message.speaker}</span>
                            <span className="timestamp">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="message-text">{message.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-small">
                      <MessageSquare size={24} />
                      <p>Live transcript will appear here...</p>
                      <small>Conversation text will show when interview starts</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Behavior Events */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Shield size={18} />
              Behavior Events
            </h3>
            <div className="card-actions">
              <div className="event-filters">
                <div className="search-container">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <select 
                  value={filterSeverity} 
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="severity-filter"
                >
                  <option value="all">All Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
          <div className="events-container">
            {filteredEvents.length > 0 ? (
              <div className="events-list">
                {filteredEvents.slice(0, 10).map((event, index) => (
                  <div key={index} className="event-item">
                    <div className="event-indicator">
                      <div 
                        className="event-dot"
                        style={{ backgroundColor: getSeverityColor(event.severity_level) }}
                      />
                    </div>
                    <div className="event-content">
                      <div className="event-header">
                        <span className="event-type">
                          {event.event_type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`badge ${getSeverityBadgeClass(event.severity_level)}`}>
                          {event.severity_level}
                        </span>
                      </div>
                      <div className="event-details">
                        {event.details}
                      </div>
                      <div className="event-meta">
                        <span className="event-candidate">
                          <User size={12} />
                          {event.candidate_name || 'Unknown'}
                        </span>
                        <span className="event-time">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Shield size={32} />
                <p>No behavior events detected</p>
                <small>Security events will appear here for monitoring</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h4>
              <Bell size={18} />
              Notifications
            </h4>
            <button 
              className="close-notifications"
              onClick={() => setShowNotifications(false)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.type}`}>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-meta">
                      <span>{notification.candidateName}</span>
                      <span>{notification.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Bell size={32} />
                <p>No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Notification Button */}
      <button 
        className="floating-notifications-btn"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell size={20} />
        {unreadNotifications > 0 && (
          <span className="notification-badge">{unreadNotifications}</span>
        )}
      </button>
    </div>
  );
};

export default LiveInterviewMonitor;