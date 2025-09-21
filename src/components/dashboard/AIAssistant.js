import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  Paperclip,
  FileText,
  Copy,
  Share2,
  X as XIcon,
  Linkedin,
  Link2,
  AudioWaveform,
  Volume2,
  VolumeX,
  icons,
} from "lucide-react";
import api from "../../services/api";
import "../../assets/chat-styles.css";
import logo from "../../assets/11.png";
import userAvatar from "../../assets/user-avatar.png";
import VoiceAgent from "../ui-components/VoiceAgent";
import { useSpeechToText } from "../../hooks/useSpeechToText";
import { FiWifi } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// Sub-component: ChatMessage
const ChatMessage = ({ msg, onCopy, onShare, currentAudio, onMuteAudio }) => {
  const isUser = msg.type === "user";

  return (
    <div className={`chat-message-wrapper ${isUser ? "user" : "ai"}`}>
      <div className="avatar-container">
        {isUser ? (
          <img src={userAvatar} alt="User Avatar" className="avatar-logo" />
        ) : (
          <img src={logo} alt="AI Avatar" className="avatar-logo" />
        )}
      </div>
      <div className="chat-message-content">
        <div className={`chat-bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
          {msg.isFile ? (
            <div className="file-display">
              <FileText size={18} />
              <span>{msg.fileName}</span>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: msg.content }} />
          )}
        </div>
        {!isUser && msg.content && !msg.content.includes("download-link") && (
          <div className="message-actions">
            <button onClick={() => onCopy(msg.content)} title="Copy">
              <Copy size={14} />
            </button>
            <button onClick={() => onShare(msg.content)} title="Share">
              <Share2 size={14} />
            </button>
            {currentAudio && msg.hasAudio && (
              <button
                onClick={() => onMuteAudio()}
                title={currentAudio.muted ? "Unmute" : "Mute"}
                className="audio-control-btn"
              >
                {currentAudio.muted ? (
                  <VolumeX size={14} />
                ) : (
                  <Volume2 size={14} />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ShareModal = ({ text, onClose }) => {
  const shareOptions = [
    {
      name: "Copy Text",
      icon: <Link2 size={24} />,
      action: () => navigator.clipboard.writeText(text),
    },
    {
      name: "X",
      icon: <XIcon size={24} />,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
          "_blank"
        ),
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={24} />,
      action: () =>
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&summary=${encodeURIComponent(
            text
          )}&title=AI%20Assistant%20Response`,
          "_blank"
        ),
    },
  ];

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          <XIcon size={18} />
        </button>
        <h3>Share Response</h3>
        <div className="share-options-grid">
          {shareOptions.map((opt) => (
            <div
              key={opt.name}
              className="share-option"
              onClick={() => {
                opt.action();
                onClose();
              }}
            >
              <div className="share-icon-wrapper">{opt.icon}</div>
              <span>{opt.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sub-component: TypingIndicator
const TypingIndicator = () => (
  <div className="chat-message-wrapper ai">
    <div className="avatar-container">
      <img src={logo} alt="AI Avatar" className="avatar-logo" />
    </div>
    <div className="chat-message-content">
      <div className="typing-indicator">
        <div className="dot-flashing"></div>
      </div>
    </div>
  </div>
);

// Sub-component: EmptyState
const EmptyState = ({ onSampleQuery, role }) => {
  const employeePrompts = [
    "What is the leave policy?",
    "Generate my salary slip for last month",
    "What are the company holidays this year?",
    "Apply for 3 days sick leave from today",
    "Show me my performance goals",
    "What is the remote work policy?",
  ];

  const adminPrompts = [
    "Show me the employee attrition analysis",
    "List Sales team details",
    "What are pending leave requests?",
    "Show high-risk employees for churn",
    "List all open grievances",
    "Get dashboard analytics summary",
  ];

  const prompts = role === "admin" ? adminPrompts : employeePrompts;
  const greeting =
    role === "admin"
      ? "What would you like to manage today?"
      : "How can I help you today?";

  return (
    <div className="empty-state-container">
      <div className="empty-state-logo">
        <img src={logo} alt="AI Avatar" className="avatar-logo large" />
      </div>
      <h1>{greeting}</h1>
      <div className="sample-queries-grid">
        {prompts.map((prompt, index) => (
          <button  key={index} onClick={() => onSampleQuery(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Component
const AIAssistant = ({ role }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [copyNotification, setCopyNotification] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [textToShare, setTextToShare] = useState("");
  const [isVoiceAgentOpen, setVoiceAgentOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const navigate = useNavigate();

  // Auto-reconnect functionality
  useEffect(() => {
    if (connectionStatus === "disconnected") {
      const timer = setTimeout(() => {
        setConnectionStatus("connected");
      }, 5000); // Try to reconnect after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  const {
    isRecording: isSttRecording,
    isSupported: speechSupported,
    toggleRecording: toggleSttRecording,
  } = useSpeechToText((transcript) => {
    setQuery((prev) => prev + transcript);
  });

  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const uploadedFileRef = useRef(null);
  const textareaRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, loading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [query]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
      // Escape to clear input
      if (e.key === "Escape") {
        setQuery("");
        textareaRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content:
            "⚠️ File size too large. Please upload files smaller than 10MB.",
        },
      ]);
      return;
    }

    // Check file type
    const allowedTypes = [
      "pdf",
      "doc",
      "docx",
      "txt",
      "csv",
      "jpg",
      "jpeg",
      "png",
    ];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content:
            "⚠️ Unsupported file type. Please upload PDF, DOC, DOCX, TXT, CSV, or image files.",
        },
      ]);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    uploadedFileRef.current = file;
    setChatHistory((prev) => [
      ...prev,
      {
        type: "user",
        content: `File uploaded: ${file.name}`,
        isFile: true,
        fileName: file.name,
      },
    ]);

    setTimeout(() => {
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }, 1000);

    setChatHistory((prev) => [
      ...prev,
      {
        type: "ai",
        content: `✅ I've received **${file.name}**. What would you like me to do with it?`,
      },
    ]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMuteAudio = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
        setCurrentAudio((prev) => (prev ? { ...prev, muted: false } : null));
      } else {
        audioRef.current.muted = true;
        setIsMuted(true);
        setCurrentAudio((prev) => (prev ? { ...prev, muted: true } : null));
      }
    }
  };

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentAudio(null);
      setIsMuted(false);
    }
  };

  const handleSubmit = async (queryOverride) => {
    const userQuery =
      typeof queryOverride === "string" ? queryOverride : query.trim();
    if (!userQuery && !uploadedFileRef.current) return;

    const newHistory = [...chatHistory];
    if (userQuery) newHistory.push({ type: "user", content: userQuery });

    setChatHistory(newHistory);
    setLoading(true);
    setQuery("");

    try {
      let employeeId = null;
      if (role === "employee") {
        employeeId = localStorage.getItem("employee_id");
        if (!employeeId)
          throw new Error("Could not identify employee. Please log in again.");
      }

      const recentHistory = newHistory.slice(-6);

      let documentId = null;
      if (uploadedFileRef.current) {
        const uploadResponse = await api.uploadDocument(
          employeeId,
          uploadedFileRef.current
        );
        documentId = uploadResponse.document_id;
        uploadedFileRef.current = null;
      }

      const response = await api.processQuery(
        userQuery,
        recentHistory,
        documentId
      );

      let hasAudio = false;
      if (response.avatar_audio) {
        // Stop any currently playing audio
        stopCurrentAudio();

        try {
          // Debug: Log audio data info
          console.log("Audio data received:", {
            length: response.avatar_audio.length,
            firstChars: response.avatar_audio.substring(0, 50),
            lastChars: response.avatar_audio.substring(
              response.avatar_audio.length - 50
            ),
          });

          // Check if avatar_audio is actually base64 encoded audio or just text
          const isBase64Audio =
            response.avatar_audio.length > 1000 &&
            !response.avatar_audio.includes(" ") &&
            /^[A-Za-z0-9+/]*={0,2}$/.test(response.avatar_audio);

          if (!isBase64Audio) {
            console.warn(
              "Audio data appears to be text, not base64 encoded audio"
            );
            hasAudio = false;
          } else {
            // Create audio element and test different MIME types
            const audio = new Audio();
            const audioFormats = [
              "audio/mp3",
              "audio/mpeg",
              "audio/wav",
              "audio/ogg",
            ];

            let formatIndex = 0;

            const tryNextFormat = () => {
              if (formatIndex >= audioFormats.length) {
                console.error(
                  "All audio formats failed. This might be due to:"
                );
                console.error("1. Invalid base64 audio data from backend");
                console.error("2. Unsupported audio format");
                console.error("3. Missing OpenAI TTS configuration");
                console.error("4. Agent engine not generating proper audio");

                // Show user-friendly message
                setChatHistory((prev) => [
                  ...prev,
                  {
                    type: "ai",
                    content:
                      "🔊 Audio playback is currently unavailable. Please check your browser settings or try refreshing the page.",
                    hasAudio: false,
                  },
                ]);

                setCurrentAudio(null);
                setIsMuted(false);
                audioRef.current = null;
                hasAudio = false;
                return;
              }

              const format = audioFormats[formatIndex];
              const audioDataUrl = `data:${format};base64,${response.avatar_audio}`;

              console.log(`Trying audio format: ${format}`);
              audio.src = audioDataUrl;
              formatIndex++;
            };

            // Set up audio event listeners
            audio.addEventListener("loadstart", () => {
              setCurrentAudio({ muted: false, playing: true });
            });

            audio.addEventListener("canplaythrough", () => {
              console.log("Audio loaded successfully");
            });

            audio.addEventListener("ended", () => {
              setCurrentAudio(null);
              setIsMuted(false);
              audioRef.current = null;
            });

            audio.addEventListener("error", (e) => {
              console.error(
                `Audio error with format ${audioFormats[formatIndex - 1]}:`,
                e
              );
              tryNextFormat();
            });

            audioRef.current = audio;
            hasAudio = true;

            // Try the first format
            tryNextFormat();

            // Attempt to play the audio
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.error("Error playing audio:", error);
                tryNextFormat();
              });
            }
          }
        } catch (error) {
          console.error("Error setting up audio:", error);
          hasAudio = false;
        }
      }

      let aiResponse = { type: "ai", content: "", hasAudio };
      if (response.salary_slip_path) {
        // Extract parameters from the salary slip path
        const urlParams = new URLSearchParams(
          response.salary_slip_path.split("?")[1]
        );
        const month = urlParams.get("month");
        const year = urlParams.get("year");
        const employeeId = localStorage.getItem("employee_id");

        try {
          // Download the salary slip automatically
          await api.generateSalarySlipForMonth(employeeId, month, year);
          aiResponse.content = `Your salary slip for ${
            month.charAt(0).toUpperCase() + month.slice(1)
          } ${year} has been downloaded successfully.`;
        } catch (error) {
          console.error("Error downloading salary slip:", error);
          // Fallback to the original link approach
          const API_URL =
            process.env.REACT_APP_API_URL || "http://localhost:8001";
          const downloadUrl = `${API_URL}/${response.salary_slip_path}`;
          aiResponse.content = `Your salary slip has been generated. <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="download-link">Download Salary Slip</a>`;
        }
      } else {
        aiResponse.content = response.response;
      }

      setChatHistory((prev) => [...prev, aiResponse]);
      uploadedFileRef.current = null;
    } catch (error) {
      console.error("AI Assistant Error:", error);

      let errorMessage = "Sorry, I encountered an error. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "🔒 Your session has expired. Please log in again.";
        setConnectionStatus("disconnected");
      } else if (error.response?.status === 403) {
        errorMessage = "⚠️ You don't have permission to perform this action.";
      } else if (error.response?.status === 429) {
        errorMessage =
          "⏳ Too many requests. Please wait a moment and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage = "🔧 Server error. Our team has been notified.";
        setConnectionStatus("error");
      } else if (
        error.message.includes("NetworkError") ||
        error.message.includes("fetch")
      ) {
        errorMessage =
          "🌐 Connection error. Please check your internet connection.";
        setConnectionStatus("disconnected");
      } else {
        errorMessage =
          error.response?.data?.detail || error.message || errorMessage;
      }

      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    const plainText = text.replace(/<[^>]*>?/gm, "");
    navigator.clipboard.writeText(plainText).then(() => {
      setCopyNotification("Copied to clipboard!");
      setTimeout(() => setCopyNotification(""), 2000);
    });
  };

  const handleShare = (text) => {
    const plainText = text.replace(/<[^>]*>?/gm, "");
    setTextToShare(plainText);
    setShareModalOpen(true);
  };

  return (
    <div className="ai-assistant-container">
      {/* Connection Status Indicator */}
      {connectionStatus !== "connected" && (
        <div className={`connection-status-bar ${connectionStatus}`}>
          {connectionStatus === "disconnected" &&
            "🔌 Disconnected - Check your connection"}
          {connectionStatus === "error" && "⚠️ Service temporarily unavailable"}
        </div>
      )}

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="upload-progress-container">
          <div className="upload-progress-bar">
            <div
              className="upload-progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="upload-progress-text">
            Uploading... {uploadProgress}%
          </span>
        </div>
      )}

      <div className="chat-history-container" ref={chatContainerRef}>
        {chatHistory.length === 0 && !loading ? (
          <EmptyState onSampleQuery={handleSubmit} role={role} />
        ) : (
          <div className="chat-messages-list">
            {chatHistory.map((msg, index) => (
              <ChatMessage
                key={index}
                msg={msg}
                onCopy={copyToClipboard}
                onShare={handleShare}
                currentAudio={currentAudio}
                onMuteAudio={handleMuteAudio}
              />
            ))}
            {loading && <TypingIndicator />}
          </div>
        )}
      </div>
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <button
            className="input-action-btn"
            onClick={() => fileInputRef.current.click()}
            title="Upload Document"
            disabled={loading}
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx,.txt,.csv,image/*"
          />
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSubmit())
            }
            placeholder={
              isSttRecording ? "Listening..." : "Ask anything or drop a file..."
            }
            className="chat-textarea"
            rows={1}
            disabled={loading}
          />
          {speechSupported && (
            <>
              <button
                className={`input-action-btn ${
                  isSttRecording ? "recording" : ""
                }`}
                onClick={toggleSttRecording}
                title={isSttRecording ? "Stop" : "Speak to type"}
                disabled={loading}
              >
                <Mic size={20} />
              </button>
            </>
          )}

          {query.trim() !== "" && (
            <button
              className="send-btn"
              onClick={() => handleSubmit()}
              disabled={(!query.trim() && !uploadedFileRef.current) || loading}
              title="Send"
            >
              <Send size={20} />
            </button>
          )}
          {query.trim() === "" && (
            <button
              className="input-action-btn"
              onClick={() => navigate("/Voice")}
              title="Voice Agent"
              disabled={loading}
            >
              <FiWifi size={20} />
            </button>
          )}
        </div>
      </div>
      {/*  <button 
                className={`input-action-btn`}
                onClick={() => setVoiceAgentOpen(true)} 
                title={'Voice Agent'}
                disabled={loading}
              >
                  <AudioWaveform size={20} />
              </button>*/}
      {uploadedFileRef.current && (
        <div className="file-preview">
          Attached: {uploadedFileRef.current.name}
        </div>
      )}
      {copyNotification && <div className="copy-toast">{copyNotification}</div>}
      {shareModalOpen && (
        <ShareModal
          text={textToShare}
          onClose={() => setShareModalOpen(false)}
        />
      )}
      <VoiceAgent
        show={isVoiceAgentOpen}
        onClose={() => setVoiceAgentOpen(false)}
        setChatHistory={setChatHistory}
        setLoading={setLoading}
      />
    </div>
  );
};
export default AIAssistant;
