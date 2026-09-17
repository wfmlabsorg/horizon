# Control Chart Constants Reference

Standard constants for Shewhart control charts based on subgroup size (n).

## X-bar and R Chart Constants

| n | A2 | D3 | D4 | d2 |
|---|-----|-----|-----|-----|
| 2 | 1.880 | 0.000 | 3.267 | 1.128 |
| 3 | 1.023 | 0.000 | 2.574 | 1.693 |
| 4 | 0.729 | 0.000 | 2.282 | 2.059 |
| 5 | 0.577 | 0.000 | 2.114 | 2.326 |
| 6 | 0.483 | 0.000 | 2.004 | 2.534 |
| 7 | 0.419 | 0.076 | 1.924 | 2.704 |
| 8 | 0.373 | 0.136 | 1.864 | 2.847 |
| 9 | 0.337 | 0.184 | 1.816 | 2.970 |
| 10 | 0.308 | 0.223 | 1.777 | 3.078 |

**Usage:**
- UCL(X-bar) = X̿ + A2 × R̄
- LCL(X-bar) = X̿ - A2 × R̄
- UCL(R) = D4 × R̄
- LCL(R) = D3 × R̄
- σ estimate = R̄ / d2

## X-bar and S Chart Constants

| n | A3 | B3 | B4 | c4 |
|---|-----|-----|-----|------|
| 2 | 2.659 | 0.000 | 3.267 | 0.7979 |
| 3 | 1.954 | 0.000 | 2.568 | 0.8862 |
| 4 | 1.628 | 0.000 | 2.266 | 0.9213 |
| 5 | 1.427 | 0.000 | 2.089 | 0.9400 |
| 6 | 1.287 | 0.030 | 1.970 | 0.9515 |
| 7 | 1.182 | 0.118 | 1.882 | 0.9594 |
| 8 | 1.099 | 0.185 | 1.815 | 0.9650 |
| 9 | 1.032 | 0.239 | 1.761 | 0.9693 |
| 10 | 0.975 | 0.284 | 1.716 | 0.9727 |
| 15 | 0.789 | 0.428 | 1.572 | 0.9823 |
| 20 | 0.680 | 0.510 | 1.490 | 0.9869 |
| 25 | 0.606 | 0.565 | 1.435 | 0.9896 |

**Usage:**
- UCL(X-bar) = X̿ + A3 × S̄
- LCL(X-bar) = X̿ - A3 × S̄
- UCL(S) = B4 × S̄
- LCL(S) = B3 × S̄
- σ estimate = S̄ / c4

## Individuals Chart Constants

For I-MR charts (subgroup size = 1), use n=2 constants for moving range:

| Constant | Value | Usage |
|----------|-------|-------|
| E2 | 2.660 | UCL(X) = X̄ + E2 × MR̄ |
| d2 | 1.128 | σ = MR̄ / d2 |
| D3 | 0.000 | LCL(MR) = D3 × MR̄ |
| D4 | 3.267 | UCL(MR) = D4 × MR̄ |

**Alternative calculation:**
- UCL(X) = X̄ + 3 × (MR̄ / d2)
- LCL(X) = X̄ - 3 × (MR̄ / d2)

## Control Limit Formulas Summary

### Variables Charts

| Chart | Center Line | UCL | LCL |
|-------|-------------|-----|-----|
| I | X̄ | X̄ + 3σ̂ | X̄ - 3σ̂ |
| MR | MR̄ | D4 × MR̄ | D3 × MR̄ |
| X-bar (R) | X̿ | X̿ + A2R̄ | X̿ - A2R̄ |
| R | R̄ | D4R̄ | D3R̄ |
| X-bar (S) | X̿ | X̿ + A3S̄ | X̿ - A3S̄ |
| S | S̄ | B4S̄ | B3S̄ |

### Attribute Charts

| Chart | Center Line | UCL | LCL |
|-------|-------------|-----|-----|
| p | p̄ | p̄ + 3√(p̄(1-p̄)/n) | p̄ - 3√(p̄(1-p̄)/n) |
| np | np̄ | np̄ + 3√(np̄(1-p̄)) | np̄ - 3√(np̄(1-p̄)) |
| c | c̄ | c̄ + 3√c̄ | c̄ - 3√c̄ |
| u | ū | ū + 3√(ū/n) | ū - 3√(ū/n) |

## Notes

1. **D3 = 0** for n < 7 means the lower control limit for R charts is zero
2. **B3 = 0** for n < 6 means the lower control limit for S charts is zero
3. These constants assume normally distributed data
4. For non-normal data, consider transformation or non-parametric alternatives
