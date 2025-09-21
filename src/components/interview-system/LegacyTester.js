import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

const LegacyTester = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const testLegacyEndpoint = async (endpoint, method = 'POST', data = null) => {
    setLoading(true);
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_URL}/api${endpoint}`, options);
      const result = method === 'GET' && endpoint === '/download-csv' 
        ? await response.text() 
        : (response.headers.get('content-type')?.includes('application/json') 
           ? await response.json() 
           : await response.text());

      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          success: response.ok,
          data: result,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 'Error',
          success: false,
          data: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
    setLoading(false);
  };

  const testResumeScorer = () => {
    testLegacyEndpoint('/resumescorer/', 'POST');
  };

  const testMeetingScheduler = () => {
    const meetingData = {
      subject: "Test Meeting from Legacy API - Resume Scorer",
      body: "This is a test meeting scheduled through the legacy API endpoint for candidate interview.",
      to_emails: ["mayank.gupta@namasys.ai", "aditya.bhavar@namasys.ai"],
      cc_emails: ["rathina.kumar@namasys.ai"],
      start_time: "2025-08-05T10:00:00",
      end_time: "2025-08-05T10:30:00"
    };
    testLegacyEndpoint('/sch_meeting', 'POST', meetingData);
  };

  const testCsvDownload = () => {
    testLegacyEndpoint('/download-csv', 'GET');
  };

  const testStatus = () => {
    testLegacyEndpoint('/resumescorer/status', 'GET');
  };

  const downloadCsv = () => {
    window.open(`${API_URL}/api/download-csv`, '_blank');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🧪 Legacy Endpoint Tester</h2>
      <p>Test the original resume scorer endpoints for backward compatibility</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={testResumeScorer}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {loading ? '⏳ Processing...' : '📊 Test Resume Scorer'}
        </button>
        
        <button 
          onClick={testMeetingScheduler}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🗓️ Test Meeting Scheduler
        </button>
        
        <button 
          onClick={testCsvDownload}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📥 Test CSV Download
        </button>
        
        <button 
          onClick={downloadCsv}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          💾 Download CSV File
        </button>
        
        <button 
          onClick={testStatus}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📊 Check Folder Status
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {Object.entries(results).map(([endpoint, result]) => (
          <div 
            key={endpoint}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: result.success ? '#f8f9fa' : '#fff5f5'
            }}
          >
            <h3 style={{ 
              color: result.success ? '#28a745' : '#dc3545',
              margin: '0 0 10px 0',
              fontSize: '16px'
            }}>
              {result.success ? '✅' : '❌'} {endpoint} 
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                ({result.timestamp})
              </span>
            </h3>
            
            <p><strong>Status:</strong> {result.status}</p>
            
            <div>
              <strong>Response:</strong>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '300px',
                fontSize: '12px',
                border: '1px solid #e9ecef'
              }}>
                {typeof result.data === 'object' 
                  ? JSON.stringify(result.data, null, 2)
                  : result.data?.substring(0, 500) + (result.data?.length > 500 ? '...' : '')
                }
              </pre>
            </div>
            
            {endpoint === '/resumescorer/' && result.success && (
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={() => {
                    const newWindow = window.open();
                    newWindow.document.write(result.data);
                    newWindow.document.close();
                  }}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📋 View HTML Table
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h3>📚 Legacy Endpoints Documentation</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>POST /api/resumescorer/</strong> - Processes resumes from bulk folder and returns HTML table</li>
          <li><strong>POST /api/sch_meeting</strong> - Schedules a meeting using EmailRequest4 format</li>
          <li><strong>GET /api/download-csv</strong> - Downloads the latest processed results as CSV</li>
        </ul>
        
        <h4>🔄 Backward Compatibility</h4>
        <p>These endpoints maintain exact compatibility with your original implementation while benefiting from:</p>
        <ul>
          <li>Enhanced error handling and logging</li>
          <li>Multi-format file support (PDF, DOCX, DOC)</li>
          <li>Improved OpenAI integration with structured outputs</li>
          <li>Fallback folder support for corrupted files</li>
          <li>Your exact Microsoft Graph API integration with credentials.yaml</li>
        </ul>
        
        <h4>🔧 Meeting Scheduler Setup</h4>
        <p><strong>To enable meeting scheduling:</strong></p>
        <ol style={{fontSize: '14px', lineHeight: '1.4'}}>
          <li>Copy your existing credentials from:<br/>
              <code style={{fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px'}}>
                /Users/aditya/Library/Containers/com.microsoft.rdc.macos/Data/tmp/4171BFE7-214D-4BD5-8594-70FB858C0261/credentials.yaml
              </code>
          </li>
          <li>Replace the placeholder file at:<br/>
              <code style={{fontSize: '12px', backgroundColor: '#f0f0f0', padding: '2px'}}>
                /backend/credentials.yaml
              </code>
          </li>
          <li>Meeting scheduler will use your exact Graph API configuration:
              <ul style={{fontSize: '12px', marginTop: '5px'}}>
                <li>Tenant: 145f284e-22d3-4ef5-99fb-81bd09fd2067</li>
                <li>Organizer: rathina.kumar@namasys.ai</li>
                <li>API: Microsoft Graph v1.0</li>
              </ul>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default LegacyTester;