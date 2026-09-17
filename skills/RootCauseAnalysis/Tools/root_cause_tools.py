#!/usr/bin/env python3
"""
Root Cause Analysis Tools

Provides functions for:
- Pareto analysis with vital few identification
- Ishikawa/fishbone diagram generation (Mermaid)
- 5 Why worksheet generation
- FMEA template with RPN calculation
- Multi-criteria cause prioritization

Usage:
    from root_cause_tools import pareto_analysis, generate_ishikawa_mermaid
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass


# =============================================================================
# PARETO ANALYSIS
# =============================================================================

@dataclass
class ParetoResult:
    """Result of Pareto analysis."""
    pareto_table: pd.DataFrame
    vital_few: List[str]
    vital_few_pct: float
    useful_many: List[str]
    total_impact: float


def pareto_analysis(
    df: pd.DataFrame,
    cause_col: str,
    impact_col: str,
    threshold: float = 0.80
) -> ParetoResult:
    """
    Perform Pareto analysis to identify vital few causes.

    Args:
        df: DataFrame with cause and impact data
        cause_col: Column name for cause/category
        impact_col: Column name for impact metric
        threshold: Cumulative percentage threshold for "vital few" (default 0.80)

    Returns:
        ParetoResult with sorted table, vital few list, and statistics

    Example:
        >>> df = pd.DataFrame({
        ...     'cause': ['A', 'B', 'C', 'D', 'E'],
        ...     'impact': [100, 80, 50, 30, 20]
        ... })
        >>> result = pareto_analysis(df, 'cause', 'impact')
        >>> print(result.vital_few)
        ['A', 'B', 'C']
    """
    # Aggregate if duplicates exist
    agg_df = df.groupby(cause_col)[impact_col].sum().reset_index()

    # Sort by impact descending
    agg_df = agg_df.sort_values(impact_col, ascending=False).reset_index(drop=True)

    # Calculate percentages
    total = agg_df[impact_col].sum()
    agg_df['pct'] = agg_df[impact_col] / total
    agg_df['cumulative_pct'] = agg_df['pct'].cumsum()

    # Add rank
    agg_df['rank'] = range(1, len(agg_df) + 1)

    # Identify vital few (those needed to reach threshold)
    vital_few_mask = agg_df['cumulative_pct'].shift(1, fill_value=0) < threshold
    vital_few = agg_df.loc[vital_few_mask, cause_col].tolist()
    vital_few_pct = agg_df.loc[vital_few_mask, 'cumulative_pct'].iloc[-1] if len(vital_few) > 0 else 0

    # Useful many are the rest
    useful_many = agg_df.loc[~vital_few_mask, cause_col].tolist()

    # Reorder columns for output
    output_df = agg_df[['rank', cause_col, impact_col, 'pct', 'cumulative_pct']].copy()
    output_df.columns = ['Rank', 'Cause', 'Impact', '%', 'Cumulative %']

    return ParetoResult(
        pareto_table=output_df,
        vital_few=vital_few,
        vital_few_pct=vital_few_pct,
        useful_many=useful_many,
        total_impact=total
    )


def format_pareto_table(result: ParetoResult) -> str:
    """Format Pareto result as markdown table."""
    lines = ["| Rank | Cause | Impact | % | Cumulative % |",
             "|------|-------|--------|---|--------------|"]

    for _, row in result.pareto_table.iterrows():
        lines.append(
            f"| {int(row['Rank'])} | {row['Cause']} | {row['Impact']:,.0f} | "
            f"{row['%']:.1%} | {row['Cumulative %']:.1%} |"
        )

    return "\n".join(lines)


# =============================================================================
# ISHIKAWA DIAGRAM GENERATION
# =============================================================================

def generate_ishikawa_mermaid(
    problem: str,
    categories: Dict[str, List[str]],
    style: str = "flowchart"
) -> str:
    """
    Generate Mermaid code for Ishikawa (fishbone) diagram.

    Args:
        problem: The problem statement (head of fish)
        categories: Dict mapping category names to list of causes
        style: "flowchart" (default) or "mindmap"

    Returns:
        Mermaid diagram code as string

    Example:
        >>> categories = {
        ...     "People": ["Training gaps", "High turnover"],
        ...     "Process": ["Unclear procedures", "No escalation path"]
        ... }
        >>> mermaid = generate_ishikawa_mermaid("Low FCR", categories)
    """
    if style == "mindmap":
        return _ishikawa_mindmap(problem, categories)
    else:
        return _ishikawa_flowchart(problem, categories)


def _ishikawa_flowchart(problem: str, categories: Dict[str, List[str]]) -> str:
    """Generate flowchart-style fishbone diagram."""
    lines = ["flowchart LR"]

    # Problem node (head)
    problem_escaped = problem.replace('"', "'")
    lines.append(f'    subgraph Problem')
    lines.append(f'        P["{problem_escaped}"]')
    lines.append(f'    end')
    lines.append("")

    # Category subgraphs
    for i, (category, causes) in enumerate(categories.items()):
        cat_id = f"C{i}"
        lines.append(f'    subgraph {category}')
        for j, cause in enumerate(causes):
            cause_escaped = cause.replace('"', "'")
            lines.append(f'        {cat_id}_{j}["{cause_escaped}"]')
        lines.append(f'    end')
        lines.append("")

    # Connect categories to problem
    for i, category in enumerate(categories.keys()):
        lines.append(f'    {category} --> P')

    return "\n".join(lines)


def _ishikawa_mindmap(problem: str, categories: Dict[str, List[str]]) -> str:
    """Generate mindmap-style fishbone diagram."""
    lines = ["mindmap"]
    lines.append(f'  root(("{problem}"))')

    for category, causes in categories.items():
        lines.append(f'    {category}')
        for cause in causes:
            # Escape special characters
            cause_escaped = cause.replace("(", "[").replace(")", "]")
            lines.append(f'      {cause_escaped}')

    return "\n".join(lines)


def get_ishikawa_categories(framework: str = "6P") -> Dict[str, List[str]]:
    """
    Get standard Ishikawa category framework with example subcategories.

    Args:
        framework: "6M" (manufacturing), "6P" (contact center), "4P" (service)

    Returns:
        Dict with category names and example focus areas
    """
    frameworks = {
        "6M": {
            "Manpower": ["Skills", "Training", "Experience", "Staffing"],
            "Machine": ["Hardware", "Software", "Tools", "Maintenance"],
            "Method": ["Procedures", "Standards", "Workflows", "Controls"],
            "Material": ["Inputs", "Data quality", "Supplies", "Information"],
            "Measurement": ["Metrics", "Calibration", "Reporting", "Accuracy"],
            "Mother Nature": ["Environment", "External factors", "Conditions"]
        },
        "6P": {
            "People": ["Agent skills", "Training", "Tenure", "Engagement"],
            "Technology": ["ACD", "CRM", "CTI", "Desktop", "Integrations"],
            "Process": ["Scripts", "Escalation", "QA", "Workflows"],
            "Information": ["Knowledge base", "Data quality", "Documentation"],
            "Management": ["Scheduling", "Coaching", "Policies", "Staffing"],
            "Environment": ["Facilities", "Remote setup", "Noise", "Ergonomics"]
        },
        "4P": {
            "People": ["Staff", "Customers", "Stakeholders"],
            "Process": ["Service delivery", "Workflows", "Policies"],
            "Product": ["Offering", "Features", "Pricing"],
            "Place": ["Channels", "Locations", "Access"]
        }
    }

    return frameworks.get(framework, frameworks["6P"])


# =============================================================================
# 5 WHY TEMPLATE
# =============================================================================

@dataclass
class FiveWhyLevel:
    """Single level in 5 Why analysis."""
    level: int
    question: str
    answer: str
    evidence: str
    status: str  # "validated", "assumed", "needs_validation"


def five_why_template(problem: str) -> str:
    """
    Generate a 5 Why worksheet template.

    Args:
        problem: The initial problem statement

    Returns:
        Markdown template for 5 Why analysis
    """
    template = f"""## 5 Why Analysis: {problem}

### Problem Definition
**What happened:** {problem}
**When:** [Date/period]
**Impact:** [Quantified impact]
**Outcome domain:** [CX/COST/EX]

### Causal Chain

| Level | Question | Answer | Evidence |
|-------|----------|--------|----------|
| Problem | What happened? | {problem} | [Data source] |
| Why 1 | Why {problem.lower()}? | [Answer] | [Data source or "NEEDS VALIDATION"] |
| Why 2 | Why [answer 1]? | [Answer] | [Data source or "NEEDS VALIDATION"] |
| Why 3 | Why [answer 2]? | [Answer] | [Data source or "NEEDS VALIDATION"] |
| Why 4 | Why [answer 3]? | [Answer] | [Data source or "NEEDS VALIDATION"] |
| Why 5 | Why [answer 4]? | **[ROOT CAUSE]** | [Data source or "NEEDS VALIDATION"] |

### "Therefore" Verification
[Read chain backwards: Root cause → therefore → Why 4 answer → therefore → ... → Problem]

### Validation Checklist

- [ ] Does addressing root cause prevent recurrence?
- [ ] Is root cause within our control?
- [ ] Do we have evidence supporting each "because"?
- [ ] Have we validated with data (StatisticalAnalysis)?
- [ ] Have we confirmed causation (CausalInference)?

---

⚠️ **HYPOTHESIS NOTE:** This causal chain represents a hypothesis. Each link should be validated with data before implementing countermeasures.
"""
    return template


def validate_five_why_chain(chain: List[FiveWhyLevel]) -> Tuple[bool, List[str]]:
    """
    Validate a 5 Why chain for completeness and logic.

    Args:
        chain: List of FiveWhyLevel objects

    Returns:
        Tuple of (is_valid, list_of_issues)
    """
    issues = []

    if len(chain) < 3:
        issues.append("Chain too short - typically need at least 3-5 levels")

    if len(chain) > 7:
        issues.append("Chain very long - may indicate circular reasoning or scope creep")

    # Check for empty answers
    for level in chain:
        if not level.answer or level.answer.strip() == "":
            issues.append(f"Level {level.level} has empty answer")

    # Check evidence status
    unvalidated = [l for l in chain if l.status == "needs_validation"]
    if len(unvalidated) > len(chain) / 2:
        issues.append(f"{len(unvalidated)} of {len(chain)} levels need validation")

    return len(issues) == 0, issues


# =============================================================================
# FMEA (FAILURE MODE AND EFFECTS ANALYSIS)
# =============================================================================

@dataclass
class FMEARow:
    """Single row in FMEA analysis."""
    step: str
    failure_mode: str
    effect: str
    severity: int  # 1-10
    cause: str
    occurrence: int  # 1-10
    current_control: str
    detection: int  # 1-10

    @property
    def rpn(self) -> int:
        """Calculate Risk Priority Number."""
        return self.severity * self.occurrence * self.detection

    @property
    def priority(self) -> str:
        """Determine priority level based on RPN."""
        if self.rpn > 200:
            return "Critical"
        elif self.rpn > 100:
            return "High"
        elif self.rpn > 50:
            return "Medium"
        else:
            return "Low"


def fmea_template(process_steps: List[str]) -> pd.DataFrame:
    """
    Generate an FMEA worksheet template.

    Args:
        process_steps: List of process step names

    Returns:
        DataFrame with FMEA columns ready for completion
    """
    columns = [
        'Step', 'Failure Mode', 'Effect', 'Severity (S)',
        'Cause', 'Occurrence (O)', 'Current Control', 'Detection (D)',
        'RPN', 'Priority'
    ]

    rows = []
    for step in process_steps:
        rows.append({
            'Step': step,
            'Failure Mode': '[Describe how step could fail]',
            'Effect': '[What happens if it fails]',
            'Severity (S)': 5,
            'Cause': '[Why it might fail]',
            'Occurrence (O)': 5,
            'Current Control': '[Existing mitigation]',
            'Detection (D)': 5,
            'RPN': 125,  # Default 5*5*5
            'Priority': 'High'
        })

    return pd.DataFrame(rows, columns=columns)


def calculate_fmea_rpn(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate RPN and priority for FMEA DataFrame.

    Args:
        df: DataFrame with Severity, Occurrence, Detection columns

    Returns:
        DataFrame with RPN and Priority columns added/updated
    """
    df = df.copy()

    # Handle various column name formats
    s_col = next((c for c in df.columns if 'sever' in c.lower() or c == 'S'), None)
    o_col = next((c for c in df.columns if 'occur' in c.lower() or c == 'O'), None)
    d_col = next((c for c in df.columns if 'detect' in c.lower() or c == 'D'), None)

    if not all([s_col, o_col, d_col]):
        raise ValueError("DataFrame must have Severity, Occurrence, and Detection columns")

    # Calculate RPN
    df['RPN'] = df[s_col] * df[o_col] * df[d_col]

    # Assign priority
    def get_priority(rpn):
        if rpn > 200:
            return "Critical"
        elif rpn > 100:
            return "High"
        elif rpn > 50:
            return "Medium"
        else:
            return "Low"

    df['Priority'] = df['RPN'].apply(get_priority)

    return df


def prioritize_fmea(df: pd.DataFrame, threshold: int = 100) -> pd.DataFrame:
    """
    Filter and sort FMEA by RPN threshold.

    Args:
        df: FMEA DataFrame with RPN calculated
        threshold: Minimum RPN to include (default 100)

    Returns:
        Filtered DataFrame sorted by RPN descending
    """
    filtered = df[df['RPN'] >= threshold].copy()
    return filtered.sort_values('RPN', ascending=False)


def format_fmea_table(df: pd.DataFrame) -> str:
    """Format FMEA DataFrame as markdown table."""
    lines = ["| # | Step | Failure Mode | Effect | S | Cause | O | Control | D | RPN | Priority |",
             "|---|------|--------------|--------|---|-------|---|---------|---|-----|----------|"]

    for i, row in df.iterrows():
        lines.append(
            f"| {i+1} | {row['Step']} | {row['Failure Mode']} | {row['Effect']} | "
            f"{row.get('Severity (S)', row.get('S', '-'))} | {row['Cause']} | "
            f"{row.get('Occurrence (O)', row.get('O', '-'))} | {row['Current Control']} | "
            f"{row.get('Detection (D)', row.get('D', '-'))} | {row['RPN']} | {row['Priority']} |"
        )

    return "\n".join(lines)


# =============================================================================
# MULTI-CRITERIA CAUSE PRIORITIZATION
# =============================================================================

def prioritize_causes(
    causes: List[str],
    criteria: Dict[str, Dict[str, float]],
    weights: Optional[Dict[str, float]] = None
) -> pd.DataFrame:
    """
    Multi-criteria prioritization of causes.

    Args:
        causes: List of cause names
        criteria: Dict of {criterion: {cause: score}} where scores are 0-1
        weights: Optional weights for each criterion (default equal)

    Returns:
        DataFrame with causes ranked by weighted score

    Example:
        >>> causes = ["Training gaps", "System issues", "Process unclear"]
        >>> criteria = {
        ...     "impact": {"Training gaps": 0.8, "System issues": 0.6, "Process unclear": 0.7},
        ...     "controllability": {"Training gaps": 0.9, "System issues": 0.4, "Process unclear": 0.8},
        ...     "evidence_available": {"Training gaps": 0.7, "System issues": 0.9, "Process unclear": 0.5}
        ... }
        >>> result = prioritize_causes(causes, criteria)
    """
    # Default equal weights
    if weights is None:
        weights = {c: 1.0 / len(criteria) for c in criteria.keys()}

    # Normalize weights
    total_weight = sum(weights.values())
    weights = {k: v / total_weight for k, v in weights.items()}

    # Build score matrix
    rows = []
    for cause in causes:
        row = {'Cause': cause}
        weighted_sum = 0

        for criterion, scores in criteria.items():
            score = scores.get(cause, 0)
            row[criterion] = score
            weighted_sum += score * weights[criterion]

        row['Weighted Score'] = weighted_sum
        rows.append(row)

    df = pd.DataFrame(rows)
    df = df.sort_values('Weighted Score', ascending=False).reset_index(drop=True)
    df['Rank'] = range(1, len(df) + 1)

    # Reorder columns
    cols = ['Rank', 'Cause'] + list(criteria.keys()) + ['Weighted Score']
    df = df[cols]

    return df


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def hypothesis_warning() -> str:
    """Return standard hypothesis warning message."""
    return """⚠️ **HYPOTHESIS NOTE:** These are potential causes to investigate, not validated root causes. Test with StatisticalAnalysis, confirm causation with CausalInference before implementing countermeasures."""


def outcome_link_template(cause: str) -> str:
    """Generate outcome linkage template for a cause."""
    return f"""### Outcome Linkage: {cause}

| Outcome | Impact | Mechanism |
|---------|--------|-----------|
| CX | [Impact description] | [How cause affects CX] |
| COST | [Impact description] | [How cause affects COST] |
| EX | [Impact description] | [How cause affects EX] |
"""


# =============================================================================
# MAIN (CLI USAGE)
# =============================================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Root Cause Analysis Tools")
    subparsers = parser.add_subparsers(dest="command")

    # Pareto subcommand
    pareto_parser = subparsers.add_parser("pareto", help="Run Pareto analysis")
    pareto_parser.add_argument("--input", "-i", required=True, help="Input CSV file")
    pareto_parser.add_argument("--cause-col", required=True, help="Cause column name")
    pareto_parser.add_argument("--impact-col", required=True, help="Impact column name")
    pareto_parser.add_argument("--threshold", type=float, default=0.80, help="Vital few threshold")

    # 5 Why subcommand
    why_parser = subparsers.add_parser("5why", help="Generate 5 Why template")
    why_parser.add_argument("--problem", "-p", required=True, help="Problem statement")

    # FMEA subcommand
    fmea_parser = subparsers.add_parser("fmea", help="Generate FMEA template")
    fmea_parser.add_argument("--steps", "-s", nargs="+", required=True, help="Process steps")

    # Ishikawa subcommand
    ishi_parser = subparsers.add_parser("ishikawa", help="Generate Ishikawa categories")
    ishi_parser.add_argument("--framework", "-f", default="6P", choices=["6M", "6P", "4P"])

    args = parser.parse_args()

    if args.command == "pareto":
        df = pd.read_csv(args.input)
        result = pareto_analysis(df, args.cause_col, args.impact_col, args.threshold)
        print(format_pareto_table(result))
        print(f"\nVital few: {result.vital_few}")
        print(f"Account for: {result.vital_few_pct:.1%} of impact")

    elif args.command == "5why":
        print(five_why_template(args.problem))

    elif args.command == "fmea":
        df = fmea_template(args.steps)
        print(format_fmea_table(df))

    elif args.command == "ishikawa":
        categories = get_ishikawa_categories(args.framework)
        print(f"\n{args.framework} Framework Categories:\n")
        for cat, subcats in categories.items():
            print(f"  {cat}:")
            for sub in subcats:
                print(f"    - {sub}")

    else:
        parser.print_help()
