# Factor Mapping

Classification guide for mapping operational factors to outcome domains.

---

## Quick Reference Table

| Factor | Primary | Secondary | Notes |
|--------|---------|-----------|-------|
| Average Handle Time | COST | CX, EX | Direction depends on cause |
| After Call Work | COST | EX | Rushed ACW → rework |
| Service Level | CX | COST, EX | Staffing/pressure tradeoffs |
| Occupancy | COST | EX | Threshold at ~85% |
| First Contact Resolution | CX | COST | Strong multiplier effect |
| Transfer Rate | CX | COST | Efficiency/resolution tension |
| Quality Score | CX | EX | Recognition/stress effects |
| CSAT/NPS | CX | — | Lagging indicator |
| Turnover | EX | COST, CX | Cascading effects |
| Absenteeism | EX | COST | Leading indicator of turnover |
| Schedule Adherence | COST | EX | Flexibility tradeoff |
| Training Investment | EX | CX, COST | Long-term payoff |
| Coaching Hours | EX | CX | Development/productivity tension |
| Overtime Hours | COST | EX | Mandatory vs voluntary matters |
| Shrinkage | COST | EX | Some shrinkage is healthy |
| Channel Mix | COST | CX | Digital deflection effects |

---

## Detailed Factor Classifications

### Staffing & Capacity Factors

| Factor | Primary | Rationale |
|--------|---------|-----------|
| FTE Count | COST | Direct labor cost driver |
| Overtime % | COST (primary), EX (secondary) | Cost vs burden tradeoff |
| Vendor/BPO Mix | COST | Cost arbitrage |
| Skill Routing Efficiency | COST | Utilization optimization |
| Schedule Optimization | COST (primary), EX (secondary) | Efficiency vs preference |
| Forecasting Accuracy | COST | Over/understaffing cost |
| Attrition Backfill Time | COST | Productivity gap cost |

### Process & Technology Factors

| Factor | Primary | Rationale |
|--------|---------|-----------|
| IVR Containment | COST | Self-service deflection |
| Desktop Tool Efficiency | COST (primary), EX (secondary) | Time savings + frustration |
| Knowledge Base Quality | CX (primary), EX (secondary) | Resolution + confidence |
| Authentication Time | COST | Non-value time |
| System Downtime | CX (primary), COST (secondary) | Service disruption |
| Automation Rate | COST | Labor substitution |
| Process Complexity | EX (primary), COST (secondary) | Agent burden |

### Quality & Performance Factors

| Factor | Primary | Rationale |
|--------|---------|-----------|
| QA Score | CX | Service quality proxy |
| Compliance Rate | CX | Risk/regulatory |
| Error Rate | CX (primary), COST (secondary) | Rework driver |
| Coaching Effectiveness | EX (primary), CX (secondary) | Development outcome |
| Performance Distribution | EX | Equity/fairness |
| Recognition Frequency | EX | Engagement driver |

### Customer-Facing Factors

| Factor | Primary | Rationale |
|--------|---------|-----------|
| Wait Time (ASA) | CX | Direct experience impact |
| Abandonment Rate | CX | Failed service |
| Callback Rate | CX (primary), COST (secondary) | Resolution failure |
| Survey Response Rate | CX | Measurement quality |
| Complaint Rate | CX | Dissatisfaction indicator |
| Channel Availability | CX | Access/convenience |

### People & Culture Factors

| Factor | Primary | Rationale |
|--------|---------|-----------|
| Manager Span of Control | EX (primary), COST (secondary) | Support vs efficiency |
| Career Path Clarity | EX | Retention driver |
| Pay Competitiveness | EX (primary), COST (secondary) | Attraction/retention |
| Work Environment | EX | Wellbeing |
| Team Stability | EX | Relationship continuity |
| Leadership Quality | EX | Engagement multiplier |

---

## Classification Decision Tree

When classifying a new factor:

```
1. Does it directly affect customer experience during interaction?
   → Yes: Primary = CX
   → No: Continue

2. Does it directly affect operational cost or efficiency?
   → Yes: Primary = COST
   → No: Continue

3. Does it directly affect agent satisfaction, wellbeing, or retention?
   → Yes: Primary = EX
   → No: Mixed/Context-dependent

4. Identify secondary effects:
   - Does it create queue/wait time effects? → Secondary CX
   - Does it affect staffing requirements? → Secondary COST
   - Does it create stress or pressure? → Secondary EX
```

---

## Context-Dependent Classifications

Some factors require context to classify:

### Average Handle Time (AHT)

| Context | Classification |
|---------|----------------|
| AHT reduced via efficiency tools | COST (positive for all) |
| AHT reduced via agent pressure | COST (negative for CX/EX) |
| AHT increased via thorough service | CX (positive, COST negative) |

### Occupancy

| Context | Classification |
|---------|----------------|
| Occupancy 75-85% | COST (healthy range) |
| Occupancy >90% | EX (burnout risk) |
| Occupancy <70% | COST (inefficiency) |

### Training Time

| Context | Classification |
|---------|----------------|
| Initial training investment | EX (development) |
| Ongoing skill development | EX (career growth) |
| Cross-training for flexibility | COST (utilization) |
| Compliance/mandatory training | COST (requirement) |

---

## Multi-Factor Interactions

When multiple factors change together, consider:

### Synergistic Effects

| Combination | Effect |
|-------------|--------|
| FCR↑ + AHT neutral | Strong CX gain, moderate COST reduction |
| Quality↑ + Engagement↑ | Multiplicative CX/EX benefits |
| Turnover↓ + Training↑ | Compounding capability gains |

### Antagonistic Effects

| Combination | Effect |
|-------------|--------|
| AHT↓ + Quality targets | Conflicting pressures on agents |
| SL targets + Cost reduction | Understaffing spiral risk |
| Occupancy↑ + Engagement targets | Impossible to optimize both |

### Tradeoff Indicators

Watch for these patterns suggesting unsustainable optimization:

- COST improving while EX declining → future turnover risk
- CX improving while COST flat → potential measurement artifact
- All three improving → either genuine improvement or data issues
