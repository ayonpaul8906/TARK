// lib/smolify.ts

type Mapping = Record<string, string>

export function runSmolify(input: string) {
  let sanitized = input
  const mapping: Mapping = {}

  let nameIndex = 1
  let accountIndex = 1
  let phoneIndex = 1
  let emailIndex = 1

  // Emails (global + case insensitive)
  sanitized = sanitized.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    (match) => {
      const tag = `[EMAIL_${emailIndex++}]`
      mapping[tag] = match
      return tag
    }
  )

  // Phone numbers
  sanitized = sanitized.replace(
    /\b\d{10}\b/g,
    (match) => {
      const tag = `[PHONE_${phoneIndex++}]`
      mapping[tag] = match
      return tag
    }
  )

  // Bank-like numbers
  sanitized = sanitized.replace(
    /\b\d{9,18}\b/g,
    (match) => {
      const tag = `[BANK_ACCT_${accountIndex++}]`
      mapping[tag] = match
      return tag
    }
  )

  // Names (basic heuristic)
  sanitized = sanitized.replace(
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
    (match) => {
      const tag = `[NAME_${nameIndex++}]`
      mapping[tag] = match
      return tag
    }
  )

  return { sanitizedText: sanitized, mapping }
}