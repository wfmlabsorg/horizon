# Explain Workflow

## Purpose

Teach the Shapley decomposition methodology using the user's specific domain and examples.

---

## When to Use

- "Explain Shapley decomposition"
- "How does this attribution method work?"
- "Teach me variance decomposition"
- "Why is this better than sequential analysis?"

---

## Process

### Step 1: Identify Domain Context

Ask: "What domain are you working in?" (if not obvious)

Common domains:
- **WFM/Operations:** Staffing, service levels, costs
- **Finance:** Revenue, margin, P&L
- **Marketing:** Attribution, conversion funnels
- **Manufacturing:** Yield, quality, throughput
- **Statistics:** Regression R², factor importance

### Step 2: Start with the Problem

**The Attribution Problem:**

When an outcome depends on multiple factors, and those factors change simultaneously, how do we fairly assign responsibility for the total change?

**Example (Price × Quantity):**
```
Price:    $10 → $12  (+20%)
Quantity: 100 → 90   (-10%)
Revenue:  $1,000 → $1,080  (+$80)

Question: How much did Price contribute? How much did Quantity?
```

### Step 3: Show Why Naive Methods Fail

**Sequential Attribution (Order Matters!):**

**Order 1: Price first, then Quantity**
```
Step 1: Change Price only
  $12 × 100 = $1,200
  Price contribution = $1,200 - $1,000 = +$200

Step 2: Then change Quantity
  $12 × 90 = $1,080
  Quantity contribution = $1,080 - $1,200 = -$120

Total: +$200 - $120 = +$80 ✓
```

**Order 2: Quantity first, then Price**
```
Step 1: Change Quantity only
  $10 × 90 = $900
  Quantity contribution = $900 - $1,000 = -$100

Step 2: Then change Price
  $12 × 90 = $1,080
  Price contribution = $1,080 - $900 = +$180

Total: -$100 + $180 = +$80 ✓
```

**Problem:** Total is correct, but attributions differ!
- Price: $200 vs $180
- Quantity: -$120 vs -$100

**Which is "right"?** Neither—the order is arbitrary.

### Step 4: Introduce the Shapley Solution

**The Insight:** Average over ALL possible orderings.

For 2 factors, there are 2! = 2 orderings:
- Price first, Quantity second
- Quantity first, Price second

**Shapley Value = Average Marginal Contribution**

```
Price Shapley Value = (200 + 180) / 2 = $190
Quantity Shapley Value = (-120 + -100) / 2 = -$110

Total: $190 - $110 = $80 ✓
```

**Properties:**
1. **Sums exactly to total** (no residual)
2. **Symmetric** (treats factors fairly)
3. **Unique** (only method with these properties)

### Step 5: Generalize the Formula

**For n factors:**

The Shapley value for factor i is:
```
φᵢ = Σ [weight(|S|)] × [v(S∪{i}) - v(S)]
```

Where:
- S = any subset of factors not including i
- v(S) = outcome when factors in S are at "actual", others at "baseline"
- weight = |S|!(n-|S|-1)!/n!

**In words:** Average the marginal contribution of factor i across all possible "entry orders."

### Step 6: Walk Through Domain-Specific Example

**[Use the user's actual domain and numbers]**

For WFM example:
```
Model: FTE = (Volume × AHT) / (WorkHours × Occupancy × (1-Shrinkage))

Given:
- Volume: 1000 → 1100 (+10%)
- AHT: 300s → 330s (+10%)
- Shrinkage: 30% → 35% (+5pp)
- Fixed: WorkHours=480min, Occ=85%

Forecast FTE: 105.04
Actual FTE: 136.87
Variance: +31.83 FTE

Question: How much did each factor contribute?
```

Then compute the full decomposition.

### Step 7: Address Common Questions

**Q: Why not just use percentage changes?**
A: Percentage changes don't account for interaction effects. A 10% volume increase has different FTE impact depending on where AHT and shrinkage are.

**Q: What if factors are correlated?**
A: Shapley handles this through the averaging. Correlated factors will "share" their joint contribution fairly.

**Q: Is this the same as sensitivity analysis?**
A: No. Sensitivity analysis asks "what if we changed X by 1%?" Shapley asks "given that X, Y, Z all changed, how much did each contribute?"

**Q: When shouldn't I use Shapley?**
A: When you need causal inference (Shapley is attribution, not causation), or when the model structure is unknown.

---

## Output Format

```markdown
## Understanding Shapley Decomposition

### The Problem
[Explain the attribution challenge in their domain]

### Why Simple Methods Fail
[Show order-dependence with their numbers]

### The Shapley Solution
[Walk through the averaging approach]

### Your Example
[Full decomposition with their data]

### Key Takeaways
1. [Takeaway 1]
2. [Takeaway 2]
3. [Takeaway 3]

### Further Reading
- Shorrocks (2013) - Decomposition procedures
- Context/ShapleyTheory.md - Full theory
```

---

## Visual Aids

**Diagram: Coalition Lattice (n=3)**
```
                    {A,B,C}
                   /   |   \
              {A,B}  {A,C}  {B,C}
               / \   / \   / \
             {A}   {B}   {C}
               \    |    /
                    ∅
```

Each path from ∅ to {A,B,C} is an ordering. Shapley averages across all paths.

**Table: Weights for n=3**
| Coalition Size | Count | Weight per coalition | Total weight |
|----------------|-------|---------------------|--------------|
| 0 (enters 1st) | 1 | 1/3 | 1/3 |
| 1 (enters 2nd) | 2 | 1/6 | 1/3 |
| 2 (enters 3rd) | 1 | 1/3 | 1/3 |
