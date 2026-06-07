const BASE_URL = ''; // Proxied through Vite to avoid CORS issues

// Helper to construct headers with JWT token
function getHeaders(contentType = 'application/json') {
  const token = localStorage.getItem('token');
  const headers = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Global response handler to check for auth failures
async function handleResponse(response) {
  if (response.status === 401 || response.status === 403) {
    // Session expired or access denied, trigger logout if token exists
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export const api = {
  // Auth
  async login(username, password) {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        username: data.username,
        role: data.role
      }));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async registerUser(username, password, role) {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password, role }),
    });
    return handleResponse(response);
  },

  // Students
  async getStudents() {
    const response = await fetch(`${BASE_URL}/api/students`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getStudent(id) {
    const response = await fetch(`${BASE_URL}/api/students/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createStudent(student) {
    const response = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(student),
    });
    return handleResponse(response);
  },

  async updateStudent(id, studentDetails) {
    const response = await fetch(`${BASE_URL}/api/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(studentDetails),
    });
    return handleResponse(response);
  },

  async deleteStudent(id) {
    const response = await fetch(`${BASE_URL}/api/students/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Grades
  async getGrades() {
    const response = await fetch(`${BASE_URL}/api/grades`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getGradesForStudent(studentId) {
    const response = await fetch(`${BASE_URL}/api/grades/student/${studentId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async updateGrade(id, score, feedback) {
    const response = await fetch(`${BASE_URL}/api/grades/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ score, feedback }),
    });
    return handleResponse(response);
  },

  async importCsv(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${BASE_URL}/api/grades/import`, {
      method: 'POST',
      headers: getHeaders(null), // Let browser set Content-Type for boundary
      body: formData,
    });
    return handleResponse(response);
  },

  // Users (Admin Only)
  async getUsers() {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getUser(id) {
    const response = await fetch(`${BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async updateUser(id, payload) {
    const response = await fetch(`${BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  async deleteUser(id) {
    const response = await fetch(`${BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  }
};
