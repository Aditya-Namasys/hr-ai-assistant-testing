import React, { useEffect, useRef, useState } from 'react';
import { Mic, X as XIcon, Wifi, WifiOff, Headphones, BrainCircuit, AlertTriangle, VolumeX, Volume2, Settings, Download, RotateCcw, Sparkles, MessageCircle, Clock, Activity } from 'lucide-react';
import { useVoiceAgent } from '../../hooks/useVoiceAgent';
import '../../assets/voice-agent-styles.css';

const VoiceAgent = ({ show, onClose }) => {
    const audioRef = useRef(null);
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [totalInteractions, setTotalInteractions] = useState(0);
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const [speakingSpeed, setSpeakingSpeed] = useState(1.0);
    const [audioVolume, setAudioVolume] = useState(1.0);
    const silenceTimeoutRef = useRef(null);
    
    // Use unified voice agent that handles both WebSocket and HTTP
    const {
        agentStatus,
        transcript,
        aiResponse,
        finalResponse,
        startAgent,
        stopAgent,
        startRecording,
        stopRecording,
        isWebSocket
    } = useVoiceAgent(audioRef);

    // Initialize session start time
    useEffect(() => {
        if (show && !sessionStartTime) {
            setSessionStartTime(new Date());
        }
    }, [show, sessionStartTime]);

    // Track conversation history
    useEffect(() => {
        if (transcript && finalResponse) {
            const newEntry = {
                id: Date.now(),
                timestamp: new Date(),
                userMessage: transcript,
                aiResponse: finalResponse,
                duration: null
            };
            setConversationHistory(prev => [...prev, newEntry]);
            setTotalInteractions(prev => prev + 1);
        }
    }, [transcript, finalResponse]);

    // Apply audio settings
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = audioVolume;
            audioRef.current.playbackRate = speakingSpeed;
        }
    }, [audioVolume, speakingSpeed]);

    const startAgentRef = useRef(startAgent);
    useEffect(() => {
        startAgentRef.current = startAgent;
    });

    useEffect(() => {
        if (show) {
            startAgentRef.current();
        }
    }, [show]);

    // Auto-mode functionality
    useEffect(() => {
        if (isAutoMode && agentStatus === 'ready') {
            // Auto-start recording after a brief delay
            // Use longer delay for HTTP mode since it's not as real-time
            const delay = isWebSocket ? 1000 : 1500;
            const autoStartDelay = setTimeout(() => {
                startRecording();
            }, delay);
            return () => clearTimeout(autoStartDelay);
        }
    }, [isAutoMode, agentStatus, startRecording, isWebSocket]);

    // Auto-stop recording after silence
    useEffect(() => {
        if (isAutoMode && agentStatus === 'listening') {
            // Clear existing timeout
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
            
            // Set new timeout for auto-stop
            silenceTimeoutRef.current = setTimeout(() => {
                stopRecording();
            }, 6000); // Stop after 6 seconds of assumed silence
            
            return () => {
                if (silenceTimeoutRef.current) {
                    clearTimeout(silenceTimeoutRef.current);
                }
            };
        }
    }, [isAutoMode, agentStatus, stopRecording]);

    // Auto-restart after AI response in auto mode
    useEffect(() => {
        if (isAutoMode && agentStatus === 'ready' && finalResponse) {
            // Use longer delay for HTTP mode to allow for audio playback
            const delay = isWebSocket ? 1000 : 2000;
            const autoRestartDelay = setTimeout(() => {
                startRecording();
            }, delay);
            return () => clearTimeout(autoRestartDelay);
        }
    }, [isAutoMode, agentStatus, finalResponse, startRecording, isWebSocket]);

    if (!show) {
        return null;
    }

    const handleClose = () => {
        setIsAutoMode(false);
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
        }
        stopAgent();
        onClose();
    };

    const exportConversation = () => {
        const conversationData = {
            sessionStart: sessionStartTime,
            sessionEnd: new Date(),
            totalInteractions,
            conversations: conversationHistory
        };
        
        const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voice-conversation-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearConversation = () => {
        setConversationHistory([]);
        setTotalInteractions(0);
        setSessionStartTime(new Date());
    };

    const formatDuration = (startTime) => {
        if (!startTime) return '0:00';
        const duration = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const toggleAutoMode = () => {
        setIsAutoMode(!isAutoMode);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
        }
    };

    const getStatusIcon = () => {
        switch (agentStatus) {
            case 'listening':
                return <Mic size={24} className="status-icon listening" />;
            case 'thinking':
                return <BrainCircuit size={24} className="status-icon thinking" />;
            case 'speaking':
                return <Headphones size={24} className="status-icon speaking" />;
            case 'error':
                return <AlertTriangle size={24} className="status-icon error" />;
            case 'connecting':
                return <Wifi size={24} className="status-icon connecting" />;
            case 'ready':
                return <Sparkles size={24} className="status-icon ready" />;
            default:
                return <WifiOff size={24} className="status-icon idle" />;
        }
    };

    const getStatusColor = () => {
        switch (agentStatus) {
            case 'listening': return '#ef4444';
            case 'thinking': return '#f59e0b';
            case 'speaking': return '#3b82f6';
            case 'error': return '#ef4444';
            case 'connecting': return '#10a37f';
            case 'ready': return '#10a37f';
            default: return '#6b7280';
        }
    };

    const getInfoText = () => {
        switch (agentStatus) {
            case 'connecting':
                return isWebSocket ? 'Establishing WebSocket connection...' : 'Setting up HTTP voice agent...';
            case 'ready':
                return isAutoMode ? 'Auto mode active - Ready to listen' : 'Ready - Click to speak';
            case 'listening':
                return isAutoMode ? 'Auto listening for your voice...' : 'Listening carefully...';
            case 'thinking':
                return 'Processing your request...';
            case 'speaking':
                return 'AI is responding...';
            case 'error':
                return 'Connection issue detected';
            case 'idle':
            default:
                return isWebSocket ? 'Initializing WebSocket voice agent...' : 'Initializing HTTP voice agent...';
        }
    };

    return (
        <div className="voice-agent-overlay" onClick={handleClose}>
            <div className="voice-agent-container" onClick={(e) => e.stopPropagation()}>
                <div className="status-header">
                    <div className="status-indicator">
                        {getStatusIcon()}
                        <div className="status-info">
                            <span className="status-text">{getInfoText()}</span>
                            <div className="session-stats">
                                <span className="stat-item">
                                    <Clock size={12} /> {formatDuration(sessionStartTime)}
                                </span>
                                <span className="stat-item">
                                    <MessageCircle size={12} /> {totalInteractions}
                                </span>
                                <span className="stat-item">
                                    <Activity size={12} /> {isWebSocket ? 'WebSocket' : 'HTTP'}
                                </span>
                            </div>
                            {!isWebSocket && (
                                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    Running in HTTP mode (Vercel compatible)
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="header-controls">
                        <button 
                            className="control-button-small" 
                            onClick={() => setShowSettings(!showSettings)}
                            title="Settings"
                        >
                            <Settings size={18} />
                        </button>
                        <button className="close-button" onClick={handleClose}>
                            <XIcon size={24} />
                        </button>
                    </div>
                </div>

                <div className="voice-agent-content">
                    {showSettings && (
                        <div className="settings-panel">
                            <h3>Voice Agent Settings</h3>
                            <div className="settings-grid">
                                <div className="setting-group">
                                    <label>Voice Selection</label>
                                    <select 
                                        value={selectedVoice} 
                                        onChange={(e) => setSelectedVoice(e.target.value)}
                                        className="setting-select"
                                    >
                                        <option value="alloy">Alloy (Default)</option>
                                        <option value="echo">Echo</option>
                                        <option value="fable">Fable</option>
                                        <option value="onyx">Onyx</option>
                                        <option value="nova">Nova</option>
                                        <option value="shimmer">Shimmer</option>
                                    </select>
                                </div>
                                <div className="setting-group">
                                    <label>Speaking Speed</label>
                                    <input 
                                        type="range" 
                                        min="0.5" 
                                        max="2" 
                                        step="0.1" 
                                        value={speakingSpeed}
                                        onChange={(e) => setSpeakingSpeed(parseFloat(e.target.value))}
                                        className="setting-slider"
                                    />
                                    <span className="setting-value">{speakingSpeed}x</span>
                                </div>
                                <div className="setting-group">
                                    <label>Audio Volume</label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1" 
                                        step="0.1" 
                                        value={audioVolume}
                                        onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                                        className="setting-slider"
                                    />
                                    <span className="setting-value">{Math.round(audioVolume * 100)}%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="conversation-display">
                        <div className="transcript-section">
                            <div className="transcript-label">
                                <span>You said:</span>
                                <div className="transcript-indicators">
                                    {agentStatus === 'listening' && <div className="recording-indicator"></div>}
                                </div>
                            </div>
                            <div className="transcript-content user-transcript">
                                {transcript || (agentStatus === 'listening' ? 'Listening for your voice...' : 'Click the microphone to start speaking')}
                            </div>
                        </div>
                        
                        <div className="response-section">
                            <div className="transcript-label">
                                <span>AI Response:</span>
                                <div className="transcript-indicators">
                                    {agentStatus === 'thinking' && <div className="thinking-indicator"></div>}
                                    {agentStatus === 'speaking' && <div className="speaking-indicator"></div>}
                                </div>
                            </div>
                            <div className="transcript-content ai-transcript">
                                {aiResponse || finalResponse || (agentStatus === 'thinking' ? 'Processing your request...' : 'Ready to assist you')}
                            </div>
                        </div>
                    </div>

                    {conversationHistory.length > 0 && (
                        <div className="conversation-history">
                            <div className="history-header">
                                <h4>Conversation History</h4>
                                <div className="history-controls">
                                    <button 
                                        className="control-button-small" 
                                        onClick={exportConversation}
                                        title="Export Conversation"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button 
                                        className="control-button-small" 
                                        onClick={clearConversation}
                                        title="Clear History"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="history-content">
                                {conversationHistory.slice(-3).map((entry) => (
                                    <div key={entry.id} className="history-entry">
                                        <div className="history-timestamp">
                                            {entry.timestamp.toLocaleTimeString()}
                                        </div>
                                        <div className="history-messages">
                                            <div className="history-user">{entry.userMessage}</div>
                                            <div className="history-ai">{entry.aiResponse}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={`voice-bubble ${agentStatus === 'listening' ? 'recording' : ''} ${agentStatus === 'speaking' ? 'speaking' : ''} ${agentStatus === 'thinking' ? 'thinking' : ''}`}>
                        <div className="voice-bubble-inner">
                            {getStatusIcon()}
                            <div className="voice-bubble-ring" style={{ borderColor: getStatusColor() }}></div>
                            <div className="voice-bubble-pulse" style={{ backgroundColor: getStatusColor() }}></div>
                        </div>
                        <div className="voice-bubble-status">
                            <span className="bubble-status-text">{agentStatus.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div className="voice-controls">
                    <audio ref={audioRef} style={{ display: 'none' }} />
                    
                    <div className="control-row">
                        <button
                            className={`control-button ${isAutoMode ? 'active' : ''}`}
                            onClick={toggleAutoMode}
                            title={isAutoMode ? 'Disable Auto Mode' : 'Enable Auto Mode'}
                        >
                            <div className="control-icon">
                                {isAutoMode ? '🔄' : '⏸️'}
                            </div>
                            <span className="control-label">{isAutoMode ? 'Auto' : 'Manual'}</span>
                        </button>
                        
                        <button
                            className={`mic-button ${agentStatus === 'listening' ? 'active' : ''} ${isAutoMode ? 'auto-mode' : ''}`}
                            onMouseDown={!isAutoMode ? startRecording : undefined}
                            onMouseUp={!isAutoMode ? stopRecording : undefined}
                            onTouchStart={!isAutoMode ? startRecording : undefined}
                            onTouchEnd={!isAutoMode ? stopRecording : undefined}
                            onClick={isAutoMode ? (agentStatus === 'listening' ? stopRecording : startRecording) : undefined}
                            disabled={!['ready', 'listening'].includes(agentStatus)}
                        >
                            <Mic size={32} />
                            <div className="mic-button-ring"></div>
                        </button>
                        
                        <button
                            className={`control-button ${isMuted ? 'active' : ''}`}
                            onClick={toggleMute}
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            <div className="control-icon">
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </div>
                            <span className="control-label">{isMuted ? 'Muted' : 'Audio'}</span>
                        </button>
                    </div>
                    
                    <div className="keyboard-shortcuts">
                        <div className="shortcut-item">
                            <kbd>Space</kbd> <span>Hold to speak</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>Esc</kbd> <span>Close</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>A</kbd> <span>Toggle auto mode</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>M</kbd> <span>Toggle mute</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceAgent;
