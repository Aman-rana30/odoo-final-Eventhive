import axios from "axios"

function normalizeBaseUrl(input) {
  let raw = (input || "").trim()
  const md = raw.match(/\[[^\]]+\]$$(https?:\/\/[^)]+)$$/i)
  if (md) raw = md[1]
  if (!raw) raw = "http://localhost:4000"
  if (!/^https?:\/\//i.test(raw)) raw = `http://${raw.replace(/^\/+/, "")}`
  return raw.replace(/\/+$/, "")
}

export const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  withCredentials: true,
})
