#!/usr/bin/env bun
/**
 * GenerateWFMShapley.ts - Generate WFM Shapley Decomposition Template
 *
 * Creates a 12-month Excel workbook for staffing variance analysis using
 * Shapley decomposition. Three variance factors: Volume, AHT, Shrinkage.
 * Occupancy is held constant as a planning assumption.
 *
 * Usage:
 *   bun run GenerateWFMShapley.ts --output ~/Downloads/WFM_Shapley_Template.xlsx
 */

import { parseArgs } from "util";
import ExcelJS from "exceljs";

// ============================================================================
// CONFIGURATION
// ============================================================================

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const COLORS = {
  header: "FF0F172A",      // Slate 900
  headerText: "FFFFFFFF",  // White
  inputBlue: "FFEFF6FF",   // Blue 50
  inputOrange: "FFFFF7ED", // Orange 50
  sectionHeader: "FF1D4ED8", // Blue 700
  positive: "FF059669",    // Emerald 600
  negative: "FFDC2626",    // Red 600
  gold: "FFF59E0B",        // Amber 500
  lightGray: "FFF1F5F9",   // Slate 100
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function colLetter(n: number): string {
  let result = "";
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

function applyHeaderStyle(cell: ExcelJS.Cell) {
  cell.font = { bold: true, color: { argb: COLORS.headerText } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.header } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
}

function applySectionStyle(cell: ExcelJS.Cell) {
  cell.font = { bold: true, size: 12, color: { argb: COLORS.sectionHeader } };
}

function applyInputStyle(cell: ExcelJS.Cell, type: "forecast" | "plan" | "actual") {
  const color = type === "actual" ? COLORS.inputOrange : COLORS.inputBlue;
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

async function generateWFMShapley(outputPath: string, year: number = 2024) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "WFM Shapley Decomposition Tool";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Shapley Analysis", {
    properties: { tabColor: { argb: COLORS.sectionHeader } },
    views: [{ state: "frozen", xSplit: 1, ySplit: 2 }],
  });

  // Column widths
  sheet.getColumn(1).width = 22;
  for (let i = 2; i <= 13; i++) {
    sheet.getColumn(i).width = 12;
  }

  let row = 1;

  // ============================================================================
  // TITLE
  // ============================================================================
  sheet.mergeCells(`A${row}:M${row}`);
  sheet.getCell(`A${row}`).value = `WFM Staffing Variance Analysis - ${year}`;
  sheet.getCell(`A${row}`).font = { bold: true, size: 16, color: { argb: COLORS.header } };
  sheet.getCell(`A${row}`).alignment = { horizontal: "center" };
  row += 2;

  // ============================================================================
  // MONTH HEADERS
  // ============================================================================
  sheet.getCell(`A${row}`).value = "Month";
  applyHeaderStyle(sheet.getCell(`A${row}`));
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = `${MONTHS[m]}-${year.toString().slice(-2)}`;
    applyHeaderStyle(cell);
  }
  row += 2;

  // ============================================================================
  // PLANNING ASSUMPTIONS (Fixed)
  // ============================================================================
  sheet.getCell(`A${row}`).value = "PLANNING ASSUMPTIONS";
  applySectionStyle(sheet.getCell(`A${row}`));
  row++;

  // Work Hours
  const workHoursRow = row;
  sheet.getCell(`A${row}`).value = "Work Hours/Month";
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 160; // Default, user can edit
    applyInputStyle(cell, "plan");
    cell.numFmt = "#,##0";
  }
  row++;

  // Occupancy (CONSTANT - key point)
  const occupancyRow = row;
  sheet.getCell(`A${row}`).value = "Planned Occupancy";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 0.80; // Default 80%
    applyInputStyle(cell, "plan");
    cell.numFmt = "0.0%";
  }
  row++;

  // Note about occupancy
  sheet.getCell(`A${row}`).value = "↑ Occupancy is a planning constant, not a variance driver";
  sheet.getCell(`A${row}`).font = { italic: true, size: 10, color: { argb: "FF64748B" } };
  row += 2;

  // ============================================================================
  // VOLUME (CALLS)
  // ============================================================================
  sheet.getCell(`A${row}`).value = "VOLUME (CALLS)";
  applySectionStyle(sheet.getCell(`A${row}`));
  row++;

  const planVolumeRow = row;
  sheet.getCell(`A${row}`).value = "Plan/Budget";
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 25000 + m * 100; // Sample data
    applyInputStyle(cell, "plan");
    cell.numFmt = "#,##0";
  }
  row++;

  const fcstVolumeRow = row;
  sheet.getCell(`A${row}`).value = "Forecast";
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 26000 + m * 200; // Sample data
    applyInputStyle(cell, "forecast");
    cell.numFmt = "#,##0";
  }
  row++;

  const actVolumeRow = row;
  sheet.getCell(`A${row}`).value = "Actual";
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 27000 + m * 150; // Sample data
    applyInputStyle(cell, "actual");
    cell.numFmt = "#,##0";
  }
  row++;

  // Variance rows
  sheet.getCell(`A${row}`).value = "Fcst vs Act %";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `IFERROR((${col}${actVolumeRow}-${col}${fcstVolumeRow})/${col}${fcstVolumeRow},0)` };
    sheet.getCell(row, m + 2).numFmt = "0.0%";
  }
  row++;

  sheet.getCell(`A${row}`).value = "Plan vs Act %";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `IFERROR((${col}${actVolumeRow}-${col}${planVolumeRow})/${col}${planVolumeRow},0)` };
    sheet.getCell(row, m + 2).numFmt = "0.0%";
  }
  row += 2;

  // ============================================================================
  // AHT (AVERAGE HANDLE TIME)
  // ============================================================================
  sheet.getCell(`A${row}`).value = "AHT (SECONDS)";
  applySectionStyle(sheet.getCell(`A${row}`));
  row++;

  const planAHTRow = row;
  sheet.getCell(`A${row}`).value = "Plan/Budget";
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 600; // 10 minutes
    applyInputStyle(cell, "plan");
    cell.numFmt = "#,##0";
  }
  row++;

  const fcstAHTRow = row;
  sheet.getCell(`A${row}`).value = "Forecast";
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 620 + m * 5; // Sample data
    applyInputStyle(cell, "forecast");
    cell.numFmt = "#,##0";
  }
  row++;

  const actAHTRow = row;
  sheet.getCell(`A${row}`).value = "Actual";
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 640 + m * 8; // Sample data
    applyInputStyle(cell, "actual");
    cell.numFmt = "#,##0";
  }
  row++;

  // Variance rows
  sheet.getCell(`A${row}`).value = "Fcst vs Act %";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `IFERROR((${col}${actAHTRow}-${col}${fcstAHTRow})/${col}${fcstAHTRow},0)` };
    sheet.getCell(row, m + 2).numFmt = "0.0%";
  }
  row++;

  sheet.getCell(`A${row}`).value = "Plan vs Act %";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `IFERROR((${col}${actAHTRow}-${col}${planAHTRow})/${col}${planAHTRow},0)` };
    sheet.getCell(row, m + 2).numFmt = "0.0%";
  }
  row += 2;

  // ============================================================================
  // SHRINKAGE
  // ============================================================================
  sheet.getCell(`A${row}`).value = "SHRINKAGE";
  applySectionStyle(sheet.getCell(`A${row}`));
  row++;

  const planShrinkRow = row;
  sheet.getCell(`A${row}`).value = "Plan/Budget";
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 0.35; // 35%
    applyInputStyle(cell, "plan");
    cell.numFmt = "0.0%";
  }
  row++;

  const fcstShrinkRow = row;
  sheet.getCell(`A${row}`).value = "Forecast";
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 0.38 + m * 0.005; // Sample data
    applyInputStyle(cell, "forecast");
    cell.numFmt = "0.0%";
  }
  row++;

  const actShrinkRow = row;
  sheet.getCell(`A${row}`).value = "Actual";
  for (let m = 0; m < 12; m++) {
    const cell = sheet.getCell(row, m + 2);
    cell.value = 0.40 + m * 0.008; // Sample data
    applyInputStyle(cell, "actual");
    cell.numFmt = "0.0%";
  }
  row++;

  // Variance rows
  sheet.getCell(`A${row}`).value = "Fcst vs Act %";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `IFERROR((${col}${actShrinkRow}-${col}${fcstShrinkRow})/${col}${fcstShrinkRow},0)` };
    sheet.getCell(row, m + 2).numFmt = "0.0%";
  }
  row++;

  sheet.getCell(`A${row}`).value = "Plan vs Act %";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `IFERROR((${col}${actShrinkRow}-${col}${planShrinkRow})/${col}${planShrinkRow},0)` };
    sheet.getCell(row, m + 2).numFmt = "0.0%";
  }
  row += 2;

  // ============================================================================
  // FTE REQUIREMENTS
  // ============================================================================
  // Formula: FTE = (Volume * AHT) / (WorkHours * 3600 * Occupancy * (1 - Shrinkage))
  // Note: AHT in seconds, WorkHours in hours, so we convert WorkHours to seconds

  sheet.getCell(`A${row}`).value = "FTE REQUIREMENTS";
  applySectionStyle(sheet.getCell(`A${row}`));
  row++;

  sheet.getCell(`A${row}`).value = "Formula: (Volume × AHT) / (WorkHours × 3600 × Occ × (1-Shrink))";
  sheet.getCell(`A${row}`).font = { italic: true, size: 10 };
  row++;

  // Plan FTE
  const planFTERow = row;
  sheet.getCell(`A${row}`).value = "Plan Required FTE";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    // Plan FTE = (Plan Volume * Plan AHT) / (Work Hours * 3600 * Occ * (1 - Plan Shrink))
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${planVolumeRow}*${col}${planAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${planShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // Forecast FTE
  const fcstFTERow = row;
  sheet.getCell(`A${row}`).value = "Forecast Required FTE";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    // Forecast FTE = (Fcst Volume * Fcst AHT) / (Work Hours * 3600 * Occ * (1 - Fcst Shrink))
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${fcstVolumeRow}*${col}${fcstAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${fcstShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // Actual FTE
  const actFTERow = row;
  sheet.getCell(`A${row}`).value = "Actual Required FTE";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    // Actual FTE = (Act Volume * Act AHT) / (Work Hours * 3600 * Occ * (1 - Act Shrink))
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${actVolumeRow}*${col}${actAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${actShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row += 2;

  // Total Variance
  sheet.getCell(`A${row}`).value = "VARIANCE SUMMARY";
  applySectionStyle(sheet.getCell(`A${row}`));
  row++;

  const fcstVarianceRow = row;
  sheet.getCell(`A${row}`).value = "Fcst vs Actual (FTE)";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `${col}${actFTERow}-${col}${fcstFTERow}` };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
    sheet.getCell(row, m + 2).font = { bold: true };
  }
  row++;

  const planVarianceRow = row;
  sheet.getCell(`A${row}`).value = "Plan vs Actual (FTE)";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `${col}${actFTERow}-${col}${planFTERow}` };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
    sheet.getCell(row, m + 2).font = { bold: true };
  }
  row += 3;

  // ============================================================================
  // SHAPLEY DECOMPOSITION - FORECAST VS ACTUAL
  // ============================================================================
  sheet.getCell(`A${row}`).value = "SHAPLEY: FORECAST vs ACTUAL";
  applySectionStyle(sheet.getCell(`A${row}`));
  sheet.getCell(`A${row}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.gold } };
  sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: COLORS.header } };
  row++;

  sheet.getCell(`A${row}`).value = "Coalition values (baseline = forecast values)";
  sheet.getCell(`A${row}`).font = { italic: true, size: 10 };
  row++;

  // Coalition values for Fcst vs Actual
  // v(∅) = FTE with all at forecast
  const fcst_v0_row = row;
  sheet.getCell(`A${row}`).value = "v(∅) - All at Forecast";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `${col}${fcstFTERow}` };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(V) = Actual Volume, Forecast AHT, Forecast Shrink
  const fcst_vV_row = row;
  sheet.getCell(`A${row}`).value = "v(V) - Volume at Actual";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${actVolumeRow}*${col}${fcstAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${fcstShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(A) = Forecast Volume, Actual AHT, Forecast Shrink
  const fcst_vA_row = row;
  sheet.getCell(`A${row}`).value = "v(A) - AHT at Actual";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${fcstVolumeRow}*${col}${actAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${fcstShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(S) = Forecast Volume, Forecast AHT, Actual Shrink
  const fcst_vS_row = row;
  sheet.getCell(`A${row}`).value = "v(S) - Shrink at Actual";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${fcstVolumeRow}*${col}${fcstAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${actShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(V,A) = Actual Volume, Actual AHT, Forecast Shrink
  const fcst_vVA_row = row;
  sheet.getCell(`A${row}`).value = "v(V,A)";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${actVolumeRow}*${col}${actAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${fcstShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(V,S) = Actual Volume, Forecast AHT, Actual Shrink
  const fcst_vVS_row = row;
  sheet.getCell(`A${row}`).value = "v(V,S)";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${actVolumeRow}*${col}${fcstAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${actShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(A,S) = Forecast Volume, Actual AHT, Actual Shrink
  const fcst_vAS_row = row;
  sheet.getCell(`A${row}`).value = "v(A,S)";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${fcstVolumeRow}*${col}${actAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${actShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(V,A,S) = All at actual
  const fcst_vVAS_row = row;
  sheet.getCell(`A${row}`).value = "v(V,A,S) - All at Actual";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `${col}${actFTERow}` };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row += 2;

  // Shapley Values for Fcst vs Actual
  sheet.getCell(`A${row}`).value = "Shapley Attribution (FTE)";
  sheet.getCell(`A${row}`).font = { bold: true };
  row++;

  // φ_V
  const fcst_phiV_row = row;
  sheet.getCell(`A${row}`).value = "φ(Volume)";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    // φ_V = (1/3)(v(V)-v(∅)) + (1/6)(v(V,A)-v(A)) + (1/6)(v(V,S)-v(S)) + (1/3)(v(V,A,S)-v(A,S))
    sheet.getCell(row, m + 2).value = {
      formula: `(1/3)*(${col}${fcst_vV_row}-${col}${fcst_v0_row})+(1/6)*(${col}${fcst_vVA_row}-${col}${fcst_vA_row})+(1/6)*(${col}${fcst_vVS_row}-${col}${fcst_vS_row})+(1/3)*(${col}${fcst_vVAS_row}-${col}${fcst_vAS_row})`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // φ_A
  const fcst_phiA_row = row;
  sheet.getCell(`A${row}`).value = "φ(AHT)";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    // φ_A = (1/3)(v(A)-v(∅)) + (1/6)(v(V,A)-v(V)) + (1/6)(v(A,S)-v(S)) + (1/3)(v(V,A,S)-v(V,S))
    sheet.getCell(row, m + 2).value = {
      formula: `(1/3)*(${col}${fcst_vA_row}-${col}${fcst_v0_row})+(1/6)*(${col}${fcst_vVA_row}-${col}${fcst_vV_row})+(1/6)*(${col}${fcst_vAS_row}-${col}${fcst_vS_row})+(1/3)*(${col}${fcst_vVAS_row}-${col}${fcst_vVS_row})`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // φ_S
  const fcst_phiS_row = row;
  sheet.getCell(`A${row}`).value = "φ(Shrinkage)";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    // φ_S = (1/3)(v(S)-v(∅)) + (1/6)(v(V,S)-v(V)) + (1/6)(v(A,S)-v(A)) + (1/3)(v(V,A,S)-v(V,A))
    sheet.getCell(row, m + 2).value = {
      formula: `(1/3)*(${col}${fcst_vS_row}-${col}${fcst_v0_row})+(1/6)*(${col}${fcst_vVS_row}-${col}${fcst_vV_row})+(1/6)*(${col}${fcst_vAS_row}-${col}${fcst_vA_row})+(1/3)*(${col}${fcst_vVAS_row}-${col}${fcst_vVA_row})`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // Verification
  const fcst_check_row = row;
  sheet.getCell(`A${row}`).value = "Check (should = variance)";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `${col}${fcst_phiV_row}+${col}${fcst_phiA_row}+${col}${fcst_phiS_row}`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row += 3;

  // ============================================================================
  // SHAPLEY DECOMPOSITION - PLAN VS ACTUAL
  // ============================================================================
  sheet.getCell(`A${row}`).value = "SHAPLEY: PLAN vs ACTUAL";
  applySectionStyle(sheet.getCell(`A${row}`));
  sheet.getCell(`A${row}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.gold } };
  sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: COLORS.header } };
  row++;

  sheet.getCell(`A${row}`).value = "Coalition values (baseline = plan/budget values)";
  sheet.getCell(`A${row}`).font = { italic: true, size: 10 };
  row++;

  // Coalition values for Plan vs Actual
  // v(∅) = FTE with all at plan
  const plan_v0_row = row;
  sheet.getCell(`A${row}`).value = "v(∅) - All at Plan";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `${col}${planFTERow}` };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(V) = Actual Volume, Plan AHT, Plan Shrink
  const plan_vV_row = row;
  sheet.getCell(`A${row}`).value = "v(V) - Volume at Actual";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${actVolumeRow}*${col}${planAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${planShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(A) = Plan Volume, Actual AHT, Plan Shrink
  const plan_vA_row = row;
  sheet.getCell(`A${row}`).value = "v(A) - AHT at Actual";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${planVolumeRow}*${col}${actAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${planShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(S) = Plan Volume, Plan AHT, Actual Shrink
  const plan_vS_row = row;
  sheet.getCell(`A${row}`).value = "v(S) - Shrink at Actual";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${planVolumeRow}*${col}${planAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${actShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(V,A)
  const plan_vVA_row = row;
  sheet.getCell(`A${row}`).value = "v(V,A)";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${actVolumeRow}*${col}${actAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${planShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(V,S)
  const plan_vVS_row = row;
  sheet.getCell(`A${row}`).value = "v(V,S)";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${actVolumeRow}*${col}${planAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${actShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(A,S)
  const plan_vAS_row = row;
  sheet.getCell(`A${row}`).value = "v(A,S)";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `IFERROR((${col}${planVolumeRow}*${col}${actAHTRow})/(${col}${workHoursRow}*3600*${col}${occupancyRow}*(1-${col}${actShrinkRow})),0)`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // v(V,A,S) = All at actual
  const plan_vVAS_row = row;
  sheet.getCell(`A${row}`).value = "v(V,A,S) - All at Actual";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = { formula: `${col}${actFTERow}` };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row += 2;

  // Shapley Values for Plan vs Actual
  sheet.getCell(`A${row}`).value = "Shapley Attribution (FTE)";
  sheet.getCell(`A${row}`).font = { bold: true };
  row++;

  // φ_V
  const plan_phiV_row = row;
  sheet.getCell(`A${row}`).value = "φ(Volume)";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `(1/3)*(${col}${plan_vV_row}-${col}${plan_v0_row})+(1/6)*(${col}${plan_vVA_row}-${col}${plan_vA_row})+(1/6)*(${col}${plan_vVS_row}-${col}${plan_vS_row})+(1/3)*(${col}${plan_vVAS_row}-${col}${plan_vAS_row})`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // φ_A
  const plan_phiA_row = row;
  sheet.getCell(`A${row}`).value = "φ(AHT)";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `(1/3)*(${col}${plan_vA_row}-${col}${plan_v0_row})+(1/6)*(${col}${plan_vVA_row}-${col}${plan_vV_row})+(1/6)*(${col}${plan_vAS_row}-${col}${plan_vS_row})+(1/3)*(${col}${plan_vVAS_row}-${col}${plan_vVS_row})`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // φ_S
  const plan_phiS_row = row;
  sheet.getCell(`A${row}`).value = "φ(Shrinkage)";
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `(1/3)*(${col}${plan_vS_row}-${col}${plan_v0_row})+(1/6)*(${col}${plan_vVS_row}-${col}${plan_vV_row})+(1/6)*(${col}${plan_vAS_row}-${col}${plan_vA_row})+(1/3)*(${col}${plan_vVAS_row}-${col}${plan_vVA_row})`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row++;

  // Verification
  sheet.getCell(`A${row}`).value = "Check (should = variance)";
  for (let m = 0; m < 12; m++) {
    const col = colLetter(m + 2);
    sheet.getCell(row, m + 2).value = {
      formula: `${col}${plan_phiV_row}+${col}${plan_phiA_row}+${col}${plan_phiS_row}`
    };
    sheet.getCell(row, m + 2).numFmt = "#,##0.00";
  }
  row += 3;

  // ============================================================================
  // METHODOLOGY NOTES
  // ============================================================================
  sheet.getCell(`A${row}`).value = "METHODOLOGY";
  applySectionStyle(sheet.getCell(`A${row}`));
  row++;

  const notes = [
    "Shapley value decomposition treats variance attribution as a cooperative game.",
    "Each factor's contribution = average marginal impact across all possible orderings.",
    "For n=3 factors, we compute 2³=8 coalition values and apply weights: 1/3, 1/6, 1/6, 1/3.",
    "",
    "Key assumptions:",
    "• Occupancy is a PLANNING CONSTANT - it does not contribute to variance",
    "• Baseline for 'Fcst vs Actual' = Forecast values",
    "• Baseline for 'Plan vs Actual' = Plan/Budget values",
    "",
    "Formula: FTE = (Volume × AHT) / (WorkHours × 3600 × Occupancy × (1 - Shrinkage))",
    "• Volume: Number of contacts/calls",
    "• AHT: Average Handle Time in SECONDS",
    "• WorkHours: Productive hours per month",
    "• Shrinkage: Fraction of time agents are unavailable (training, breaks, etc.)",
    "",
    "Shapley values sum EXACTLY to total variance (verify with 'Check' row).",
  ];

  for (const note of notes) {
    sheet.getCell(`A${row}`).value = note;
    sheet.getCell(`A${row}`).font = { size: 10 };
    row++;
  }

  // ============================================================================
  // SAVE
  // ============================================================================
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ WFM Shapley template generated: ${outputPath}`);
  console.log(`   Year: ${year}`);
  console.log(`   Factors: Volume, AHT, Shrinkage (Occupancy held constant)`);
  console.log(`   Analyses: Forecast vs Actual, Plan vs Actual`);
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const { values: args } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      output: { type: "string", short: "o" },
      year: { type: "string", short: "y", default: "2024" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (args.help) {
    console.log(`
GenerateWFMShapley.ts - Generate WFM Shapley Decomposition Template

USAGE:
  bun run GenerateWFMShapley.ts --output <path> [--year <year>]

OPTIONS:
  --output, -o <path>   Output Excel file path (required)
  --year, -y <year>     Year for column headers (default: 2024)
  --help, -h            Show this help

FEATURES:
  • 12 months of data (Jan-Dec)
  • Three variance factors: Volume, AHT, Shrinkage
  • Occupancy held constant (planning assumption)
  • Two analyses: Forecast vs Actual, Plan vs Actual
  • Full Shapley decomposition with verification
  • Editable input cells (blue=plan/forecast, orange=actual)

EXAMPLE:
  bun run GenerateWFMShapley.ts --output ~/Downloads/WFM_Shapley.xlsx --year 2025
`);
    return;
  }

  if (!args.output) {
    console.error("Error: --output is required");
    process.exit(1);
  }

  await generateWFMShapley(args.output, parseInt(args.year || "2024"));
}

main().catch(console.error);
