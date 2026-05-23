export const SYNCHRONIZATION_CONFIG = {
  /** Discipline chain length → title unlock key */
  MILESTONES: [
    { days: 3, unlock: "title:discipline-3" },
    { days: 7, unlock: "title:discipline-7" },
    { days: 14, unlock: "title:discipline-14" },
  ],
  /** Days without activity before chain reads as broken */
  BREAK_AFTER_DAYS: 2,
} as const
