"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { FaRobot } from "react-icons/fa";
import logo from "../../assets/logo.png";
import aiImage from "../../assets/ai_robot.png";
function CandidateInterviewPortal() {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
  });

  // Request camera & mic permissions
 const [stream, setStream] = useState(null); // <-- new state

// Request camera & mic permissions
const requestPermissions = async () => {
  try {
    const userStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: "user" },
      audio: true,
    });

    setStream(userStream); // <-- save stream in state
    setHasPermission(true);
  } catch (err) {
    console.error("Permission denied or camera error:", err);
    setError("Camera and Microphone permissions are required to continue.");
  }
};

// Attach stream to video when available
useEffect(() => {
  if (videoRef.current && stream) {
    videoRef.current.srcObject = stream;
    videoRef.current
      .play()
      .catch((err) => console.error("Autoplay error:", err));
  }
}, [stream]);

// Stop camera tracks on unmount
useEffect(() => {
  return () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };
}, [stream]);

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: "agent_6701k3438s99ehnb5jgfbc7ycpgt",
        dynamicVariables: {
          userName: "Julias",
          jobDesc: "Software Engineer(Python)",
        },
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  // Stop camera tracks on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const buttonHover = { transform: "scale(1.05)", filter: "brightness(1.15)" };

  // Styles
  const styles = {
    layout: {
      display: "flex",
      height: "100vh",
      width: "100%",
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
      background: "#edeeefff",
    },
    permissionLayout: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100%",
      textAlign: "center",
      padding: "2rem",
      backgroundColor: "white",
    },
    card: {
      background: "#182955",
      backdropFilter: "blur(15px)",
      borderRadius: "25px",
      padding: "3rem 4rem",
      boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
      maxWidth: "500px",
      height: "600px",
      width: "600px",
      textAlign: "center",
      color: "#fff",
    },
    error: { marginTop: "1rem", color: "#f87171", fontWeight: 500 },
    button: {
      padding: "1rem 2rem",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: 600,
      cursor: "pointer",
      background: "linear-gradient(135deg, #3b82f6, #1313abff)",
      color: "#fff",
      marginTop: "2rem",
      boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
      transition: "all 0.3s ease",
    },
    leftPane: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    },
    video: {
      width: "65%",
      height: "79%",
      borderRadius: "20px",
      objectFit: "cover",
      boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
      border: "2px solid rgba(255,255,255,0.2)",
      backdropFilter: "blur(5px)",
    },
    rightPane: {
      flex: 1.2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    },
    agentBox: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "2rem",
      padding: "3rem 2rem",
      background: "#182955",
      backdropFilter: "blur(20px)",
      borderRadius: "25px",
      boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      width: "100%",
      maxWidth: "500px",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    headerBox: {
      background: "rgba(255,255,255,0.1)",
      padding: "1rem 2rem",
      borderRadius: "15px",
      backdropFilter: "blur(10px)",
      boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
      textAlign: "center",
      fontSize: "24px",
      fontWeight: "700",
      width: "100%",
      color: "#fff",
    },
    robotIcon: { fontSize: "75px", color: "#3b82f6", marginBottom: "1rem" },
    buttonContainer: { display: "flex", gap: "1rem", width: "100%" },
    startBtn: {
      background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
      color: "white",
    },
    stopBtn: {
      background: "linear-gradient(135deg, #4463efff, #331cb9ff)",
      color: "white",
    },
    disabledBtn: {
      backgroundColor: "rgba(255,255,255,0.2)",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    statusBox: {
      textAlign: "center",
      background: "rgba(255,255,255,0.1)",
      padding: "1rem 1.5rem",
      borderRadius: "15px",
      backdropFilter: "blur(10px)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
      width: "100%",
    },
    statusText: {
      margin: "0.3rem 0",
      fontSize: "15px",
      fontWeight: 500,
      color: "#fff",
    },
  };

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
       {/* Logo (top-left) */}
       <div style={{ position: "absolute", top: "20px", left: "30px" }}>
         <img
           src={logo} 
           alt="NamaSYS Logo"
           style={{ height: "48px", objectFit: "contain" }}
         />
       </div>

       {/* AI Image */}
       <img
         src={aiImage}
         alt="AI Robot"
         style={{ maxWidth: "520px", marginBottom: "2rem" }}
       />

       {/* Heading */}
       <h1
         style={{ fontSize: "52px", fontWeight: "700", marginBottom: "1rem" ,color:"white" }}
       >
         Welcome to AI Interview <br></br> Portal
       </h1>

       {/* Subtext */}
       <p style={{ fontSize: "18px", color: "#cbd5e1", marginBottom: "2rem" }}>
         Please allow camera and microphone access to proceed.
       </p>

       {/* Allow Button */}
       <button
         onClick={requestPermissions}
         style={{
           padding: "0.9rem 2rem",
           borderRadius: "10px",
           border: "none",
           fontSize: "16px",
           fontWeight: "600",
           background: "#3b82f6",
           color: "#fff",
           cursor: "pointer",
           transition: "all 0.3s ease",
           width:"355px",
           boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
         }}
         onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
         onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
       >
         Allow Access
       </button>

       {/* Error message */}
       {error && <p style={{ color: "#f87171", marginTop: "1rem" }}>{error}</p>}
     </div>
   );
 }

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
    {/* Logo */}
    <div style={{ position: "absolute", top: "20px", left: "30px" }}>
      <img
        src={logo}
        alt="NamaSYS Logo"
        style={{ height: "42px", objectFit: "contain" }}
      />
    </div>

    {/* Main Layout */}
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
      {/* Left - Candidate Video */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
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

      {/* Right Side */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Title outside box */}
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

        {/* AI Interview Box */}
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
          {/* Icon */}
          <FaRobot
            style={{
              fontSize: "80px",
              color: "#3b82f6",
              marginBottom: "1.5rem",
            }}
          />

          {/* Subtitle */}
          <h3
            style={{
              fontSize: "22px",
              fontWeight: "600",
              marginBottom: "2.5rem",
              color: "white",
            }}
          >
            AI Interview
          </h3>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
            <button
              onClick={startConversation}
              disabled={conversation.status === "connected"}
              style={{
                padding: "0.9rem 2rem",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor:
                  conversation.status === "connected"
                    ? "not-allowed"
                    : "pointer",
                background: "#2563eb",
                color: "#fff",
                width: "190px",
                transition: "0.2s ease-in-out",
              }}
            >
              Join
            </button>
            <button
              onClick={stopConversation}
              disabled={conversation.status !== "connected"}
              style={{
                padding: "0.9rem 2rem",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor:
                  conversation.status !== "connected"
                    ? "not-allowed"
                    : "pointer",
                background: "linear-gradient(90deg, #E84340 0%, #B02334 100%)",
                color: "#fff",
                width: "150px",
                transition: "0.2s ease-in-out",
              }}
            >
              Cancel
            </button>
          </div>

          {/* Status */}
          <p style={{ fontSize: "15px", color: "#e2e8f0" }}>
            {conversation.status === "connected"
              ? `Agent is ${conversation.isSpeaking ? "speaking" : "listening"}`
              : "Disconnected · Agent is listening"}
          </p>
        </div>
      </div>
    </div>
  </div>
);
}

export default CandidateInterviewPortal;
