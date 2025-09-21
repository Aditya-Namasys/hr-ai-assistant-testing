import { useRealtimeVoiceAgent } from './useRealtimeVoiceAgent';
import { useHttpVoiceAgent } from './useHttpVoiceAgent';
import { useRef } from 'react';

export const useVoiceAgent = (audioRef) => {
    // Determine which voice agent to use based on environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const useWebSocket = isLocalhost;
    
    // Log only once per component lifecycle
    const loggedRef = useRef(false);
    if (!loggedRef.current) {
        console.log('Voice Agent Environment:', { 
            hostname: window.location.hostname, 
            isLocalhost, 
            useWebSocket 
        });
        console.log(`Using ${useWebSocket ? 'WebSocket' : 'HTTP'} agent`);
        loggedRef.current = true;
    }
    
    // Always call both hooks but use the appropriate one
    const realtimeAgent = useRealtimeVoiceAgent(audioRef);
    const httpAgent = useHttpVoiceAgent(audioRef);
    
    // Return the appropriate agent based on environment
    if (useWebSocket) {
        return { ...realtimeAgent, isWebSocket: true };
    } else {
        return { ...httpAgent, isWebSocket: false };
    }
};