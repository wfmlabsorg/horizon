# Ishikawa Category Frameworks

Reference for cause categorization in fishbone diagrams.

---

## Standard 6M Framework

The classic manufacturing-origin framework applicable to most operational problems.

| Category | Also Known As | Focus Areas |
|----------|---------------|-------------|
| **Manpower** | People, Personnel | Skills, training, experience, staffing levels, motivation, communication |
| **Machine** | Equipment, Technology | Hardware, software, tools, capacity, reliability, maintenance |
| **Method** | Process, Procedures | Workflows, instructions, standards, policies, controls |
| **Material** | Inputs, Supplies | Raw materials, data quality, information inputs, consumables |
| **Measurement** | Metrics, Data | Accuracy, precision, frequency, calibration, reporting |
| **Mother Nature** | Environment | Physical conditions, external factors, market conditions |

### When to Use 6M
- Manufacturing or operational problems
- General-purpose root cause analysis
- When uncertain which framework fits

---

## Contact Center Adaptation (6P Framework)

Optimized for contact center operations with more relevant categories.

| Category | Focus Areas | Example Causes |
|----------|-------------|----------------|
| **People** | Agent capabilities | Tenure mix, training gaps, skill routing errors, engagement, absenteeism, attrition |
| **Technology** | Systems & tools | ACD issues, CRM latency, CTI failures, desktop performance, integration errors |
| **Process** | Workflows | Script gaps, escalation confusion, transfer loops, disposition errors, auth procedures |
| **Information** | Knowledge & data | KB staleness, search failures, data quality, documentation gaps, reporting lag |
| **Management** | Leadership & planning | Scheduling errors, coaching gaps, policy conflicts, incentive misalignment, staffing decisions |
| **Environment** | Work context | Facility noise, remote work setup, ergonomics, interruptions, shift timing |

### When to Use 6P
- Contact center performance issues (AHT, FCR, CSAT, etc.)
- Agent behavior or productivity problems
- Customer experience gaps

---

## Service Industry Adaptation (4Ps)

Simplified framework for service quality problems.

| Category | Focus Areas |
|----------|-------------|
| **People** | Staff, customers, stakeholders |
| **Process** | Service delivery, workflows, policies |
| **Product** | Service offering, features, pricing |
| **Place** | Channels, locations, access points |

### When to Use 4Ps
- Customer-facing service issues
- Marketing and product problems
- Channel strategy questions

---

## Healthcare Adaptation (5Ms + E)

Modified for healthcare settings.

| Category | Focus Areas |
|----------|-------------|
| **Man** | Clinicians, staff, patients |
| **Machine** | Medical devices, IT systems |
| **Method** | Clinical protocols, procedures |
| **Material** | Medications, supplies, samples |
| **Measurement** | Diagnostics, monitoring, documentation |
| **Environment** | Facilities, infection control, lighting |

---

## Software/IT Adaptation (6Cs)

For technology and software development problems.

| Category | Focus Areas |
|----------|-------------|
| **Code** | Source code, bugs, technical debt |
| **Configuration** | Settings, parameters, deployments |
| **Capacity** | Performance, scaling, resources |
| **Connectivity** | Network, integrations, APIs |
| **Change** | Releases, updates, migrations |
| **Competency** | Skills, training, documentation |

---

## Selecting the Right Framework

```
Problem Type                          Recommended Framework
─────────────────────────────────────────────────────────────
Contact center operations      →      6P (Contact Center)
Manufacturing/production       →      6M (Standard)
General service quality        →      4Ps (Service)
Healthcare operations          →      5Ms + E (Healthcare)
Software/IT issues             →      6Cs (Software)
Unknown/hybrid                 →      6M (Standard)
```

---

## Category Deep Dive: Contact Center

### People
**Subcategories:**
- Agent Skills: Product knowledge, soft skills, technical skills
- Training: Initial, ongoing, product updates, system training
- Workforce: Tenure distribution, attrition patterns, engagement scores
- Supervision: Coaching quality, span of control, availability

**Common Causes:**
- High attrition reducing average tenure
- Training not updated for new products
- Skill routing mismatch
- Burnout from workload imbalance

### Technology
**Subcategories:**
- Telephony: ACD, IVR, CTI, call recording
- Applications: CRM, ticketing, KB, order systems
- Desktop: Performance, reliability, ergonomics
- Integrations: APIs, data flows, synchronization

**Common Causes:**
- CRM latency during peak hours
- CTI pop-up failures
- Knowledge base search relevance
- Screen real estate limitations

### Process
**Subcategories:**
- Call Handling: Scripts, authentication, wrap-up
- Escalation: Tiers, warm transfer, callback
- Quality: Monitoring, calibration, feedback
- Exceptions: Overrides, adjustments, credits

**Common Causes:**
- Escalation criteria unclear
- Script missing common scenarios
- Disposition codes inconsistent
- Authentication too lengthy

### Information
**Subcategories:**
- Knowledge Base: Content, search, updates
- Reporting: Accuracy, timeliness, accessibility
- Data Quality: CRM records, customer history
- Documentation: SOPs, job aids, reference materials

**Common Causes:**
- KB articles outdated
- Search returning irrelevant results
- Customer history incomplete
- No single source of truth

### Management
**Subcategories:**
- Staffing: Hiring, scheduling, WFM
- Performance: Goals, incentives, consequences
- Policy: Rules, exceptions, authority
- Leadership: Coaching, communication, decisions

**Common Causes:**
- Incentives misaligned (AHT vs FCR)
- Understaffed during peak intervals
- Policy inconsistently applied
- Insufficient coaching time

### Environment
**Subcategories:**
- Physical: Noise, lighting, temperature, ergonomics
- Remote Work: Home setup, connectivity, isolation
- Schedule: Shift timing, breaks, overtime
- Culture: Team dynamics, engagement, recognition

**Common Causes:**
- Background noise (home/office)
- Inadequate home office setup
- Split shifts causing fatigue
- Lack of peer interaction (remote)

---

## Tips for Effective Brainstorming

1. **Don't stop at first answer** - Push for 3-5 potential causes per category
2. **Include "no problem" categories** - Documenting ruled-out areas adds credibility
3. **Distinguish symptoms vs causes** - "High AHT" is often a symptom, not a cause
4. **Cross-reference categories** - Many root causes span multiple categories
5. **Use data prompts** - "What does the data show about [category]?"
