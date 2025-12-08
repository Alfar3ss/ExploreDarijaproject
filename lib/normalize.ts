export type OverrideMap = Record<string, string>

// Basic normalization for user input before sending to the model / doing lookups.
// - lowercase
// - collapse whitespace
// - remove surrounding punctuation
// - keep Arabic-ascii digits (3,7,2,5...) used in romanization
export function normalizeText(s: string) {
  if (!s) return s
  // trim, lowercase
  let t = String(s).trim().toLowerCase()
  // remove leading/trailing punctuation (keep letters, numbers, common marks)
  t = t.replace(/^[^0-9A-Za-z\u00C0-\u024F'’-]+|[^0-9A-Za-z\u00C0-\u024F'’-]+$/g, '')
  // collapse repeated non-word characters into single spaces
  t = t.replace(/[^0-9A-Za-z\u00C0-\u024F'’-\s]+/g, ' ').replace(/\s+/g, ' ')
  return t
}

// Apply a small override map for common romanization variants
export function applyOverrides(s: string, overrides: OverrideMap) {
  if (!s) return s
  const words = s.split(/\s+/)
  const mapped = words.map((w) => overrides[w] || w)
  return mapped.join(' ')
}

export const DEFAULT_OVERRIDES: OverrideMap = {
  // common variants
  'bosa': 'bousa',
  'bosa?': 'bousa',
  'bousa': 'bousa',
  'wafin': 'fin',
  'wfayn': 'fin',
  'wfin': 'fin',
  'fin?': 'fin',
  '3tini': '3tini',
  '3atini': '3tini',
  // small contractions
  'm3lich': 'm3lich',
}
