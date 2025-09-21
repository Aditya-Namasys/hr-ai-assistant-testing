const API_URL = process.env.REACT_APP_API_URL;
console.log('Using API URL:', API_URL);
console.log('Environment variable REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

let csrfToken = '';

const getCsrfToken = async () => {
  if (!csrfToken) {
    try {
      csrfToken = 'csrf-' + Math.random().toString(36).substring(2, 15);
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  }
  return csrfToken;
};

const api = {
  async request(endpoint, method = 'GET', data = null, token = null) {
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (method !== 'GET') {
      const csrf = await getCsrfToken();
      headers['X-CSRF-Token'] = csrf;
    }

    const config = {
      method,
      headers,
      body: data ? JSON.stringify(data) : null,
      credentials: 'include',
      mode: 'cors',
      cache: 'no-cache'
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      console.log(`Response received from ${API_URL}:`, { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        let errorMessage = 'An unexpected error occurred';
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (errorData.detail.message) {
            errorMessage = errorData.detail.message;
          } else if (Array.isArray(errorData.detail)) {
            const firstError = errorData.detail[0];
            if (firstError && firstError.msg) {
              errorMessage = `${firstError.msg}`;
              if (firstError.loc && firstError.loc.length > 1) {
                const fieldName = firstError.loc[1];
                errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${errorMessage}`;
              }
            }
          }
        }
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to perform this action.');
        } else if (response.status === 404) {
          throw new Error('The requested resource was not found.');
        } else if (response.status === 422) {
          if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
            const validationError = errorData.detail[0];
            let fieldName = '';
            
            if (validationError.loc && validationError.loc.length > 1) {
              fieldName = validationError.loc[1];
              fieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ': ';
            }
            
            throw new Error(`${fieldName}${validationError.msg}`);
          } else {
            throw new Error('Validation error: Please check your input.');
          }
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(errorMessage);
        }
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      if (contentType && contentType.includes('application/pdf')) {
        return await response.blob();
      }

      return await response.text();
    } catch (error) {
      console.error('API request error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Full URL attempted:', `${API_URL}${endpoint}`);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The server took too long to respond.');
      } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.log('Backend URL:', API_URL);
        throw new Error(`Connection error. Unable to connect to the backend server. Please verify the server is running.`);
      }
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.request('/api/auth/login', 'POST', credentials);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('employee_id', response.employee_id);
      localStorage.setItem('role', response.role);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getDashboard: async (role) => {
    const token = localStorage.getItem('token');
    console.log('Getting dashboard with token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.error('No token found in localStorage');
      throw new Error('Authentication required. Please log in again.');
    }
    
    return api.request(`/api/dashboard`, 'GET', null, token);
  },
  
  processQuery: async (query, chatHistory = [], documentId = null) => {
    const token = localStorage.getItem('token');
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const payload = {
      query,
      chat_history: formattedHistory
    };

    if (documentId) {
      payload.document_id = documentId;
    }

    return api.request('/api/queries/query', 'POST', payload, token);
  },
  
  getEmployees: async () => {
    const token = localStorage.getItem('token');
    return api.request('/api/employees', 'GET', null, token);
  },

  getEmployeeProfile: async (employeeId) => {
    const token = localStorage.getItem('token');
    return api.request(`/api/employees/${employeeId}`, 'GET', null, token);
  },

  getGoals: async (employeeId) => {
    const token = localStorage.getItem('token');
    return api.request(`/api/employees/${employeeId}/goals`, 'GET', null, token);
  },

  createGoal: async (goalData) => {
    const token = localStorage.getItem('token');
    const employeeId = localStorage.getItem('employee_id');
    return api.request(`/employees/${employeeId}/goals`, 'POST', goalData, token);
  },

  getLeaves: async (employeeId) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (role === 'admin') {
      return api.request('/leaves', 'GET', null, token);
    } else {
      return api.request(`/employees/${employeeId}/leaves`, 'GET', null, token);
    }
  },

  createLeave: async (leaveData) => {
    const token = localStorage.getItem('token');
    const employeeId = localStorage.getItem('employee_id');
    return api.request(`/employees/${employeeId}/leaves`, 'POST', leaveData, token);
  },

  getAttritionAnalysis: async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    const url = `/api/attrition-analysis${forceRefresh ? '?force_refresh=true' : ''}`;
    return api.request(url, 'GET', null, token);
  },

  refreshAttritionAnalysis: async (employeeId) => {
    const token = localStorage.getItem('token');
    return api.request(`/api/attrition-analysis/${employeeId}/refresh`, 'POST', null, token);
  },

  getPolicies: async () => {
    const token = localStorage.getItem('token');
    return api.request('/policies', 'GET', null, token);
  },
  
  getHolidays: async () => {
    const token = localStorage.getItem('token');
    return api.request('/holidays', 'GET', null, token);
  },

  getSalarySlips: async (employeeId) => {
    const token = localStorage.getItem('token');
    return api.request(`/api/employees/${employeeId}/salary_slips`, 'GET', null, token);
  },

  submitGrievance: async (grievanceData) => {
    const token = localStorage.getItem('token');
    return api.request('/grievances/', 'POST', grievanceData, token);
  },

  getGrievanceById: async (grievanceId) => {
    const token = localStorage.getItem('token');
    return api.request(`/grievances/${grievanceId}`, 'GET', null, token);
  },

  updateGrievance: async (grievanceId, updateData) => {
    const token = localStorage.getItem('token');
    return api.request(`/grievances/${grievanceId}`, 'PATCH', updateData, token);
  },
  
  getSalarySlipPdfUrl: async (employeeId, slipId, month, year) => {
    let url = `${API_URL}/api/employees/${employeeId}/salary_slips/${slipId}/pdf`;
    
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    
    return url;
  },

  generateSalarySlipForMonth: async (employeeId, month, year) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const url = `${API_URL}/api/employees/${employeeId}/salary_slips/generate?month=${month}&year=${year}`;
    
    try {
      console.log('Downloading salary slip from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      console.log('Blob created:', blob.size, 'bytes, type:', blob.type);
      
      // Use the robust download method
      const filename = `salary_slip_${employeeId}_${month}_${year}.pdf`;
      api.downloadBlob(blob, filename);
      
      return blob;
    } catch (error) {
      console.error('Error generating salary slip:', error);
      throw error;
    }
  },

  uploadSalarySlip: async (employeeId, file) => {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/api/employees/${employeeId}/salary_slips/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  uploadDocument: async (employeeId, file, documentType = 'general') => {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    const response = await fetch(`${API_URL}/employees/${employeeId}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  generateSalarySlipPdf: async (employeeId, slipId, month, year) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    let endpoint = `/api/employees/${employeeId}/salary_slips/${slipId}/pdf`;
    
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    try {
      console.log(`Generating salary slip PDF: ${API_URL}${endpoint}`);
      console.log(`Using token: ${token.substring(0, 10)}...`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('PDF Response status:', response.status);
      console.log('PDF Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      console.log('PDF Blob created:', blob.size, 'bytes, type:', blob.type);
      
      // Use the robust download method
      const filename = `salary_slip_${employeeId}_${slipId}_${month || 'current'}_${year || new Date().getFullYear()}.pdf`;
      api.downloadBlob(blob, filename);
      
      return blob;
    } catch (error) {
      console.error('Error generating salary slip PDF:', error);
      throw error;
    }
  },

  postVoiceQuery: async (formData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    try {
      console.log('Sending voice query to:', `${API_URL}/api/queries/voice`);
      const response = await fetch(`${API_URL}/api/queries/voice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Voice API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Voice API error data:', errorData);
        
        let errorMessage = 'Voice processing failed';
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || err).join(', ');
          }
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error('Voice query API error:', error);
      throw error;
    }
  },

  postSpeechToText: async (formData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    try {
      const response = await fetch(`${API_URL}/api/queries/stt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('STT API error:', error);
      throw error;
    }
  },

  // Alternative download method for production environments
  downloadBlob: (blob, filename) => {
    try {
      // Method 1: Standard download approach
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      
      // Enhanced click method
      if (link.click) {
        link.click();
      } else {
        // Fallback for older browsers
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        link.dispatchEvent(event);
      }
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
      
    } catch (error) {
      console.error('Download method 1 failed:', error);
      
      // Method 2: Fallback approach
      try {
        const reader = new FileReader();
        reader.onload = function() {
          const link = document.createElement('a');
          link.href = reader.result;
          link.download = filename;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        reader.readAsDataURL(blob);
      } catch (fallbackError) {
        console.error('Download method 2 failed:', fallbackError);
        
        // Method 3: Open in new window as last resort
        try {
          const blobUrl = window.URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        } catch (finalError) {
          console.error('All download methods failed:', finalError);
          throw new Error('Unable to download file. Please try again or contact support.');
        }
      }
    }
  },

  get API_URL() {
    return API_URL;
  }
};

export default api;
