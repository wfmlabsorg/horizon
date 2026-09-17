#!/usr/bin/env python3
"""
Control Charts Module for ProcessCapability Skill

Provides statistical process control charting functions including:
- Individuals and Moving Range (I-MR) charts
- X-bar R and X-bar S charts
- Attribute charts (p, np, c, u)
- Western Electric run rules analysis
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Union
from dataclasses import dataclass


# Control chart constants lookup table
CONTROL_CONSTANTS = {
    # n: (A2, D3, D4, A3, c4, B3, B4, d2)
    2:  (1.880, 0.000, 3.267, 2.659, 0.7979, 0.000, 3.267, 1.128),
    3:  (1.023, 0.000, 2.574, 1.954, 0.8862, 0.000, 2.568, 1.693),
    4:  (0.729, 0.000, 2.282, 1.628, 0.9213, 0.000, 2.266, 2.059),
    5:  (0.577, 0.000, 2.114, 1.427, 0.9400, 0.000, 2.089, 2.326),
    6:  (0.483, 0.000, 2.004, 1.287, 0.9515, 0.030, 1.970, 2.534),
    7:  (0.419, 0.076, 1.924, 1.182, 0.9594, 0.118, 1.882, 2.704),
    8:  (0.373, 0.136, 1.864, 1.099, 0.9650, 0.185, 1.815, 2.847),
    9:  (0.337, 0.184, 1.816, 1.032, 0.9693, 0.239, 1.761, 2.970),
    10: (0.308, 0.223, 1.777, 0.975, 0.9727, 0.284, 1.716, 3.078),
    11: (0.285, 0.256, 1.744, 0.927, 0.9754, 0.321, 1.679, 3.173),
    12: (0.266, 0.283, 1.717, 0.886, 0.9776, 0.354, 1.646, 3.258),
    13: (0.249, 0.307, 1.693, 0.850, 0.9794, 0.382, 1.618, 3.336),
    14: (0.235, 0.328, 1.672, 0.817, 0.9810, 0.406, 1.594, 3.407),
    15: (0.223, 0.347, 1.653, 0.789, 0.9823, 0.428, 1.572, 3.472),
    20: (0.180, 0.415, 1.585, 0.680, 0.9869, 0.510, 1.490, 3.735),
    25: (0.153, 0.459, 1.541, 0.606, 0.9896, 0.565, 1.435, 3.931),
}


@dataclass
class ControlChartResult:
    """Results from control chart analysis."""
    chart_type: str
    center_line: float
    ucl: float
    lcl: float
    sigma_estimate: float
    data: np.ndarray
    ooc_points: List[int]  # Indices of out-of-control points
    run_rule_violations: Dict[str, List[int]]
    is_stable: bool

    def to_dict(self) -> dict:
        return {
            'chart_type': self.chart_type,
            'center_line': self.center_line,
            'ucl': self.ucl,
            'lcl': self.lcl,
            'sigma_estimate': self.sigma_estimate,
            'ooc_points': self.ooc_points,
            'run_rule_violations': self.run_rule_violations,
            'is_stable': self.is_stable,
            'n_points': len(self.data)
        }


def get_control_constants(n: int) -> Dict[str, float]:
    """
    Get control chart constants for subgroup size n.

    Args:
        n: Subgroup size (2-25)

    Returns:
        Dictionary with constants A2, D3, D4, A3, c4, B3, B4, d2
    """
    if n < 2:
        raise ValueError("Subgroup size must be at least 2")

    # Use closest available if exact match not found
    if n > 25:
        n = 25
    elif n not in CONTROL_CONSTANTS:
        # Find closest
        available = sorted(CONTROL_CONSTANTS.keys())
        n = min(available, key=lambda x: abs(x - n))

    constants = CONTROL_CONSTANTS[n]
    return {
        'A2': constants[0],
        'D3': constants[1],
        'D4': constants[2],
        'A3': constants[3],
        'c4': constants[4],
        'B3': constants[5],
        'B4': constants[6],
        'd2': constants[7]
    }


def individuals_chart(data: Union[List, np.ndarray, pd.Series]) -> Tuple[ControlChartResult, ControlChartResult]:
    """
    Create Individuals and Moving Range (I-MR) control chart.

    Args:
        data: Individual measurements (no subgroups)

    Returns:
        Tuple of (individuals_result, moving_range_result)
    """
    data = np.asarray(data, dtype=float)
    data = data[~np.isnan(data)]  # Remove NaN values

    if len(data) < 2:
        raise ValueError("Need at least 2 data points")

    # Calculate moving ranges
    mr = np.abs(np.diff(data))
    mr_bar = np.mean(mr)

    # Constants for n=2 (moving range of 2 consecutive points)
    d2 = 1.128
    D3 = 0.0
    D4 = 3.267

    # Individuals chart
    x_bar = np.mean(data)
    sigma_estimate = mr_bar / d2

    i_ucl = x_bar + 3 * sigma_estimate
    i_lcl = x_bar - 3 * sigma_estimate

    # Moving range chart
    mr_ucl = D4 * mr_bar
    mr_lcl = D3 * mr_bar  # Always 0 for n=2

    # Find out-of-control points
    i_ooc = list(np.where((data > i_ucl) | (data < i_lcl))[0])
    mr_ooc = list(np.where(mr > mr_ucl)[0])

    # Apply run rules to individuals chart
    run_violations = apply_run_rules(data, x_bar, i_ucl, i_lcl)

    individuals_result = ControlChartResult(
        chart_type='Individuals (I)',
        center_line=x_bar,
        ucl=i_ucl,
        lcl=i_lcl,
        sigma_estimate=sigma_estimate,
        data=data,
        ooc_points=i_ooc,
        run_rule_violations=run_violations,
        is_stable=len(i_ooc) == 0 and all(len(v) == 0 for v in run_violations.values())
    )

    mr_result = ControlChartResult(
        chart_type='Moving Range (MR)',
        center_line=mr_bar,
        ucl=mr_ucl,
        lcl=mr_lcl,
        sigma_estimate=sigma_estimate,
        data=mr,
        ooc_points=mr_ooc,
        run_rule_violations={},  # Run rules typically not applied to MR chart
        is_stable=len(mr_ooc) == 0
    )

    return individuals_result, mr_result


def xbar_r_chart(
    data: pd.DataFrame,
    subgroup_col: str,
    value_col: str
) -> Tuple[ControlChartResult, ControlChartResult]:
    """
    Create X-bar and R control chart for subgrouped data.

    Best for subgroup sizes 2-10.

    Args:
        data: DataFrame with subgroup identifier and values
        subgroup_col: Column name for subgroup identifier
        value_col: Column name for measurement values

    Returns:
        Tuple of (xbar_result, range_result)
    """
    # Calculate subgroup statistics
    subgroups = data.groupby(subgroup_col)[value_col]
    xbars = subgroups.mean()
    ranges = subgroups.max() - subgroups.min()
    n = subgroups.count().median()  # Typical subgroup size

    if n < 2:
        raise ValueError("Subgroup size must be at least 2")
    if n > 10:
        print(f"Warning: Subgroup size {n} > 10. Consider using X-bar S chart.")

    constants = get_control_constants(int(n))
    A2, D3, D4, d2 = constants['A2'], constants['D3'], constants['D4'], constants['d2']

    # X-bar chart
    x_double_bar = xbars.mean()
    r_bar = ranges.mean()
    sigma_estimate = r_bar / d2

    xbar_ucl = x_double_bar + A2 * r_bar
    xbar_lcl = x_double_bar - A2 * r_bar

    # R chart
    r_ucl = D4 * r_bar
    r_lcl = D3 * r_bar

    # Out-of-control points
    xbar_ooc = list(xbars[(xbars > xbar_ucl) | (xbars < xbar_lcl)].index)
    r_ooc = list(ranges[(ranges > r_ucl) | (ranges < r_lcl)].index)

    # Run rules
    run_violations = apply_run_rules(xbars.values, x_double_bar, xbar_ucl, xbar_lcl)

    xbar_result = ControlChartResult(
        chart_type='X-bar',
        center_line=x_double_bar,
        ucl=xbar_ucl,
        lcl=xbar_lcl,
        sigma_estimate=sigma_estimate,
        data=xbars.values,
        ooc_points=[list(xbars.index).index(i) for i in xbar_ooc],
        run_rule_violations=run_violations,
        is_stable=len(xbar_ooc) == 0 and all(len(v) == 0 for v in run_violations.values())
    )

    r_result = ControlChartResult(
        chart_type='R (Range)',
        center_line=r_bar,
        ucl=r_ucl,
        lcl=r_lcl,
        sigma_estimate=sigma_estimate,
        data=ranges.values,
        ooc_points=[list(ranges.index).index(i) for i in r_ooc],
        run_rule_violations={},
        is_stable=len(r_ooc) == 0
    )

    return xbar_result, r_result


def xbar_s_chart(
    data: pd.DataFrame,
    subgroup_col: str,
    value_col: str
) -> Tuple[ControlChartResult, ControlChartResult]:
    """
    Create X-bar and S control chart for subgrouped data.

    Best for subgroup sizes > 10.

    Args:
        data: DataFrame with subgroup identifier and values
        subgroup_col: Column name for subgroup identifier
        value_col: Column name for measurement values

    Returns:
        Tuple of (xbar_result, s_result)
    """
    # Calculate subgroup statistics
    subgroups = data.groupby(subgroup_col)[value_col]
    xbars = subgroups.mean()
    stds = subgroups.std(ddof=1)
    n = subgroups.count().median()

    if n < 10:
        print(f"Warning: Subgroup size {n} < 10. Consider using X-bar R chart.")

    constants = get_control_constants(int(min(n, 25)))
    A3, c4, B3, B4 = constants['A3'], constants['c4'], constants['B3'], constants['B4']

    # X-bar chart
    x_double_bar = xbars.mean()
    s_bar = stds.mean()
    sigma_estimate = s_bar / c4

    xbar_ucl = x_double_bar + A3 * s_bar
    xbar_lcl = x_double_bar - A3 * s_bar

    # S chart
    s_ucl = B4 * s_bar
    s_lcl = B3 * s_bar

    # Out-of-control points
    xbar_ooc = list(xbars[(xbars > xbar_ucl) | (xbars < xbar_lcl)].index)
    s_ooc = list(stds[(stds > s_ucl) | (stds < s_lcl)].index)

    # Run rules
    run_violations = apply_run_rules(xbars.values, x_double_bar, xbar_ucl, xbar_lcl)

    xbar_result = ControlChartResult(
        chart_type='X-bar',
        center_line=x_double_bar,
        ucl=xbar_ucl,
        lcl=xbar_lcl,
        sigma_estimate=sigma_estimate,
        data=xbars.values,
        ooc_points=[list(xbars.index).index(i) for i in xbar_ooc],
        run_rule_violations=run_violations,
        is_stable=len(xbar_ooc) == 0 and all(len(v) == 0 for v in run_violations.values())
    )

    s_result = ControlChartResult(
        chart_type='S (Standard Deviation)',
        center_line=s_bar,
        ucl=s_ucl,
        lcl=s_lcl,
        sigma_estimate=sigma_estimate,
        data=stds.values,
        ooc_points=[list(stds.index).index(i) for i in s_ooc],
        run_rule_violations={},
        is_stable=len(s_ooc) == 0
    )

    return xbar_result, s_result


def p_chart(
    defectives: Union[List, np.ndarray],
    sample_sizes: Union[List, np.ndarray]
) -> ControlChartResult:
    """
    Create p-chart for proportion defective with variable sample sizes.

    Args:
        defectives: Number of defective items per sample
        sample_sizes: Size of each sample

    Returns:
        ControlChartResult for p-chart
    """
    defectives = np.asarray(defectives, dtype=float)
    sample_sizes = np.asarray(sample_sizes, dtype=float)

    # Calculate proportions
    p = defectives / sample_sizes
    p_bar = np.sum(defectives) / np.sum(sample_sizes)

    # Control limits (vary with sample size)
    n_bar = np.mean(sample_sizes)
    sigma = np.sqrt(p_bar * (1 - p_bar) / n_bar)

    ucl = p_bar + 3 * sigma
    lcl = max(0, p_bar - 3 * sigma)

    # For variable limits per point
    sigmas = np.sqrt(p_bar * (1 - p_bar) / sample_sizes)
    ucls = p_bar + 3 * sigmas
    lcls = np.maximum(0, p_bar - 3 * sigmas)

    # Out-of-control (using individual limits)
    ooc = list(np.where((p > ucls) | (p < lcls))[0])

    return ControlChartResult(
        chart_type='p (Proportion Defective)',
        center_line=p_bar,
        ucl=ucl,  # Average limit
        lcl=lcl,
        sigma_estimate=sigma,
        data=p,
        ooc_points=ooc,
        run_rule_violations={},  # Run rules less applicable to attribute charts
        is_stable=len(ooc) == 0
    )


def np_chart(
    defectives: Union[List, np.ndarray],
    sample_size: int
) -> ControlChartResult:
    """
    Create np-chart for count of defectives with constant sample size.

    Args:
        defectives: Number of defective items per sample
        sample_size: Constant sample size

    Returns:
        ControlChartResult for np-chart
    """
    defectives = np.asarray(defectives, dtype=float)

    np_bar = np.mean(defectives)
    p_bar = np_bar / sample_size
    sigma = np.sqrt(np_bar * (1 - p_bar))

    ucl = np_bar + 3 * sigma
    lcl = max(0, np_bar - 3 * sigma)

    ooc = list(np.where((defectives > ucl) | (defectives < lcl))[0])

    return ControlChartResult(
        chart_type='np (Number Defective)',
        center_line=np_bar,
        ucl=ucl,
        lcl=lcl,
        sigma_estimate=sigma,
        data=defectives,
        ooc_points=ooc,
        run_rule_violations={},
        is_stable=len(ooc) == 0
    )


def c_chart(defects: Union[List, np.ndarray]) -> ControlChartResult:
    """
    Create c-chart for count of defects with constant opportunity.

    Args:
        defects: Count of defects per inspection unit

    Returns:
        ControlChartResult for c-chart
    """
    defects = np.asarray(defects, dtype=float)

    c_bar = np.mean(defects)
    sigma = np.sqrt(c_bar)

    ucl = c_bar + 3 * sigma
    lcl = max(0, c_bar - 3 * sigma)

    ooc = list(np.where((defects > ucl) | (defects < lcl))[0])

    return ControlChartResult(
        chart_type='c (Count of Defects)',
        center_line=c_bar,
        ucl=ucl,
        lcl=lcl,
        sigma_estimate=sigma,
        data=defects,
        ooc_points=ooc,
        run_rule_violations={},
        is_stable=len(ooc) == 0
    )


def u_chart(
    defects: Union[List, np.ndarray],
    inspection_units: Union[List, np.ndarray]
) -> ControlChartResult:
    """
    Create u-chart for defects per unit with variable opportunity.

    Args:
        defects: Count of defects per sample
        inspection_units: Number of inspection units per sample

    Returns:
        ControlChartResult for u-chart
    """
    defects = np.asarray(defects, dtype=float)
    inspection_units = np.asarray(inspection_units, dtype=float)

    u = defects / inspection_units
    u_bar = np.sum(defects) / np.sum(inspection_units)

    # Average limit
    n_bar = np.mean(inspection_units)
    sigma = np.sqrt(u_bar / n_bar)

    ucl = u_bar + 3 * sigma
    lcl = max(0, u_bar - 3 * sigma)

    # Variable limits
    sigmas = np.sqrt(u_bar / inspection_units)
    ucls = u_bar + 3 * sigmas
    lcls = np.maximum(0, u_bar - 3 * sigmas)

    ooc = list(np.where((u > ucls) | (u < lcls))[0])

    return ControlChartResult(
        chart_type='u (Defects per Unit)',
        center_line=u_bar,
        ucl=ucl,
        lcl=lcl,
        sigma_estimate=sigma,
        data=u,
        ooc_points=ooc,
        run_rule_violations={},
        is_stable=len(ooc) == 0
    )


def apply_run_rules(
    data: np.ndarray,
    cl: float,
    ucl: float,
    lcl: float
) -> Dict[str, List[int]]:
    """
    Apply Western Electric run rules to detect special causes.

    Rules:
    1. One point beyond 3 sigma
    2. Nine points in a row on same side of centerline
    3. Six points in a row steadily increasing or decreasing
    4. Fourteen points alternating up and down
    5. Two of three points beyond 2 sigma (same side)
    6. Four of five points beyond 1 sigma (same side)

    Args:
        data: Array of data points
        cl: Center line
        ucl: Upper control limit
        lcl: Lower control limit

    Returns:
        Dictionary mapping rule name to list of violating point indices
    """
    data = np.asarray(data)
    n = len(data)

    # Calculate zone boundaries
    sigma = (ucl - cl) / 3
    zone_a_upper = cl + 2 * sigma
    zone_a_lower = cl - 2 * sigma
    zone_b_upper = cl + 1 * sigma
    zone_b_lower = cl - 1 * sigma

    violations = {
        'rule_1_beyond_3sigma': [],
        'rule_2_nine_same_side': [],
        'rule_3_six_trending': [],
        'rule_4_fourteen_alternating': [],
        'rule_5_two_of_three_beyond_2sigma': [],
        'rule_6_four_of_five_beyond_1sigma': []
    }

    # Rule 1: One point beyond 3 sigma
    violations['rule_1_beyond_3sigma'] = list(np.where((data > ucl) | (data < lcl))[0])

    # Rule 2: Nine points in a row on same side of centerline
    for i in range(n - 8):
        segment = data[i:i+9]
        if all(segment > cl) or all(segment < cl):
            violations['rule_2_nine_same_side'].extend(range(i, i+9))
    violations['rule_2_nine_same_side'] = list(set(violations['rule_2_nine_same_side']))

    # Rule 3: Six points in a row steadily increasing or decreasing
    for i in range(n - 5):
        segment = data[i:i+6]
        diffs = np.diff(segment)
        if all(diffs > 0) or all(diffs < 0):
            violations['rule_3_six_trending'].extend(range(i, i+6))
    violations['rule_3_six_trending'] = list(set(violations['rule_3_six_trending']))

    # Rule 4: Fourteen points alternating up and down
    for i in range(n - 13):
        segment = data[i:i+14]
        diffs = np.diff(segment)
        signs = np.sign(diffs)
        # Check alternating pattern
        if all(signs[::2] == signs[0]) and all(signs[1::2] == -signs[0]):
            violations['rule_4_fourteen_alternating'].extend(range(i, i+14))
    violations['rule_4_fourteen_alternating'] = list(set(violations['rule_4_fourteen_alternating']))

    # Rule 5: Two of three points beyond 2 sigma (same side)
    for i in range(n - 2):
        segment = data[i:i+3]
        above_2sigma = segment > zone_a_upper
        below_2sigma = segment < zone_a_lower
        if sum(above_2sigma) >= 2 or sum(below_2sigma) >= 2:
            violations['rule_5_two_of_three_beyond_2sigma'].extend(range(i, i+3))
    violations['rule_5_two_of_three_beyond_2sigma'] = list(set(violations['rule_5_two_of_three_beyond_2sigma']))

    # Rule 6: Four of five points beyond 1 sigma (same side)
    for i in range(n - 4):
        segment = data[i:i+5]
        above_1sigma = segment > zone_b_upper
        below_1sigma = segment < zone_b_lower
        if sum(above_1sigma) >= 4 or sum(below_1sigma) >= 4:
            violations['rule_6_four_of_five_beyond_1sigma'].extend(range(i, i+5))
    violations['rule_6_four_of_five_beyond_1sigma'] = list(set(violations['rule_6_four_of_five_beyond_1sigma']))

    return violations


def format_chart_results(
    result: ControlChartResult,
    include_data: bool = False
) -> str:
    """Format control chart results as markdown."""

    output = f"""## {result.chart_type} Chart Analysis

| Statistic | Value |
|-----------|-------|
| Center Line | {result.center_line:.4f} |
| UCL | {result.ucl:.4f} |
| LCL | {result.lcl:.4f} |
| σ estimate | {result.sigma_estimate:.4f} |
| Data Points | {len(result.data)} |

**Out of Control Points:** {result.ooc_points if result.ooc_points else "None"}
"""

    # Run rule violations
    violations_found = [(k, v) for k, v in result.run_rule_violations.items() if v]
    if violations_found:
        output += "\n**Run Rules Violations:**\n"
        for rule, points in violations_found:
            rule_name = rule.replace('_', ' ').title()
            output += f"- {rule_name}: Points {points}\n"
    elif result.run_rule_violations:
        output += "\n**Run Rules Violations:** None\n"

    output += f"\n**Process Status:** {'✅ Stable' if result.is_stable else '⚠️ Not Stable - Investigate special causes'}\n"

    return output


if __name__ == "__main__":
    # Example usage
    import sys

    # Generate sample data
    np.random.seed(42)
    sample_data = np.random.normal(100, 5, 30)
    # Add an out-of-control point
    sample_data[15] = 120

    print("=== I-MR Chart Example ===")
    i_result, mr_result = individuals_chart(sample_data)
    print(format_chart_results(i_result))
    print(format_chart_results(mr_result))
