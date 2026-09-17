#!/usr/bin/env python3
"""
BlackBelt Suite Router

Routes analysis intents to appropriate skills and workflows.
Flags when causal escalation is likely needed.
"""

import argparse
import json
from typing import Dict, List, Tuple, Optional

# Intent patterns mapped to skills and workflows
ROUTING_TABLE = {
    # Full analysis intents
    "full_analysis": {
        "workflow": "FullAnalysis.md",
        "skills": ["RootCauseAnalysis", "StatisticalAnalysis", "VarianceAnalysis",
                   "ProcessCapability", "DOEDesigner"],
        "description": "Comprehensive investigation through all analytical phases",
        "causal_escalation": "likely"
    },
    "quick_check": {
        "workflow": "QuickDiagnostics.md",
        "skills": ["StatisticalAnalysis", "ProcessCapability", "OutcomeFramework"],
        "description": "Rapid health check with key metrics",
        "causal_escalation": "unlikely"
    },
    "variance_investigation": {
        "workflow": "VarianceDeepDive.md",
        "skills": ["VarianceAnalysis", "ShapleyDecomposition", "StatisticalAnalysis"],
        "description": "Deep dive into variance sources and attribution",
        "causal_escalation": "possible"
    },
    "process_improvement": {
        "workflow": "ProcessImprovement.md",
        "skills": ["ProcessCapability", "RootCauseAnalysis", "DOEDesigner"],
        "description": "Baseline → RCA → DOE → Confirm cycle",
        "causal_escalation": "likely"
    },

    # DMAIC phase routing
    "dmaic_define": {
        "workflow": None,
        "skills": ["OutcomeFramework"],
        "description": "Define problem and map to CX/COST/EX outcomes",
        "causal_escalation": "unlikely"
    },
    "dmaic_measure": {
        "workflow": None,
        "skills": ["StatisticalAnalysis", "ProcessCapability"],
        "description": "Measure current state and establish baseline",
        "causal_escalation": "unlikely"
    },
    "dmaic_analyze": {
        "workflow": None,
        "skills": ["RootCauseAnalysis", "ShapleyDecomposition", "StatisticalAnalysis"],
        "description": "Analyze root causes and variance sources",
        "causal_escalation": "likely"
    },
    "dmaic_improve": {
        "workflow": None,
        "skills": ["DOEDesigner", "StatisticalAnalysis"],
        "description": "Design and run experiments to test improvements",
        "causal_escalation": "yes"
    },
    "dmaic_control": {
        "workflow": None,
        "skills": ["ProcessCapability", "StatisticalAnalysis"],
        "description": "Establish control charts and monitoring",
        "causal_escalation": "unlikely"
    },

    # Direct skill routing
    "statistics": {
        "workflow": None,
        "skills": ["StatisticalAnalysis"],
        "description": "Statistical hypothesis testing, correlation, regression",
        "causal_escalation": "possible"
    },
    "capability": {
        "workflow": None,
        "skills": ["ProcessCapability"],
        "description": "SPC, control charts, Cp/Cpk analysis",
        "causal_escalation": "unlikely"
    },
    "variance": {
        "workflow": None,
        "skills": ["VarianceAnalysis", "ShapleyDecomposition"],
        "description": "Variance decomposition and attribution",
        "causal_escalation": "possible"
    },
    "root_cause": {
        "workflow": None,
        "skills": ["RootCauseAnalysis"],
        "description": "Ishikawa, 5-Why, Pareto, FMEA",
        "causal_escalation": "likely"
    },
    "experiment": {
        "workflow": None,
        "skills": ["DOEDesigner"],
        "description": "Design of Experiments for controlled testing",
        "causal_escalation": "yes"
    }
}

# Keywords that suggest causal intent
CAUSAL_KEYWORDS = [
    "why", "cause", "caused", "because", "reason", "driver",
    "impact", "effect", "influence", "lead to", "result in",
    "if we change", "what happens when", "intervention",
    "would", "should", "recommend", "improve"
]

def detect_intent(query: str) -> str:
    """Detect analysis intent from natural language query."""
    query_lower = query.lower()

    # Check for explicit commands
    if "full analysis" in query_lower or "comprehensive" in query_lower:
        return "full_analysis"
    if "quick" in query_lower or "health check" in query_lower:
        return "quick_check"
    if "variance" in query_lower and ("deep" in query_lower or "dive" in query_lower):
        return "variance_investigation"
    if "improve" in query_lower or "improvement" in query_lower:
        return "process_improvement"

    # Check for DMAIC phases
    if "define" in query_lower and "phase" in query_lower:
        return "dmaic_define"
    if "measure" in query_lower and "phase" in query_lower:
        return "dmaic_measure"
    if "analyze" in query_lower and "phase" in query_lower:
        return "dmaic_analyze"
    if "improve" in query_lower and "phase" in query_lower:
        return "dmaic_improve"
    if "control" in query_lower and "phase" in query_lower:
        return "dmaic_control"

    # Check for direct skill references
    if any(kw in query_lower for kw in ["stats", "statistic", "hypothesis", "correlation", "regression", "t-test", "anova"]):
        return "statistics"
    if any(kw in query_lower for kw in ["spc", "control chart", "capability", "cp", "cpk", "stable"]):
        return "capability"
    if any(kw in query_lower for kw in ["variance", "budget", "actual", "decompos"]):
        return "variance"
    if any(kw in query_lower for kw in ["root cause", "rca", "fishbone", "ishikawa", "5 why", "pareto", "fmea"]):
        return "root_cause"
    if any(kw in query_lower for kw in ["doe", "experiment", "factorial", "screening"]):
        return "experiment"

    # Default to full analysis
    return "full_analysis"


def check_causal_intent(query: str) -> Tuple[bool, List[str]]:
    """Check if query suggests causal intent requiring escalation."""
    query_lower = query.lower()
    found_keywords = [kw for kw in CAUSAL_KEYWORDS if kw in query_lower]
    return len(found_keywords) > 0, found_keywords


def route(query: str) -> Dict:
    """
    Route an analysis query to appropriate skills and workflows.

    Args:
        query: Natural language analysis request

    Returns:
        Dict with routing information
    """
    intent = detect_intent(query)
    routing = ROUTING_TABLE.get(intent, ROUTING_TABLE["full_analysis"])

    has_causal_intent, causal_keywords = check_causal_intent(query)

    result = {
        "intent": intent,
        "workflow": routing["workflow"],
        "skills": routing["skills"],
        "description": routing["description"],
        "causal_escalation_likelihood": routing["causal_escalation"],
        "causal_intent_detected": has_causal_intent,
        "causal_keywords_found": causal_keywords,
        "recommendation": None,
        "caveat": "All findings are correlational (Rung 1). For causal claims, escalate to CausalInference or use DOE."
    }

    # Add recommendation based on causal analysis
    if has_causal_intent and routing["causal_escalation"] != "yes":
        result["recommendation"] = (
            f"Causal intent detected (keywords: {', '.join(causal_keywords)}). "
            f"After {intent} analysis, consider escalating to CausalInference skill "
            f"or designing a DOE for causal confirmation."
        )
    elif routing["causal_escalation"] == "yes":
        result["recommendation"] = (
            "This analysis type (DOE) enables causal claims through controlled manipulation. "
            "Ensure proper randomization and execution."
        )
    else:
        result["recommendation"] = (
            f"Proceed with {intent}. Remember to include causal caveats in findings."
        )

    return result


def format_output(result: Dict, format_type: str = "text") -> str:
    """Format routing result for output."""
    if format_type == "json":
        return json.dumps(result, indent=2)

    lines = []
    lines.append(f"## Routing Decision")
    lines.append(f"")
    lines.append(f"**Intent Detected:** {result['intent']}")
    lines.append(f"**Workflow:** {result['workflow'] or 'Direct skill invocation'}")
    lines.append(f"**Skills:** {', '.join(result['skills'])}")
    lines.append(f"")
    lines.append(f"**Description:** {result['description']}")
    lines.append(f"")
    lines.append(f"### Causal Assessment")
    lines.append(f"- Escalation likelihood: {result['causal_escalation_likelihood']}")
    lines.append(f"- Causal intent in query: {'Yes' if result['causal_intent_detected'] else 'No'}")
    if result['causal_keywords_found']:
        lines.append(f"- Keywords found: {', '.join(result['causal_keywords_found'])}")
    lines.append(f"")
    lines.append(f"**Recommendation:** {result['recommendation']}")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"*{result['caveat']}*")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="BlackBelt Suite Router")
    parser.add_argument("query", nargs="*", help="Analysis query or intent")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--list", action="store_true", help="List all routing options")

    args = parser.parse_args()

    if args.list:
        print("## BlackBelt Suite Routing Options\n")
        for intent, config in ROUTING_TABLE.items():
            print(f"### {intent}")
            print(f"- **Workflow:** {config['workflow'] or 'Direct'}")
            print(f"- **Skills:** {', '.join(config['skills'])}")
            print(f"- **Description:** {config['description']}")
            print(f"- **Causal escalation:** {config['causal_escalation']}")
            print()
        return

    query = " ".join(args.query) if args.query else "full analysis"
    result = route(query)

    format_type = "json" if args.json else "text"
    print(format_output(result, format_type))


if __name__ == "__main__":
    main()
