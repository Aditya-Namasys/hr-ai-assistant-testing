import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, X as CancelIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVoiceAgent } from "../../hooks/useVoiceAgent";
import "../../assets/Voice.css";

export default function Voice() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const [isRecording, setIsRecording] = useState(true);

  const {
    agentStatus,
    transcript,
    startAgent,
    stopAgent,
    startRecording,
    stopRecording,
    isWebSocket,
  } = useVoiceAgent(audioRef);

  useEffect(() => {
    startAgent();
    return () => stopAgent();
  }, []);

  useEffect(() => {
    if (isRecording && agentStatus === "ready") {
      const delay = isWebSocket ? 1000 : 1500;
      const autoStartDelay = setTimeout(() => startRecording(), delay);
      return () => clearTimeout(autoStartDelay);
    }
  }, [isRecording, agentStatus]);

  useEffect(() => {
    if (isRecording && agentStatus === "listening") {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => stopRecording(), 6000);
      return () => clearTimeout(silenceTimeoutRef.current);
    }
  }, [isRecording, agentStatus]);

  const toggleMic = () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording();
      setIsRecording(true);
    }
  };

  const isPulsing =
    isRecording && (agentStatus === "listening" || agentStatus === "speaking");
  return (
    <div className="voice-container">
      {/* Voice Ball */}
      <div className={`voice-ball ${isPulsing ? "pulse" : ""}`}></div>

      {/* Transcript */}
      <div className="para">
        {transcript ||
          (agentStatus === "listening"
            ? "Listening..."
            : isRecording
            ? "Connecting"
            : "Mic is off.")}
      </div>

      {/* Mic and Cancel Buttons Side by Side */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <button className="button3" onClick={toggleMic}>
          {isRecording ? (
            <MicOff
              size={22}
              style={{
                marginRight: "8px",
                verticalAlign: "middle",

                color: "red",
              }}
            />
          ) : (
            <Mic
              size={22}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
          )}
        </button>

        {/* ✅ Fixed Cancel Button Navigation */}
        <button
          className="button4"
          onClick={() => navigate("/admin-dashboard")}
        >
          <CancelIcon
            size={22}
            style={{ marginRight: "8px", verticalAlign: "middle" }}
          />
        </button>
      </div>

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}
