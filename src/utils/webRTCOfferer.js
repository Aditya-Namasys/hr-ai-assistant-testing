// webRTCOfferer.js
import io from 'socket.io-client';

// 👇 ADD STUN SERVER CONFIGURATION 👇
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

export function createWebRTCOfferer({ interviewId, localStream, signalingUrl, onRemoteStream, onConnectionStateChange }) {
  const socket = io(signalingUrl);
  // 👇 PASS THE CONFIGURATION TO THE PEER CONNECTION 👇
  const pc = new RTCPeerConnection(ICE_SERVERS);

  // A reusable function to create and send the offer
  const createAndSendOffer = async () => {
    try {
      console.log('[WebRTC Offerer] Creating and sending offer...');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('signal', { room: interviewId, data: { offer } });
    } catch (error) {
      console.error('[WebRTC Offerer] Error creating offer:', error);
    }
  };

  // Add local tracks
  if (localStream) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
      console.log('[WebRTC Offerer] Added local track:', track.kind);
    });
  }

  // Handle remote stream (shouldn't happen for offerer, but for completeness)
  pc.ontrack = (event) => {
    if (onRemoteStream) onRemoteStream(event.streams[0]);
  };

  // ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('[WebRTC Offerer] Sending ICE candidate');
      socket.emit('signal', { room: interviewId, data: { candidate: event.candidate } });
    }
  };

  // Connection state
  pc.onconnectionstatechange = () => {
    console.log('[WebRTC Offerer] Connection state:', pc.connectionState);
    if (onConnectionStateChange) onConnectionStateChange(pc.connectionState);
  };

  // Join signaling room
  socket.on('connect', () => {
    console.log('[WebRTC Offerer] Connected to signaling server');
    socket.emit('join', interviewId);
    // 🛑 We no longer send the offer immediately on connect.
  });

  // 👇 LISTEN FOR THE 'PEER-READY' EVENT FROM THE MONITOR 👇
  socket.on('peer-ready', () => {
    console.log(`[WebRTC Offerer] Peer is ready in room ${interviewId}. Creating offer.`);
    createAndSendOffer();
  });

  // Handle answer and ICE from remote
  socket.on('signal', async (data) => {
    if (data.answer) {
      console.log('[WebRTC Offerer] Received answer');
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
    if (data.candidate) {
      console.log('[WebRTC Offerer] Received ICE candidate');
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  });

  return { pc, socket };
}