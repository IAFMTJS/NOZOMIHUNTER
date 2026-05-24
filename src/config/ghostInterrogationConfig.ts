export const GHOST_INTERROGATION_CHOICES = [
  {
    id: "calm",
    label: "Request clarification — neutral tone",
    implication: "状況を説明してください (joukyou wo setsumei shite kudasai)",
  },
  {
    id: "pressure",
    label: "Apply pressure — demand truth",
    implication: "本当のことを話してください (hontou no koto wo hanashite kudasai)",
  },
  {
    id: "empathy",
    label: "Offer reassurance — lower tension",
    implication: "大丈夫です。落ち着いてください (daijoubu desu. ochitsuite kudasai)",
  },
] as const
