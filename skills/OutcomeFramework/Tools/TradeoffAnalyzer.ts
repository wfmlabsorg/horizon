#!/usr/bin/env bun
/**
 * TradeoffAnalyzer - Analyze tradeoffs between CX/COST/EX outcomes
 *
 * Usage:
 *   bun run TradeoffAnalyzer.ts "reduce AHT by 15%"
 *   bun run TradeoffAnalyzer.ts --intervention "increase occupancy to 90%"
 *   bun run TradeoffAnalyzer.ts --compare "cost reduction" vs "service improvement"
 */

interface TradeoffResult {
  intervention: string;
  impacts: {
    CX: { direction: 'positive' | 'negative' | 'neutral' | 'varies'; magnitude: string; mechanism: string };
    COST: { direction: 'positive' | 'negative' | 'neutral' | 'varies'; magnitude: string; mechanism: string };
    EX: { direction: 'positive' | 'negative' | 'neutral' | 'varies'; magnitude: string; mechanism: string };
  };
  risks: string[];
  recommendations: string[];
}

// Common intervention patterns and their typical impacts
const INTERVENTION_PATTERNS: Record<string, TradeoffResult> = {
  'reduce aht': {
    intervention: 'Reduce Average Handle Time',
    impacts: {
      CX: {
        direction: 'varies',
        magnitude: 'Depends on method',
        mechanism: 'If via efficiency: neutral/positive. If via rushing: negative quality/FCR.'
      },
      COST: {
        direction: 'positive',
        magnitude: 'High (7-10% cost reduction per 10% AHT)',
        mechanism: 'Direct FTE reduction through improved productivity'
      },
      EX: {
        direction: 'varies',
        magnitude: 'Depends on method',
        mechanism: 'If via tools: positive. If via pressure: negative stress/burnout.'
      }
    },
    risks: [
      'Quality degradation if agents rush',
      'FCR decline leading to repeat contacts',
      'Agent burnout if achieved via pressure',
      'Customer complaints if not properly implemented'
    ],
    recommendations: [
      'Identify AHT drivers before setting targets',
      'Invest in tools/processes, not just targets',
      'Monitor quality and FCR alongside AHT',
      'Set realistic targets with agent input'
    ]
  },

  'increase occupancy': {
    intervention: 'Increase Agent Occupancy',
    impacts: {
      CX: {
        direction: 'varies',
        magnitude: 'Threshold-dependent',
        mechanism: 'Neutral below 85%. Negative above 90% (fatigue affects quality).'
      },
      COST: {
        direction: 'positive',
        magnitude: 'Moderate (5-8% efficiency gain)',
        mechanism: 'Better utilization of existing staff'
      },
      EX: {
        direction: 'negative',
        magnitude: 'High above 85% threshold',
        mechanism: 'Burnout, stress, reduced breaks, higher turnover'
      }
    },
    risks: [
      'Turnover spike if sustained above 90%',
      'Quality decline from fatigued agents',
      'Absenteeism increase as coping mechanism',
      'Death spiral: turnover → more understaffing → higher occupancy'
    ],
    recommendations: [
      'Target 80-85% occupancy range',
      'Never sustain above 90% for extended periods',
      'Monitor turnover and absenteeism as leading indicators',
      'Provide adequate breaks and recovery time'
    ]
  },

  'improve service level': {
    intervention: 'Improve Service Level',
    impacts: {
      CX: {
        direction: 'positive',
        magnitude: 'High (direct wait time reduction)',
        mechanism: 'Customers answered faster, lower abandonment'
      },
      COST: {
        direction: 'negative',
        magnitude: 'High (8-12% FTE increase per 10 SL points)',
        mechanism: 'More staff required to meet targets'
      },
      EX: {
        direction: 'varies',
        magnitude: 'Depends on how achieved',
        mechanism: 'If via better forecasting: positive. If via mandatory OT: negative.'
      }
    },
    risks: [
      'Cost escalation without commensurate CX gains',
      'Diminishing returns above certain thresholds',
      'Agent pressure if understaffed to target',
      'Schedule instability if using OT to hit targets'
    ],
    recommendations: [
      'Validate SL target against CX impact curve',
      'Invest in forecasting accuracy first',
      'Consider interval-level SL rather than daily average',
      'Balance SL with cost constraints explicitly'
    ]
  },

  'reduce turnover': {
    intervention: 'Reduce Agent Turnover',
    impacts: {
      CX: {
        direction: 'positive',
        magnitude: 'Moderate to High',
        mechanism: 'More experienced agents, better quality, higher FCR'
      },
      COST: {
        direction: 'positive',
        magnitude: 'High ($3-5K per point of turnover)',
        mechanism: 'Reduced hiring, training, and productivity loss costs'
      },
      EX: {
        direction: 'positive',
        magnitude: 'High',
        mechanism: 'Stable teams, better culture, more development'
      }
    },
    risks: [
      'Short-term cost increase if investing in pay/benefits',
      'May retain wrong performers if not targeted',
      'Cultural change takes time to show results'
    ],
    recommendations: [
      'Identify root causes before interventions',
      'Focus on first-year attrition (highest ROI)',
      'Address both compensation and non-compensation factors',
      'Track cohort-based turnover for accurate measurement'
    ]
  },

  'improve fcr': {
    intervention: 'Improve First Contact Resolution',
    impacts: {
      CX: {
        direction: 'positive',
        magnitude: 'Very High (1.5-2x multiplier on CSAT)',
        mechanism: 'Issue resolved without callback effort'
      },
      COST: {
        direction: 'positive',
        magnitude: 'Moderate (1-2% volume reduction per FCR point)',
        mechanism: 'Fewer repeat contacts, lower total volume'
      },
      EX: {
        direction: 'varies',
        magnitude: 'Depends on implementation',
        mechanism: 'Empowerment is positive. Expanded scope without support is negative.'
      }
    },
    risks: [
      'AHT increase if agents taking more time',
      'Scope creep if FCR definition expands',
      'Measurement challenges (how to define FCR)',
      'Agent burden if not given proper tools/authority'
    ],
    recommendations: [
      'Define FCR consistently and measurably',
      'Empower agents with authority to resolve',
      'Provide tools and knowledge for resolution',
      'Accept potential AHT increase as worthwhile'
    ]
  },

  'cut costs': {
    intervention: 'General Cost Reduction',
    impacts: {
      CX: {
        direction: 'negative',
        magnitude: 'Moderate to High',
        mechanism: 'Less staff, longer waits, less experienced agents'
      },
      COST: {
        direction: 'positive',
        magnitude: 'Direct target',
        mechanism: 'Reduced labor, technology, or overhead'
      },
      EX: {
        direction: 'negative',
        magnitude: 'High',
        mechanism: 'Fewer resources, more pressure, job insecurity'
      }
    },
    risks: [
      'Quality spiral: cuts → worse service → more contacts → more cuts',
      'Turnover spike negating savings',
      'Customer defection if service degrades',
      'Brand damage from poor service'
    ],
    recommendations: [
      'Identify efficiency gains before headcount cuts',
      'Set explicit CX/EX guardrails',
      'Monitor leading indicators closely',
      'Consider phased approach with checkpoints'
    ]
  }
};

function findIntervention(query: string): TradeoffResult | null {
  const normalized = query.toLowerCase();

  for (const [pattern, result] of Object.entries(INTERVENTION_PATTERNS)) {
    if (normalized.includes(pattern)) {
      return result;
    }
  }

  // Additional pattern matching
  if (normalized.includes('aht') || normalized.includes('handle time')) {
    return INTERVENTION_PATTERNS['reduce aht'];
  }
  if (normalized.includes('occupancy') || normalized.includes('utilization')) {
    return INTERVENTION_PATTERNS['increase occupancy'];
  }
  if (normalized.includes('sl') || normalized.includes('service level') || normalized.includes('asa')) {
    return INTERVENTION_PATTERNS['improve service level'];
  }
  if (normalized.includes('turnover') || normalized.includes('attrition') || normalized.includes('retention')) {
    return INTERVENTION_PATTERNS['reduce turnover'];
  }
  if (normalized.includes('fcr') || normalized.includes('resolution')) {
    return INTERVENTION_PATTERNS['improve fcr'];
  }
  if (normalized.includes('cost') || normalized.includes('reduce') || normalized.includes('cut')) {
    return INTERVENTION_PATTERNS['cut costs'];
  }

  return null;
}

function formatDirection(dir: string): string {
  switch (dir) {
    case 'positive': return '↑ Positive';
    case 'negative': return '↓ Negative';
    case 'neutral': return '→ Neutral';
    case 'varies': return '↔ Varies';
    default: return dir;
  }
}

function printAnalysis(result: TradeoffResult): void {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log(`║  TRADEOFF ANALYSIS: ${result.intervention.padEnd(42)} ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');

  console.log('║                                                                ║');
  console.log('║  IMPACT MATRIX                                                 ║');
  console.log('║  ─────────────                                                 ║');

  // CX
  console.log('║                                                                ║');
  console.log(`║  🎯 CX (Customer Experience)                                   ║`);
  console.log(`║     Direction: ${formatDirection(result.impacts.CX.direction).padEnd(47)} ║`);
  console.log(`║     Magnitude: ${result.impacts.CX.magnitude.substring(0, 47).padEnd(47)} ║`);

  // COST
  console.log('║                                                                ║');
  console.log(`║  💰 COST (Financial)                                           ║`);
  console.log(`║     Direction: ${formatDirection(result.impacts.COST.direction).padEnd(47)} ║`);
  console.log(`║     Magnitude: ${result.impacts.COST.magnitude.substring(0, 47).padEnd(47)} ║`);

  // EX
  console.log('║                                                                ║');
  console.log(`║  👤 EX (Employee Experience)                                   ║`);
  console.log(`║     Direction: ${formatDirection(result.impacts.EX.direction).padEnd(47)} ║`);
  console.log(`║     Magnitude: ${result.impacts.EX.magnitude.substring(0, 47).padEnd(47)} ║`);

  console.log('║                                                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  ⚠️  RISKS                                                      ║');
  result.risks.forEach(risk => {
    console.log(`║  • ${risk.substring(0, 60).padEnd(60)} ║`);
  });

  console.log('║                                                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  ✅ RECOMMENDATIONS                                            ║');
  result.recommendations.forEach(rec => {
    console.log(`║  • ${rec.substring(0, 60).padEnd(60)} ║`);
  });

  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

function printHelp(): void {
  console.log(`
TradeoffAnalyzer - Analyze CX/COST/EX tradeoffs for interventions

Usage:
  bun run TradeoffAnalyzer.ts "reduce AHT by 15%"
  bun run TradeoffAnalyzer.ts --list

Supported Interventions:
  - reduce aht / handle time
  - increase occupancy / utilization
  - improve service level / SL / ASA
  - reduce turnover / attrition
  - improve fcr / resolution
  - cut costs / reduce costs

Example:
  bun run TradeoffAnalyzer.ts "what if we increase occupancy to 90%"
`);
}

function listInterventions(): void {
  console.log('\n📊 Available Intervention Analyses\n');

  for (const [pattern, result] of Object.entries(INTERVENTION_PATTERNS)) {
    console.log(`\n▸ ${result.intervention}`);
    console.log(`  Pattern: "${pattern}"`);
    console.log(`  CX: ${formatDirection(result.impacts.CX.direction)} | COST: ${formatDirection(result.impacts.COST.direction)} | EX: ${formatDirection(result.impacts.EX.direction)}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    printHelp();
    return;
  }

  if (args[0] === '--list') {
    listInterventions();
    return;
  }

  const query = args.join(' ').replace('--intervention', '').trim();
  const result = findIntervention(query);

  if (result) {
    printAnalysis(result);
  } else {
    console.log(`\n⚠️  No matching intervention pattern found for: "${query}"`);
    console.log('\nTry one of these patterns:');
    listInterventions();
  }
}

main();
