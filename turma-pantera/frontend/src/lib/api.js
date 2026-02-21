// src/lib/api.js
import axios from 'axios'
import { useAuthStore } from '../store/auth'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

let refreshing = false
let queue = []

const flush = (err, token) => {
  queue.forEach(p => err ? p.reject(err) : p.resolve(token))
  queue = []
}

api.interceptors.request.use(cfg => {
  const token = useAuthStore.getState().token
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config
    if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && !orig._retry) {
      if (refreshing) {
        return new Promise((res, rej) => queue.push({ resolve: res, reject: rej }))
          .then(t => { orig.headers.Authorization = `Bearer ${t}`; return api(orig) })
      }
      orig._retry = true
      refreshing = true
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        useAuthStore.getState().setToken(data.accessToken)
        flush(null, data.accessToken)
        orig.headers.Authorization = `Bearer ${data.accessToken}`
        return api(orig)
      } catch (e) {
        flush(e, null)
        useAuthStore.getState().logout()
        window.location.href = '/'
        return Promise.reject(e)
      } finally { refreshing = false }
    }
    return Promise.reject(err)
  }
)

export default api
