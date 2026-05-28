# NOZOMI HUNTER - FULL PAGE-BY-PAGE UX / GAMEPLAY / LEARNING REVIEW
## Based On Real Screens & User Testing Feedback

**Remediation status:** see [`ux-audit-status.md`](ux-audit-status.md) (v1.5.0).

---

# OVERVIEW

The app already succeeds at:
- visual atmosphere
- cyberpunk identity
- immersive terminology
- futuristic presentation
- mobile-first visual direction

The aesthetic layer is strong.

The problem is the gameplay and learning systems underneath are often:
- cosmetic
- fake-interactive
- mechanically shallow
- leaking answers
- removing memory pressure
- functioning like decorated forms

The app LOOKS like:
> a Japanese-learning dungeon crawler RPG

But many mechanics currently FUNCTION like:
> neon flashcards with next buttons.

That disconnect becomes obvious quickly during usage.

This document explains:
- exact page problems
- exact gameplay issues
- exact UX issues
- exact learning failures
- exact immersion breaks
- exact technical concerns
- exact system redesign recommendations

---

# GLOBAL CORE ISSUE

## THE APP CURRENTLY REWARDS RECOGNITION MORE THAN RECALL

Recognition:
> “I saw this before.”

Recall:
> “I can retrieve this from memory.”

Language learning depends heavily on recall.

Right now many systems show:
- kanji
- kana
- romaji
- English

simultaneously.

This removes:
- challenge
- retrieval
- memory strain
- immersion
- progression feeling

The player stops THINKING and starts visually scanning for the answer.

That weakens:
- retention
- satisfaction
- mastery

---

# GLOBAL REQUIRED FIX
# DYNAMIC INFORMATION MASKING SYSTEM

---

# CORE RULE

During active challenges:

NEVER show:
- kanji
- romaji
- English

all together.

The system must dynamically decide what information is visible depending on:
- challenge type
- difficulty
- mastery
- player level
- dungeon modifiers
- assist settings

---

# REQUIRED DISPLAY LOGIC

---

## IF QUESTION EXPECTS ENGLISH

### SHOW:
```text
勝利
shouri
```

### HIDE:
```text
victory
```

Because:
player must retrieve English meaning.

---

## IF QUESTION EXPECTS JAPANESE

### SHOW:
```text
victory
```

### HIDE:
```text
勝利
shouri
```

Because:
player must retrieve Japanese.

---

# IMPORTANT DESIGN RULE

Allowed:
- Kanji + Romaji

OR:
- English

NOT:
- Kanji + Romaji + English together

during challenge states.

---

# WHY THIS MATTERS

Current behavior creates:
> “visual matching”

instead of:
> “language retrieval.”

The difference is enormous.

---

# PAGE: VOCAB CONTRACT / ARCHIVE RECOVERY
## Vocabulary Recovery Mission

### Screenshot Context
Mission page showing:
- vocabulary recovery
- answer chips
- transmit system
- contract progression
- target lock

---

# CURRENT ISSUES

---

# ISSUE 1: ANSWER LEAKING

## Current Example

```text
勝利
しょうり
shouri
victory
```

Then the game asks:
- meaning
- translation
- recognition

Problem:
the answer is already visible.

The player does not need:
- recall
- memory
- interpretation
- understanding

Only recognition.

---

# REQUIRED FIX

Apply:
# Dynamic Information Masking System

---

# ISSUE 2: ANSWER CHIPS DESTROY CHALLENGE

## Current

```text
危険 • kiken • danger
```

This instantly reveals:
- pronunciation
- meaning
- kanji

at once.

Result:
no memory pressure exists.

---

# REQUIRED FIX

## CHALLENGE MODE RULE

Only ONE information layer may be visible.

---

## EXAMPLE 1

### SHOW:
```text
危険 • kiken
```

### HIDE:
```text
danger
```

---

## EXAMPLE 2

### SHOW:
```text
danger
```

### HIDE:
```text
危険 • kiken
```

---

# ISSUE 3: SPOILER CARD

## Current
Bottom reveal card instantly displays:
- kanji
- kana
- meaning

before answer submission.

This completely destroys suspense and learning pressure.

---

# REQUIRED FIX

Before solving:
- blurred
- glitched
- encrypted
- static-corrupted
- hidden

After solving:
reveal information dramatically.

---

# ISSUE 4: FLEXIBLE ANSWER FORMAT WEAKENS LEARNING

## Current

```text
Transmit answer (romaji or English)
```

This lets players bypass challenge.

Players naturally choose easiest mode.

---

# REQUIRED FIX

Separate answer modes:
- English only
- Kana only
- Japanese only
- Romaji only

Difficulty determines allowed inputs.

---

# ISSUE 5: TARGET LOCK SYSTEM HAS NO REAL TENSION

## Current
“Target lock 4/5”
exists visually.

But:
- no pressure
- no corruption
- no timer
- no punishment escalation

---

# REQUIRED FIX

Target lock should affect:
- dungeon corruption
- signal stability
- reward multiplier
- enemy aggression
- combo system

---

# EXAMPLE

Wrong answers:
```text
Signal corruption rising...
```

Perfect streak:
```text
Channel stabilized.
XP multiplier increased.
```

Now the mechanic matters emotionally.

---

# PAGE: SIGNAL DRILL / AUDIO INTERCEPT
## Listening Mission

### Screenshot Context
Listening mission with:
- giant microphone
- waveform
- audio intercept
- station intercept

---

# CURRENT ISSUES

---

# ISSUE 1: MICROPHONE LOOKS INTERACTIVE BUT ISN’T

The microphone visually implies:
- tap interaction
- replay functionality
- voice activity
- audio control

But:
- no meaningful response
- unclear behavior
- fake affordance

This breaks trust immediately.

---

# REQUIRED FIX

Mic interaction should:
- replay audio
- animate waveform
- pulse glow
- trigger haptics
- visually respond

The UI must feel alive.

---

# ISSUE 2: LISTENING SYSTEM IS NOT REAL LISTENING

## Current

The page already reveals:

```text
光
ひかり
```

before the player even listens.

Meaning:
the player is not practicing listening.

They are reading.

---

# REQUIRED FIX

---

# INITIAL STATE

### SHOW:
- waveform
- static
- signal corruption
- audio controls

### HIDE:
- kanji
- kana
- romaji
- English

---

# PLAYER LISTENS

Audio plays:
```text
ひかり
```

---

# PLAYER RESPONDS

Via:
- typing
- multiple choice
- speech
- kana input

---

# AFTER SUCCESS

Reveal:
```text
光
ひかり
hikari
light
```

ONLY after challenge completion.

---

# ISSUE 3: LISTENING PAGE LACKS GAMEPLAY

Currently:
- audio exists visually
- but not mechanically

---

# REQUIRED MECHANICS

Listening page should include:
- replay limits
- signal distortion
- hidden clues
- timing pressure
- confidence meter
- corruption penalties

---

# EXAMPLE

Replaying audio repeatedly:
```text
Signal degrading...
```

Now replaying becomes strategic.

---

# PAGE: ECHO HUNT / SPEECH SYSTEM
## Voice Recognition Mission

### Screenshot Context
Page with:
- speech recognition
- transmit voice
- romaji/Japanese toggles
- typed fallback

---

# CURRENT ISSUES

---

# ISSUE 1: JAPANESE SPEECH RECOGNITION FAILS

Likely causes:
- wrong recognition locale
- English speech model
- no kana normalization
- Safari/iOS limitations

---

# REQUIRED FIX

---

## Correct Locale

```js
recognition.lang = 'ja-JP'
```

NOT:
```js
en-US
```

---

# ISSUE 2: NO NORMALIZATION SYSTEM

Speech recognition may return:
- kana
- kanji
- katakana

instead of romaji.

---

# REQUIRED FIX

Normalize ALL answer formats internally.

Example accepted answers:
```js
['風', 'かぜ', 'kaze']
```

All should validate successfully.

---

# ISSUE 3: UI LABELS ARE CONFUSING

## Current

```text
Romaji (en)
Japanese
```

This does not clearly explain:
- what the player should say
- what language is expected

---

# REQUIRED FIX

Replace with:

```text
Speak Japanese
```

OR:

```text
Speak English Meaning
```

---

# ISSUE 4: ANSWERS ARE STILL VISIBLE

## Current

The page already shows:
```text
風
かぜ
kaze
wind
```

before voice interaction.

So speech practice becomes:
> “read visible answer into microphone.”

---

# REQUIRED FIX

---

## SPEECH MODE

### SHOW:
```text
wind
```

### EXPECT PLAYER TO SAY:
```text
kaze
```

---

# AFTER VALIDATION

Reveal:
```text
風
かぜ
kaze
wind
```

---

# ISSUE 5: SAFARI / IOS SUPPORT

Speech APIs are unreliable on iOS.

You NEED:
- typed fallback
- unsupported warning
- graceful degradation

Otherwise:
users think your app is broken.

---

# PAGE: DUNGEON TRANSIT / HOLD CHANNEL
## Neon Corridor Dungeon Page

### Screenshot Context
Page containing:
- dungeon sectors
- scan system
- hold channel
- engage system
- progression phases

---

# CURRENT ISSUES

---

# ISSUE 1: HOLD CHANNEL BUTTON IS FAKE INTERACTION

## Current

Player presses:
```text
Hold Channel
```

and the screen simply advances.

---

# WHY THIS FAILS

The button visually promises:
- scanning
- listening
- interception
- investigation

But mechanically behaves like:
```js
nextScreen()
```

This destroys immersion very quickly.

---

# REQUIRED FIX

## HOLD CHANNEL MUST:
- freeze progression
- activate waveform
- play transmission audio
- reveal hidden clues
- trigger mini challenge
- intercept signal

ONLY AFTER completion:
unlock “Advance”.

---

# ISSUE 2: DUNGEON PHASES ARE MOSTLY COSMETIC

## Current Tabs
- Prep
- Transit
- Sector
- Boss
- Extract

Currently mostly visual labels.

---

# REQUIRED FIX

Each phase must meaningfully alter gameplay.

---

# PREP PHASE

Should include:
- boosters
- loadout
- hint modules
- consumables
- corruption resistance

---

# TRANSIT PHASE

Should include:
- environmental scanning
- clue gathering
- hidden transmissions
- memory setup

---

# SECTOR PHASE

Should include:
- active encounters
- vocabulary combat
- grammar traps
- timed events

---

# BOSS PHASE

Should include:
- cumulative challenge
- no hints
- pressure mechanics
- mixed learning systems

---

# EXTRACT PHASE

Should include:
- recap
- mastery summary
- lore rewards
- unlocks
- XP calculations

---

# ISSUE 3: TEXT OVERLAP BUGS

## Current Examples

```text
Hold ChannelListen
```

```text
AdvancePush forward
```

Indicates:
- flexbox issues
- overflow bugs
- mobile scaling issues
- absolute positioning conflicts

---

# REQUIRED FIX

Likely fix:

```css
flex-direction: column;
gap: 4px;
align-items: center;
```

instead of conflicting horizontal layouts.

---

# ISSUE 4: BUTTONS LACK CONSEQUENCES

Most dungeon buttons currently:
- advance screens
- but do not create gameplay

---

# REQUIRED PRINCIPLE

Every dungeon interaction should include at least ONE:
- clue
- risk
- timing mechanic
- puzzle
- corruption effect
- memory challenge
- audio interaction
- hidden consequence

Otherwise:
the dungeon becomes:
> “beautiful next buttons.”

---

# ISSUE 5: NO REAL AUDIO IMMERSION

The dungeon constantly references:
- channels
- transmissions
- signals
- static

But lacks meaningful sound design.

---

# REQUIRED AUDIO DESIGN

---

## Ambient Audio
- radio hiss
- neon hum
- static crackle
- distant announcements

---

## Interaction Audio
- signal locks
- corruption pulses
- scan pings
- decode sounds

---

## Gameplay Audio
- combo escalation
- corruption warnings
- enemy detection

Sound would massively increase immersion.

---

# PAGE: DIRECTOR COMMUNICATION / RESPONSE PAGE
## Dialogue Transmission System

### Screenshot Context
Page where Director asks:
```text
準備はいいですか？
```

and player responds manually.

---

# CURRENT ISSUES

---

# ISSUE 1: PLACEHOLDER CONTAINS ANSWER

## Current

```text
e.g. junbi dekite imasu...
```

This destroys:
- interpretation
- communication
- memory
- creativity

The player simply copies the placeholder.

---

# REQUIRED FIX

Placeholder must NEVER contain:
- exact answer
- full response
- translated solution

---

# ISSUE 2: DIALOGUE IS NOT REAL COMMUNICATION

Current dialogue system:
- only has one expected response
- no personality
- no variation
- no emotional pressure
- no roleplay

Feels like:
> filling a form

instead of:
> communicating under pressure.

---

# REQUIRED FIX

Allow:
- formal responses
- casual responses
- English
- hybrid Japanese/English
- partial responses

---

# EXAMPLE

Director says:
```text
Hunter. Are you prepared?
```

Possible valid replies:

```text
準備できています
```

```text
いけます
```

```text
Ready.
```

---

# RESULT

Different replies create:
- different reactions
- different XP
- style scoring
- immersion
- relationship shifts

---

# ISSUE 3: NO STORY CONSEQUENCES

Dialogue currently affects nothing.

---

# REQUIRED FIX

Dialogue responses should affect:
- corruption
- operator trust
- mission rewards
- hidden lore
- signal stability
- faction alignment

---

# ISSUE 4: DIALOGUE DOESN’T TEACH NATURAL LANGUAGE

Current system teaches:
> exact answer matching

instead of:
- expression
- interpretation
- communication

---

# REQUIRED FIX

Operators should have:
- unique speech styles
- different formality
- slang
- broken transmissions
- beginner-friendly kana
- military Japanese

This teaches:
- context
- tone
- speech patterns
- real usage

naturally through immersion.

---

# GLOBAL IMMERSION ISSUE

The app visually promises:
- infiltration
- tension
- signal warfare
- decoding
- cyberpunk investigation

But mechanically often behaves like:
- static forms
- visible-answer flashcards
- cosmetic transitions

---

# REQUIRED CORE PRINCIPLE

Every interaction should provide:
- decision-making
- memory pressure
- consequence
- information gain
- risk
- challenge
- immersion
- feedback

Otherwise:
players eventually realize:
> the app only advances screens.

And once that illusion breaks:
the atmosphere loses power very quickly.

---

# FINAL DIRECTION

The app should evolve from:
> “beautiful neon flashcards”

into:
> “immersive Japanese signal-hunting RPG.”

That requires:
- hidden information
- true recall systems
- meaningful interaction
- real gameplay mechanics
- adaptive dialogue
- audio immersion
- pressure systems
- consequence systems
- dynamic learning structures

Visually:
the project is already strong.

Mechanically:
the systems underneath now need to reach the same level.