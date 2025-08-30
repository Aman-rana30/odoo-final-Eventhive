export function toCSV(rows) {
  if (!rows?.length) return ""
  const headers = Object.keys(rows[0])
  const lines = [headers.join(",")]
  for (const r of rows) lines.push(headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))
  return lines.join("\n")
}
