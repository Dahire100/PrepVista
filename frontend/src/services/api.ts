const API_BASE_URL = 'https://prepvista-backend7.onrender.com/api';

const getToken = (): string | null => localStorage.getItem('token');

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
};

// ============= Types =============
export interface User {
  _id: string;
  email: string;
  full_name: string;
  profile?: {
    phone?: string;
    linkedin?: string;
    location?: string;
    university?: string;
    course?: string;
    graduation_year?: string;
    bio?: string;
    profile_photo?: string;
    skills?: string[];
    experience?: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    achievements?: string[];
  };
  subscription: {
    plan: string;
    analyses_used: number;
    analyses_limit: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ============= Authentication API =============
export const authAPI = {
  register: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        password, 
        full_name: fullName 
      })
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData: {
    full_name?: string;
    profile?: {
      phone?: string;
      linkedin?: string;
      location?: string;
      university?: string;
      course?: string;
      graduation_year?: string;
      bio?: string;
      profile_photo?: string;
      skills?: string[];
      experience?: Array<{
        title: string;
        company: string;
        duration: string;
        description: string;
      }>;
      achievements?: string[];
    };
  }): Promise<{ message: string; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(profileData)
    });
    const data = await handleResponse(response);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  uploadProfilePhoto: async (photoFile: File): Promise<{ message: string; photo_url: string; user: User }> => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    const response = await fetch(`${API_BASE_URL}/auth/upload-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });
    
    const data = await handleResponse(response);
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });
    return handleResponse(response);
  },

  exportData: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/export-data`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Export failed' }));
      throw new Error(error.error || 'Failed to export data');
    }

    // Download the ZIP file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'user_data_export.zip';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  },

  clearData: async (): Promise<{ message: string; deleted_count: number }> => {
    const response = await fetch(`${API_BASE_URL}/auth/clear-data`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return handleResponse(response);
  },

  deleteAccount: async (password: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ password })
    });
    const data = await handleResponse(response);
    
    // Clear local storage after successful deletion
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return data;
  },

  isAuthenticated: (): boolean => !!getToken(),

  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// ============= Video Analysis API =============
export const analysisAPI = {
  analyzeVideo: async (
    videoFile: File, 
    onProgress?: (progress: number) => void
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('video', videoFile);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(JSON.parse(xhr.responseText).error || 'Upload failed'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error')));

      xhr.open('POST', `${API_BASE_URL}/analysis/video`);
      xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
      xhr.send(formData);
    });
  },

  getHistory: async (limit: number = 10) => {
    const response = await fetch(`${API_BASE_URL}/analysis/history?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  getAnalysisHistory: async (limit: number = 100) => {
    const response = await fetch(`${API_BASE_URL}/analysis/history?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await handleResponse(response);
    return data.analyses || [];
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/analysis/stats`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  downloadReport: async (analysisId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/analysis/report/${analysisId}`,
      { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );

    if (!response.ok) {
      throw new Error('Failed to download report');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_report_${analysisId}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

// ============= Interview API =============
export const interviewAPI = {
  generatePlan: async (resumeFile: File) => {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    const response = await fetch(`${API_BASE_URL}/interview/plan`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    });
    return handleResponse(response);
  },

  evaluateAnswer: async (
    question: any, 
    answer: string, 
    resumeKeywords: string[] | null = null
  ) => {
    const response = await fetch(`${API_BASE_URL}/interview/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ question, answer, resume_keywords: resumeKeywords })
    });
    return handleResponse(response);
  },

  completeInterview: async (interviewData: any) => {
    const response = await fetch(`${API_BASE_URL}/interview/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(interviewData)
    });
    return handleResponse(response);
  },

  downloadReport: async (analysisId: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Please login to download reports');
      
      const response = await fetch(
        `${API_BASE_URL}/interview/report/${analysisId}`,
        { 
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`
          } 
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `interview_report_${analysisId}.docx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
};

// ============= Resume Analysis API =============
export const resumeAPI = {
  analyzeResume: async (resumeFile: File, jobDescription: string) => {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('job_description', jobDescription);
    const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    });
    return handleResponse(response);
  },

  downloadReport: async (analysisId: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Please login to download reports');
      
      const response = await fetch(
        `${API_BASE_URL}/resume/report/${analysisId}`,
        { 
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`
          } 
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `resume_analysis_${analysisId}.docx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
};

// ============= Helper function for Dashboard =============
export const getAnalysisHistory = async (limit: number = 10) => {
  return analysisAPI.getHistory(limit);
};

// ============= Default Export =============
export default {
  auth: authAPI,
  analysis: analysisAPI,
  interview: interviewAPI,
  resume: resumeAPI
};
