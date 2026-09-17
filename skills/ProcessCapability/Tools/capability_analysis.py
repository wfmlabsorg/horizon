#!/usr/bin/env python3
"""
Capability Analysis Module for ProcessCapability Skill

Provides process capability calculations including:
- Cp, Cpk (short-term/within capability)
- Pp, Ppk (long-term/overall capability)
- Sigma level and DPMO calculations
- Capability interpretation
"""

import numpy as np
from typing import Dict, Optional, Union, List, Tuple
from dataclasses import dataclass
from scipy import stats


@dataclass
class CapabilityResult:
    """Results from process capability analysis."""
    cp: Optional[float]
    cpk: float
    cpu: float  # Upper capability
    cpl: float  # Lower capability
    pp: Optional[float]
    ppk: float
    ppu: float
    ppl: float
    sigma_within: float
    sigma_overall: float
    mean: float
    usl: Optional[float]
    lsl: Optional[float]
    target: Optional[float]
    n: int
    sigma_level: float
    dpmo: float
    interpretation: str
    is_capable: bool
    is_centered: bool

    def to_dict(self) -> dict:
        return {
            'cp': self.cp,
            'cpk': self.cpk,
            'cpu': self.cpu,
            'cpl': self.cpl,
            'pp': self.pp,
            'ppk': self.ppk,
            'ppu': self.ppu,
            'ppl': self.ppl,
            'sigma_within': self.sigma_within,
            'sigma_overall': self.sigma_overall,
            'mean': self.mean,
            'usl': self.usl,
            'lsl': self.lsl,
            'target': self.target,
            'n': self.n,
            'sigma_level': self.sigma_level,
            'dpmo': self.dpmo,
            'interpretation': self.interpretation,
            'is_capable': self.is_capable,
            'is_centered': self.is_centered
        }


def estimate_within_sigma(data: np.ndarray, method: str = 'mr') -> float:
    """
    Estimate within-subgroup (short-term) standard deviation.

    Args:
        data: Array of individual measurements
        method: 'mr' for moving range method (default), 'pooled' for pooled std

    Returns:
        Estimated within-subgroup sigma
    """
    data = np.asarray(data, dtype=float)
    data = data[~np.isnan(data)]

    if method == 'mr':
        # Moving range method (d2 for n=2 is 1.128)
        mr = np.abs(np.diff(data))
        mr_bar = np.mean(mr)
        return mr_bar / 1.128
    else:
        # Use sample standard deviation
        return np.std(data, ddof=1)


def calculate_capability(
    data: Union[List, np.ndarray],
    usl: Optional[float] = None,
    lsl: Optional[float] = None,
    target: Optional[float] = None,
    sigma_within: Optional[float] = None
) -> CapabilityResult:
    """
    Calculate process capability indices.

    Args:
        data: Array of measurements
        usl: Upper specification limit (optional)
        lsl: Lower specification limit (optional)
        target: Target value (optional, defaults to midpoint of specs)
        sigma_within: Pre-calculated within sigma (optional)

    Returns:
        CapabilityResult with all capability metrics
    """
    data = np.asarray(data, dtype=float)
    data = data[~np.isnan(data)]

    if len(data) < 2:
        raise ValueError("Need at least 2 data points")

    if usl is None and lsl is None:
        raise ValueError("At least one specification limit (USL or LSL) is required")

    # Basic statistics
    mean = np.mean(data)
    n = len(data)

    # Sigma estimates
    sigma_overall = np.std(data, ddof=1)
    if sigma_within is None:
        sigma_within = estimate_within_sigma(data)

    # Target defaults to midpoint if both specs provided
    if target is None and usl is not None and lsl is not None:
        target = (usl + lsl) / 2

    # Initialize capability indices
    cp = cpk = cpu = cpl = None
    pp = ppk = ppu = ppl = None

    # Calculate one-sided capabilities
    if usl is not None:
        cpu = (usl - mean) / (3 * sigma_within)
        ppu = (usl - mean) / (3 * sigma_overall)

    if lsl is not None:
        cpl = (mean - lsl) / (3 * sigma_within)
        ppl = (mean - lsl) / (3 * sigma_overall)

    # Two-sided capability
    if usl is not None and lsl is not None:
        cp = (usl - lsl) / (6 * sigma_within)
        pp = (usl - lsl) / (6 * sigma_overall)
        cpk = min(cpu, cpl)
        ppk = min(ppu, ppl)
    elif usl is not None:
        cpk = cpu
        ppk = ppu
    else:
        cpk = cpl
        ppk = ppl

    # Sigma level (based on Cpk)
    sigma_level = calculate_sigma_level(cpk)

    # DPMO calculation
    dpmo = calculate_ppm(cpk)

    # Interpretation
    interpretation = interpret_capability(cpk)

    # Capability assessment
    is_capable = cpk >= 1.33

    # Centering assessment (if two-sided)
    is_centered = True
    if cp is not None:
        centering_ratio = cpk / cp if cp > 0 else 0
        is_centered = centering_ratio >= 0.9  # Within 10% of centered

    return CapabilityResult(
        cp=cp,
        cpk=cpk,
        cpu=cpu if cpu is not None else 0,
        cpl=cpl if cpl is not None else 0,
        pp=pp,
        ppk=ppk,
        ppu=ppu if ppu is not None else 0,
        ppl=ppl if ppl is not None else 0,
        sigma_within=sigma_within,
        sigma_overall=sigma_overall,
        mean=mean,
        usl=usl,
        lsl=lsl,
        target=target,
        n=n,
        sigma_level=sigma_level,
        dpmo=dpmo,
        interpretation=interpretation,
        is_capable=is_capable,
        is_centered=is_centered
    )


def calculate_ppm(cpk: float) -> float:
    """
    Calculate expected defects per million opportunities (DPMO) from Cpk.

    Args:
        cpk: Process capability index

    Returns:
        Expected DPMO
    """
    if cpk <= 0:
        return 1_000_000

    # Z-score from Cpk
    z = 3 * cpk

    # One-tail probability
    prob = stats.norm.sf(z)

    # Two-tail (defects on both sides)
    dpmo = 2 * prob * 1_000_000

    return min(dpmo, 1_000_000)


def calculate_sigma_level(cpk: float) -> float:
    """
    Convert Cpk to sigma level.

    The sigma level represents how many standard deviations fit between
    the process mean and the nearest specification limit.

    Args:
        cpk: Process capability index

    Returns:
        Sigma level (e.g., 3, 4, 5, 6)
    """
    return 3 * cpk


def sigma_level_to_cpk(sigma: float) -> float:
    """
    Convert sigma level to Cpk.

    Args:
        sigma: Sigma level (e.g., 6 for Six Sigma)

    Returns:
        Equivalent Cpk value
    """
    return sigma / 3


def interpret_capability(cpk: float) -> str:
    """
    Provide plain language interpretation of capability index.

    Args:
        cpk: Process capability index

    Returns:
        Interpretation string
    """
    if cpk < 0:
        return "Process mean is outside specification limits - CRITICAL"
    elif cpk < 0.67:
        return "Not capable - process cannot meet specifications reliably"
    elif cpk < 1.0:
        return "Poor capability - significant defect rate expected"
    elif cpk < 1.33:
        return "Marginally capable - meets minimum standards but improvement needed"
    elif cpk < 1.67:
        return "Capable - process meets specifications reliably"
    elif cpk < 2.0:
        return "Highly capable - excellent process performance"
    else:
        return "World-class capability - Six Sigma level performance"


def capability_summary_table(cpk: float) -> str:
    """
    Generate a capability reference table showing Cpk thresholds.

    Args:
        cpk: Current Cpk value to highlight

    Returns:
        Markdown table
    """
    thresholds = [
        (0.67, "Not capable", "> 22,750"),
        (1.0, "Poor", "~2,700"),
        (1.33, "Marginally capable", "~66"),
        (1.67, "Capable", "~0.6"),
        (2.0, "Highly capable", "~0.002"),
    ]

    table = "| Cpk | Rating | DPMO |\n|-----|--------|------|\n"
    for threshold, rating, dpmo in thresholds:
        marker = " ◄ Current" if abs(cpk - threshold) < 0.17 else ""
        table += f"| {threshold:.2f} | {rating} | {dpmo} |{marker}\n"

    return table


def assess_normality(data: np.ndarray) -> Dict[str, Union[float, bool, str]]:
    """
    Assess normality of data (important for capability analysis).

    Args:
        data: Array of measurements

    Returns:
        Dictionary with normality test results
    """
    data = np.asarray(data, dtype=float)
    data = data[~np.isnan(data)]

    # Shapiro-Wilk test (best for n < 50)
    if len(data) <= 5000:
        stat, p_value = stats.shapiro(data)
        test_used = "Shapiro-Wilk"
    else:
        # Use D'Agostino-Pearson for larger samples
        stat, p_value = stats.normaltest(data)
        test_used = "D'Agostino-Pearson"

    is_normal = p_value > 0.05

    return {
        'test': test_used,
        'statistic': stat,
        'p_value': p_value,
        'is_normal': is_normal,
        'interpretation': "Data appears normally distributed" if is_normal
                         else "Data may not be normally distributed - consider transformation"
    }


def format_capability_results(result: CapabilityResult) -> str:
    """Format capability analysis results as markdown."""

    # Build spec limits string
    specs = []
    if result.lsl is not None:
        specs.append(f"LSL = {result.lsl:.4f}")
    if result.usl is not None:
        specs.append(f"USL = {result.usl:.4f}")
    spec_str = ", ".join(specs)

    output = f"""## Process Capability Analysis

**Specification Limits:** {spec_str}
**Target:** {result.target if result.target is not None else "Not specified"}
**Sample Size:** {result.n}

### Capability Indices

| Metric | Value | Interpretation |
|--------|-------|----------------|
"""

    if result.cp is not None:
        output += f"| Cp | {result.cp:.3f} | Potential (if centered) |\n"
    output += f"| Cpk | {result.cpk:.3f} | Actual short-term capability |\n"
    if result.pp is not None:
        output += f"| Pp | {result.pp:.3f} | Long-term potential |\n"
    output += f"| Ppk | {result.ppk:.3f} | Actual long-term capability |\n"

    # One-sided indices
    if result.cpu and result.cpl:
        output += f"\n**One-Sided:** CPU = {result.cpu:.3f}, CPL = {result.cpl:.3f}\n"

    output += f"""
### Process Statistics

| Statistic | Value |
|-----------|-------|
| Mean (μ) | {result.mean:.4f} |
| σ within | {result.sigma_within:.4f} |
| σ overall | {result.sigma_overall:.4f} |

### Performance

**Sigma Level:** {result.sigma_level:.2f}
**Expected DPMO:** {result.dpmo:,.0f}

### Assessment

**{result.interpretation}**

- Process Capable: {'✅ Yes' if result.is_capable else '❌ No (Cpk < 1.33)'}
- Process Centered: {'✅ Yes' if result.is_centered else '⚠️ No - shift toward center could improve capability'}
"""

    return output


if __name__ == "__main__":
    # Example usage
    np.random.seed(42)

    # Generate sample process data
    data = np.random.normal(100, 2, 100)

    # Specifications
    usl = 106
    lsl = 94
    target = 100

    print("=== Process Capability Analysis Example ===\n")

    # Check normality first
    normality = assess_normality(data)
    print(f"Normality Check: {normality['interpretation']}")
    print(f"  Test: {normality['test']}, p-value: {normality['p_value']:.4f}\n")

    # Calculate capability
    result = calculate_capability(data, usl=usl, lsl=lsl, target=target)
    print(format_capability_results(result))
