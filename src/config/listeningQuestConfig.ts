export const LISTENING_QUEST_CONFIG = {
  DEFAULT_FRAGMENT_COUNT: 3,
  TUTORIAL_FRAGMENT_COUNT: 2,
} as const

export const LISTENING_QUEST_VARIANTS = [
  {
    title: "Signal intercept",
    briefing:
      "Encrypted audio bleeds through the grid. Listen, then transmit the word you heard.",
  },
  {
    title: "Ghost frequency",
    briefing:
      "A phantom voice repeats one glyph at a time. Decode each transmission before the link decays.",
  },
  {
    title: "Static veil",
    briefing:
      "Noise hides a single word per burst. Catch each syllable before the channel flatlines.",
  },
  {
    title: "Archive whisper",
    briefing:
      "Cold storage bleeds half-heard Japanese. Log each fragment into the hunter registry.",
  },
] as const
