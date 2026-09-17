#!/usr/bin/env bun
/**
 * InspectExcel.ts - Inspect Excel file structure
 */

import ExcelJS from "exceljs";

const filePath = process.argv[2] || "/home/tedla/cloud/projects/job-search/portfolio/analytical-methodology/tools/Shapley.xlsx";
const startRow = parseInt(process.argv[3] || "1");
const endRow = parseInt(process.argv[4] || "100");

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(filePath);

console.log("=== WORKBOOK STRUCTURE ===\n");
console.log("Sheets:", workbook.worksheets.map(s => s.name).join(", "));

for (const sheet of workbook.worksheets) {
  console.log(`\n=== Sheet: ${sheet.name} ===`);
  console.log(`Rows: ${sheet.rowCount}, Cols: ${sheet.columnCount}`);

  // Print specified rows
  for (let r = startRow; r <= Math.min(endRow, sheet.rowCount); r++) {
    const row = sheet.getRow(r);
    const values: string[] = [];
    for (let c = 1; c <= Math.min(14, sheet.columnCount); c++) {
      const cell = row.getCell(c);
      let val: any = cell.value;
      if (val && typeof val === 'object' && 'formula' in val) {
        const formula = String(val.formula);
        val = "[=" + formula.substring(0, 30) + (formula.length > 30 ? "..." : "") + "]";
      } else if (val && typeof val === 'object' && 'result' in val) {
        val = val.result;
      }
      values.push(val !== null && val !== undefined ? String(val).substring(0, 12) : '');
    }
    if (values.some(v => v !== '')) {
      console.log(`R${r}: ${values.join(' | ')}`);
    }
  }
}
