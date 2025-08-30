import axios from "axios"

function normalizeBaseUrl(input) {
  let raw = (input || "").trim()
  // Extract (http://...) if someone pasted Markdown like [link](http://...)
  const mdMatch = raw.match(/$$(https?:\/\/[^)]+)$$/i)
  if (mdMatch) raw = mdMatch[1]
  if (!raw) raw = "http://localhost:4000"
  if (!/^https?:\/\//i.test(raw)) raw = `http://${raw.replace(/^\/+/, "")}`
  return raw.replace(/\/+$/, "")
}

const BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("eh_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
