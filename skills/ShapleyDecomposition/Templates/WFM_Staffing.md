# WFM Staffing Variance Template

## Model

```
FTE = (Volume × AHT) / (WorkHours × Occupancy × (1 - Shrinkage))
```

**Variables:**
- **Volume:** Call/contact volume
- **AHT:** Average Handle Time (in same units as WorkHours)
- **WorkHours:** Productive hours per FTE per period
- **Occupancy:** Target occupancy (typically 0.80-0.90)
- **Shrinkage:** Non-productive time fraction (typically 0.25-0.40)

## Typical Decomposition Setup

**Fixed (planning assumptions):**
- WorkHours = 8 hours × 60 min = 480 min/day (or adjust for period)
- Occupancy = 0.85 (or your target)

**Variable (actual vs forecast):**
- Volume
- AHT
- Shrinkage

## Baseline Definition

**v(∅)** = FTE with all factors at **forecast** values

```
v(∅) = (Forecast_Volume × Forecast_AHT) / (WorkHours × Occ × (1 - Forecast_Shrink))
```

## Coalition Values (3 factors)

| Coalition | Volume | AHT | Shrinkage | Formula |
|-----------|--------|-----|-----------|---------|
| ∅ | Fcst | Fcst | Fcst | Baseline FTE |
| V | **Act** | Fcst | Fcst | Volume only at actual |
| A | Fcst | **Act** | Fcst | AHT only at actual |
| V,A | **Act** | **Act** | Fcst | Volume and AHT at actual |
| S | Fcst | Fcst | **Act** | Shrinkage only at actual |
| V,S | **Act** | Fcst | **Act** | Volume and Shrinkage at actual |
| A,S | Fcst | **Act** | **Act** | AHT and Shrinkage at actual |
| V,A,S | **Act** | **Act** | **Act** | All at actual = Actual FTE |

## Shapley Formulas

```
φ_V = ⅓[v(V) - v(∅)] + ⅙[v(V,A) - v(A)] + ⅙[v(V,S) - v(S)] + ⅓[v(V,A,S) - v(A,S)]

φ_A = ⅓[v(A) - v(∅)] + ⅙[v(V,A) - v(V)] + ⅙[v(A,S) - v(S)] + ⅓[v(V,A,S) - v(V,S)]

φ_S = ⅓[v(S) - v(∅)] + ⅙[v(V,S) - v(V)] + ⅙[v(A,S) - v(A)] + ⅓[v(V,A,S) - v(V,A)]
```

## Example Calculation

**Inputs:**
| Parameter | Forecast | Actual | % Change |
|-----------|----------|--------|----------|
| Volume | 1000 | 1100 | +10% |
| AHT (sec) | 300 | 330 | +10% |
| Shrinkage | 0.30 | 0.35 | +16.7% |
| WorkHours | 480 min | 480 min | Fixed |
| Occupancy | 0.85 | 0.85 | Fixed |

**Coalition Values:**

```
Denominator = 480 × 0.85 × (1 - Shrink) = 408 × (1 - Shrink)

v(∅)     = (1000 × 300) / (408 × 0.70) = 300,000 / 285.60 = 105.04
v(V)     = (1100 × 300) / (408 × 0.70) = 330,000 / 285.60 = 115.55
v(A)     = (1000 × 330) / (408 × 0.70) = 330,000 / 285.60 = 115.55
v(V,A)   = (1100 × 330) / (408 × 0.70) = 363,000 / 285.60 = 127.10
v(S)     = (1000 × 300) / (408 × 0.65) = 300,000 / 265.20 = 113.12
v(V,S)   = (1100 × 300) / (408 × 0.65) = 330,000 / 265.20 = 124.43
v(A,S)   = (1000 × 330) / (408 × 0.65) = 330,000 / 265.20 = 124.43
v(V,A,S) = (1100 × 330) / (408 × 0.65) = 363,000 / 265.20 = 136.87
```

**Shapley Calculation:**

```
φ_V = ⅓(115.55 - 105.04) + ⅙(127.10 - 115.55) + ⅙(124.43 - 113.12) + ⅓(136.87 - 124.43)
    = ⅓(10.51) + ⅙(11.55) + ⅙(11.31) + ⅓(12.44)
    = 3.50 + 1.93 + 1.89 + 4.15
    = 11.47 FTE

φ_A = ⅓(115.55 - 105.04) + ⅙(127.10 - 115.55) + ⅙(124.43 - 113.12) + ⅓(136.87 - 124.43)
    = ⅓(10.51) + ⅙(11.55) + ⅙(11.31) + ⅓(12.44)
    = 11.47 FTE

φ_S = ⅓(113.12 - 105.04) + ⅙(124.43 - 115.55) + ⅙(124.43 - 115.55) + ⅓(136.87 - 127.10)
    = ⅓(8.08) + ⅙(8.88) + ⅙(8.88) + ⅓(9.77)
    = 2.69 + 1.48 + 1.48 + 3.26
    = 8.91 FTE
```

**Verification:**
```
Total = φ_V + φ_A + φ_S = 11.47 + 11.47 + 8.91 = 31.85 FTE
Expected = v(V,A,S) - v(∅) = 136.87 - 105.04 = 31.83 FTE
✓ (small rounding difference)
```

## Result Summary

| Factor | Attribution | % of Total | Direction |
|--------|-------------|------------|-----------|
| Volume (+10%) | +11.47 FTE | 36.0% | + |
| AHT (+10%) | +11.47 FTE | 36.0% | + |
| Shrinkage (+5pp) | +8.91 FTE | 28.0% | + |
| **Total** | **+31.85 FTE** | **100%** | |

## Interpretation

Volume and AHT each changed by the same percentage (+10%) and contributed equally to the variance (36% each). This symmetry is expected in multiplicative models when percentage changes are equal.

Shrinkage increased from 30% to 35% (a 5 percentage point increase, or 16.7% relative increase), contributing 28% of the total variance. While the percentage change in shrinkage was larger, its Shapley contribution is smaller because shrinkage appears in the denominator and its effect is moderated by the other factors.

## CLI Command

```bash
bun run ~/.claude/skills/ShapleyDecomposition/Tools/ShapleyCompute.ts \
  --factors "Volume,AHT,Shrinkage" \
  --values "105.04,115.55,115.55,127.10,113.12,124.43,124.43,136.87"
```

Or with model:
```bash
# Note: Requires custom model function for WFM with fixed parameters
```
