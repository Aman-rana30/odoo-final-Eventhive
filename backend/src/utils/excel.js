import ExcelJS from "exceljs"
export async function toExcelXLSX(rows, sheetName = "Sheet1") {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet(sheetName)
  if (rows?.length) {
    ws.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k }))
    rows.forEach((r) => ws.addRow(r))
  }
  return wb.xlsx.writeBuffer()
}
