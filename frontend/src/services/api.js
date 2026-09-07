import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const hasAuthHeader = Boolean(error.config?.headers?.Authorization)

    // Spring Security may return 403 for an expired token instead of 401.
    if ((status === 401 || status === 403) && hasAuthHeader) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const returnTo = `${window.location.pathname}${window.location.search}`
      window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`
    }
    return Promise.reject(error)
  }
)

export default api
