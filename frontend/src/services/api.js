const API_URL = import.meta.env.VITE_API_URL || 'backend-cq8n1d2j8-animukherjee2006-techs-projects.vercel.app';

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An unexpected error occurred.');
    error.status = response.status;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (payload) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  getMe: () => request('/api/auth/me'),
  updateProfile: (payload) =>
    request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  changePassword: (payload) =>
    request('/api/auth/password', { method: 'PUT', body: JSON.stringify(payload) }),
  forgotPassword: (email) =>
    request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload) =>
    request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
};

export const aiApi = {
  generateNotes: (payload) =>
    request('/api/ai/generate-notes', { method: 'POST', body: JSON.stringify(payload) }),
  generateQuiz: (payload) =>
    request('/api/ai/generate-quiz', { method: 'POST', body: JSON.stringify(payload) }),
};

export const notesApi = {
  list: (search = '') =>
    request(`/api/notes${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id) => request(`/api/notes/${id}`),
  delete: (id) => request(`/api/notes/${id}`, { method: 'DELETE' }),
};

export const quizApi = {
  history: () => request('/api/quizzes'),
  saveResult: (payload) =>
    request('/api/quizzes/results', { method: 'POST', body: JSON.stringify(payload) }),
  deleteResult: (id) => request(`/api/quizzes/results/${id}`, { method: 'DELETE' }),
};

export const flashcardApi = {
  list: () => request('/api/flashcards'),
  create: (payload) =>
    request('/api/flashcards', { method: 'POST', body: JSON.stringify(payload) }),
  updateCardStatus: (deckId, cardId, status) =>
    request(`/api/flashcards/${deckId}/cards/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: (id) => request(`/api/flashcards/${id}`, { method: 'DELETE' }),
};

export const materialApi = {
  list: ({ search = '', subject = 'All' } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (subject && subject !== 'All') params.set('subject', subject);
    const qs = params.toString();
    return request(`/api/materials${qs ? `?${qs}` : ''}`);
  },
  upload: (formData) =>
    request('/api/materials/upload', { method: 'POST', body: formData }),
  get: (id) => request(`/api/materials/${id}`),
  downloadUrl: (id) => `${API_URL}/api/materials/${id}/download`,
  delete: (id) => request(`/api/materials/${id}`, { method: 'DELETE' }),
  chat: (id, question) =>
    request(`/api/materials/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
};

export const dashboardApi = {
  stats: () => request('/api/dashboard/stats'),
  history: ({ type = 'all', search = '', dateFrom = '' } = {}) => {
    const params = new URLSearchParams();
    if (type && type !== 'all') params.set('type', type);
    if (search) params.set('search', search);
    if (dateFrom) params.set('dateFrom', dateFrom);
    const qs = params.toString();
    return request(`/api/history${qs ? `?${qs}` : ''}`);
  },
  deleteHistory: (id) => request(`/api/history/${id}`, { method: 'DELETE' }),
  getSettings: () => request('/api/settings'),
  updateSettings: (payload) =>
    request('/api/settings', { method: 'PUT', body: JSON.stringify(payload) }),
};
