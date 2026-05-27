/** Curated meaning components for common radicals (glyph-fragment lore). */
const RADICAL_LORE: Record<string, string> = {
  "氵": "Water fragment — often marks liquid or flow-related kanji.",
  "火": "Fire fragment — heat, light, or combustion threads.",
  "木": "Wood fragment — trees, plants, or organic structures.",
  "金": "Metal fragment — ore, money, or hard materials.",
  "土": "Earth fragment — ground, soil, or territory.",
  "人": "Person fragment — human figures or social roles.",
  "心": "Heart fragment — emotion, mind, or inner state.",
  "口": "Mouth fragment — speech, openings, or entrances.",
  "手": "Hand fragment — action, skill, or manipulation.",
  "目": "Eye fragment — sight, observation, or appearance.",
  "言": "Speech fragment — language, words, or testimony.",
  "食": "Eat fragment — food, meals, or consumption.",
  "犬": "Dog fragment — animals, loyalty, or beasts.",
  "山": "Mountain fragment — peaks, geography, or scale.",
  "日": "Sun fragment — day, time, or solar imagery.",
  "月": "Moon fragment — month, body, or night cycles.",
  "車": "Vehicle fragment — wheels, transport, or machines.",
  "門": "Gate fragment — doors, thresholds, or domains.",
}

export function resolveRadicalNote(japanese: string): string | null {
  for (const char of japanese) {
    const note = RADICAL_LORE[char]
    if (note) return note
  }
  const firstKanji = [...japanese].find((ch) => /[\u4e00-\u9faf]/.test(ch))
  if (firstKanji && RADICAL_LORE[firstKanji]) {
    return RADICAL_LORE[firstKanji]
  }
  return null
}
