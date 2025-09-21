// Mock data service for demonstration when backend APIs are not available

export const mockInterviews = [
  {
    id: "mock-1",
    candidate_name: "Sarah Johnson",
    candidate_email: "sarah.johnson@email.com",
    job_title: "Senior React Developer",
    interview_type: "quick",
    status: "completed",
    created_at: "2025-07-04T10:30:00Z",
    duration_minutes: 45,
    score: 8.5,
    technical_score: 9.0,
    communication_score: 8.0
  },
  {
    id: "mock-2", 
    candidate_name: "Michael Chen",
    candidate_email: "m.chen@email.com",
    job_title: "Data Scientist",
    interview_type: "scheduled",
    status: "in_progress",
    created_at: "2025-07-04T14:15:00Z",
    duration_minutes: 60,
    score: null,
    technical_score: null,
    communication_score: null
  },
  {
    id: "mock-3",
    candidate_name: "Emily Rodriguez", 
    candidate_email: "emily.r@email.com",
    job_title: "Full Stack Engineer",
    interview_type: "quick",
    status: "ready",
    created_at: "2025-07-04T16:45:00Z",
    duration_minutes: 30,
    score: null,
    technical_score: null,
    communication_score: null
  },
  {
    id: "mock-4",
    candidate_name: "David Kim",
    candidate_email: "david.kim@email.com", 
    job_title: "Backend Developer",
    interview_type: "scheduled",
    status: "completed",
    created_at: "2025-07-03T09:20:00Z",
    duration_minutes: 50,
    score: 7.8,
    technical_score: 8.2,
    communication_score: 7.4
  },
  {
    id: "mock-5",
    candidate_name: "Lisa Wang",
    candidate_email: "lisa.wang@email.com",
    job_title: "Frontend Developer", 
    interview_type: "quick",
    status: "expired",
    created_at: "2025-07-02T11:10:00Z",
    duration_minutes: 35,
    score: null,
    technical_score: null,
    communication_score: null
  }
];

export const mockActiveInterviews = [
  {
    id: "active-1",
    candidate_name: "Michael Chen",
    job_title: "Data Scientist",
    start_time: "2025-07-04T14:15:00Z",
    duration_minutes: 60,
    current_question: 3,
    total_questions: 7,
    status: "in_progress",
    proctoring_enabled: true,
    recording_enabled: true
  }
];

export const mockBehaviorEvents = [
  {
    id: "event-1",
    interview_id: "active-1",
    candidate_name: "Michael Chen",
    event_type: "tab_switch",
    severity: "medium",
    timestamp: "2025-07-04T14:25:30Z",
    description: "Candidate switched browser tab"
  },
  {
    id: "event-2", 
    interview_id: "active-1",
    candidate_name: "Michael Chen",
    event_type: "face_not_detected",
    severity: "high",
    timestamp: "2025-07-04T14:22:15Z",
    description: "Face not detected for 10 seconds"
  },
  {
    id: "event-3",
    interview_id: "active-1", 
    candidate_name: "Michael Chen",
    event_type: "audio_issue",
    severity: "low",
    timestamp: "2025-07-04T14:18:45Z",
    description: "Brief audio distortion detected"
  }
];

export const getMockRecentInterviews = (adminId, status = 'all', limit = 10) => {
  let filtered = mockInterviews;
  
  if (status !== 'all') {
    filtered = mockInterviews.filter(interview => interview.status === status);
  }
  
  // Add a notice to the console for developers
  console.info('📋 Using mock interview data for demonstration. Create real interviews to see actual data!');
  
  return {
    success: true,
    interviews: filtered.slice(0, limit),
    total: filtered.length,
    message: "Mock data - showing sample interviews for demonstration"
  };
};

export const getMockActiveInterviews = (adminId) => {
  return {
    success: true,
    interviews: mockActiveInterviews,
    total: mockActiveInterviews.length,
    message: "Mock data - showing sample active interviews"
  };
};

export const getMockBehaviorEvents = (adminId, limit = 50) => {
  return {
    success: true,
    events: mockBehaviorEvents.slice(0, limit),
    total: mockBehaviorEvents.length,
    message: "Mock data - showing sample behavior events"
  };
};

export const getMockInterviewData = (interviewId) => {
  console.info('🎯 Using mock interview data for candidate portal demonstration');
  
  return {
    success: true,
    interview: {
      id: interviewId,
      job_title: "Senior React Developer",
      job_description: "We are looking for an experienced React developer to join our dynamic frontend team. You will be responsible for building user interfaces, optimizing application performance, and collaborating with designers and backend developers.",
      candidate_name: "Demo Candidate",
      candidate_email: "demo@example.com",
      status: "ready",
      question_count: 5,
      duration_minutes: 30,
      created_at: "2025-07-04T20:00:00Z",
      expires_at: "2025-07-05T20:00:00Z",
      interview_type: "quick",
      difficulty_level: "medium",
      company_name: "TechCorp Solutions",
      instructions: "Welcome to your technical interview! Please ensure you are in a quiet environment with a stable internet connection. The interview will consist of 5 questions covering technical knowledge, problem-solving, and communication skills. Take your time to think through each question before responding.",
      questions: [
        {
          id: 1,
          type: "technical",
          text: "Explain the difference between React's useState and useEffect hooks, and provide an example of when you would use each.",
          time_limit_seconds: 300
        },
        {
          id: 2,
          type: "technical", 
          text: "How would you optimize the performance of a React application that has a large list of items to render?",
          time_limit_seconds: 300
        },
        {
          id: 3,
          type: "coding",
          text: "Write a function that takes an array of numbers and returns the sum of all even numbers. Explain your approach.",
          time_limit_seconds: 600
        },
        {
          id: 4,
          type: "behavioral",
          text: "Describe a challenging project you worked on recently. What made it challenging and how did you overcome the difficulties?",
          time_limit_seconds: 300
        },
        {
          id: 5,
          type: "technical",
          text: "What are the key principles of RESTful API design, and how would you implement authentication in a React application?",
          time_limit_seconds: 300
        }
      ]
    },
    message: "Mock interview data loaded successfully"
  };
};