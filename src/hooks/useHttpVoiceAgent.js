import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useHttpVoiceAgent = (audioRef) => {
    const [agentStatus, setAgentStatus] = useState('idle');
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [finalResponse, setFinalResponse] = useState('');

    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const recordingChunks = useRef([]);
    const isProcessing = useRef(false);

    const stopAgent = useCallback(async () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setAgentStatus('idle');
        setTranscript('');
        setAiResponse('');
        setFinalResponse('');
        isProcessing.current = false;
        recordingChunks.current = [];
        console.log("HTTP Voice Agent stopped and cleaned up.");
    }, []);

    const startAgent = useCallback(async () => {
        console.log('HTTP Voice Agent: Starting agent...');
        if (agentStatus !== 'idle') return;

        setAgentStatus('connecting');
        setTranscript('');
        setAiResponse('');
        setFinalResponse('');
        recordingChunks.current = [];
        isProcessing.current = false;

        try {
            console.log('HTTP Voice Agent: Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const recorderMimeType = 'audio/webm; codecs=opus';
            if (!MediaRecorder.isTypeSupported(recorderMimeType)) {
                console.error(`Unsupported recorder MIME type: ${recorderMimeType}`);
                setAgentStatus('error');
                setFinalResponse('Your browser does not support the required audio recording format.');
                await stopAgent();
                return;
            }

            const recorder = new MediaRecorder(stream, { mimeType: recorderMimeType });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordingChunks.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                if (isProcessing.current) return;
                isProcessing.current = true;

                try {
                    setAgentStatus('thinking');
                    
                    // Create audio blob from recorded chunks
                    const audioBlob = new Blob(recordingChunks.current, { type: 'audio/webm' });
                    recordingChunks.current = [];

                    // Check if we have actual audio data
                    if (audioBlob.size === 0) {
                        console.warn('No audio data recorded');
                        setAgentStatus('error');
                        setFinalResponse('No audio was recorded. Please try again.');
                        return;
                    }

                    // Create form data for API request
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recording.webm');

                    console.log('Sending audio to voice API...', {
                        blobSize: audioBlob.size,
                        blobType: audioBlob.type
                    });
                    const response = await api.postVoiceQuery(formData);
                    
                    if (response.transcript) {
                        setTranscript(response.transcript);
                    }
                    
                    if (response.response) {
                        setAiResponse(response.response);
                        setFinalResponse(response.response);
                    }

                    // If avatar_audio is provided, play it
                    if (response.avatar_audio && audioRef.current) {
                        setAgentStatus('speaking');
                        
                        // Create blob URL from base64 audio data
                        const audioBlob = new Blob([new Uint8Array(atob(response.avatar_audio).split('').map(c => c.charCodeAt(0)))], { type: 'audio/mpeg' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        audioRef.current.src = audioUrl;
                        
                        const playPromise = audioRef.current.play();
                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                console.log('Audio playback started');
                            }).catch(error => {
                                console.error('Audio playback failed:', error);
                                setAgentStatus('ready');
                            });
                        }

                        const onPlaybackEnded = () => {
                            setAgentStatus('ready');
                            URL.revokeObjectURL(audioUrl);
                            audioRef.current.removeEventListener('ended', onPlaybackEnded);
                        };
                        audioRef.current.addEventListener('ended', onPlaybackEnded);
                    } else {
                        setAgentStatus('ready');
                    }

                } catch (error) {
                    console.error('Voice processing error:', error);
                    setAgentStatus('error');
                    setFinalResponse('Error processing your voice request. Please try again.');
                } finally {
                    isProcessing.current = false;
                }
            };

            setAgentStatus('ready');
            console.log("HTTP Voice Agent ready.");

        } catch (error) {
            console.error('Could not start HTTP voice agent:', error);
            setAgentStatus('error');
            setFinalResponse(`Error: Could not access microphone. ${error.message}`);
            await stopAgent();
        }
    }, [agentStatus, stopAgent, audioRef]);

    const startRecording = useCallback(() => {
        if (agentStatus === 'ready' && !isProcessing.current) {
            setTranscript('');
            setAiResponse('');
            setFinalResponse('');
            recordingChunks.current = [];

            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
                setAgentStatus('listening');
                mediaRecorderRef.current.start();
            }
        }
    }, [agentStatus]);

    const stopRecording = useCallback(() => {
        if (agentStatus === 'listening' && !isProcessing.current) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        }
    }, [agentStatus]);

    const stopAgentRef = useRef(stopAgent);
    useEffect(() => {
        stopAgentRef.current = stopAgent;
    });

    useEffect(() => {
        return () => {
            stopAgentRef.current();
        };
    }, []);

    return { agentStatus, transcript, aiResponse, finalResponse, startAgent, stopAgent, startRecording, stopRecording };
};