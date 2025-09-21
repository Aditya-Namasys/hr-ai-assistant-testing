import { useEffect, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function TabSwitchDetector({ interviewId }) {
  const isHiddenRef = useRef(false);
  const tabSwitchCountRef = useRef(0);
  const lastEventRef = useRef(Date.now());

  useEffect(() => {
    if (!interviewId) return;

    const logBehaviorEvent = async (eventType, details = null) => {
      try {
        await fetch(`${API_URL}/api/monitor/behavior-event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            interview_id: interviewId,
            event_type: eventType,
            details: details || '',
            timestamp: new Date().toISOString()
          })
        });
        console.log(`Behavior event logged: ${eventType}`, details);
      } catch (error) {
        console.error('Failed to log behavior event:', error);
      }
    };

    // Show proctoring warning to candidate
    const showProctoringWarning = (message) => {
      // Create a temporary warning overlay
      const warningDiv = document.createElement('div');
      warningDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease-out;
      `;
      
      warningDiv.textContent = `⚠️ ${message}`;
      document.body.appendChild(warningDiv);
      
      // Remove after 5 seconds
      setTimeout(() => {
        if (warningDiv.parentNode) {
          warningDiv.parentNode.removeChild(warningDiv);
        }
      }, 5000);
    };

    const handleVisibilityChange = () => {
      const now = Date.now();
      
      if (now - lastEventRef.current < 1000) {
        return;
      }
      
      lastEventRef.current = now;
      
      if (document.hidden && !isHiddenRef.current) {
        isHiddenRef.current = true;
        tabSwitchCountRef.current++;
        
        logBehaviorEvent('tab_switch', `Tab hidden (switch #${tabSwitchCountRef.current})`);
        
        if (tabSwitchCountRef.current > 1) {
          console.warn('Tab switching detected during interview');
        }
      } else if (!document.hidden && isHiddenRef.current) {
        isHiddenRef.current = false;
        logBehaviorEvent('tab_focus', 'Tab focused again');
      }
    };

    const handleWindowBlur = () => {
      const now = Date.now();
      if (now - lastEventRef.current < 1000) return;
      lastEventRef.current = now;
      
      logBehaviorEvent('window_blur', 'Window lost focus');
    };

    const handleWindowFocus = () => {
      const now = Date.now();
      if (now - lastEventRef.current < 1000) return;
      lastEventRef.current = now;
      
      logBehaviorEvent('window_focus', 'Window gained focus');
    };

    const handleKeyDown = (event) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = event;

      // Enhanced suspicious key detection
      if (ctrlKey || metaKey) {
        const suspiciousKeys = ['c', 'a', 'v', 'x', 'z', 'f', 't', 'n', 'w', 's', 'p'];
        if (suspiciousKeys.includes(key.toLowerCase())) {
          event.preventDefault(); // Prevent copy/paste/save operations
          logBehaviorEvent('blocked_keypress', `Blocked ${ctrlKey ? 'Ctrl' : 'Cmd'}+${key.toUpperCase()}`);
          
          // Show warning to candidate
          showProctoringWarning(`${ctrlKey ? 'Ctrl' : 'Cmd'}+${key.toUpperCase()} is not allowed during the interview`);
        }
      }
      
      // Developer tools detection
      if (key === 'F12' || (ctrlKey && shiftKey && key === 'I') || (ctrlKey && shiftKey && key === 'J')) {
        event.preventDefault();
        logBehaviorEvent('dev_tools_blocked', `Blocked ${key === 'F12' ? 'F12' : 'Ctrl+Shift+' + key}`);
        showProctoringWarning('Developer tools are not allowed during the interview');
      }
      
      // Task switching detection
      if (altKey && key === 'Tab') {
        logBehaviorEvent('task_switch_attempt', 'Alt+Tab pressed');
      }
      
      // Screen capture detection
      if ((metaKey && shiftKey && ['3', '4', '5'].includes(key)) || 
          (key === 'PrintScreen')) {
        event.preventDefault();
        logBehaviorEvent('screen_capture_attempt', 'Screen capture blocked');
        showProctoringWarning('Screen capture is not allowed during the interview');
      }
    };

    const handleContextMenu = (event) => {
      event.preventDefault(); // Block right-click menu
      logBehaviorEvent('right_click_blocked', `Right-click blocked at (${event.clientX}, ${event.clientY})`);
      showProctoringWarning('Right-click menu is not allowed during the interview');
    };

    const handleBeforeUnload = (event) => {
      logBehaviorEvent('page_unload_attempt', 'User attempted to leave page');
    };

    const handlePrint = () => {
      logBehaviorEvent('print_attempt', 'Print dialog opened');
    };

    let lastMouseMove = Date.now();
    
    const handleMouseMove = () => {
      const now = Date.now();
      
      if (now - lastMouseMove > 30000) {
        logBehaviorEvent('suspicious_activity', 'Long inactivity followed by mouse movement');
      }
      
      lastMouseMove = now;
    };

    const detectDevTools = () => {
      const threshold = 160;
      
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        logBehaviorEvent('dev_tools_detected', 'Developer tools may be open');
        showProctoringWarning('Please close developer tools to continue the interview');
      }
    };

    // Enhanced screen recording detection
    const detectScreenRecording = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Check if screen sharing is active
        navigator.mediaDevices.enumerateDevices().then(devices => {
          const screenDevices = devices.filter(device => 
            device.kind === 'videoinput' && 
            (device.label.includes('screen') || device.label.includes('display'))
          );
          
          if (screenDevices.length > 0) {
            logBehaviorEvent('screen_recording_detected', 'Screen recording may be active');
          }
        }).catch(() => {});
      }
    };

    const detectMultipleMonitors = () => {
      if (window.screen.availWidth !== window.screen.width || window.screen.availHeight !== window.screen.height) {
        logBehaviorEvent('multiple_monitors_detected', `Screen: ${window.screen.width}x${window.screen.height}, Available: ${window.screen.availWidth}x${window.screen.availHeight}`);
      }
    };
    const detectFacialPresence = () => {
      const videoElement = document.querySelector('video');
      if (videoElement && videoElement.srcObject) {
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          
          try {
            ctx.drawImage(videoElement, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
            let totalBrightness = 0;
            let pixelCount = 0;
            
            for (let i = 0; i < imageData.data.length; i += 4) {
              const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
              totalBrightness += brightness;
              pixelCount++;
            }
            
            const avgBrightness = totalBrightness / pixelCount;
            
            // If screen is too dark or too bright, might indicate absence or covering
            if (avgBrightness < 20) {
              logBehaviorEvent('face_detection_lost', 'Video feed appears too dark - candidate may not be present');
              showProctoringWarning('Please ensure you are visible on camera');
            } else if (avgBrightness > 240) {
              logBehaviorEvent('face_detection_lost', 'Video feed appears overexposed - camera may be blocked');
              showProctoringWarning('Please check your camera - feed appears blocked');
            }
          } catch (error) {
            console.debug('Facial detection analysis failed:', error);
          }
        } else {
          logBehaviorEvent('face_detection_lost', 'No video content detected');
        }
      }
    };

    const detectSuspiciousActivity = () => {
      let rapidMovements = 0;
      let lastMousePosition = { x: 0, y: 0 };
      
      const handleMouseMovement = (e) => {
        const distance = Math.sqrt(
          Math.pow(e.clientX - lastMousePosition.x, 2) + 
          Math.pow(e.clientY - lastMousePosition.y, 2)
        );
        
        if (distance > 200) {
          rapidMovements++;
          if (rapidMovements > 5) {
            logBehaviorEvent('suspicious_activity', 'Rapid mouse movements detected - possible automation');
            rapidMovements = 0;
          }
        }
        
        lastMousePosition = { x: e.clientX, y: e.clientY };
      };
      
      document.addEventListener('mousemove', handleMouseMovement);
      
      const detectRemoteAccess = () => {
        const userAgent = navigator.userAgent;
        const suspiciousPatterns = [
          'TeamViewer', 'AnyDesk', 'Chrome Remote Desktop', 'Remote Desktop'
        ];
        
        suspiciousPatterns.forEach(pattern => {
          if (userAgent.includes(pattern)) {
            logBehaviorEvent('suspicious_activity', `Possible remote access detected: ${pattern}`);
          }
        });

        if (window.screen.availWidth === window.screen.width && 
            window.screen.availHeight === window.screen.height &&
            window.screen.width === 1024 && window.screen.height === 768) {
          logBehaviorEvent('suspicious_activity', 'Screen resolution matches common VM/remote desktop settings');
        }
      };
      
      detectRemoteAccess();
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMovement);
      };
    };

    const monitorAudioLevels = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            microphone.connect(analyser);
            analyser.fftSize = 256;
            
            let silentPeriod = 0;
            const maxSilentPeriod = 60000;
            
            const checkAudioLevel = () => {
              analyser.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              
              if (average < 5) {
                silentPeriod += 1000;
                if (silentPeriod > maxSilentPeriod) {
                  logBehaviorEvent('audio_level_change', 'Extended silence detected - candidate may not be engaged');
                  silentPeriod = 0; // Reset
                }
              } else {
                silentPeriod = 0;
              }
            };
            
            const intervalId = setInterval(checkAudioLevel, 1000);
            
            window.audioMonitorCleanup = () => {
              clearInterval(intervalId);
              audioContext.close();
              stream.getTracks().forEach(track => track.stop());
            };
          })
          .catch(error => {
            console.debug('Audio monitoring not available:', error);
          });
      }
    };

    const detectZoomChanges = () => {
      const currentZoom = Math.round(window.devicePixelRatio * 100);
      if (currentZoom !== 100) {
        logBehaviorEvent('zoom_detected', `Browser zoom level: ${currentZoom}%`);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logBehaviorEvent('fullscreen_exit', 'Candidate exited fullscreen mode');
        showProctoringWarning('Please return to fullscreen mode for the interview');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('beforeprint', handlePrint);
    window.addEventListener('afterprint', handlePrint);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    const devToolsInterval = setInterval(detectDevTools, 5000);
    const screenRecordingInterval = setInterval(detectScreenRecording, 10000);
    const zoomInterval = setInterval(detectZoomChanges, 3000);
    const facialDetectionInterval = setInterval(detectFacialPresence, 15000);
    
    detectDevTools();
    detectMultipleMonitors();
    detectZoomChanges();
    
    const suspiciousActivityCleanup = detectSuspiciousActivity();
    monitorAudioLevels();
    
    setTimeout(() => {
      detectFacialPresence();
    }, 5000);
    

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('beforeprint', handlePrint);
      window.removeEventListener('afterprint', handlePrint);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearInterval(devToolsInterval);
      clearInterval(screenRecordingInterval);
      clearInterval(zoomInterval);
      clearInterval(facialDetectionInterval);
      
      if (suspiciousActivityCleanup) {
        suspiciousActivityCleanup();
      }
      if (window.audioMonitorCleanup) {
        window.audioMonitorCleanup();
      }
    };
  }, [interviewId]);

  return null;
}

export default TabSwitchDetector;