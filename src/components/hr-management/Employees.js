import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  MoreVertical,
  Search,
  Filter,
  Plus,
  Briefcase,
  MapPin,
} from "lucide-react";
import api from "../../services/api";
import "../../assets/employee-styles.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [departments, setDepartments] = useState(["All"]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.getEmployees();
      setEmployees(data || []);

      const uniqueDepartments = [
        ...new Set((data || []).map((emp) => emp.department || "Unknown")),
      ];
      setDepartments(["All", ...uniqueDepartments]);

      setError(null);
    } catch (error) {
      console.error("Error loading employees:", error);
      setError("Failed to load employees. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentFilter = (dept) => {
    setDepartmentFilter(dept);
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      (employee.name || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      (employee.position || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      (employee.email || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase());

    const matchesDepartment =
      departmentFilter === "All" ||
      (employee.department || "Unknown") === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const getEmployeeStatus = (employee) => {
    const statuses = ["active", "onleave"];
    const randomIndex = (employee.id || 0) % statuses.length;
    return statuses[randomIndex];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading employees data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={loadEmployees}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="section-header">
        <h2 className="section-title">Employees</h2>
        <p className="section-subtitle">Manage your organization's employees</p>
      </div>

      {/* Search and Filters */}
      <div className="employee-controls">
        <div className="employee-search">
          <Search size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="employee-filter-btn">
          <Filter size={16} color="#6b7280" />
          <span>Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => handleDepartmentFilter(e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <button className="employee-add-btn">
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <p>No employees found matching your criteria</p>
          <button
            className="retry-button"
            onClick={() => {
              setSearchTerm("");
              setDepartmentFilter("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="dashboard-grid employees">
          {filteredEmployees.map((employee) => {
            const status = getEmployeeStatus(employee);

            return (
              <div key={employee.id || Math.random()} className="employee-card">
                <div className="employee-card-header">
                  <div className="employee-avatar">
                    {(employee.name || "U").charAt(0)}
                  </div>
                  <button className="employee-menu-btn">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="employee-card-body">
                  <div className={`employee-status employee-status-${status}`}>
                    {status === "active" ? "Active" : "On Leave"}
                  </div>
                  <h3 className="employee-name">
                    {employee.name || "Unnamed"}
                  </h3>
                  <p className="employee-position">
                    {employee.position || "No position"}
                  </p>

                  <div className="employee-details">
                    <div className="employee-detail">
                      <Mail size={14} className="employee-detail-icon" />
                      <span>{employee.email || "No email"}</span>
                    </div>
                    <div className="employee-detail">
                      <Briefcase size={14} className="employee-detail-icon" />
                      <span>{employee.department || "Unknown"}</span>
                    </div>
                    <div className="employee-detail">
                      <MapPin size={14} className="employee-detail-icon" />
                      <span>{employee.location || "Headquarters"}</span>
                    </div>
                    <div className="employee-detail">
                      <Calendar size={14} className="employee-detail-icon" />
                      <span>Joined: {formatDate(employee.join_date)}</span>
                    </div>
                  </div>
                </div>
                <div className="employee-card-footer">
                  <button className="employee-action-btn">View Profile</button>
                  <button className="employee-action-btn employee-action-btn-secondary">
                    Message
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Employees;
