# Outcome Relationships

Causal hypotheses and theoretical relationships between outcome domains.

---

## The Outcome Triangle Dynamics

```
         CX
        /  \
       /    \
    (+)      (+)
     /        \
    /    (-)   \
 COST ←-------→ EX
```

### Default Relationships

| Path | Direction | Mechanism |
|------|-----------|-----------|
| CX → COST | Usually Negative | Better CX often requires more resources |
| CX → EX | Usually Positive | Happy customers = less agent stress |
| COST → EX | Usually Negative | Cost cutting often increases EX burden |
| EX → CX | Usually Positive | Engaged agents deliver better service |
| EX → COST | Usually Negative | Better EX requires investment |
| COST → CX | Usually Negative | Cost cutting often degrades service |

**Key Insight:** The triangle creates inherent tensions. Optimizing one domain often comes at the expense of another.

---

## Causal Hypotheses by Intervention

### H1: Reducing Average Handle Time (AHT)

```
AHT↓ → COST↓ (direct: fewer FTEs needed)
AHT↓ → CX? (depends on HOW reduced)
  - If via efficiency: CX neutral or positive
  - If via rushing: CX negative (lower quality, repeat calls)
AHT↓ → EX? (depends on implementation)
  - If via tools: EX positive (easier work)
  - If via pressure: EX negative (stress, burnout)
```

**Testable predictions:**
- AHT reduction via process improvement → neutral/positive CX
- AHT reduction via agent pressure → negative CX within 3-6 months
- AHT reduction via automation → positive EX if well-implemented

### H2: Increasing First Contact Resolution (FCR)

```
FCR↑ → CX↑ (direct: customer satisfaction)
FCR↑ → COST↓ (fewer repeat contacts)
FCR↑ → EX? (depends on how achieved)
  - If via empowerment: EX positive
  - If via scope expansion: EX negative (complexity)
```

**Testable predictions:**
- FCR improvement → 1.5-2x multiplier on CSAT
- Each 1% FCR improvement → 1-2% reduction in contact volume
- FCR targets without resources → EX decline

### H3: Reducing Turnover

```
Turnover↓ → EX↑ (direct: stability, tenure)
Turnover↓ → COST↓ (hiring/training savings)
Turnover↓ → CX↑ (experienced agents)
```

**Testable predictions:**
- Each 1% turnover reduction → $3-5K savings per FTE annually
- Tenure >12 months → 15-25% higher quality scores
- High turnover teams → lower FCR, higher AHT

### H4: Improving Service Level

```
SL↑ → CX↑ (direct: shorter wait times)
SL↑ → COST↑ (more FTEs required)
SL↑ → EX? (depends on method)
  - If via better forecasting: EX neutral
  - If via mandatory OT: EX negative
```

**Testable predictions:**
- SL improvement from 70% to 80% (20s) → ~20% FTE increase
- Mandatory OT for SL → turnover increase within 6 months
- SL stability → better scheduling predictability → EX positive

### H5: Increasing Occupancy

```
Occupancy↑ → COST↓ (efficiency gains)
Occupancy↑ → EX↓ (burnout risk above 85%)
Occupancy↑ → CX? (threshold effects)
  - Below 85%: likely CX neutral
  - Above 85%: CX decline (rushed, fatigued agents)
```

**Optimal occupancy range:** 80-85%

**Testable predictions:**
- Occupancy >90% sustained → turnover spike in 6-12 months
- Occupancy >90% → quality score decline
- Occupancy 75-85% → optimal balance

---

## Feedback Loops

### Positive Feedback Loops (Virtuous Cycles)

**The Service-Quality Spiral**
```
Good Service → Happy Customers → Easier Calls → Lower Stress
       ↑                                            ↓
       └────── Better Performance ←───── Happy Agents
```

**The Retention-Experience Spiral**
```
Low Turnover → Experienced Team → Better Quality → Customer Satisfaction
      ↑                                                    ↓
      └────── Agent Pride/Engagement ←──── Recognition ←───┘
```

### Negative Feedback Loops (Death Spirals)

**The Understaffing Spiral**
```
Understaffing → High Occupancy → Burnout → Turnover
      ↑                                       ↓
      └─── More Understaffing ←───────────────┘
```

**The Quality Spiral**
```
Pressure to cut AHT → Rushed Calls → Repeat Contacts → More Volume
         ↑                                               ↓
         └────────── More Pressure ←─────────────────────┘
```

---

## Quantified Relationships (Reference)

Based on industry research and typical contact center data:

| Relationship | Typical Magnitude | Confidence |
|--------------|-------------------|------------|
| 1% FCR↑ → CSAT +0.5-1.0 pts | Medium-High | High |
| 1% Turnover↓ → Quality +0.3% | Low-Medium | Medium |
| 10% AHT↓ → Cost -7-8% | High | High |
| 10% SL↑ → FTE +8-12% | High | High |
| Occupancy >90% → Turnover +15-30% | Medium-High | Medium |
| eNPS +10 pts → Turnover -5-10% | Low-Medium | Low |

**Note:** These are reference values. Actual relationships should be estimated from client data using ShapleyDecomposition or CausalInference skills.

---

## Confounding Factors

When analyzing outcome relationships, control for:

| Factor | Confounds |
|--------|-----------|
| **Seasonality** | Volume, SL, Occupancy, Turnover |
| **Tenure Mix** | Quality, AHT, Turnover interpretation |
| **Product Complexity** | AHT, FCR, Quality |
| **Call Type Mix** | AHT, FCR, CSAT |
| **Market Conditions** | Turnover (job market effects) |
| **Management Changes** | EX metrics broadly |

Always ask: "What else changed?" before attributing causation.

---

## Application Guidelines

### When Building DAGs

1. Start with the outcome you're trying to explain
2. Identify direct factors (one hop away)
3. Map second-order effects through the triangle
4. Check for feedback loops
5. Identify confounders

### When Recommending Interventions

1. Map primary impact on target outcome
2. Trace secondary effects on other two domains
3. Identify potential negative consequences
4. Quantify tradeoffs where possible
5. Recommend monitoring for unintended effects

### When Interpreting Results

1. Distinguish correlation from causation
2. Consider time lags (EX effects often delayed)
3. Account for measurement validity
4. Look for threshold effects
5. Check for feedback loop evidence
