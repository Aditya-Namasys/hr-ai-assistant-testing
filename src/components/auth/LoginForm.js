import React, { useState } from "react";
import api from "../../services/api";
import logo from "../../assets/Logo.svg";
import upscaleImage from "../../assets/ai-face.png"; // Left side decorative image
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Eye icons

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.login({ username, password });
      onLogin(response);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message ||
          "Connection error. Please check your internet and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputWrapperStyle = {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "8px 16px",
    gap: "4px",
    width: "480px",
    height: "50px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "6px",
    position: "relative",
  };

  const inputStyle = {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#fff",
    fontSize: "14px",
  };

  const eyeIconStyle = {
    position: "absolute",
    right: "16px",
    cursor: "pointer",
    color: "#fff",
    fontSize: "20px",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background:
          "linear-gradient(72.68deg, rgba(55,134,233,0) 34.36%, rgba(55,134,233,0.45) 85.23%), linear-gradient(287.35deg, #182955 0%, #182955 15.88%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Responsive tweaks only */}
      <style>
        {`
          .custom-input::placeholder { color: rgba(255,255,255,0.5) !important; opacity: 1 !important;
       }
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus,
                textarea:-webkit-autofill,
                select:-webkit-autofill {
                -webkit-box-shadow: 0 0 0px 1000px transparent inset; 
                -webkit-text-fill-color: #fff; 
                 caret-color:#fff;
                 transition: background-color 5000s ease-in-out 0s;   
                                                                        }
          @media (max-width: 1200px) {
            img[alt="Decorative"] { display: none !important; }
            .decorative-circle { display: none !important; }
            .login-box {
              position: absolute !important;
              right: 0 !important;
              margin: 0 auto !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              width: 95% !important;
              gap: 20px !important;
            }
            .login-box h1 { font-size: 28px !important; line-height: 34px !important; }
            .login-box p { font-size: 14px !important; }
            .login-box form { gap: 16px !important; }
            .login-box input, .login-box button { width: 100% !important; }
          }
        `}
      </style>

      {/* Decorative Ellipse */}
      <div
        className="decorative-circle"
        style={{
          position: "absolute",
          width: "65vw",
          height: "65vw",
          maxWidth: "1307px",
          maxHeight: "1307px",
          left: "50vw",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(53,136,231,0.05)",
          borderRadius: "50%",
        }}
      />

      {/* Left Side Image */}
      <img
        src={upscaleImage}
        alt="Decorative"
        style={{
          position: "absolute",
          width: "700px",
          height: "830px",
          left: "99px",
          top: "50%",
          transform: "translateY(-50%)",
          objectFit: "contain",
        }}
      />

      {/* Right Side Login Box */}
      <div
        className="login-box"
        style={{
          position: "absolute",
          width: "480px",
          height: "628.45px",
          right: "120px",
          top: "calc(50% - 628.45px/2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "42px",
          marginRight: "160px",
        }}
      >
        {/* Logo */}
        <img
          src={logo}
          alt="Logo"
          style={{ width: "377px", maxHeight: "100%" }}
        />

        {/* Heading */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h1
            style={{
              fontSize: "62px",
              fontWeight: "600",
              lineHeight: "70px",
              margin: 0,
              color: "white",
            }}
          >
            Sign in to your account
          </h1>
          <p
            style={{
              fontSize: "18px",
              lineHeight: "22px",
              margin: 0,
              color: "#FFFFFF",
            }}
          >
            Securely sign in to enjoy a seamless experience.
          </p>
        </div>

        {/* Form */}
        <form
          autoComplete="off" // disables autofill for the form
          style={{
            width: "480px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
          onSubmit={handleSubmit}
        >
          {/* Hidden dummy fields (trap Chrome autofill) */}
          <input
            type="text"
            name="name"
            style={{ display: "none" }}
            autoComplete="off"
          />
          <input
            type="password"
            name="password"
            style={{ display: "none" }}
            autoComplete="new-password"
          />

          {/* Username */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label
              style={{ fontSize: "14px", fontWeight: "500", color: "#fff" }}
            >
              Username
            </label>
            <div style={inputWrapperStyle}>
              <input
                type="text"
                name="username"
                autoComplete="off" // disables autofill
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                className="custom-input"
              />
            </div>
          </div>

          {/* Password */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label
              style={{ fontSize: "14px", fontWeight: "500", color: "#fff" }}
            >
              Password
            </label>
            <div style={inputWrapperStyle}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password" // prevents saved password autofill
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                className="custom-input"
              />
              <div
                style={eyeIconStyle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

          {/* Forgot Password */}
          <div
            style={{
              fontSize: "14px",
              textAlign: "left",
              textDecoration: "underline",
              color: "white",
              cursor: "pointer",
            }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot your password?
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "8px 16px",
              width: "480px",
              height: "50px",
              background: "#3588E7",
              borderRadius: "6px",
              border: "none",
              fontSize: "16px",
              fontWeight: "500",
              color: "#fff",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
