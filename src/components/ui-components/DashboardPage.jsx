import React from "react";
import {
  ExternalLink,
  Home,
  Users,
  BarChart3,
  Calendar,
  Search,
  MessageSquare,
} from "lucide-react";
import image from "../../assets/image.png";
import robotImg from "../../assets/bg_removal.png";
import logoImg from "../../assets/Logo.svg";

const DashboardPage = ({
  activeSection,
  setActiveSection,
  setShowDashboardLanding,
  role,
  onLogout,
}) => {
  const features = [
    {
      id: "dashboard",
      title: "HR Dashboard",
      desc: "Stay on top of employees, approvals, and performance in one sleek snapshot.",
      icon: <Home size={35} />,
    },
    {
      id: "employees",
      title: "Employees",
      desc: "A complete directory with profiles, skills, and insights at your fingertips.",
      icon: <Users size={35} />,
    },
    {
      id: "attrition-analysis",
      title: "Attrition Analysis",
      desc: "Spot trends early, reduce turnover, and keep your top talent engaged.",
      icon: <BarChart3 size={35} />,
      highlight: true,
    },
    {
      id: "leaves",
      title: "Leave Management",
      desc: "Approve, track, and manage leaves in seconds — no paperwork, no chaos.",
      icon: <Calendar size={35} />,
    },
    {
      id: "ai-assistant",
      title: "AI Assistant",
      desc: "Answers, automates, and suggests — like having an HR expert always on call.",
      icon: <Search size={35} />,
    },
    {
      id: "ai-interviewer",
      title: "AI Interviewer",
      desc: "AI-powered interviews that save time, reduce bias, and find the right fit faster.",
      icon: <MessageSquare size={35} />,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh", // ✅ Full viewport height
        width: "100vw", // ✅ Full viewport width
        backgroundColor: "#fff",
        color: "#111827",
        overflow: "hidden", // ✅ Scrollbar हटाने के लिए
      }}
    >
      {/* Left Section */}
      <div
        style={{
          position: "relative",
          width: "853px",
          height: "100%",
          marginLeft: "40px",
          marginTop: "40px",
          overflow: "hidden",
        }}
      >
        {/* Background Rectangle */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "91.444%",
            left: 0,
            top: 0,
            borderRadius: "40px",
            background: `
              linear-gradient(73.11deg, rgba(55, 134, 233, 0) -1.77%, rgba(55, 134, 233, 0.45) 77.24%),
              linear-gradient(287.35deg, rgba(24, 41, 85, 0.9) 0%, rgba(24, 41, 85, 0.9) 15.88%),
              url(${image})
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Hero Text */}
        <h1
          style={{
            position: "absolute",
            width: "679px",
            top: "161px",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "35px",
            lineHeight: "58px",
            textAlign: "center",
            color: "#FFFFFF",
          }}
        >
          Powered by AI that works<br></br> smarter, not harder.
        </h1>

        {/* Robot Image */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: "-66px",
            borderRadius: "40px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={robotImg}
            alt="Robot"
            style={{
              width: window.innerWidth > 1300 ? "103%" : "88%",
              height: window.innerHeight > 1300 ? "58%" : "61%",
              objectFit: "contain",
              transform: "rotate(13deg)",
              position: "absolute",
              bottom: 30,
            }}
          />
        </div>

        {/* Logo Box */}
        <div
          style={{
            boxSizing: "border-box",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px",
            gap: "28px",
            position: "absolute",
            width: "300px",
            height: "80px",
            left: "15px",
            top: "24px",
            borderRadius: "20px",
          }}
        >
          <img
            src={logoImg}
            alt="Logo"
            style={{ width: "800px", objectFit: "contain", height: "40px" }}
          />
        </div>
      </div>

      {/* Right Section */}

      <div
        style={{
          flex: 1.5,
          padding: "40px 30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          overflow: "hidden",
        }}
      >
        {" "}
        <button
          onClick={onLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1e3a8a", // Blue color
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
            width: "122px",
            marginLeft: "auto",
            marginTop:"-35px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#3b82f6"; // Lighter blue on hover
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1e3a8a";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ⬅ Back
        </button>
        <h2
          style={{
            fontSize: "50px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#182955",
            lineHeight: "1.2",
          }}
        >
          Less managing, more <br />
          leading
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "#4b5563",
            marginBottom: "30px",
            maxWidth: "500px",
            lineHeight: "1.6",
          }}
        >
          Where people, data, and AI come together to power the future of work.
        </p>
        {/* Feature Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
            flexGrow: 1,
          }}
        >
          {features.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (typeof setShowDashboardLanding === "function") {
                  setShowDashboardLanding(false);
                }
              }}
              style={{
                background: "#8dbac23a", // ✅ Always default white
                color: "#1e3a8a", // ✅ Default text blue
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                transition: "0.3s",
                cursor: "pointer",
                position: "relative",
                minHeight: "180px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1e3a8a";
                e.currentTarget.style.color = "white";
                e.currentTarget.querySelectorAll("h3, p, svg").forEach((el) => {
                  el.style.color = "white";
                  el.style.fill = "white";
                });
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#8dbac23a"; // ✅ Reset to white
                e.currentTarget.style.color = "#1e3a8a"; // ✅ Reset text blue
                e.currentTarget.querySelectorAll("h3, p, svg").forEach((el) => {
                  el.style.color = "#1e3a8a";
                  el.style.fill = "#1e3a8a";
                });
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "28px", color: "#1e3a8a" }}>
                  {item.icon}
                </span>
                <h3
                  style={{
                    fontSize: "36px",
                    fontWeight: "600",
                    color: "#1e3a8a",
                    lineHeight: "22px",
                  }}
                >
                  {item.title}
                </h3>
              </div>
              <p
                style={{
                  fontSize: "16px",
                  color: "#1e3a8a",
                  lineHeight: "22px",
                }}
              >
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
