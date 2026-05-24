# Current Architecture



Last updated: v1.2.1 — shop & economy expansion



## Implemented



| Layer | Status |

|-------|--------|

| Next.js App Router | Yes |

| Folder structure | Yes |

| Contracts | `/contracts` (incl. `economy-contract`, `readiness-contract`) |

| Event bus + analytics buffer | `src/systems/events`, `src/systems/analytics` |

| Auth (Google + guest + email) | Yes |

| DB migrations 001–013 | Yes (013 = server completion boosts, catalog effect metadata) |

| Progression systems | Yes (XP via `complete_quest_guarded`; autosave uses strict `apply_guarded_progression`) |

| Player store | Yes (`economy`, `inventory`, `trackedQuestId`, `pendingRewards`, `identity`, `synchronization`) |

| Quest system (vocabulary + conversation + speech + listening/TTS) | Yes |

| Mobile shell (`HunterShellLayout`, `BottomNav`, `(hunter)` routes) | Yes |

| Session layer (`HunterSessionProvider`, `EncounterHost`, `RewardClaimOverlay`) | Yes |

| Command node hub (`features/hub/ContractHub` — split menu/hunt/dispatch/sector views) | Yes |

| Economy (stamina, credits, brew, inventory, shop, pending rewards, boosts) | Yes — migrations 006–013; completion rewards server-authoritative |
| Credits shop + black market rotation + XP conversion + consumable boosts | Yes (`shopSystem`, `boostSystem`, `/inventory` Loadout+Shop) |
| Deploy preparation gate | Yes (`/prepare` blocks on checklist + CRITICAL readiness) |

| Mission catalog + tracked mission | Yes (`missionCatalogSystem`, `missionTrackingSystem`) |

| Hunter power (stats + gear advisory) | Yes (`hunterPowerSystem`) |

| Preparation deploy gate (`/prepare`, ring gauge, checklist) | Yes |

| Vocabulary brew (`/vocabulary`, `brew_word_guarded`) | Yes |

| Vocabulary preparation briefing (pre-quest) | Yes |

| AI conversation (rule-based director) | Yes |

| UI kit (`Button`, `Panel`, `Input`, `EncounterFocusShell`, `HubScreenFrame`, preparation gauges) | Yes |

| Presentation (`penaltyPresentationSystem`, `hunterPresentationSystem`, motion tokens) | Yes |

| Audio (`audioSystem`, Web Audio cues via event bus, mute toggle) | Yes |

| Speech (recording state machine, MediaRecorder, browser STT, mobile gesture preflight) | Yes |

| Dungeons (Neon Corridor + Shadow Archive) | Yes |

| Unlock persistence + `UNLOCK_GRANTED` | Yes (`resolveQuestCompletion`) |

| Penalty gameplay hooks | Yes (`penaltyGameplaySystem`) |

| PWA (manifest, SW, install prompt) | Yes — see `docs/mobile-pwa.md` |

| Hunter profile (`/profile` in `(hunter)` group) | Yes — dossier, links to `/stats`, `/system` |

| Hunter identity + sync (codename, registry, discipline chain) | Yes — migration 005 |

| Readiness + dungeon forecast + system messaging | Yes |

| Multiplayer (Phase 6 scaffold) | Scaffold, flags off |



## App routes (`src/app`)



| Route | Purpose |

|-------|---------|

| `/` | Landing (`HomeTerminal`) |

| `/login` | Auth |

| `/home` | Command node hub (primary post-login) |

| `/contracts`, `/contracts/[id]` | Contract catalog + detail |

| `/dungeons`, `/dungeons/[key]` | Sector list + detail (stamina enter) |

| `/prepare` | Deploy gate (`questId` or `dungeonKey` query) |

| `/vocabulary`, `/vocabulary/[id]` | Brew + word detail |

| `/inventory` | Inventory grid |

| `/profile` | Hunter dossier menu |

| `/stats` | Operator metrics (power breakdown) |

| `/system` | System status rail |

| `/dashboard` | Redirect → `/home` |

| `/auth/callback` | OAuth/magic-link → `/home` |



Route group `(hunter)/layout.tsx` wraps authenticated pages in `HunterSessionProvider` (shell chrome, encounters, reward overlay, progression notices).



## Folder map



```txt

/contracts          — player, quest, dungeon, encounter, vocabulary, speech, ai, economy, readiness, …

/rules

/flows

/prompts

/docs

/supabase/migrations   — 001–008

/src/app

  (hunter)/            — tab shell routes

  dashboard/           — redirect shim

  login/, auth/callback/

/src/features

  auth, home, contracts, preparation, dungeons, quests, conversation, speech,

  vocabulary, inventory, hunter (session + EncounterHost), hub, profile, rewards, system

/src/systems

  events, analytics, progression, quests, penalties, penaltyGameplay, tutorial, save, antiExploit,

  ai, mastery, vocabulary, speech, dungeons, presentation, audio, listening,

  identity, synchronization, readiness, messaging, player, power, economy, inventory, rewards

/src/config

  unlockRegistry, dungeonConfig, penaltyConfig, staminaConfig, inventoryConfig, brewConfig,

  powerConfig, readinessConfig, hunterCodenames, vocabularyThreatMetadata, systemMessages, …

/src/services

  supabase (player, progression, economy, inventory, vocabulary, …), jmdict, dialogue, speech

/src/components

  ui, layout (HunterShellLayout, HunterPage, BottomNav, HubScreenFrame), preparation, hunter, dungeons

/src/hooks, /src/stores

/public/{icons,sw.js,audio}

```



## Core loop



Login → `/home` → Mission or Dungeon → `/prepare` (optional briefing) → Deploy sets `hubView` → Encounter overlay on `/contracts` or `/dungeons` only (`EncounterHost` / `ContractHub`) → guarded completion → `pendingRewards` claim → XP / unlocks → Save (Supabase)

`EncounterHost` does not replace tab routes: leaving `/contracts` | `/missions` | `/dungeons` resets `hubView` to `menu` so `/home`, `/inventory`, `/stats`, etc. render their page components.



## Environment



See `.env.example` and `DECISIONS.md`. Mobile dev: `npm run dev:mobile` (HTTPS on LAN). PWA install + SW: `docs/mobile-pwa.md`. Supabase migrations: `docs/supabase-setup.md`.



## Related docs



- Product / mockup mapping: `docs/reference-mockup-integration.md`, `docs/nozomi-product-spec.md`

- Terminology: `docs/terminology.md`

- Visual v2: `docs/visual-direction-v2.md`

- Navigation + economy flows: `flows/navigation-flow.md`, `flows/economy-flow.md`

