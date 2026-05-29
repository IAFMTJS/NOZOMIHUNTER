# Mode differentiation matrix (GDD Vol 2–3)

| Mode | Emotion | Unique mechanic hook | System owner |
|------|---------|----------------------|--------------|
| Training arcade | Discipline / Dopamine | Combo decay, `ArcadeSessionHud`, timed pressure | `arcadeSessionPresentationSystem` |
| TERMINAL_BREACH | Curiosity | Environmental signage reading, alarm counter | `terminalBreachEncounter` |
| GHOST_INTERROGATION / DEEP_COVER | Social pressure | Branch + panic timer | `conversationEncounterSystem` |
| CORRUPTION_RUN / VOID_PURSUIT | Stress | Pursuit distance / endless sector meters | `explorationSystem`, dungeon shell |
| ENTITY_HUNT / SEMANTIC_NETWORK | Discovery | Threat index + semantic graph | `entityHuntSystem`, semantic network |
| Dungeons V2 | Survival | Route choice consequences, corruption bands | `dungeonThreatSystem`, `corruptionPresentationSystem` |

Identity test: each mode must expose at least one mechanic not reducible to “submit English gloss for Japanese token” without mode-specific UI or state.
