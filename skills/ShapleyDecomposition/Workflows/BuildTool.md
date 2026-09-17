# BuildTool Workflow

## Purpose

Generate reusable analysis tools (Excel templates, Python scripts, SQL queries) for ongoing Shapley decomposition analysis.

---

## When to Use

- "Create an Excel template for variance analysis"
- "Build a tool I can use monthly"
- "Automate this decomposition"
- "Generate a reusable spreadsheet"

---

## Input

User provides:
1. **Model/Formula** - The decomposition model
2. **Factor names** - Variables to decompose
3. **Tool type** - Excel, Python, SQL, or custom
4. **Use case** - How the tool will be used (monthly, ad-hoc, etc.)

---

## Process

### Step 1: Confirm Model and Factors

Document the exact formula and factor definitions:

```markdown
**Model:** [formula]
**Factors:** [list with descriptions]
**Baseline definition:** [how "absent" is defined]
```

### Step 2: Select Tool Type

| Type | Best For | Output |
|------|----------|--------|
| **Excel** | Non-technical users, one-off analysis | `.xlsx` with formulas |
| **Python** | Automation, large datasets | `.py` script |
| **SQL** | Database integration | SQL query |
| **TypeScript** | Integration with other tools | `.ts` module |

### Step 3: Generate Tool

#### Excel Template

**Structure:**
```
Sheet 1: "Inputs"
- Baseline values (editable)
- Actual values (editable)
- Fixed parameters

Sheet 2: "Coalitions"
- All 2^n coalition combinations
- Formulas computing v(S) for each

Sheet 3: "Shapley"
- Weight matrix
- Marginal contributions
- Final Shapley values

Sheet 4: "Summary"
- Results table
- Verification check
- Interpretation guidance
```

**Formulas for n=3:**
```excel
# In Coalitions sheet
v_empty = Model(baseline_all)
v_A = Model(actual_A, baseline_B, baseline_C)
v_B = Model(baseline_A, actual_B, baseline_C)
...

# In Shapley sheet
phi_A = (1/3)*(v_A - v_empty) + (1/6)*(v_AB - v_B) + (1/6)*(v_AC - v_C) + (1/3)*(v_ABC - v_BC)
```

#### Python Script

```python
#!/usr/bin/env python3
"""
Shapley Decomposition Tool
Model: [formula]
Factors: [list]
"""

import itertools
from typing import Callable, Dict, List
import math

def shapley_weight(coalition_size: int, total_factors: int) -> float:
    n = total_factors
    s = coalition_size
    return math.factorial(s) * math.factorial(n - s - 1) / math.factorial(n)

def shapley_decompose(
    model_func: Callable,
    baseline: List[float],
    actual: List[float],
    factor_names: List[str]
) -> Dict[str, float]:
    n = len(factor_names)

    # Build coalition values
    coalitions = {}
    for r in range(n + 1):
        for combo in itertools.combinations(range(n), r):
            values = [actual[i] if i in combo else baseline[i] for i in range(n)]
            key = tuple(sorted(combo))
            coalitions[key] = model_func(values)

    # Compute Shapley values
    shapley = {}
    for i in range(n):
        others = [j for j in range(n) if j != i]
        phi = 0
        for r in range(n):
            for combo in itertools.combinations(others, r):
                S = set(combo)
                S_with_i = tuple(sorted(list(S) + [i]))
                S_tuple = tuple(sorted(S)) if S else ()

                weight = shapley_weight(len(S), n)
                marginal = coalitions[S_with_i] - coalitions[S_tuple]
                phi += weight * marginal

        shapley[factor_names[i]] = phi

    return shapley

# Model-specific function
def model(values: List[float]) -> float:
    # TODO: Customize for your model
    # Example: FTE = (V * AHT) / (Hours * Occ * (1 - Shrink))
    return values[0] * values[1]  # Placeholder

if __name__ == "__main__":
    baseline = [1000, 300, 0.30]  # TODO: Set baseline values
    actual = [1100, 330, 0.35]    # TODO: Set actual values
    factors = ["Volume", "AHT", "Shrinkage"]

    result = shapley_decompose(model, baseline, actual, factors)

    total = sum(result.values())
    print(f"Total Variance: {total:.2f}")
    print("\nShapley Decomposition:")
    for factor, value in result.items():
        pct = (value / total) * 100 if total != 0 else 0
        print(f"  {factor}: {value:.2f} ({pct:.1f}%)")
```

### Step 4: Add Documentation

Include in the tool:
- Model description
- Input/output specifications
- Example usage
- Interpretation guidance

### Step 5: Test with Example

Run the tool with known values to verify correctness.

---

## Output

Deliver:
1. **Tool file** (Excel/Python/etc.)
2. **README** with usage instructions
3. **Example** demonstrating correct operation

---

## Excel Template Structure (Detailed)

### Sheet: Inputs

| Cell | Label | Value | Notes |
|------|-------|-------|-------|
| B2 | Factor 1 Baseline | [editable] | |
| B3 | Factor 2 Baseline | [editable] | |
| B4 | Factor 3 Baseline | [editable] | |
| D2 | Factor 1 Actual | [editable] | |
| D3 | Factor 2 Actual | [editable] | |
| D4 | Factor 3 Actual | [editable] | |

### Sheet: Coalitions

| Coalition | F1 | F2 | F3 | v(S) |
|-----------|----|----|-----|------|
| ∅ | =B2 | =B3 | =B4 | =MODEL(...) |
| {1} | =D2 | =B3 | =B4 | =MODEL(...) |
| {2} | =B2 | =D3 | =B4 | =MODEL(...) |
| ... | | | | |

### Sheet: Shapley

| Factor | φ Formula | Value | % |
|--------|-----------|-------|---|
| F1 | =(1/3)*(v1-v0)+... | [calc] | [calc] |
| F2 | =(1/3)*(v2-v0)+... | [calc] | [calc] |
| F3 | =(1/3)*(v3-v0)+... | [calc] | [calc] |
| **Total** | | =SUM(...) | 100% |
| **Check** | | =v_full - v_empty | |

### Sheet: Summary

Visual presentation of results with:
- Bar chart of contributions
- Interpretation text
- Timestamp and parameters

---

## Tips

1. **Color coding:** Use conditional formatting to highlight positive (green) and negative (red) contributions.

2. **Data validation:** Add dropdowns or input validation to prevent errors.

3. **Flexibility:** Design for easy modification of factors (add/remove).

4. **Documentation:** Include a "Help" sheet explaining the methodology.
