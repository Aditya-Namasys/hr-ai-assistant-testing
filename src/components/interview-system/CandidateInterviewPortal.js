"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createWebRTCOfferer } from '../../utils/webRTCOfferer';
import { useConversation } from "@elevenlabs/react";
import { MdSmartToy } from "react-icons/md";
import logo from "../../assets/Logo.svg";
import aiImage from "../../assets/ai_robot.png";
import * as faceapi from 'face-api.js';

const API_URL = process.env.REACT_APP_API_URL;

function CandidateInterviewPortal({ interviewId }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState("");
  const [candidateInfo, setCandidateInfo] = useState({ name: "", job_description: "", question_count: 5, duration_minutes: 30 });
  const [allowAccessDisabled, setAllowAccessDisabled] = useState(false);
  const videoRef = useRef(null);
  const [stream, setStream] = useState("");
  const [joinClicked, setJoinClicked] = useState(false);
  const [interviewSubmitted, setInterviewSubmitted] = useState(false);
  const [faceModelLoaded, setFaceModelLoaded] = useState(false);
  const webRTCRef = useRef(null);
  
  // Fetch Candidate Info

  useEffect(() => {
  console.log("Candidate Portal using interviewId:", interviewId);
}, [interviewId]);
  useEffect(() => {
  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'); // <-- Add this line
      setFaceModelLoaded(true);
      console.log("[Face Detection] Models loaded successfully");
    } catch (err) {
      console.error("[Face Detection] Model failed to load", err);
    }
  };
  loadModels();
}, []);

  useEffect(() => {
    async function fetchCandidateInfo() {
      try {
        const res = await fetch(`${API_URL}/api/conversational_route/get-candidate-info`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: interviewId }),
        });
        if (!res.ok) {
          // Try to extract error message from backend
          let msg = "Could not fetch candidate info.";
          try {
            const errData = await res.json();
            if (errData && errData.detail) msg = errData.detail;
          } catch {}
          setError(msg);
          if (res.status === 400) setAllowAccessDisabled(true);
          return;
        }
        const data = await res.json();
        setCandidateInfo({
          name: data.name,
          job_description: data.job_description,
          question_count: data.question_count,
          duration_minutes: data.duration_minutes,
        });
      } catch (err) {
        setError("Could not fetch candidate info.");
        setAllowAccessDisabled(true);
      }
    }
    fetchCandidateInfo();
  }, [interviewId]);

  // Setup Conversation
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => {
      console.log("Message:", message);
      logMessage(message);
    },
    onError: (error) => console.error("Error:", error),
    onDebug: (debugInfo) => console.log("Debug:", debugInfo), // Added to fix error
  });

  // Conversation Log
  const conversationLogRef = useRef([]);
  const logMessage = (message) => {
    conversationLogRef.current.push(message);
  };

  const sendLogToBackend = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/conversational_route/save-conversation-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log: conversationLogRef.current }),
      });
      conversationLogRef.current = [];
    } catch (error) {
      console.error("Failed to send log:", error);
    }
  }, []);

  const analyzeConversation = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/conversational_route/analyze-conversation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interview_id: interviewId,
            name: candidateInfo.name,
            job_description: candidateInfo.job_description,
            log: conversationLogRef.current,
          }),
        }
      );
      const data = await res.json();
      console.log("Analysis report:", data.report);
    } catch (error) {
      console.error("Failed to analyze conversation:", error);
    }
  }, [interviewId, candidateInfo]);

  // Request Camera & Mic Permission
  const requestPermissions = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });

      setStream(userStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
    } catch (err) {
      console.error("Permission denied or camera error:", err);
      setError("Camera and Microphone permissions are required to continue.");
    }
  };

  // Start Conversation
  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await fetch(`${API_URL}/api/conversational_route/update-interview-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interview_id: interviewId, status: "ready" }),/*in_progress*/
    });
      console.log("Starting conversation with candidate info:", candidateInfo);
      await conversation.startSession({
        agentId: "agent_2201k3k3srpwe5dby175fp6qphss",
         dynamicVariables: {
          userName: candidateInfo.name,
          jobDesc: candidateInfo.job_description,
          numQuestions: candidateInfo.question_count,
          duration: candidateInfo.duration_minutes,
        },
      });
      setJoinClicked(true); // Disable Join button after first click
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation, candidateInfo]);

  // Stop Conversation
  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    await fetch(`${API_URL}/api/conversational_route/update-interview-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interview_id: interviewId, status: "completed" }),
  });
    console.log("Calling sendLogToBackend...");
    await sendLogToBackend();
    await analyzeConversation();
    setJoinClicked(false);
    setInterviewSubmitted(true);
  }, [conversation, sendLogToBackend, analyzeConversation]);

  // Handle Stream Changes and WebRTC Offerer
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    // Start WebRTC offerer when stream and interviewId are available
    if (stream && interviewId) {
      // Only create once
      if (!webRTCRef.current) {
        webRTCRef.current = createWebRTCOfferer({
          interviewId,
          localStream: stream,
          signalingUrl: 'http://localhost:3002',
          onRemoteStream: () => {}, // Not needed for offerer
          onConnectionStateChange: (state) => {
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
              webRTCRef.current = null;
            }
          }
        });
      }
    }
    // Cleanup on unmount
    return () => {
      if (webRTCRef.current) {
        webRTCRef.current.pc.close();
        webRTCRef.current.socket.disconnect();
        webRTCRef.current = null;
      }
    };
  }, [stream, interviewId]);

  // Cleanup Stream on Unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Removed all code related to sending live frames

  // Load face-api.js models
  useEffect(() => {
  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'); // <-- Add this line
      setFaceModelLoaded(true);
      console.log("[Face Detection] Models loaded successfully");
    } catch (err) {
      console.error("[Face Detection] Model failed to load", err);
    }
  };
  loadModels();
}, []);
  // Detect face, estimate gaze, and send events to backend (face + eye tracking)
  useEffect(() => {
    if (!stream || !videoRef.current || !faceModelLoaded || !(joinClicked || conversation.status === "connected")) return;
    let lastGazeAway = null;
    let gazeAwayStart = null;
    let gazeAwayLogged = false;
    let interval = null;

    const detectFaceAndGaze = async () => {
      const video = videoRef.current;
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        // Detect face with landmarks
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);
        let numFaces = 0;
        let gazeAway = false;
        if (detection) {
          numFaces = 1;
          // Estimate gaze direction using eyes landmarks
          const landmarks = detection.landmarks;
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          // Simple heuristic: compare eye center to face center
          const faceCenter = detection.detection.box.x + detection.detection.box.width / 2;
          const leftEyeCenter = (leftEye[0].x + leftEye[3].x) / 2;
          const rightEyeCenter = (rightEye[0].x + rightEye[3].x) / 2;
          // If both eyes are far from face center, likely looking away
          const eyeOffset = Math.abs(leftEyeCenter - faceCenter) + Math.abs(rightEyeCenter - faceCenter);
          gazeAway = eyeOffset > detection.detection.box.width * 0.18; // Tune this threshold as needed
        }
        // Gaze away logic
        if (gazeAway) {
          if (!gazeAwayStart) gazeAwayStart = Date.now();
          if (Date.now() - gazeAwayStart > 2000 && !gazeAwayLogged) {
            // Prolonged gaze away (>2s)
            gazeAwayLogged = true;
            const payload = {
              interview_id: interviewId,
              event_type: "gaze_away",
              details: "Candidate looked away from screen for over 2 seconds.",
              timestamp: new Date().toISOString(),
            };
            try {
              await fetch(`${API_URL}/api/monitor/behavior-event`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              // Optionally: show a console log
              console.log("[Eye Tracking] Gaze away event sent", payload);
            } catch (err) {
              console.error("[Eye Tracking] Failed to send gaze event", err);
            }
          }
        } else {
          gazeAwayStart = null;
          gazeAwayLogged = false;
        }
        // Face detection event (as before)
        const eventType = numFaces > 1 ? "multiple_faces_detected" : (numFaces === 1 ? "face_detected" : "face_detection_lost");
        const details = `Faces detected: ${numFaces}`;
        const payload = {
          interview_id: interviewId,
          event_type: eventType,
          details,
          num_faces: numFaces,
          timestamp: new Date().toISOString(),
        };
        try {
          await fetch(`${API_URL}/api/monitor/behavior-event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          // Ignore errors for face events
        }
      }
    };
    interval = setInterval(detectFaceAndGaze, 3000);
    return () => clearInterval(interval);
  }, [stream, videoRef, interviewId, faceModelLoaded, joinClicked, conversation.status]);

  // Permission UI
  if (!hasPermission) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
          fontFamily: "'Inter', sans-serif",
          color: "white",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ position: "absolute", top: "20px", left: "30px" }}>
          <img src={logo} alt="Logo" style={{ height: "48px" }} />
        </div>

        <img
          src={aiImage}
          alt="AI Robot"
          style={{ maxWidth: "520px", marginBottom: "2rem" }}
        />

        <h1
          style={{
            fontSize: "52px",
            fontWeight: "700",
            marginBottom: "1rem",
            color: "white",
          }}
        >
          Welcome to AI Interview <br /> Portal
        </h1>
        <p style={{ fontSize: "18px", color: "#cbd5e1", marginBottom: "2rem" }}>
          Please allow camera and microphone access to proceed.
        </p>
        <button
          onClick={requestPermissions}
          disabled={allowAccessDisabled}
          style={{
            padding: "0.9rem 2rem",
            borderRadius: "10px",
            border: "none",
            fontSize: "16px",
            fontWeight: "600",
            background: allowAccessDisabled ? "#888" : "#3b82f6",
            color: "#fff",
            cursor: allowAccessDisabled ? "not-allowed" : "pointer",
            width: "355px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            opacity: allowAccessDisabled ? 0.6 : 1,
          }}
        >
          Allow Access
        </button>
        {error && (
          <p style={{ color: "#f87171", marginTop: "1rem" }}>{error}</p>
        )}
      </div>
    );
  }

  if (interviewSubmitted) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
          fontFamily: "'Inter', sans-serif",
          color: "white",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ position: "absolute", top: "20px", left: "30px" }}>
          <img src={logo} alt="Logo" style={{ height: "48px" }} />
        </div>
        <img
          src={aiImage}
          alt="AI Robot"
          style={{ maxWidth: "520px", marginBottom: "2rem" }}
        />
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "700",
            marginBottom: "1rem",
            color: "white",
          }}
        >
          Interview Submitted
        </h1>
        <p style={{ fontSize: "18px", color: "#cbd5e1", marginBottom: "2rem" }}>
          Your interview has been submitted.<br />
          Our team will review it now.
        </p>
      </div>
    );
  }

  // Main Interview UI
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
        fontFamily: "'Inter', sans-serif",
        color: "white",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "20px", left: "30px" }}>
        <img src={logo} alt="Logo" style={{ height: "42px" }} />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          gap: "4rem",
        }}
      >
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "620px",
              height: "600px",
              borderRadius: "16px",
              objectFit: "cover",
              boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "50px",
              fontWeight: "700",
              color: "white",
              marginBottom: "0.5rem",
              textAlign: "center",
              marginRight: "22rem",
            }}
          >
            AI Technical Interview
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "20px",
              padding: "3rem 2rem",
              boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
              textAlign: "center",
              width: "460px",
              marginRight: "22rem",
            }}
          >
            <MdSmartToy
              style={{
                fontSize: "80px",
                color: "#3b82f6",
                marginBottom: "1.5rem",
              }}
            />
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "2.5rem",
                color: "white",
              }}
            >
              AI Interviewer
            </h3>

            <div
              style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}
            >
              <button
                onClick={startConversation}
                disabled={joinClicked || conversation.status === "connected"}
                style={{
                  padding: "0.9rem 2rem",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "600",
                  background:
                    joinClicked || conversation.status === "connected"
                      ? "#888"
                      : "#2563eb",
                  color: "#fff",
                  cursor:
                    joinClicked || conversation.status === "connected"
                      ? "not-allowed"
                      : "pointer",
                  width: "190px",
                  opacity:
                    joinClicked || conversation.status === "connected"
                      ? 0.5
                      : 1,
                }}
              >
                Join
              </button>
              <button
                onClick={stopConversation}
                disabled={conversation.status !== "connected"}
                style={{
                  padding: "0.9rem 2rem",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "600",
                  background:
                    "linear-gradient(90deg, #E84340 0%, #B02334 100%)",
                  color: "#fff",
                  cursor:
                    conversation.status !== "connected"
                      ? "not-allowed"
                      : "pointer",
                  width: "150px",
                }}
              >
                Cancel
              </button>
            </div>

            <p style={{ fontSize: "15px", color: "#e2e8f0" }}>
              {conversation.status === "connected"
                ? `Agent is ${
                    conversation.isSpeaking ? "speaking" : "listening"
                  }`
                : "Disconnected · Agent is listening"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateInterviewPortal;
