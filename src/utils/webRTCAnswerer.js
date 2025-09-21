// webRTCAnswerer.js
import io from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

export function createWebRTCAnswerer({ interviewId, signalingUrl, onRemoteStream, onConnectionStateChange }) {
  const socket = io(signalingUrl);
  const pc = new RTCPeerConnection(ICE_SERVERS);

  // (No changes to the top part of the file)
  // ... ontrack, onicecandidate, onconnectionstatechange handlers remain the same ...

  pc.ontrack = (event) => {
    console.log('[WebRTC Answerer] Received remote track');
    if (onRemoteStream) onRemoteStream(event.streams[0]);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('[WebRTC Answerer] Sending ICE candidate');
      socket.emit('signal', { room: interviewId, data: { candidate: event.candidate } });
    }
  };

  pc.onconnectionstatechange = () => {
    console.log('[WebRTC Answerer] Connection state:', pc.connectionState);
    if (onConnectionStateChange) onConnectionStateChange(pc.connectionState);
  };

  socket.on('connect', () => {
    console.log('[WebRTC Answerer] Connected to signaling server');
    socket.emit('join', interviewId);
    console.log(`[WebRTC Answerer] Announcing readiness for interview ${interviewId}`);
    socket.emit('peer-ready', { room: interviewId });
  });


  // 👇 UPDATE THIS EVENT HANDLER 👇
  socket.on('signal', async (data) => {
    if (data.offer) {
      try {
        // Only handle offers if the connection is in a stable state
        if (pc.signalingState !== 'stable') {
          console.warn(`[WebRTC Answerer] Received an offer while in state ${pc.signalingState}. Ignoring.`);
          return;
        }

        console.log('[WebRTC Answerer] Received offer');
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        console.log('[WebRTC Answerer] Created and sent answer');
        socket.emit('signal', { room: interviewId, data: { answer } });

      } catch (error) {
        console.error('[WebRTC Answerer] Error handling offer:', error);
      }
    }
    if (data.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        // It's common to ignore errors for candidates that arrive early.
        console.warn('[WebRTC Answerer] Error adding ICE candidate:', error.message);
      }
    }
  });

  return { pc, socket };
}