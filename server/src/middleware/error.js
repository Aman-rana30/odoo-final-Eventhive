export function notFoundHandler(_req, res, _next) {
  return res.status(404).json({ error: "Not found" })
}

export function errorHandler(err, _req, res, _next) {
  console.error("[error]", err)
  const status = err.status || 500
  return res.status(status).json({
    error: err.message || "Internal Server Error",
  })
}
