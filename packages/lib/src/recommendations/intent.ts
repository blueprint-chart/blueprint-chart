import type { Intent } from './types'

// Ordered by precedence: the first pattern that matches wins.
// range → composition-over-time → part-to-whole → ranking → trend → comparison.
const INTENT_RULES: ReadonlyArray<{ intent: Intent, pattern: RegExp }> = [
  { intent: 'range', pattern: /\b(range|high and low|high\/low|margin of error|confidence interval|confidence|interval|plus or minus|spread between)\b/i },
  { intent: 'composition-over-time', pattern: /(composition|mix|stacked|breakdown)[^.]*\b(over time|by year|by quarter|by month|by decade)\b|\b(over time|by year|by quarter|by month)\b[^.]*(composition|mix|breakdown)/i },
  { intent: 'part-to-whole', pattern: /\b(share|part[- ]to[- ]whole|proportion|percentage of (?:the )?total|% of (?:the )?total|makes? up|out of (?:the )?total|composition)\b/i },
  { intent: 'ranking', pattern: /\b(rank|ranked|ranking|top \d+|most|largest|biggest|highest|leading|fewest|smallest)\b/i },
  { intent: 'trend', pattern: /\b(over time|trend|grew|rose|fell|climbed|declined|increased?|decreased?|change over|year[- ]over[- ]year|overtak\w*|overtook|surpass\w*|crossover|diverg\w*)\b/i },
  { intent: 'comparison', pattern: /\b(compares?|compared|comparison|versus|vs\.?|more than|difference between|across|than)\b/i },
]

export function classifyIntent(goal?: string): Intent {
  if (goal === undefined || goal.trim() === '') {
    return 'none'
  }
  for (const rule of INTENT_RULES) {
    if (rule.pattern.test(goal)) {
      return rule.intent
    }
  }
  return 'none'
}
