import { useState, useRef, useEffect, useCallback } from "react";

export const useRealtimeVoiceAgent = (audioRef) => {
  const [agentStatus, setAgentStatus] = useState("idle"); // idle, connecting, ready, listening, thinking, speaking, error
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [finalResponse, setFinalResponse] = useState("");

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const aiSpeechEndedRef = useRef(false);
  const audioQueue = useRef([]); // This will now hold chunks for a single blob.
  const isConnecting = useRef(false);

  const playAudio = useCallback(() => {
    if (audioQueue.current.length === 0) return;

    const audioBlob = new Blob(audioQueue.current, { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);
    audioRef.current.src = audioUrl;

    audioRef.current
      .play()
      .catch((e) => console.error("Audio play failed:", e));

    const onPlaybackEnded = () => {
      setAgentStatus("ready");
      aiSpeechEndedRef.current = false;
      // Clean up the URL object to free memory
      URL.revokeObjectURL(audioUrl);
      audioRef.current.removeEventListener("ended", onPlaybackEnded);
    };

    audioRef.current.addEventListener("ended", onPlaybackEnded);

    // Clear the queue for the next interaction
    audioQueue.current = [];
  }, [audioRef]);

  const stopAgent = useCallback(async () => {
    isConnecting.current = false;
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setAgentStatus("idle");
    setTranscript("");
    setAiResponse("");
    setFinalResponse("");
    console.log("Agent stopped and cleaned up.");
  }, []);

  const startAgent = useCallback(async () => {
    // Check if WebSocket is available (not on Vercel)
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isLocalhost) {
      console.log(
        "WebSocket not available on this platform, should use HTTP agent instead"
      );
      setAgentStatus("idle");
      return;
    }

    if (agentStatus !== "idle" || isConnecting.current) return;
    isConnecting.current = true;

    setAgentStatus("connecting");
    setTranscript("");
    setAiResponse("");
    setFinalResponse("");
    audioQueue.current = [];
    aiSpeechEndedRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorderMimeType = "audio/webm; codecs=opus";
      if (!MediaRecorder.isTypeSupported(recorderMimeType)) {
        console.error(`Unsupported recorder MIME type: ${recorderMimeType}`);
        setAgentStatus("error");
        setFinalResponse(
          "Your browser does not support the required audio recording format."
        );
        await stopAgent();
        return;
      }
      const recorder = new MediaRecorder(stream, {
        mimeType: recorderMimeType,
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (
          event.data.size > 0 &&
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result.split(",")[1];
            socketRef.current.send(
              JSON.stringify({ type: "audio_chunk", data: base64String })
            );
          };
          reader.readAsDataURL(event.data);
        }
      };

      recorder.onstop = () => {
        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          socketRef.current.send(JSON.stringify({ type: "stop_streaming" }));
        }
      };

      const socket = new WebSocket("ws://localhost:8001/ws/voice");
      socketRef.current = socket;
      socket.binaryType = "arraybuffer";

      socket.onopen = () => {
        isConnecting.current = false;
        // Send authentication token
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        console.log(
          "DEBUG: Token found:",
          token ? `${token.substring(0, 20)}...` : "null"
        );
        console.log("DEBUG: Role found:", role);

        if (token) {
          socket.send(JSON.stringify({ type: "auth", token: token }));
          console.log("WebSocket connected, authentication sent.");
        } else {
          setAgentStatus("error");
          setFinalResponse("Authentication required. Please log in first.");
          console.error("No authentication token found");
          return;
        }
      };

      socket.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          if (agentStatus !== "speaking") {
            setAgentStatus("speaking");
          }
          audioQueue.current.push(event.data);
          return;
        }

        const message = JSON.parse(event.data);
        switch (message.type) {
          case "auth_success":
            setAgentStatus("ready");
            console.log("Authentication successful, agent ready.");
            break;
          case "auth_error":
            setAgentStatus("error");
            setFinalResponse("Authentication failed. Please log in again.");
            console.error("Authentication failed:", message.data);
            break;
          case "transcript":
            setTranscript(message.data);
            break;
          case "ai_response":
            setAiResponse((prev) => prev + message.data);
            break;
          case "ai_speech_end":
            aiSpeechEndedRef.current = true;
            playAudio(); // All audio chunks received, play the full audio
            break;
          case "final_response":
            setFinalResponse(message.data);
            break;
          case "error":
            setAgentStatus("error");
            setFinalResponse(message.data || "An error occurred.");
            break;
          default:
            break;
        }
      };

      socket.onerror = (error) => {
        isConnecting.current = false;
        console.error("WebSocket error:", error);
        setAgentStatus("error");
        setFinalResponse("A connection error occurred.");
      };

      socket.onclose = (event) => {
        isConnecting.current = false;
        console.log("WebSocket disconnected:", event.code, event.reason);
        if (agentStatus !== "idle" && agentStatus !== "error") {
          setAgentStatus("error");
          setFinalResponse("Connection to server lost.");
        }
      };
    } catch (error) {
      isConnecting.current = false;
      console.error("Could not start agent.", error);
      setAgentStatus("error");
      setFinalResponse(`Error: Could not access microphone. ${error.message}`);
      await stopAgent();
    }
  }, [agentStatus, stopAgent, playAudio]);

  const startRecording = useCallback(() => {
    // Only allow starting a new recording when the agent is fully ready.
    if (agentStatus === "ready") {
      // Clear previous conversation state for the new turn.
      setTranscript("");
      setAiResponse("");
      setFinalResponse("");
      aiSpeechEndedRef.current = false;
      audioQueue.current = [];

      // Send a config message to the backend to signal the start of a new audio stream.
      // This is crucial for the backend to switch from 'waiting_for_config' to 'processing_audio' state.
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(
          JSON.stringify({
            type: "audio_config",
            config: { mimeType: mediaRecorderRef.current.mimeType },
          })
        );
      }

      // Start the actual recording.
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "inactive"
      ) {
        setAgentStatus("listening");
        mediaRecorderRef.current.start(250);
      }
    }
  }, [agentStatus]);

  const stopRecording = useCallback(() => {
    if (agentStatus === "listening") {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        setAgentStatus("thinking");
        mediaRecorderRef.current.stop();
      }
    }
  }, [agentStatus]);

  // Create a ref to hold the stopAgent function to ensure the cleanup effect
  // always calls the latest version of the function without needing it as a dependency.
  const stopAgentRef = useRef(stopAgent);
  useEffect(() => {
    stopAgentRef.current = stopAgent;
  });

  useEffect(() => {
    // This cleanup function will be called when the component unmounts.
    // It's crucial for handling React StrictMode's unmount/remount cycle in development.
    return () => {
      stopAgentRef.current();
    };
  }, []); // The empty dependency array ensures this effect runs only on mount and unmount.

  return {
    agentStatus,
    transcript,
    aiResponse,
    finalResponse,
    startAgent,
    stopAgent,
    startRecording,
    stopRecording,
  };
};
