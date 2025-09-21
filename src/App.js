import React, { useState, useEffect, createContext, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import "./assets/namasys-theme.css";
import "./assets/salary-slip.css";
import Voice from "./components/ui-components/Voice.js";
import "./assets/chat-styles.css";
import LoginForm from "./components/auth/LoginForm";
import Sidebar from "./components/ui-components/Sidebar";
import AIAssistant from "./components/dashboard/AIAssistant";
import AdminDashboard from "./components/admin/AdminDashboard";
import EmployeeDashboard from "./components/employee-portal/EmployeeDashboard";
import Employees from "./components/hr-management/Employees";
import AttritionAnalysis from "./components/analytics/AttritionAnalysis";
import LeaveManagement from "./components/employee-portal/LeaveManagement";
import Profile from "./components/employee-portal/Profile";
import Goals from "./components/employee-portal/Goals";
import GrievanceSubmitForm from "./components/grievances/GrievanceSubmitForm";
import InterviewAgent from "./components/interview-system/InterviewAgent";
import CandidateInterviewPortal from "./components/interview-system/CandidateInterviewPortal";
import ComprehensiveAIInterviewer from "./components/interview-system/ComprehensiveAIInterviewer";
import DashboardPage from "./components/ui-components/DashboardPage.jsx";

const AuthContext = createContext();

// Interview route component that gets the ID from URL
const InterviewRoute = () => {
  const { id } = useParams();
  return <CandidateInterviewPortal interviewId={id} />;
};

// Main application component for authenticated users
const MainApp = () => {
  const [showDashboardLanding, setShowDashboardLanding] = useState(false); // first-page after login
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const timerRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const employee_id = localStorage.getItem("employee_id");

    if (token && role) {
      setUser({ access_token: token, role, employee_id });
    }
  }, []);
 useEffect(() => {
   if (!user) return;

   const resetTimer = () => {
     clearTimeout(timerRef.current);
     timerRef.current = setTimeout(() => {
       handleLogout();
     }, 60 * 5 * 1000); // 5 mins inactivity
   };

   const events = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];
   events.forEach((event) => window.addEventListener(event, resetTimer));

   resetTimer();

   return () => {
     events.forEach((event) => window.removeEventListener(event, resetTimer));
     clearTimeout(timerRef.current);
   };
 }, [user]);

  const handleLogin = (userData) => {
    localStorage.setItem("token", userData.access_token);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("employee_id", userData.employee_id || "");
    setUser(userData);
    setShowDashboardLanding(true);
    setActiveSection("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("employee_id");
    setUser(null);
    setActiveSection("dashboard");
  };

  const renderContent = () => {
    if (activeSection === "dashboardPage") {
      return (
        <AuthContext.Provider
          value={{ user, login: handleLogin, logout: handleLogout }}
        >
          <DashboardPage
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            role={user.role}
          />
        </AuthContext.Provider>
      );
    }
    if (activeSection === "submit-grievance") {
      return <GrievanceSubmitForm />;
    }
    if (activeSection === "ai-assistant") {
      return <AIAssistant role={user.role} />;
    }
    if (activeSection === "ai-interviewer") {
      // Use ComprehensiveAIInterviewer for admins, InterviewAgent for employees
      return user.role === "admin" ? (
        <ComprehensiveAIInterviewer adminId={user.employee_id} />
      ) : (
        <InterviewAgent />
      );
    }

    if (user.role === "admin") {
      switch (activeSection) {
        case "dashboard":
          return <AdminDashboard></AdminDashboard>;
        case "employees":
          return <Employees />;
        case "attrition-analysis":
          return <AttritionAnalysis />;
        case "leaves":
          return <LeaveManagement role="admin" />;
        case "ai- assistant":
          return <AIAssistant role="admin" />;
        default:
          return <AdminDashboard />;
      }
    } else {
      switch (activeSection) {
        case "dashboard":
          return <EmployeeDashboard />;
        case "profile":
          return <Profile />;
        case "goals":
          return <Goals />;
        case "leaves":
          return <LeaveManagement role="employee" />;
        case "ai-interviewer":
          return <InterviewAgent />;
        default:
          return <EmployeeDashboard />;
      }
    }
  };

  if (!user) {
    return (
      <AuthContext.Provider
        value={{ user, login: handleLogin, logout: handleLogout }}
      >
        <LoginForm onLogin={handleLogin} />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, login: handleLogin, logout: handleLogout }}
    >
      {showDashboardLanding ? (
        <DashboardPage
          setActiveSection={setActiveSection}
          setShowDashboardLanding={setShowDashboardLanding} // Pass this so buttons can hide landing
          role={user.role}
          onLogout={handleLogout}
        />
      ) : (
        <div className="app-container">
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            role={user.role}
            onLogout={handleLogout}
            setShowDashboardLanding={setShowDashboardLanding}
          />
          <main className="main-content">{renderContent()}</main>
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Root App component with Router
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/interview/:id" element={<InterviewRoute />} />
        <Route path="voice" element={<Voice />} />
        
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
};

export default App;
