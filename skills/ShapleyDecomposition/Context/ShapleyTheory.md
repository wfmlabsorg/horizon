# Shapley Value Theory for Variance Decomposition

**Synthesized from:**
- Shorrocks (2013) — Framework for decomposition as cooperative game
- Grömping (2007) — Statistical properties, R² decomposition, LMG method
- Huettner & Sunder (2012) — Axiomatic foundation, Owen value for grouped factors

---

## 1. The Decomposition Problem

### General Setup

Given an outcome Y determined by m factors X₁, X₂, ..., Xₘ:

```
Y = f(X₁, X₂, ..., Xₘ)
```

**The Problem:** Assign contributions Cₖ to each factor such that:
- Contributions sum to total: ΣCₖ = Total Effect
- Attribution is "fair" by some reasonable definition

### Why Naive Methods Fail

**Sequential elimination** (remove factors one at a time) gives different answers depending on order:

Example: Revenue = Price × Quantity
- Price: $10 → $12 (+20%)
- Quantity: 100 → 90 (-10%)
- Revenue: $1000 → $1080 (+$80)

**Order 1:** Price first, then Quantity
- Price effect: $12×100 - $10×100 = +$200
- Quantity effect: $12×90 - $12×100 = -$120
- Total: +$80 ✓

**Order 2:** Quantity first, then Price
- Quantity effect: $10×90 - $10×100 = -$100
- Price effect: $12×90 - $10×90 = +$180
- Total: +$80 ✓

**Problem:** Same total, but different factor attributions!

---

## 2. The Shapley Solution

### Core Idea

Remedy path dependence by **averaging over all possible orderings**.

### Mathematical Definition

For factors F = {1, 2, ..., n}, define:
- v(S) = value/outcome when only factors in S are at "actual" (others at "baseline")
- v(∅) = 0 (baseline value)
- v(F) = total variance/effect

The **Shapley value** for factor i:

```
φᵢ = Σ     [|S|!(n-|S|-1)!/n!] × [v(S∪{i}) - v(S)]
    S⊆F\{i}
```

**Interpretation:** Expected marginal contribution of factor i, averaged over all possible orderings in which factors could "join the coalition."

### Weights for n Factors

The weight for a coalition of size |S| is:

```
w(|S|, n) = |S|!(n-|S|-1)!/n!
```

For n=3 factors, the weights are:
- |S|=0: 1/3 (factor enters first)
- |S|=1: 1/6 (factor enters second)
- |S|=2: 1/3 (factor enters third)

### Explicit Formulas for Small n

**n=2 factors (A, B):**
```
φ_A = ½[v(A) - v(∅)] + ½[v(A,B) - v(B)]
φ_B = ½[v(B) - v(∅)] + ½[v(A,B) - v(A)]
```

**n=3 factors (V, A, S):**
```
φ_V = ⅓[v(V)-v(∅)] + ⅙[v(V,A)-v(A)] + ⅙[v(V,S)-v(S)] + ⅓[v(V,A,S)-v(A,S)]
φ_A = ⅓[v(A)-v(∅)] + ⅙[v(V,A)-v(V)] + ⅙[v(A,S)-v(S)] + ⅓[v(V,A,S)-v(V,S)]
φ_S = ⅓[v(S)-v(∅)] + ⅙[v(V,S)-v(V)] + ⅙[v(A,S)-v(A)] + ⅓[v(V,A,S)-v(V,A)]
```

---

## 3. Axiomatic Foundation

### Why Shapley is Unique (Young 1985)

The Shapley value is the **only** decomposition rule satisfying:

**Axiom 1: Efficiency**
```
Σφᵢ = v(F) - v(∅)
```
Contributions sum exactly to total effect.

**Axiom 2: Symmetry (Equal Treatment)**
If factors i and j contribute equally in all coalitions:
```
v(S∪{i}) = v(S∪{j}) for all S ⊆ F\{i,j}
```
Then φᵢ = φⱼ.

**Axiom 3: Null Player**
If factor i contributes nothing in any coalition:
```
v(S∪{i}) = v(S) for all S
```
Then φᵢ = 0.

**Axiom 4: Monotonicity**
If factor i's marginal contributions increase, its Shapley value cannot decrease.

### Theorem (Young 1985)
*The Shapley value is the unique decomposition satisfying Efficiency, Symmetry, Null Player, and Monotonicity.*

---

## 4. The Owen Value for Grouped Factors

### When to Use Owen Value

When factors are **exogenously grouped** (e.g., polynomial terms, dummy variables, conceptually related factors), use the **Owen value** for consistency.

### Calculation

Two-stage approach:
1. **Between groups:** Apply Shapley to groups (treating each group as a single player)
2. **Within groups:** Distribute group's share among members using Shapley

### Formal Definition

Let G = {G₁, G₂, ..., Gᵧ} be a partition of factors.

**Admissible orderings:** Only permutations where group members appear consecutively.

```
|Θ(K,G)| = γ! × Π|Gₛ|!
```

**Owen value:**
```
Owᵢ(f,G) = (1/|Θ(K,G)|) × Σ MC(xᵢ, θ)
                          θ∈Θ(K,G)
```

### Key Property: Consistency

If you replace a group with a single "super-factor" having the same contribution, that super-factor receives the same value as the original group's total.

---

## 5. R² Decomposition (LMG Method)

### The Problem

In regression Y = β₀ + β₁X₁ + ... + βₚXₚ + ε, how should R² be allocated among regressors?

### LMG (Lindeman-Merenda-Gold) = Shapley

The LMG method is **identical** to Shapley decomposition applied to explained variance:

```
LMG(Xⱼ) = (1/p!) Σ svar({j}|S)
              S⊆{1,...,p}\{j}
```

where svar({j}|S) = R²(S∪{j}) - R²(S)

### Properties

| Property | LMG/Shapley |
|----------|-------------|
| Proper decomposition | ✓ (sums to R²) |
| Non-negativity | ✓ (always ≥ 0) |
| Exclusion (β=0 → share=0) | ✗ (may be nonzero if correlated) |
| Inclusion (β≠0 → share≠0) | ✓ |

### Alternative: PMVD

The **Proportional Marginal Variance Decomposition** uses data-dependent weights to guarantee exclusion. Trade-off: higher variability, more computation.

**Recommendation:** Use LMG/Shapley unless exclusion property is essential.

---

## 6. Defining "Absent" (Counterfactual Baseline)

### Critical Decision

The Shapley value requires specifying what v(S) means—what happens when factors outside S are "absent."

### Common Approaches

| Approach | v(S) Definition | Use Case |
|----------|-----------------|----------|
| **Baseline/Forecast** | Factors not in S take forecast values | Variance from forecast |
| **Zero** | Factors not in S = 0 | Additive models |
| **Mean** | Factors not in S = population mean | Regression R² |
| **Reference Period** | Factors not in S = prior period values | Period comparison |

### For Multiplicative Models (WFM)

**Recommended:** Use forecast/baseline values for "absent" factors.

Example: FTE = (Volume × AHT) / (WorkHours × Occ × (1-Shrink))

- v(∅) = FTE with all factors at forecast = Forecast FTE
- v(Volume) = FTE with Volume at actual, others at forecast
- v(Volume, AHT) = FTE with Volume and AHT at actual, others at forecast
- v(V, A, S) = Actual FTE

Total variance = v(V,A,S) - v(∅) = Actual - Forecast

---

## 7. Computational Complexity

### Exact Computation

For n factors, need 2ⁿ coalition values.

| n | Coalitions | Practical? |
|---|------------|------------|
| 2 | 4 | Trivial |
| 3 | 8 | Easy |
| 4 | 16 | Easy |
| 5 | 32 | Easy |
| 6 | 64 | Moderate |
| 10 | 1024 | Feasible |
| 20 | ~1M | Needs sampling |

### Approximation Methods

For large n, use **Monte Carlo sampling** of permutations:
1. Sample random orderings
2. Compute marginal contributions in each
3. Average

Convergence is typically fast (a few thousand samples).

---

## 8. Interpretation Guidelines

### What Shapley Values Tell You

- **Magnitude:** How much each factor contributed to the total effect
- **Sign:** Direction of contribution (positive = increased outcome)
- **Proportion:** Relative importance among factors

### What They Don't Tell You

- **Causality:** Shapley is about attribution, not causal inference
- **Counterfactual actions:** "What if we had changed X" requires causal model
- **Optimal intervention:** Largest contributor may not be easiest to change

### Communication Tips

1. Always state the model/formula being decomposed
2. Specify the baseline (what "absent" means)
3. Show that contributions sum to total (verification)
4. Avoid over-interpreting small differences (consider bootstrap CIs)

---

## 9. Common Applications

### Finance
- Revenue variance: Price × Quantity
- Margin variance: (Price - Cost) × Quantity
- Portfolio returns: Weighted sum of asset returns

### WFM/Operations
- Staffing variance: (Volume × AHT) / (Hours × Occ × (1-Shrink))
- Service level drivers: Volume, AHT, staffing, occupancy
- Cost variance: FTE × Rate × Hours

### Marketing
- Conversion funnel: Impressions × CTR × CVR × AOV
- Channel attribution: Multi-touch attribution
- Campaign ROI decomposition

### Manufacturing
- Yield decomposition: f(temperature, pressure, time, materials)
- Quality variance: Multiple process parameters
- Throughput analysis

---

## References

1. Shapley, L.S. (1953). A value for n-person games. *Contributions to the Theory of Games* II.
2. Shorrocks, A.F. (2013). Decomposition procedures for distributional analysis. *J. Economic Inequality* 11, 99–126.
3. Grömping, U. (2007). Estimators of relative importance in linear regression. *American Statistician* 61, 139–147.
4. Huettner, F. & Sunder, M. (2012). Axiomatic arguments for decomposing goodness of fit. *Electronic J. Statistics* 6, 1239–1250.
5. Owen, G. (1977). Values of games with a priori unions. *Essays in Mathematical Economics*.
6. Young, H.P. (1985). Monotonic solutions of cooperative games. *Int. J. Game Theory* 14, 65–72.
