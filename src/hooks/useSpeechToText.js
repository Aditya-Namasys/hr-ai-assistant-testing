import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useSpeechToText = (onTranscriptReceived) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const checkSupport = async () => {
            if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && window.MediaRecorder) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamRef.current = stream;
                    setIsSupported(true);
                } catch (err) {
                    console.error('Mic access denied for STT:', err);
                    setIsSupported(false);
                }
            } else {
                setIsSupported(false);
            }
        };
        checkSupport();
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    const startRecording = useCallback(() => {
        if (!streamRef.current) {
            console.error("Audio stream not available for STT.");
            return;
        }

        setIsRecording(true);
        const recorder = new window.MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        let audioChunks = [];

        recorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = [];

            const formData = new FormData();
            formData.append('file', audioBlob, 'stt_audio.webm');

            try {
                const data = await api.postSpeechToText(formData);
                if (data.transcript) {
                    onTranscriptReceived(data.transcript);
                }
            } catch (error) {
                console.error('Error during speech-to-text:', error);
                onTranscriptReceived(''); // Clear or handle error as needed
            }
        };

        recorder.start();
    }, [onTranscriptReceived]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    return { isRecording, isSupported, toggleRecording };
};
