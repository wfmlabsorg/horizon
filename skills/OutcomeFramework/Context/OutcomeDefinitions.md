# Outcome Definitions

Complete taxonomy of contact center outcomes organized by the three domains.

---

## CX — Customer Experience

**Definition:** Outcomes that directly affect customer satisfaction, loyalty, and perceived service quality.

### Service Quality Metrics

| Metric | Definition | Direction | Unit |
|--------|------------|-----------|------|
| **Service Level (SL)** | % of calls answered within threshold | Higher = Better | % |
| **Average Speed of Answer (ASA)** | Mean wait time before agent connection | Lower = Better | seconds |
| **Abandon Rate** | % of callers who hang up before connection | Lower = Better | % |
| **First Contact Resolution (FCR)** | % of issues resolved on first contact | Higher = Better | % |

### Customer Satisfaction Metrics

| Metric | Definition | Direction | Unit |
|--------|------------|-----------|------|
| **CSAT** | Customer satisfaction survey score | Higher = Better | 1-5 or % |
| **NPS** | Net Promoter Score | Higher = Better | -100 to +100 |
| **CES** | Customer Effort Score | Lower = Better | 1-7 scale |
| **Quality Score** | Agent interaction quality rating | Higher = Better | % |

### Resolution Metrics

| Metric | Definition | Direction | Unit |
|--------|------------|-----------|------|
| **Transfer Rate** | % of calls requiring transfer | Lower = Better | % |
| **Escalation Rate** | % of calls escalated to supervisor | Lower = Better | % |
| **Callback Rate** | % of customers calling back within X days | Lower = Better | % |
| **Error Rate** | % of interactions with errors | Lower = Better | % |

---

## COST — Financial Outcomes

**Definition:** Outcomes affecting operational costs, efficiency, and financial performance.

### Efficiency Metrics

| Metric | Definition | Direction | Unit |
|--------|------------|-----------|------|
| **Average Handle Time (AHT)** | Mean duration of customer interaction | Context-dependent | seconds |
| **After Call Work (ACW)** | Time spent on post-call tasks | Lower = Better | seconds |
| **Cost per Contact** | Total cost divided by contact volume | Lower = Better | $ |
| **Contacts per Hour** | Agent productivity measure | Higher = Better | count |

### Utilization Metrics

| Metric | Definition | Direction | Unit |
|--------|------------|-----------|------|
| **Occupancy** | % of time agents are handling contacts | Optimal range | % |
| **Utilization** | % of paid time in productive work | Higher = Better | % |
| **Shrinkage** | % of time agents unavailable | Lower = Better | % |
| **Schedule Adherence** | % of time following assigned schedule | Higher = Better | % |

### Capacity Metrics

| Metric | Definition | Direction | Unit |
|--------|------------|-----------|------|
| **FTE Required** | Full-time equivalents needed | Lower = Better | headcount |
| **Overtime %** | Percentage of overtime hours | Lower = Better | % |
| **Undertime %** | Percentage of unproductive paid time | Lower = Better | % |
| **Channel Deflection** | % of contacts moved to lower-cost channels | Higher = Better | % |

---

## EX — Employee Experience

**Definition:** Outcomes affecting agent satisfaction, wellbeing, retention, and development.

### Retention Metrics

| Metric | Definition | Direction | Unit |
|--------|------------|-----------|------|
| **Turnover Rate** | % of agents leaving per period | Lower = Better | % annually |
| **Tenure** | Average length of employment | Higher = Better | months |
| **90-Day Attrition** | % leaving within first 90 days | Lower = Better | % |
| **Internal Promotion Rate** | % promoted from within | Higher = Better | % |

### Engagement Metrics

| Metric | Definition | Direction | Unit |
|--------|------------|-----------|------|
| **eNPS** | Employee Net Promoter Score | Higher = Better | -100 to +100 |
| **Engagement Score** | Survey-based engagement index | Higher = Better | % |
| **Absenteeism** | Unplanned absence rate | Lower = Better | % |
| **Voluntary OT Participation** | Agents choosing extra shifts | Higher = Better | % |

### Development Metrics

| Metric | Definition | Direction | Unit |
|--------|------------|-----------|------|
| **Training Hours** | Investment in agent development | Context-dependent | hours |
| **Time to Proficiency** | Days to reach performance targets | Lower = Better | days |
| **Skill Breadth** | Number of skills per agent | Higher = Better | count |
| **Coaching Hours** | 1:1 development time | Context-dependent | hours/agent |

### Wellbeing Metrics

| Metric | Definition | Direction | Unit |
|--------|------------|-----------|------|
| **Schedule Satisfaction** | Agent preference vs actual schedule | Higher = Better | % |
| **Overtime Burden** | Mandatory overtime hours | Lower = Better | hours |
| **Break Compliance** | Agents receiving required breaks | Higher = Better | % |
| **Stress Indicators** | Composite wellbeing measure | Lower = Better | index |

---

## Metric Interrelationships

### Primary-Secondary Mappings

Most metrics have a **primary** outcome domain and **secondary** effects on others:

| Metric | Primary | Secondary Effects |
|--------|---------|-------------------|
| AHT | COST | CX (via queue time), EX (via pressure) |
| FCR | CX | COST (via repeat calls), EX (via complexity) |
| Occupancy | COST | EX (via burnout at high levels) |
| Turnover | EX | COST (via hiring/training), CX (via inexperience) |
| Service Level | CX | COST (via staffing), EX (via pressure) |
| Quality Score | CX | EX (via recognition), COST (via rework) |

---

## Measurement Validity

### Strong Measures (High Validity)

- AHT, ASA, Abandon Rate (objective, system-captured)
- FTE, Cost per Contact (calculated from reliable data)
- Turnover (HR records)

### Moderate Measures (Moderate Validity)

- FCR (definition-dependent)
- CSAT, NPS (survey-based, sample issues)
- Occupancy (depends on AUX code accuracy)

### Weak Measures (Low Validity)

- Quality scores (subjective evaluation)
- eNPS (low response rates typical)
- Coaching effectiveness (hard to attribute)

Always acknowledge measurement limitations when using weak measures in analysis.
