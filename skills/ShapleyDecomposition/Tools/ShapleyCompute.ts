#!/usr/bin/env bun
/**
 * ShapleyCompute.ts - Shapley Value Decomposition Calculator
 *
 * Computes Shapley values for variance attribution across any number of factors.
 *
 * Usage:
 *   bun run ShapleyCompute.ts --factors "V,A,S" --values "0,10,5,8,18,12,15,25"
 *   bun run ShapleyCompute.ts --factors "Price,Quantity" --baseline "10,100" --actual "12,90" --model "multiply"
 *   bun run ShapleyCompute.ts --weights 3
 */

import { parseArgs } from "util";

// ============================================================================
// TYPES
// ============================================================================

interface CoalitionValues {
  [key: string]: number;
}

interface ShapleyResult {
  factor: string;
  value: number;
  percentage: number;
  direction: "+" | "-" | "0";
}

interface DecompositionResult {
  factors: string[];
  total: number;
  shapleyValues: ShapleyResult[];
  coalitionValues: CoalitionValues;
  verification: {
    sum: number;
    matches: boolean;
  };
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Compute factorial
 */
function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/**
 * Generate all subsets of an array
 */
function powerSet<T>(arr: T[]): T[][] {
  const result: T[][] = [[]];
  for (const elem of arr) {
    const len = result.length;
    for (let i = 0; i < len; i++) {
      result.push([...result[i], elem]);
    }
  }
  return result;
}

/**
 * Generate coalition key from factor indices
 */
function coalitionKey(factors: string[], indices: number[]): string {
  if (indices.length === 0) return "∅";
  return indices
    .sort((a, b) => a - b)
    .map((i) => factors[i])
    .join(",");
}

/**
 * Compute Shapley weight for coalition of size |S| with n total factors
 * w(|S|, n) = |S|!(n-|S|-1)!/n!
 */
function shapleyWeight(coalitionSize: number, totalFactors: number): number {
  const n = totalFactors;
  const s = coalitionSize;
  return (factorial(s) * factorial(n - s - 1)) / factorial(n);
}

/**
 * Generate Shapley weight matrix for n factors
 */
function shapleyWeights(n: number): { size: number; weight: number }[] {
  const weights: { size: number; weight: number }[] = [];
  for (let s = 0; s < n; s++) {
    weights.push({
      size: s,
      weight: shapleyWeight(s, n),
    });
  }
  return weights;
}

/**
 * Compute Shapley values from coalition values
 *
 * @param coalitionValues - Map from coalition key to value
 *   Keys: "∅", "A", "B", "A,B", etc.
 * @param factors - Array of factor names
 */
function shapleyDecompose(
  coalitionValues: CoalitionValues,
  factors: string[]
): DecompositionResult {
  const n = factors.length;
  const shapleyValues: ShapleyResult[] = [];

  // For each factor, compute its Shapley value
  for (let i = 0; i < n; i++) {
    const factor = factors[i];
    const otherIndices = factors
      .map((_, idx) => idx)
      .filter((idx) => idx !== i);

    let shapleyValue = 0;

    // Sum over all subsets S of F \ {i}
    const subsets = powerSet(otherIndices);

    for (const S of subsets) {
      const sSize = S.length;
      const weight = shapleyWeight(sSize, n);

      // Coalition S ∪ {i}
      const withI = [...S, i];
      const keyWithI = coalitionKey(factors, withI);
      const keyWithoutI = S.length === 0 ? "∅" : coalitionKey(factors, S);

      const vWithI = coalitionValues[keyWithI] ?? 0;
      const vWithoutI = coalitionValues[keyWithoutI] ?? 0;

      const marginalContribution = vWithI - vWithoutI;
      shapleyValue += weight * marginalContribution;
    }

    shapleyValues.push({
      factor,
      value: shapleyValue,
      percentage: 0, // Will compute after we have total
      direction: shapleyValue > 0.0001 ? "+" : shapleyValue < -0.0001 ? "-" : "0",
    });
  }

  // Get total variance
  const fullKey = coalitionKey(
    factors,
    factors.map((_, i) => i)
  );
  const emptyValue = coalitionValues["∅"] ?? 0;
  const fullValue = coalitionValues[fullKey] ?? 0;
  const total = fullValue - emptyValue;

  // Compute percentages
  for (const sv of shapleyValues) {
    sv.percentage = total !== 0 ? (sv.value / total) * 100 : 0;
  }

  // Verification
  const sum = shapleyValues.reduce((acc, sv) => acc + sv.value, 0);

  return {
    factors,
    total,
    shapleyValues,
    coalitionValues,
    verification: {
      sum,
      matches: Math.abs(sum - total) < 0.0001,
    },
  };
}

/**
 * Build coalition values from a model function
 *
 * @param modelFunc - Function that computes outcome from factor values
 * @param baseline - Baseline/forecast values for each factor
 * @param actual - Actual values for each factor
 * @param factors - Factor names
 */
function buildCoalitionValues(
  modelFunc: (values: number[]) => number,
  baseline: number[],
  actual: number[],
  factors: string[]
): CoalitionValues {
  const n = factors.length;
  const coalitionValues: CoalitionValues = {};

  // Generate all subsets
  const indices = factors.map((_, i) => i);
  const subsets = powerSet(indices);

  for (const S of subsets) {
    // For coalition S, use actual values for factors in S, baseline for others
    const values = baseline.map((b, i) => (S.includes(i) ? actual[i] : b));
    const key = S.length === 0 ? "∅" : coalitionKey(factors, S);
    coalitionValues[key] = modelFunc(values);
  }

  return coalitionValues;
}

/**
 * Standard model functions
 */
const modelFunctions = {
  multiply: (values: number[]) => values.reduce((a, b) => a * b, 1),
  add: (values: number[]) => values.reduce((a, b) => a + b, 0),
  wfm_fte: (values: number[]) => {
    // FTE = (Volume × AHT) / (WorkHours × Occupancy × (1 - Shrinkage))
    // Expects: [Volume, AHT, Shrinkage] with WorkHours and Occupancy fixed
    // Or full: [Volume, AHT, WorkHours, Occupancy, Shrinkage]
    if (values.length === 3) {
      const [volume, aht, shrinkage] = values;
      const workHours = 8 * 60; // 8 hours in minutes
      const occupancy = 0.85;
      return (volume * aht) / (workHours * occupancy * (1 - shrinkage));
    } else if (values.length === 5) {
      const [volume, aht, workHours, occupancy, shrinkage] = values;
      return (volume * aht) / (workHours * occupancy * (1 - shrinkage));
    }
    throw new Error("WFM FTE model expects 3 or 5 values");
  },
};

// ============================================================================
// CLI
// ============================================================================

function printHelp() {
  console.log(`
ShapleyCompute.ts - Shapley Value Decomposition Calculator

USAGE:
  bun run ShapleyCompute.ts [OPTIONS]

OPTIONS:
  --factors <names>     Comma-separated factor names (e.g., "V,A,S")
  --values <values>     Comma-separated coalition values in binary order
                        For n factors: 2^n values starting with v(∅)
                        Example for n=2: "0,10,5,15" = v(∅), v(A), v(B), v(A,B)
  --baseline <values>   Baseline/forecast values for each factor
  --actual <values>     Actual values for each factor
  --model <type>        Model type: "multiply", "add", "wfm_fte", or custom
  --weights <n>         Just print Shapley weights for n factors
  --output <format>     Output format: "json", "table", "markdown" (default: markdown)
  --help, -h            Show this help

EXAMPLES:
  # Direct coalition values (WFM 3-factor example)
  bun run ShapleyCompute.ts --factors "V,A,S" --values "0,10,5,8,18,12,15,25"

  # From baseline/actual with model
  bun run ShapleyCompute.ts --factors "Price,Quantity" \\
    --baseline "10,100" --actual "12,90" --model "multiply"

  # Show weights for 3 factors
  bun run ShapleyCompute.ts --weights 3

COALITION VALUE ORDER:
  For n factors, provide 2^n values in binary counting order:
  n=2: ∅, A, B, AB
  n=3: ∅, A, B, AB, C, AC, BC, ABC
  n=4: ∅, A, B, AB, C, AC, BC, ABC, D, AD, BD, ABD, CD, ACD, BCD, ABCD
`);
}

function formatResult(result: DecompositionResult, format: string): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (format === "table" || format === "markdown") {
    let output = `## Shapley Variance Decomposition\n\n`;
    output += `**Total Variance:** ${result.total.toFixed(4)}\n\n`;
    output += `| Factor | Attribution | % of Total | Direction |\n`;
    output += `|--------|-------------|------------|:---------:|\n`;

    for (const sv of result.shapleyValues) {
      output += `| ${sv.factor} | ${sv.value.toFixed(4)} | ${sv.percentage.toFixed(1)}% | ${sv.direction} |\n`;
    }

    output += `\n**Verification:** Sum = ${result.verification.sum.toFixed(4)} ${result.verification.matches ? "✓" : "✗"}\n`;

    return output;
  }

  return JSON.stringify(result);
}

async function main() {
  const { values: args } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      factors: { type: "string", short: "f" },
      values: { type: "string", short: "v" },
      baseline: { type: "string", short: "b" },
      actual: { type: "string", short: "a" },
      model: { type: "string", short: "m" },
      weights: { type: "string", short: "w" },
      output: { type: "string", short: "o", default: "markdown" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (args.help) {
    printHelp();
    return;
  }

  // Just show weights
  if (args.weights) {
    const n = parseInt(args.weights);
    console.log(`\nShapley Weights for n=${n} factors:\n`);
    console.log("| Coalition Size | Weight | Fraction |");
    console.log("|----------------|--------|----------|");
    const weights = shapleyWeights(n);
    for (const w of weights) {
      const frac = `${factorial(w.size)}!×${factorial(n - w.size - 1)}!/${factorial(n)}!`;
      console.log(
        `| ${w.size} | ${w.weight.toFixed(6)} | ${frac} |`
      );
    }
    return;
  }

  // Need factors for any computation
  if (!args.factors) {
    console.error("Error: --factors is required");
    printHelp();
    process.exit(1);
  }

  const factors = args.factors.split(",").map((f) => f.trim());
  const n = factors.length;

  let coalitionValues: CoalitionValues;

  // Option 1: Direct coalition values
  if (args.values) {
    const values = args.values.split(",").map((v) => parseFloat(v.trim()));
    const expected = Math.pow(2, n);

    if (values.length !== expected) {
      console.error(
        `Error: Expected ${expected} coalition values for ${n} factors, got ${values.length}`
      );
      process.exit(1);
    }

    // Build coalition values map from binary-ordered array
    coalitionValues = {};
    for (let i = 0; i < values.length; i++) {
      const indices: number[] = [];
      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) {
          indices.push(j);
        }
      }
      const key = indices.length === 0 ? "∅" : coalitionKey(factors, indices);
      coalitionValues[key] = values[i];
    }
  }
  // Option 2: Baseline/actual with model
  else if (args.baseline && args.actual && args.model) {
    const baseline = args.baseline.split(",").map((v) => parseFloat(v.trim()));
    const actual = args.actual.split(",").map((v) => parseFloat(v.trim()));

    if (baseline.length !== n || actual.length !== n) {
      console.error(
        `Error: baseline and actual must have ${n} values each`
      );
      process.exit(1);
    }

    const modelFunc =
      modelFunctions[args.model as keyof typeof modelFunctions];
    if (!modelFunc) {
      console.error(
        `Error: Unknown model "${args.model}". Use: ${Object.keys(modelFunctions).join(", ")}`
      );
      process.exit(1);
    }

    coalitionValues = buildCoalitionValues(modelFunc, baseline, actual, factors);
  } else {
    console.error(
      "Error: Provide either --values OR (--baseline, --actual, --model)"
    );
    printHelp();
    process.exit(1);
  }

  // Compute Shapley decomposition
  const result = shapleyDecompose(coalitionValues, factors);

  // Output
  console.log(formatResult(result, args.output || "markdown"));
}

main().catch(console.error);

// Export for use as module
export {
  shapleyDecompose,
  buildCoalitionValues,
  shapleyWeights,
  shapleyWeight,
  coalitionKey,
  powerSet,
  modelFunctions,
  type CoalitionValues,
  type ShapleyResult,
  type DecompositionResult,
};
