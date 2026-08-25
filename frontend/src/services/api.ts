import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Auth
  login: (employeeId: string) => /^\d+$/.test(employeeId)
    ? client.get(`/employees/${employeeId}`)
    : client.get(`/employees/code/${employeeId}`),
  
  // Employee
  getEmployee: (id: number) => client.get(`/employees/${id}`),
  updateEmployee: (id: number, data: any) => client.put(`/employees/${id}`, data),
  
  // Dashboard
  getDashboard: (id: number) => client.get(`/dashboard/${id}`),
  
  // Tasks
  getTasks: (employeeId: number) => client.get(`/employees/${employeeId}/tasks`),
  createTask: (data: any) => client.post('/tasks', data),
  updateTask: (id: number, data: any) => client.put(`/tasks/${id}`, data),
  completeTask: (id: number) => client.post(`/tasks/${id}/complete`),
  
  // Training
  getTrainingMaterials: () => client.get('/training/materials'),
  getEmployeeTraining: (employeeId: number) => client.get(`/employees/${employeeId}/training`),
  startTraining: (materialId: number, employeeId: number) =>
    client.post(`/training/start/${materialId}`, { employee_id: employeeId }),
  updateTrainingProgress: (progressId: number, percentage: number) =>
    client.put(`/training/progress/${progressId}`, { percentage }),
  
  // Support Tickets
  getEmployeeTickets: (employeeId: number) => client.get(`/employees/${employeeId}/tickets`),
  getOpenTickets: () => client.get('/tickets/open'),
  createTicket: (data: any) => client.post('/tickets', data),
  updateTicket: (id: number, data: any) => client.put(`/tickets/${id}`, data),
  getHrRequests: (limit = 100) => client.get('/hr/requests', { params: { limit } }),
  
  // Chat
  sendMessage: (data: any) => client.post('/chat', data),
  getChatHistory: (employeeId: number, limit?: number) =>
    client.get(`/chat/history/${employeeId}`, { params: { limit } }),
  
  // Health
  health: () => client.get('/health'),
}

export default client
