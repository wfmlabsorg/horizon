#!/usr/bin/env bun
/**
 * ShapleyExcel.ts - Generate Excel Templates for Shapley Decomposition
 *
 * Creates ready-to-use Excel workbooks with formulas for variance attribution.
 *
 * Usage:
 *   bun run ShapleyExcel.ts --factors "Volume,AHT,Shrinkage" --model "wfm" --output template.xlsx
 *   bun run ShapleyExcel.ts --factors "Price,Quantity" --model "multiply" --output revenue.xlsx
 */

import { parseArgs } from "util";
import ExcelJS from "exceljs";

// ============================================================================
// TYPES
// ============================================================================

interface FactorConfig {
  name: string;
  baselineDefault?: number;
  actualDefault?: number;
  description?: string;
  format?: string; // e.g., "0.00%", "#,##0", "0.00"
}

interface ModelConfig {
  name: string;
  formula: string;
  description: string;
  fixedParams?: { name: string; value: number; description: string }[];
}

// ============================================================================
// MODEL DEFINITIONS
// ============================================================================

const modelConfigs: Record<string, ModelConfig> = {
  multiply: {
    name: "Multiplicative",
    formula: "Factor1 × Factor2 × ... × FactorN",
    description: "Product of all factors (e.g., Revenue = Price × Quantity)",
  },
  add: {
    name: "Additive",
    formula: "Factor1 + Factor2 + ... + FactorN",
    description: "Sum of all factors",
  },
  wfm: {
    name: "WFM Staffing",
    formula: "(Volume × AHT) / (WorkHours × Occupancy × (1 - Shrinkage))",
    description: "Contact center FTE requirement calculation",
    fixedParams: [
      { name: "WorkHours", value: 480, description: "Minutes per shift" },
      { name: "Occupancy", value: 0.85, description: "Target occupancy" },
    ],
  },
  revenue: {
    name: "Revenue Variance",
    formula: "Price × Quantity",
    description: "Revenue = Price × Quantity",
  },
  margin: {
    name: "Margin Variance",
    formula: "(Price - Cost) × Quantity",
    description: "Gross Margin = (Price - Unit Cost) × Quantity",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate all binary combinations for n factors
 * Returns array of arrays, each inner array contains indices of "actual" factors
 */
function generateCoalitions(n: number): number[][] {
  const coalitions: number[][] = [];
  for (let i = 0; i < Math.pow(2, n); i++) {
    const coalition: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        coalition.push(j);
      }
    }
    coalitions.push(coalition);
  }
  return coalitions;
}

/**
 * Get coalition label from indices
 */
function coalitionLabel(factors: string[], indices: number[]): string {
  if (indices.length === 0) return "∅ (Baseline)";
  return indices.map((i) => factors[i]).join(", ");
}

/**
 * Generate Shapley weight as fraction string
 */
function shapleyWeightFraction(s: number, n: number): string {
  // Weight = s!(n-s-1)!/n!
  const factorial = (x: number): number => (x <= 1 ? 1 : x * factorial(x - 1));
  const num = factorial(s) * factorial(n - s - 1);
  const den = factorial(n);

  // Simplify common fractions
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(num, den);
  return `${num / g}/${den / g}`;
}

/**
 * Convert column number to Excel letter (1=A, 2=B, ..., 27=AA)
 */
function colLetter(n: number): string {
  let result = "";
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

// ============================================================================
// EXCEL GENERATION
// ============================================================================

async function generateExcel(
  factors: string[],
  modelType: string,
  outputPath: string,
  options: {
    includeChart?: boolean;
    baselineValues?: number[];
    actualValues?: number[];
  } = {}
): Promise<void> {
  const n = factors.length;
  const coalitions = generateCoalitions(n);
  const model = modelConfigs[modelType] || modelConfigs.multiply;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "HORIZON ShapleyDecomposition Skill";
  workbook.created = new Date();

  // ============================================================================
  // SHEET 1: INPUTS
  // ============================================================================
  const inputSheet = workbook.addWorksheet("Inputs", {
    properties: { tabColor: { argb: "FF1D4ED8" } },
  });

  // Title
  inputSheet.mergeCells("A1:F1");
  inputSheet.getCell("A1").value = "Shapley Variance Decomposition - Inputs";
  inputSheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF0F172A" } };
  inputSheet.getCell("A1").alignment = { horizontal: "center" };

  // Model info
  inputSheet.getCell("A3").value = "Model:";
  inputSheet.getCell("A3").font = { bold: true };
  inputSheet.getCell("B3").value = model.name;
  inputSheet.getCell("A4").value = "Formula:";
  inputSheet.getCell("A4").font = { bold: true };
  inputSheet.getCell("B4").value = model.formula;
  inputSheet.mergeCells("B4:F4");

  // Factor inputs header
  inputSheet.getCell("A6").value = "Factor";
  inputSheet.getCell("B6").value = "Baseline (Forecast)";
  inputSheet.getCell("C6").value = "Actual";
  inputSheet.getCell("D6").value = "Change";
  inputSheet.getCell("E6").value = "% Change";
  ["A6", "B6", "C6", "D6", "E6"].forEach((cell) => {
    inputSheet.getCell(cell).font = { bold: true, color: { argb: "FFFFFFFF" } };
    inputSheet.getCell(cell).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    inputSheet.getCell(cell).alignment = { horizontal: "center" };
  });

  // Factor rows
  for (let i = 0; i < n; i++) {
    const row = 7 + i;
    inputSheet.getCell(`A${row}`).value = factors[i];
    inputSheet.getCell(`A${row}`).font = { bold: true };

    // Baseline input (editable)
    const baselineCell = inputSheet.getCell(`B${row}`);
    baselineCell.value = options.baselineValues?.[i] ?? 100;
    baselineCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFF6FF" },
    };
    baselineCell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Actual input (editable)
    const actualCell = inputSheet.getCell(`C${row}`);
    actualCell.value = options.actualValues?.[i] ?? 110;
    actualCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFF7ED" },
    };
    actualCell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Change formula
    inputSheet.getCell(`D${row}`).value = { formula: `C${row}-B${row}` };

    // % Change formula
    inputSheet.getCell(`E${row}`).value = { formula: `IF(B${row}=0,0,(C${row}-B${row})/B${row})` };
    inputSheet.getCell(`E${row}`).numFmt = "0.0%";
  }

  // Fixed parameters (if any)
  if (model.fixedParams && model.fixedParams.length > 0) {
    const fixedStartRow = 7 + n + 2;
    inputSheet.getCell(`A${fixedStartRow}`).value = "Fixed Parameters";
    inputSheet.getCell(`A${fixedStartRow}`).font = { bold: true, size: 12 };

    inputSheet.getCell(`A${fixedStartRow + 1}`).value = "Parameter";
    inputSheet.getCell(`B${fixedStartRow + 1}`).value = "Value";
    inputSheet.getCell(`C${fixedStartRow + 1}`).value = "Description";
    [`A${fixedStartRow + 1}`, `B${fixedStartRow + 1}`, `C${fixedStartRow + 1}`].forEach((cell) => {
      inputSheet.getCell(cell).font = { bold: true };
    });

    model.fixedParams.forEach((param, idx) => {
      const pRow = fixedStartRow + 2 + idx;
      inputSheet.getCell(`A${pRow}`).value = param.name;
      inputSheet.getCell(`B${pRow}`).value = param.value;
      inputSheet.getCell(`C${pRow}`).value = param.description;
    });
  }

  // Column widths
  inputSheet.getColumn(1).width = 15;
  inputSheet.getColumn(2).width = 18;
  inputSheet.getColumn(3).width = 12;
  inputSheet.getColumn(4).width = 12;
  inputSheet.getColumn(5).width = 12;

  // Note: Named ranges removed due to ExcelJS compatibility issues
  // Users can add their own named ranges in Excel if needed

  // ============================================================================
  // SHEET 2: COALITIONS
  // ============================================================================
  const coalitionSheet = workbook.addWorksheet("Coalitions", {
    properties: { tabColor: { argb: "FF059669" } },
  });

  // Title
  coalitionSheet.mergeCells("A1:G1");
  coalitionSheet.getCell("A1").value = "Coalition Values";
  coalitionSheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF0F172A" } };

  coalitionSheet.getCell("A3").value =
    "Each coalition represents a combination of factors at their actual values (others at baseline).";
  coalitionSheet.mergeCells("A3:G3");

  // Headers
  const coalitionHeaders = ["Coalition", "Binary", ...factors, "v(S)"];
  coalitionHeaders.forEach((header, idx) => {
    const cell = coalitionSheet.getCell(5, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.alignment = { horizontal: "center" };
  });

  // Coalition rows
  coalitions.forEach((coalition, idx) => {
    const row = 6 + idx;
    const binaryStr = idx.toString(2).padStart(n, "0").split("").reverse().join("");

    coalitionSheet.getCell(row, 1).value = coalitionLabel(factors, coalition);
    coalitionSheet.getCell(row, 2).value = binaryStr;
    coalitionSheet.getCell(row, 2).font = { name: "Consolas" };

    // Factor values (actual if in coalition, baseline otherwise)
    for (let j = 0; j < n; j++) {
      const inCoalition = coalition.includes(j);
      const factorRow = 7 + j; // Row in Inputs sheet
      const formula = inCoalition ? `Inputs!$C$${factorRow}` : `Inputs!$B$${factorRow}`;
      coalitionSheet.getCell(row, 3 + j).value = { formula };

      // Highlight actual values
      if (inCoalition) {
        coalitionSheet.getCell(row, 3 + j).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF7ED" },
        };
      }
    }

    // v(S) formula - depends on model type
    const vCol = 3 + n;
    let vFormula: string;

    if (modelType === "multiply" || modelType === "revenue") {
      // Product of all factors
      const factorCells = factors.map((_, j) => `${colLetter(3 + j)}${row}`);
      vFormula = factorCells.join("*");
    } else if (modelType === "add") {
      // Sum of all factors
      const factorCells = factors.map((_, j) => `${colLetter(3 + j)}${row}`);
      vFormula = factorCells.join("+");
    } else if (modelType === "wfm") {
      // WFM model: (Volume × AHT) / (WorkHours × Occupancy × (1 - Shrinkage))
      // Assumes factors are [Volume, AHT, Shrinkage]
      const volCell = `${colLetter(3)}${row}`;
      const ahtCell = `${colLetter(4)}${row}`;
      const shrinkCell = `${colLetter(5)}${row}`;
      const workHours = model.fixedParams?.[0]?.value ?? 480;
      const occupancy = model.fixedParams?.[1]?.value ?? 0.85;
      vFormula = `(${volCell}*${ahtCell})/(${workHours}*${occupancy}*(1-${shrinkCell}))`;
    } else if (modelType === "margin") {
      // (Price - Cost) × Quantity - assumes [Price, Cost, Quantity]
      const priceCell = `${colLetter(3)}${row}`;
      const costCell = `${colLetter(4)}${row}`;
      const qtyCell = `${colLetter(5)}${row}`;
      vFormula = `(${priceCell}-${costCell})*${qtyCell}`;
    } else {
      // Default to multiply
      const factorCells = factors.map((_, j) => `${colLetter(3 + j)}${row}`);
      vFormula = factorCells.join("*");
    }

    coalitionSheet.getCell(row, vCol).value = { formula: vFormula };
    coalitionSheet.getCell(row, vCol).numFmt = "#,##0.00";
    coalitionSheet.getCell(row, vCol).font = { bold: true };

    // Note: Named ranges for coalitions removed due to ExcelJS compatibility
  });

  // Column widths
  coalitionSheet.getColumn(1).width = 25;
  coalitionSheet.getColumn(2).width = 10;
  for (let j = 0; j < n; j++) {
    coalitionSheet.getColumn(3 + j).width = 12;
  }
  coalitionSheet.getColumn(3 + n).width = 15;

  // ============================================================================
  // SHEET 3: SHAPLEY CALCULATION
  // ============================================================================
  const shapleySheet = workbook.addWorksheet("Shapley", {
    properties: { tabColor: { argb: "FFF59E0B" } },
  });

  // Title
  shapleySheet.mergeCells("A1:H1");
  shapleySheet.getCell("A1").value = "Shapley Value Calculation";
  shapleySheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF0F172A" } };

  // Weights reference
  shapleySheet.getCell("A3").value = "Shapley Weights for n=" + n + " factors:";
  shapleySheet.getCell("A3").font = { bold: true };

  shapleySheet.getCell("A4").value = "Coalition Size";
  shapleySheet.getCell("B4").value = "Weight";
  shapleySheet.getCell("A4").font = { bold: true };
  shapleySheet.getCell("B4").font = { bold: true };

  for (let s = 0; s < n; s++) {
    shapleySheet.getCell(`A${5 + s}`).value = s;
    shapleySheet.getCell(`B${5 + s}`).value = shapleyWeightFraction(s, n);
  }

  // Shapley calculation for each factor
  const calcStartRow = 5 + n + 2;

  shapleySheet.getCell(`A${calcStartRow}`).value = "Factor";
  shapleySheet.getCell(`B${calcStartRow}`).value = "Shapley Value";
  shapleySheet.getCell(`C${calcStartRow}`).value = "% of Total";
  shapleySheet.getCell(`D${calcStartRow}`).value = "Direction";
  [`A${calcStartRow}`, `B${calcStartRow}`, `C${calcStartRow}`, `D${calcStartRow}`].forEach((cell) => {
    shapleySheet.getCell(cell).font = { bold: true, color: { argb: "FFFFFFFF" } };
    shapleySheet.getCell(cell).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
  });

  // For each factor, build the Shapley formula
  const vColLetter = colLetter(3 + n);

  for (let i = 0; i < n; i++) {
    const row = calcStartRow + 1 + i;
    shapleySheet.getCell(`A${row}`).value = factors[i];
    shapleySheet.getCell(`A${row}`).font = { bold: true };

    // Build Shapley formula by summing weighted marginal contributions
    // φᵢ = Σ weight(|S|) × [v(S∪{i}) - v(S)]
    const terms: string[] = [];

    // Generate all subsets of factors excluding i
    const otherIndices = factors.map((_, idx) => idx).filter((idx) => idx !== i);
    const subsets = generateCoalitions(otherIndices.length).map((subset) =>
      subset.map((idx) => otherIndices[idx])
    );

    for (const S of subsets) {
      const sSize = S.length;
      const weight = shapleyWeightFraction(sSize, n);
      const [num, den] = weight.split("/").map(Number);
      const weightValue = num / den;

      // Find coalition row numbers
      // S∪{i}
      const withI = [...S, i].sort((a, b) => a - b);
      const withIBinary = withI.reduce((acc, idx) => acc | (1 << idx), 0);
      const withIRow = 6 + withIBinary;

      // S
      const sBinary = S.reduce((acc, idx) => acc | (1 << idx), 0);
      const sRow = 6 + sBinary;

      terms.push(`(${weightValue})*(Coalitions!$${vColLetter}$${withIRow}-Coalitions!$${vColLetter}$${sRow})`);
    }

    shapleySheet.getCell(`B${row}`).value = { formula: terms.join("+") };
    shapleySheet.getCell(`B${row}`).numFmt = "#,##0.00";
    shapleySheet.getCell(`B${row}`).font = { bold: true };

    // % of Total
    const totalRow = calcStartRow + 1 + n + 1;
    shapleySheet.getCell(`C${row}`).value = { formula: `IF($B$${totalRow}=0,0,B${row}/$B$${totalRow})` };
    shapleySheet.getCell(`C${row}`).numFmt = "0.0%";

    // Direction
    shapleySheet.getCell(`D${row}`).value = { formula: `IF(B${row}>0.001,"+",IF(B${row}<-0.001,"-","0"))` };
    shapleySheet.getCell(`D${row}`).alignment = { horizontal: "center" };
  }

  // Total row
  const totalRow = calcStartRow + 1 + n;
  shapleySheet.getCell(`A${totalRow}`).value = "TOTAL";
  shapleySheet.getCell(`A${totalRow}`).font = { bold: true };
  shapleySheet.getCell(`B${totalRow}`).value = { formula: `SUM(B${calcStartRow + 1}:B${calcStartRow + n})` };
  shapleySheet.getCell(`B${totalRow}`).numFmt = "#,##0.00";
  shapleySheet.getCell(`B${totalRow}`).font = { bold: true };
  shapleySheet.getCell(`C${totalRow}`).value = 1;
  shapleySheet.getCell(`C${totalRow}`).numFmt = "0.0%";

  // Verification row
  const verifyRow = totalRow + 2;
  shapleySheet.getCell(`A${verifyRow}`).value = "Verification:";
  shapleySheet.getCell(`A${verifyRow}`).font = { bold: true };
  shapleySheet.getCell(`B${verifyRow}`).value = "v(Full) - v(Empty)";

  const fullCoalitionRow = 6 + (Math.pow(2, n) - 1);
  const emptyCoalitionRow = 6;
  shapleySheet.getCell(`C${verifyRow}`).value = {
    formula: `Coalitions!$${vColLetter}$${fullCoalitionRow}-Coalitions!$${vColLetter}$${emptyCoalitionRow}`
  };
  shapleySheet.getCell(`C${verifyRow}`).numFmt = "#,##0.00";

  shapleySheet.getCell(`D${verifyRow}`).value = {
    formula: `IF(ABS(B${totalRow}-C${verifyRow})<0.01,"✓ Match","✗ Error")`
  };
  shapleySheet.getCell(`D${verifyRow}`).font = { bold: true };

  // Column widths
  shapleySheet.getColumn(1).width = 15;
  shapleySheet.getColumn(2).width = 15;
  shapleySheet.getColumn(3).width = 12;
  shapleySheet.getColumn(4).width = 10;

  // ============================================================================
  // SHEET 4: SUMMARY
  // ============================================================================
  const summarySheet = workbook.addWorksheet("Summary", {
    properties: { tabColor: { argb: "FFDC2626" } },
  });

  // Title
  summarySheet.mergeCells("A1:F1");
  summarySheet.getCell("A1").value = "Shapley Variance Decomposition Summary";
  summarySheet.getCell("A1").font = { bold: true, size: 18, color: { argb: "FF0F172A" } };
  summarySheet.getCell("A1").alignment = { horizontal: "center" };

  // Model info
  summarySheet.getCell("A3").value = "Model:";
  summarySheet.getCell("A3").font = { bold: true };
  summarySheet.getCell("B3").value = model.formula;

  summarySheet.getCell("A4").value = "Total Variance:";
  summarySheet.getCell("A4").font = { bold: true };
  summarySheet.getCell("B4").value = { formula: `Shapley!B${calcStartRow + 1 + n}` };
  summarySheet.getCell("B4").numFmt = "#,##0.00";
  summarySheet.getCell("B4").font = { bold: true, size: 14, color: { argb: "FF1D4ED8" } };

  // Results table
  summarySheet.getCell("A6").value = "Factor";
  summarySheet.getCell("B6").value = "Baseline";
  summarySheet.getCell("C6").value = "Actual";
  summarySheet.getCell("D6").value = "Attribution";
  summarySheet.getCell("E6").value = "% of Total";
  summarySheet.getCell("F6").value = "Direction";
  ["A6", "B6", "C6", "D6", "E6", "F6"].forEach((cell) => {
    summarySheet.getCell(cell).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summarySheet.getCell(cell).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    summarySheet.getCell(cell).alignment = { horizontal: "center" };
  });

  for (let i = 0; i < n; i++) {
    const row = 7 + i;
    const inputRow = 7 + i;
    const shapleyRow = calcStartRow + 1 + i;

    summarySheet.getCell(`A${row}`).value = factors[i];
    summarySheet.getCell(`A${row}`).font = { bold: true };
    summarySheet.getCell(`B${row}`).value = { formula: `Inputs!B${inputRow}` };
    summarySheet.getCell(`C${row}`).value = { formula: `Inputs!C${inputRow}` };
    summarySheet.getCell(`D${row}`).value = { formula: `Shapley!B${shapleyRow}` };
    summarySheet.getCell(`D${row}`).numFmt = "#,##0.00";
    summarySheet.getCell(`D${row}`).font = { bold: true };
    summarySheet.getCell(`E${row}`).value = { formula: `Shapley!C${shapleyRow}` };
    summarySheet.getCell(`E${row}`).numFmt = "0.0%";
    summarySheet.getCell(`F${row}`).value = { formula: `Shapley!D${shapleyRow}` };
    summarySheet.getCell(`F${row}`).alignment = { horizontal: "center" };

    // Conditional formatting for direction
    summarySheet.getCell(`F${row}`).font = { bold: true };
  }

  // Total row
  const summaryTotalRow = 7 + n;
  summarySheet.getCell(`A${summaryTotalRow}`).value = "TOTAL";
  summarySheet.getCell(`A${summaryTotalRow}`).font = { bold: true };
  summarySheet.getCell(`D${summaryTotalRow}`).value = { formula: `SUM(D7:D${summaryTotalRow - 1})` };
  summarySheet.getCell(`D${summaryTotalRow}`).numFmt = "#,##0.00";
  summarySheet.getCell(`D${summaryTotalRow}`).font = { bold: true };
  summarySheet.getCell(`E${summaryTotalRow}`).value = 1;
  summarySheet.getCell(`E${summaryTotalRow}`).numFmt = "0.0%";

  // Instructions
  const instrRow = summaryTotalRow + 3;
  summarySheet.getCell(`A${instrRow}`).value = "Instructions:";
  summarySheet.getCell(`A${instrRow}`).font = { bold: true, size: 12 };
  summarySheet.getCell(`A${instrRow + 1}`).value = "1. Enter baseline (forecast) values in the Inputs sheet";
  summarySheet.getCell(`A${instrRow + 2}`).value = "2. Enter actual values in the Inputs sheet";
  summarySheet.getCell(`A${instrRow + 3}`).value = "3. Results automatically calculate in this Summary";
  summarySheet.getCell(`A${instrRow + 4}`).value = "4. See Coalitions sheet for all intermediate calculations";
  summarySheet.getCell(`A${instrRow + 5}`).value = "5. See Shapley sheet for detailed formula breakdown";

  // Methodology note
  const methodRow = instrRow + 8;
  summarySheet.getCell(`A${methodRow}`).value = "Methodology:";
  summarySheet.getCell(`A${methodRow}`).font = { bold: true, size: 12 };
  summarySheet.mergeCells(`A${methodRow + 1}:F${methodRow + 3}`);
  summarySheet.getCell(`A${methodRow + 1}`).value =
    "Shapley value decomposition treats variance attribution as a cooperative game. " +
    "Each factor's contribution is its average marginal impact across all possible orderings. " +
    "This ensures contributions sum exactly to total variance and treats all factors symmetrically.";
  summarySheet.getCell(`A${methodRow + 1}`).alignment = { wrapText: true, vertical: "top" };

  // Column widths
  summarySheet.getColumn(1).width = 15;
  summarySheet.getColumn(2).width = 12;
  summarySheet.getColumn(3).width = 12;
  summarySheet.getColumn(4).width = 15;
  summarySheet.getColumn(5).width = 12;
  summarySheet.getColumn(6).width = 10;

  // ============================================================================
  // SAVE WORKBOOK
  // ============================================================================
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ Excel template generated: ${outputPath}`);
  console.log(`   Factors: ${factors.join(", ")}`);
  console.log(`   Model: ${model.name}`);
  console.log(`   Sheets: Inputs, Coalitions, Shapley, Summary`);
}

// ============================================================================
// CLI
// ============================================================================

function printHelp() {
  console.log(`
ShapleyExcel.ts - Generate Excel Templates for Shapley Decomposition

USAGE:
  bun run ShapleyExcel.ts --factors <names> --model <type> --output <path>

OPTIONS:
  --factors <names>     Comma-separated factor names (required)
  --model <type>        Model type (default: multiply)
                        Options: multiply, add, wfm, revenue, margin
  --output <path>       Output Excel file path (required)
  --baseline <values>   Default baseline values (comma-separated)
  --actual <values>     Default actual values (comma-separated)
  --help, -h            Show this help

MODELS:
  multiply    Product of all factors (Price × Quantity)
  add         Sum of all factors
  wfm         WFM staffing: (Volume × AHT) / (WorkHours × Occ × (1-Shrink))
  revenue     Revenue = Price × Quantity
  margin      Margin = (Price - Cost) × Quantity

EXAMPLES:
  # WFM staffing variance template
  bun run ShapleyExcel.ts \\
    --factors "Volume,AHT,Shrinkage" \\
    --model wfm \\
    --baseline "1000,300,0.30" \\
    --actual "1100,330,0.35" \\
    --output ~/Downloads/wfm_shapley.xlsx

  # Revenue variance template
  bun run ShapleyExcel.ts \\
    --factors "Price,Quantity" \\
    --model revenue \\
    --output ~/Downloads/revenue_shapley.xlsx

  # Custom 4-factor multiplicative model
  bun run ShapleyExcel.ts \\
    --factors "A,B,C,D" \\
    --model multiply \\
    --output ~/Downloads/custom_shapley.xlsx
`);
}

async function main() {
  const { values: args } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      factors: { type: "string", short: "f" },
      model: { type: "string", short: "m", default: "multiply" },
      output: { type: "string", short: "o" },
      baseline: { type: "string", short: "b" },
      actual: { type: "string", short: "a" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (args.help) {
    printHelp();
    return;
  }

  if (!args.factors) {
    console.error("Error: --factors is required");
    printHelp();
    process.exit(1);
  }

  if (!args.output) {
    console.error("Error: --output is required");
    printHelp();
    process.exit(1);
  }

  const factors = args.factors.split(",").map((f) => f.trim());
  const baselineValues = args.baseline
    ? args.baseline.split(",").map((v) => parseFloat(v.trim()))
    : undefined;
  const actualValues = args.actual
    ? args.actual.split(",").map((v) => parseFloat(v.trim()))
    : undefined;

  await generateExcel(factors, args.model || "multiply", args.output, {
    baselineValues,
    actualValues,
  });
}

main().catch(console.error);

export { generateExcel, modelConfigs };
