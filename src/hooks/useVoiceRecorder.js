import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

export const useVoiceRecorder = (setChatHistory, setLoading) => {
    const [isRecording, setIsRecording] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const checkSupport = async () => {
            if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && window.MediaRecorder) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    streamRef.current = stream;
                    setSpeechSupported(true);
                } catch (err) {
                    console.error('Mic access denied:', err);
                    setSpeechSupported(false);
                }
            } else {
                setSpeechSupported(false);
            }
        };
        checkSupport();
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
            return;
        }

        if (!streamRef.current) {
            console.error("Audio stream not available.");
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
            setLoading(true);
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = [];

            const formData = new FormData();
            formData.append('file', audioBlob, 'user_voice.webm');

            try {
                const data = await api.postVoiceQuery(formData);
                const { transcript, response: responseText, avatar_audio: audio_b64 } = data;

                setChatHistory(prev => [
                    ...prev,
                    { type: 'user', content: transcript },
                    { type: 'ai', content: responseText, avatar_audio: audio_b64 }
                ]);

                if (audio_b64) {
                    const audio = new Audio(`data:audio/mp3;base64,${audio_b64}`);
                    audio.play();
                }
            } catch (error) {
                console.error('Error sending voice query:', error);
                const errorMessage = error.message || 'Failed to process voice query.';
                setChatHistory(prev => [...prev, { type: 'ai', content: `Error: ${errorMessage}` }]);
            } finally {
                setLoading(false);
            }
        };

        recorder.start();
    };

    return { isRecording, speechSupported, toggleRecording };
};
