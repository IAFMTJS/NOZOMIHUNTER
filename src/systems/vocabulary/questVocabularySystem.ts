export function extractQuestVocabulary(
  text: string
): string[] {

  return text
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean)
}