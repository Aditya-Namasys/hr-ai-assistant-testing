import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  BarChart3,
  Calendar,
  Search,
  User,
  Target,
  LogOut,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import logo from "../../assets/Logo.svg"
import "./Sidebar.css";

const Sidebar = ({
  activeSection,
  setActiveSection,
  role,
  onLogout,
  setShowDashboardLanding,
}) => {
  const navigate = useNavigate();
  const adminMenuItems = [
    { id: "dashboard", icon: Home, label: "HR Dashboard" },
    { id: "employees", icon: Users, label: "Employees" },
    { id: "attrition-analysis", icon: BarChart3, label: "Attrition Analysis" },
    { id: "leaves", icon: Calendar, label: "Leave Management" },
    { id: "ai-assistant", icon: Search, label: "AI Assistant" },
    { id: "ai-interviewer", icon: MessageSquare, label: "AI Interviewer" },
  ];

  const employeeMenuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "profile", icon: User, label: "My Profile" },
    { id: "goals", icon: Target, label: "My Goals" },
    { id: "leaves", icon: Calendar, label: "My Leaves" },
    { id: "submit-grievance", icon: Target, label: "Submit Grievance" },
    
    { id: "ai-assistant", icon: Search, label: "AI Assistant" },
    { id: "ai-interviewer", icon: MessageSquare, label: "Practice Interview" },
  ];

  const menuItems = role === "admin" ? adminMenuItems : employeeMenuItems;

  return (
    <div className="sidebar">
      {/* Header */}
     <div className="sidebar-header">
        <img
          src={logo}
          alt="Logo"
          style={{ width: "239px", height: "41px" }}
          className="sidebar-logo"
        />
        <div className="sidebar-title">HR AI Assistant</div>
      </div>

      {/* Menu Items */}
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`sidebar-item ${
              activeSection === item.id ? "active" : ""
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-divider"></div>

      {/* Back to Main Dashboard */}
      <button
        className="sidebar-logout"
        onClick={() => setShowDashboardLanding(true)}
      >
        <ArrowLeft size={18} /> <span>Back</span>
      </button>

      {/* Logout */}
      <button className="sidebar-logout" onClick={onLogout}>
          <LogOut size={18} /> <span>Sign Out</span>
      </button>
    </div>
  );
};

export default Sidebar;
