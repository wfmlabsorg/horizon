# Analyze Workflow

## Purpose

Decompose observed variance into fair factor contributions using Shapley values.

---

## When to Use

- "What drove the variance between forecast and actual?"
- "How much did each factor contribute?"
- "Decompose this variance"
- "Attribution analysis"

---

## Input

User provides:
1. **Model/Formula** - How outcome depends on factors
2. **Baseline values** - Forecast or reference values
3. **Actual values** - Observed values
4. **Factors to analyze** - Which variables to decompose

---

## Process

### Step 1: Clarify the Model

Identify the functional form:

| Model Type | Example |
|------------|---------|
| Multiplicative | Revenue = Price × Quantity |
| Division | FTE = (Volume × AHT) / (Hours × Occ × (1-Shrink)) |
| Additive | Total Cost = Fixed + Variable |
| Mixed | Profit = (Price - UnitCost) × Quantity |

**Ask if unclear:** "What's the formula connecting these factors to the outcome?"

### Step 2: Define Baseline ("Absent" State)

What values do factors take when "not in the coalition"?

**Standard choice:** Forecast/baseline values

**Document:**
```
Baseline: All factors at forecast values
- Factor A: [baseline_A]
- Factor B: [baseline_B]
- Factor C: [baseline_C]
```

### Step 3: Compute Coalition Values

For n factors, compute 2ⁿ combinations.

**Example for 3 factors (V, A, S):**

| Coalition | Factors at Actual | Factors at Baseline | Value v(S) |
|-----------|-------------------|---------------------|------------|
| ∅ | none | V, A, S | [baseline outcome] |
| V | V | A, S | [outcome] |
| A | A | V, S | [outcome] |
| V,A | V, A | S | [outcome] |
| S | S | V, A | [outcome] |
| V,S | V, S | A | [outcome] |
| A,S | A, S | V | [outcome] |
| V,A,S | V, A, S | none | [actual outcome] |

**Using the tool:**
```bash
bun run ~/.claude/skills/ShapleyDecomposition/Tools/ShapleyCompute.ts \
  --factors "V,A,S" \
  --baseline "[v_base],[a_base],[s_base]" \
  --actual "[v_actual],[a_actual],[s_actual]" \
  --model "wfm_fte"
```

### Step 4: Apply Shapley Formula

For n=3:
```
φ_V = ⅓[v(V)-v(∅)] + ⅙[v(V,A)-v(A)] + ⅙[v(V,S)-v(S)] + ⅓[v(V,A,S)-v(A,S)]
φ_A = ⅓[v(A)-v(∅)] + ⅙[v(V,A)-v(V)] + ⅙[v(A,S)-v(S)] + ⅓[v(V,A,S)-v(V,S)]
φ_S = ⅓[v(S)-v(∅)] + ⅙[v(V,S)-v(V)] + ⅙[v(A,S)-v(A)] + ⅓[v(V,A,S)-v(V,A)]
```

### Step 5: Verify and Interpret

**Verification:** φ_V + φ_A + φ_S = Total Variance

**Interpretation:**
- Which factor contributed most?
- Are contributions aligned with expectations?
- Any surprising findings?

---

## Output Format

```markdown
## Shapley Variance Decomposition

**Model:** [formula]
**Period:** [if applicable]
**Total Variance:** [value] [units]

### Factor Contributions

| Factor | Attribution | % of Total | Direction |
|--------|-------------|------------|-----------|
| [name] | [value]     | [%]        | [+/-]     |

**Verification:** Sum = [total] ✓

### Interpretation

[1-2 sentences explaining what drove the variance]

### Coalition Values (Detail)

| Coalition | Value |
|-----------|-------|
| ∅ | [v] |
| ... | ... |
```

---

## Example: WFM Staffing Variance

**Given:**
- Forecast: Volume=1000, AHT=300s, Shrinkage=30%
- Actual: Volume=1100, AHT=330s, Shrinkage=35%
- Fixed: WorkHours=480min, Occupancy=85%
- Model: FTE = (Volume × AHT) / (WorkHours × Occ × (1-Shrink))

**Coalition Values:**

| Coalition | Volume | AHT | Shrink | FTE |
|-----------|--------|-----|--------|-----|
| ∅ | 1000 | 300 | 0.30 | 105.04 |
| V | 1100 | 300 | 0.30 | 115.55 |
| A | 1000 | 330 | 0.30 | 115.55 |
| V,A | 1100 | 330 | 0.30 | 127.10 |
| S | 1000 | 300 | 0.35 | 113.12 |
| V,S | 1100 | 300 | 0.35 | 124.43 |
| A,S | 1000 | 330 | 0.35 | 124.43 |
| V,A,S | 1100 | 330 | 0.35 | 136.87 |

**Shapley Computation:**

```
Total Variance = 136.87 - 105.04 = 31.83 FTE

φ_V = ⅓(10.51) + ⅙(11.55) + ⅙(11.31) + ⅓(12.44) = 11.47 FTE
φ_A = ⅓(10.51) + ⅙(11.55) + ⅙(11.31) + ⅓(12.44) = 11.47 FTE
φ_S = ⅓(8.08) + ⅙(8.88) + ⅙(8.88) + ⅓(9.77) = 8.89 FTE

Verification: 11.47 + 11.47 + 8.89 = 31.83 ✓
```

**Result:**

| Factor | Attribution | % of Total |
|--------|-------------|------------|
| Volume (+10%) | +11.47 FTE | 36.0% |
| AHT (+10%) | +11.47 FTE | 36.0% |
| Shrinkage (+5pp) | +8.89 FTE | 27.9% |

**Interpretation:** Volume and AHT contributed equally (both +10%), together explaining 72% of the variance. Shrinkage increase from 30% to 35% added another 28%.

---

## Tips

1. **Symmetry check:** If two factors changed by the same percentage in a multiplicative model, their Shapley values should be equal.

2. **Direction check:** A factor that increased should typically have a positive contribution (and vice versa), though interactions can create exceptions.

3. **Reasonable magnitudes:** If one factor dominates unexpectedly, verify the model and values.

4. **Grouped factors:** If factors are naturally grouped (e.g., polynomial terms), consider Owen value for consistency.
