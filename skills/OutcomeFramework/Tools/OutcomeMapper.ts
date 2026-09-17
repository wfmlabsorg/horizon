#!/usr/bin/env bun
/**
 * OutcomeMapper - Classify factors to CX/COST/EX outcome domains
 *
 * Usage:
 *   bun run OutcomeMapper.ts "Average Handle Time"
 *   bun run OutcomeMapper.ts --batch factors.json
 *   bun run OutcomeMapper.ts --list
 */

interface OutcomeMapping {
  factor: string;
  primary: 'CX' | 'COST' | 'EX';
  secondary?: ('CX' | 'COST' | 'EX')[];
  direction: string;
  mechanism: string;
  confidence: 'High' | 'Medium' | 'Low';
}

// Pre-defined factor mappings
const FACTOR_DATABASE: Record<string, Omit<OutcomeMapping, 'factor'>> = {
  // CX Primary
  'service level': {
    primary: 'CX',
    secondary: ['COST', 'EX'],
    direction: 'Higher = Better CX',
    mechanism: 'Direct customer wait experience',
    confidence: 'High'
  },
  'average speed of answer': {
    primary: 'CX',
    secondary: ['COST'],
    direction: 'Lower = Better',
    mechanism: 'Customer wait time before connection',
    confidence: 'High'
  },
  'first contact resolution': {
    primary: 'CX',
    secondary: ['COST'],
    direction: 'Higher = Better',
    mechanism: 'Issue resolved without repeat contact',
    confidence: 'High'
  },
  'fcr': {
    primary: 'CX',
    secondary: ['COST'],
    direction: 'Higher = Better',
    mechanism: 'Issue resolved without repeat contact',
    confidence: 'High'
  },
  'csat': {
    primary: 'CX',
    direction: 'Higher = Better',
    mechanism: 'Direct customer satisfaction measure',
    confidence: 'High'
  },
  'nps': {
    primary: 'CX',
    direction: 'Higher = Better',
    mechanism: 'Customer loyalty/advocacy indicator',
    confidence: 'High'
  },
  'abandon rate': {
    primary: 'CX',
    secondary: ['COST'],
    direction: 'Lower = Better',
    mechanism: 'Failed service attempts',
    confidence: 'High'
  },
  'transfer rate': {
    primary: 'CX',
    secondary: ['COST'],
    direction: 'Lower = Better',
    mechanism: 'Customer friction from handoffs',
    confidence: 'High'
  },
  'quality score': {
    primary: 'CX',
    secondary: ['EX'],
    direction: 'Higher = Better',
    mechanism: 'Interaction quality assessment',
    confidence: 'Medium'
  },

  // COST Primary
  'average handle time': {
    primary: 'COST',
    secondary: ['CX', 'EX'],
    direction: 'Context-dependent',
    mechanism: 'Primary driver of staffing requirements',
    confidence: 'High'
  },
  'aht': {
    primary: 'COST',
    secondary: ['CX', 'EX'],
    direction: 'Context-dependent',
    mechanism: 'Primary driver of staffing requirements',
    confidence: 'High'
  },
  'after call work': {
    primary: 'COST',
    secondary: ['EX'],
    direction: 'Lower = Better (usually)',
    mechanism: 'Non-talk time reducing productivity',
    confidence: 'High'
  },
  'acw': {
    primary: 'COST',
    secondary: ['EX'],
    direction: 'Lower = Better (usually)',
    mechanism: 'Non-talk time reducing productivity',
    confidence: 'High'
  },
  'occupancy': {
    primary: 'COST',
    secondary: ['EX'],
    direction: 'Optimal range 80-85%',
    mechanism: 'Utilization vs burnout balance',
    confidence: 'High'
  },
  'shrinkage': {
    primary: 'COST',
    secondary: ['EX'],
    direction: 'Lower = Better (within reason)',
    mechanism: 'Non-productive paid time',
    confidence: 'High'
  },
  'schedule adherence': {
    primary: 'COST',
    secondary: ['EX'],
    direction: 'Higher = Better',
    mechanism: 'Staffing predictability',
    confidence: 'High'
  },
  'cost per contact': {
    primary: 'COST',
    direction: 'Lower = Better',
    mechanism: 'Primary efficiency measure',
    confidence: 'High'
  },
  'fte': {
    primary: 'COST',
    direction: 'Lower = Better (at same service)',
    mechanism: 'Direct labor cost driver',
    confidence: 'High'
  },
  'overtime': {
    primary: 'COST',
    secondary: ['EX'],
    direction: 'Lower = Better',
    mechanism: 'Premium labor cost and agent burden',
    confidence: 'High'
  },

  // EX Primary
  'turnover': {
    primary: 'EX',
    secondary: ['COST', 'CX'],
    direction: 'Lower = Better',
    mechanism: 'Agent retention and experience',
    confidence: 'High'
  },
  'attrition': {
    primary: 'EX',
    secondary: ['COST', 'CX'],
    direction: 'Lower = Better',
    mechanism: 'Agent retention and experience',
    confidence: 'High'
  },
  'enps': {
    primary: 'EX',
    direction: 'Higher = Better',
    mechanism: 'Employee advocacy/engagement',
    confidence: 'Medium'
  },
  'absenteeism': {
    primary: 'EX',
    secondary: ['COST'],
    direction: 'Lower = Better',
    mechanism: 'Engagement and wellbeing indicator',
    confidence: 'High'
  },
  'tenure': {
    primary: 'EX',
    secondary: ['CX', 'COST'],
    direction: 'Higher = Better',
    mechanism: 'Experience and stability',
    confidence: 'High'
  },
  'training hours': {
    primary: 'EX',
    secondary: ['CX', 'COST'],
    direction: 'Context-dependent',
    mechanism: 'Development investment',
    confidence: 'Medium'
  },
  'coaching hours': {
    primary: 'EX',
    secondary: ['CX'],
    direction: 'Higher = Better (within reason)',
    mechanism: 'Individual development attention',
    confidence: 'Medium'
  },
  'schedule satisfaction': {
    primary: 'EX',
    direction: 'Higher = Better',
    mechanism: 'Work-life balance indicator',
    confidence: 'Medium'
  }
};

function normalizeFactor(factor: string): string {
  return factor.toLowerCase().trim();
}

function classifyFactor(factor: string): OutcomeMapping | null {
  const normalized = normalizeFactor(factor);
  const mapping = FACTOR_DATABASE[normalized];

  if (mapping) {
    return { factor, ...mapping };
  }

  // Try partial matching
  for (const [key, value] of Object.entries(FACTOR_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { factor, ...value };
    }
  }

  return null;
}

function printMapping(mapping: OutcomeMapping): void {
  console.log('\n┌────────────────────────────────────────────────┐');
  console.log(`│ Factor: ${mapping.factor.padEnd(38)} │`);
  console.log('├────────────────────────────────────────────────┤');
  console.log(`│ Primary:    ${mapping.primary.padEnd(35)} │`);
  if (mapping.secondary?.length) {
    console.log(`│ Secondary:  ${mapping.secondary.join(', ').padEnd(35)} │`);
  }
  console.log(`│ Direction:  ${mapping.direction.padEnd(35)} │`);
  console.log(`│ Mechanism:  ${mapping.mechanism.substring(0, 35).padEnd(35)} │`);
  console.log(`│ Confidence: ${mapping.confidence.padEnd(35)} │`);
  console.log('└────────────────────────────────────────────────┘');
}

function listFactors(): void {
  console.log('\n📊 Known Factors in OutcomeFramework\n');

  const byDomain = { CX: [] as string[], COST: [] as string[], EX: [] as string[] };

  for (const [factor, mapping] of Object.entries(FACTOR_DATABASE)) {
    byDomain[mapping.primary].push(factor);
  }

  console.log('🎯 CX (Customer Experience)');
  byDomain.CX.forEach(f => console.log(`   - ${f}`));

  console.log('\n💰 COST (Financial)');
  byDomain.COST.forEach(f => console.log(`   - ${f}`));

  console.log('\n👤 EX (Employee Experience)');
  byDomain.EX.forEach(f => console.log(`   - ${f}`));
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  bun run OutcomeMapper.ts "factor name"');
    console.log('  bun run OutcomeMapper.ts --list');
    console.log('  bun run OutcomeMapper.ts --batch factors.json');
    process.exit(1);
  }

  if (args[0] === '--list') {
    listFactors();
    return;
  }

  if (args[0] === '--batch' && args[1]) {
    const file = Bun.file(args[1]);
    const factors: string[] = await file.json();

    console.log('\n📊 Batch Classification Results\n');
    console.log('| Factor | Primary | Secondary | Confidence |');
    console.log('|--------|---------|-----------|------------|');

    for (const factor of factors) {
      const mapping = classifyFactor(factor);
      if (mapping) {
        const secondary = mapping.secondary?.join(', ') || '—';
        console.log(`| ${factor} | ${mapping.primary} | ${secondary} | ${mapping.confidence} |`);
      } else {
        console.log(`| ${factor} | UNKNOWN | — | — |`);
      }
    }
    return;
  }

  // Single factor classification
  const factor = args.join(' ');
  const mapping = classifyFactor(factor);

  if (mapping) {
    printMapping(mapping);
  } else {
    console.log(`\n⚠️  Factor "${factor}" not found in database.`);
    console.log('\nTo classify manually, consider:');
    console.log('1. Does it directly affect customer experience? → CX');
    console.log('2. Does it directly affect cost/efficiency? → COST');
    console.log('3. Does it directly affect agent wellbeing? → EX');
    console.log('\nRun with --list to see known factors.');
  }
}

main();
