# Game Feel — Ceremony & Reward Flows

Maps [docs/nozomi-hunter-ui-gamefeel-progression-feedback.md](../docs/nozomi-hunter-ui-gamefeel-progression-feedback.md) to implementation.

Contract defaults: [contracts/presentation-contract.ts](../contracts/presentation-contract.ts) (`ENCOUNTER_FEEDBACK_BY_CHANNEL`, ceremony tiers).

## Level up

| Step | Component | System |
|------|-----------|--------|
| Freeze + burst | `LevelUpCeremony` + `momentFreezeSystem` | `levelUpCeremonyData`, `levelPresentationSystem` |
| Slam overlay | `CeremonyOverlay` `intensity="slam"` | CSS `.nozomi-ceremony-overlay--slam` |
| Stat / unlock reveal | `LevelUpCeremony` | `usePlayerStore.levelUpCeremony` |
| Haptics | `hapticsSystem` | level-up pulse |
| Fallback toast | `ReactiveFeedbackHost` | suppressed when ceremony active |

Shell: `HunterSessionContext`.

## Dungeon clear (in-run)

| Step | Component | System |
|------|-----------|--------|
| Boss collapse | `BossCollapsePhase` | theme CSS (`nozomi-boss-collapse--*`) |
| Freeze + haptics | `momentFreezeSystem`, `hapticsSystem` | before results |
| Slam + rewards | `DungeonClearCeremonyFlow` → `DungeonClearCeremony` | `dungeonClearCeremonyData` |
| XP aftermath | `XPBar` in flow | projected level progress |
| Sequential items | `SequentialRewardReveal` | `rewardRevealSequence` |

Shell: `DungeonRunner` → `EXTRACTION`.

## Dungeon in-run encounter feedback

| Layer | Path |
|-------|------|
| Provider | `EncounterFeedbackProvider` on `DungeonRunner` in-run shell |
| Bridge | `EncounterFeedbackBridge` |
| Audio/freeze | `EncounterFeedbackContext` consumes `orchestrateEncounterFeedback` (`playAudioCues`, `triggerMomentFreeze`) |
| Global bus | `registerAudioHandlers` — no duplicate encounter answer audio |

## Quest / gate completion (pending rewards)

| Tier | UI shell | Reveal |
|------|----------|--------|
| `light` (DAILY) | `RewardClaimOverlay` `.nozomi-reward-tier--light` | instant pop |
| `medium` (SIDE) | `.nozomi-reward-tier--medium` | sequential |
| `full` (MAIN) | `.nozomi-reward-tier--full` + heavy backdrop | sequential |
| `dungeon` | `GateClearedScreen` + heavy backdrop | sequential |

Resolver: `completionCeremonyTierSystem` ← `quest.narrativeTier` + dungeon flag.

## Achievement unlock

| Step | Component | System |
|------|-----------|--------|
| Detect delta | `detectNewAchievements` | compares player snapshots |
| Event | `ACHIEVEMENT_UNLOCKED` | `event-contract` |
| Ceremony | `AchievementUnlockCeremony` `intensity="slam"` + 280ms freeze | |
| Audio | `achievement` cue | ceremony + `registerAudioHandlers` noop |

Shell: `HunterSessionContext` (queue).

## Mastery tier-up

| Step | Component | System |
|------|-----------|--------|
| Emit | `MASTERY_TIER_UP` | `masterySystem.recordWordAnswer` |
| Ceremony | `MasteryTierUpCeremony` | 180ms freeze, below achievement intensity |
| Queue | `HunterSessionContext` | after achievement queue drains |

## Encounter feedback (quests + training + dungeon)

| Layer | Path |
|-------|------|
| Orchestrator | `encounterFeedbackOrchestrator.ts` |
| Provider | `EncounterFeedbackProvider` + `EncounterFeedbackBridge` |
| Visual | `EncounterImpactLayer` |
| Shells | `EncounterRouter`, `DungeonRunner` (in-run) |

Events: `ENCOUNTER_ANSWER_CORRECT`, `ENCOUNTER_ANSWER_WRONG` — cues via provider (not global handlers).

## Training mini-games

| Mode | System | UI | Action channel |
|------|--------|-----|----------------|
| Echo Listening | `echoListeningSystem` | `EchoListeningEncounter` | `echo-heard`, `echo-chunk`, `echo-submit` |
| Memory Grid | `memoryGridSystem` | `MemoryGridEncounter` | `memory-grid-flip` |
| Shadow Typing | `shadowTypingSystem` | `ShadowTypingEncounter` | vocab submit + decay TTL |
| Survival Vocab | `survivalVocabSystem` | `SurvivalVocabEncounter` | vocab submit, `maxWrongAttempts: 1` |

## Card hierarchy (channels)

| Channel | Card |
|---------|------|
| Daily contracts | `RoutineCard` |
| Side contracts | `OperativeCard` |
| Dungeons list | `SectorCard` |
| Vocabulary index | `ThreatCard` + mastery classes |
| Training arcade | `ArcadeCard` |

## Ceremony intensity order (player-facing)

daily claim < side claim < story claim < mastery tier < achievement < dungeon clear < level-up
