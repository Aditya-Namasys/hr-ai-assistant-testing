import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaMicrophone,
  FaSpinner,
  FaCheckCircle,
  FaRobot,
  FaUser,
  FaVideo,
} from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL;

export default function InterviewPage({
  interviewId,
  introduction_text,
  introduction_audio,
  question_text,
  audio_data,
  question_number,
  interview_type = "standard",
  interview_state = null,
  response_analysis = null,
}) {
  const [currentText, setCurrentText] = useState(
    introduction_text || question_text
  );
  const [number, setNumber] = useState(question_number);
  const [status, setStatus] = useState("loading");
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState([]);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const conversationRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  useEffect(() => {
    if (introduction_text) {
      setConversation([
        {
          type: "ai",
          message: introduction_text,
          timestamp: new Date(),
        },
      ]);
    }

    const startFlow = () => {
      playAudio(introduction_audio, () => {
        setCurrentText(question_text);
        setConversation((prev) => [
          ...prev,
          {
            type: "ai",
            message: question_text,
            timestamp: new Date(),
          },
        ]);
        playAudio(audio_data, startRecording);
      });
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        console.log("Camera and microphone access granted");
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        startFlow();

        // Start sending video frames
        const frameInterval = setInterval(() => {
          sendFrame();
        }, 1000); // Send a frame every second

        return () => clearInterval(frameInterval);
      })
      .catch((error) => {
        console.error("Camera or microphone access denied:", error);
        // Continue with audio-only or show an error
        startFlow();
      });
  }, [audio_data, introduction_audio, introduction_text, question_text]);

  function playAudio(b64, onEnd) {
    if (!b64) {
      console.error("No audio data received.");
      if (onEnd) onEnd();
      return;
    }
    try {
      setAiSpeaking(true);
      const audio = new Audio(`data:audio/wav;base64,${b64}`);
      audio.onended = () => {
        setAiSpeaking(false);
        if (onEnd) onEnd();
      };
      audio.play().catch((e) => {
        console.error("Audio playback failed:", e);
        setAiSpeaking(false);
        if (onEnd) onEnd();
      });
    } catch (e) {
      console.error("Failed to decode or play audio:", e);
      setAiSpeaking(false);
      if (onEnd) onEnd();
    }
  }

  function startRecording() {
    setStatus("listening");
    setTranscript("");
    setResponseStartTime(Date.now());
    setError(null);
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        console.log("Audio data available:", e.data.size, "bytes");
        if (e.data.size > 0) {
          const chunks = mediaRecorderRef.current.chunks || [];
          mediaRecorderRef.current.chunks = [...chunks, e.data];
        }
      };
      mediaRecorder.onstop = handleRecordingStop;
      mediaRecorder.start();

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            finalTranscript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              silenceTimerRef.current = setTimeout(() => {
                console.log("User has been silent for 3s. Stopping recording.");
                stopRecording();
              }, 3000);
            }
          }
          setTranscript(finalTranscript);
        };

        recognition.onend = () => {
          if (mediaRecorderRef.current?.state === "recording") {
            stopRecording();
          }
        };

        recognition.start();
      }
    });
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  }

  async function handleRecordingStop() {
    setStatus("processing");

    if (transcript.trim()) {
      setConversation((prev) => [
        ...prev,
        {
          type: "user",
          message: transcript.trim(),
          timestamp: new Date(),
        },
      ]);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const chunks = mediaRecorderRef.current.chunks || [];
    console.log(
      "Audio chunks:",
      chunks.length,
      "Total size:",
      chunks.reduce((sum, chunk) => sum + chunk.size, 0)
    );

    if (chunks.length === 0) {
      console.log("No audio recorded, restarting.");
      startRecording();
      return;
    }

    const blob = new Blob(chunks, { type: "audio/webm" });
    console.log("Audio blob size:", blob.size);

    // Calculate response time
    const responseTime = responseStartTime
      ? (Date.now() - responseStartTime) / 1000
      : 0;

    try {
      let data;

      if (interview_type === "advanced") {
        // Use advanced interview endpoints
        const form = new FormData();
        form.append("interview_id", interviewId);
        form.append("audio_file", blob, "answer.webm");
        form.append("response_time_seconds", responseTime.toString());

        const res = await fetch(
          `${API_URL}/api/interview-agent/advanced/audio-response`,
          {
            method: "POST",
            body: form,
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to process response");
        }
      } else {
        // Use standard interview endpoints
        const form = new FormData();
        form.append("interview_id", interviewId);
        form.append("answer_audio", blob, "answer.webm");

        const res = await fetch(`${API_URL}/process-answer`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        data = await res.json();
      }

      console.log("Backend response:", data);

      if (data.interview_status === "completed") {
        setStatus("completed");
        setCurrentText(data.closing_text || data.question_text);
        setConversation((prev) => [
          ...prev,
          {
            type: "ai",
            message: data.closing_text || data.question_text,
            timestamp: new Date(),
          },
        ]);
        playAudio(data.closing_audio || data.audio_data);
      } else {
        setCurrentText(data.question_text);
        setNumber(data.question_number);
        setConversation((prev) => [
          ...prev,
          {
            type: "ai",
            message: data.question_text,
            timestamp: new Date(),
          },
        ]);
        playAudio(data.audio_data, startRecording);
      }

      // Reset retry count on success
      setRetryCount(0);
    } catch (error) {
      console.error("Error processing response:", error);

      // Handle errors with retry logic
      if (retryCount < 3) {
        setError({
          message: "Failed to process your response. Retrying...",
          type: "retry",
        });
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          setError(null);
          startRecording();
        }, 2000);
      } else {
        setError({
          message:
            "Unable to process your response after multiple attempts. Please try again.",
          type: "fatal",
        });
        setStatus("error");
      }
    }
  }

  async function sendFrame() {
    if (!streamRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frameData = canvas.toDataURL("image/jpeg", 0.5); // Get base64 data

    try {
      await fetch(`${API_URL}/api/monitor/live-frame`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          interview_id: interviewId,
          frame_data: frameData,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.debug("Failed to send frame:", error);
    }
  }

  const StatusIndicator = () => {
    switch (status) {
      case "listening":
        return (
          <>
            <FaMicrophone className="icon listening" /> Listening...
            
          </>
        );
      case "processing":
        return (
          <>
            <FaSpinner className="icon processing spin" /> Processing...
          </>
        );
      case "completed":
        return (
          <>
            <FaCheckCircle className="icon completed" /> Interview Complete!
          </>
        );
      case "error":
        return (
          <>
            <FaSpinner className="icon error" /> Error occurred
          </>
        );
      default:
        return (
          <>
            <FaSpinner className="icon processing spin" /> Please wait...
          </>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section-header">
        <h2 className="section-title">AI Technical Interview</h2>
        <p className="section-subtitle">
          Practice your technical skills with our AI interviewer
        </p>
        {interview_type === "advanced" && (
          <div className="interview-type-indicator">
            <span className="type-badge advanced">Advanced Interview</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className={`error-notification ${error.type}`}>
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error.message}</span>
            {error.type === "retry" && (
              <div className="retry-indicator">
                <FaSpinner className="spin" />
                <span>Retry {retryCount}/3</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="interview-layout">
        <div className="video-panel">
          <div className="panel-header">
            <h3>Your Camera</h3>
            <div className="video-status">
              <FaVideo /> Live
            </div>
          </div>
          <video
            ref={videoRef}
            autoPlay
            muted
            className="live-video-feed"
          ></video>
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        </div>

        <div className="ai-agent-panel">
          <div className="ai-avatar-container">
            <div className={`ai-avatar ${aiSpeaking ? "speaking" : ""}`}>
              <FaRobot className="avatar-icon" />
              <div className="avatar-status">
                {aiSpeaking ? (
                  <div className="speaking-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <div className="idle-pulse"></div>
                )}
              </div>
            </div>
            <h3 className="agent-name">AI Interviewer</h3>
            <div className="agent-status">
              <StatusIndicator />
            </div>
          </div>

          <div className="current-question">
            <div className="question-header">
              <strong>
                {status === "completed"
                  ? "Final Message"
                  : `Question #${number}`}
              </strong>
            </div>
            <div className="question-text">{currentText}</div>
          </div>

          {status === "listening" && (
            <div className="live-transcript">
              <h4>Your Response:</h4>
              <div className="transcript-text">
                {transcript || "Start speaking..."}
              </div>
            </div>
          )}
        </div>

        <div className="transcript-panel">
          <div className="panel-header">
            <h3>Interview Transcript</h3>
            <div className="conversation-count">
              {conversation.length} messages
            </div>
          </div>

          <div className="conversation-history" ref={conversationRef}>
            {conversation.length === 0 ? (
              <div className="empty-conversation">
                <p>Conversation will appear here...</p>
              </div>
            ) : (
              conversation.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.type === "ai" ? "ai-message" : "user-message"
                  }`}
                >
                  <div className="message-header">
                    <div className="message-sender">
                      {message.type === "ai" ? (
                        <>
                          <FaRobot className="sender-icon" />
                          AI Interviewer
                        </>
                      ) : (
                        <>
                          <FaUser className="sender-icon" />
                          You
                        </>
                      )}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="message-content">{message.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
