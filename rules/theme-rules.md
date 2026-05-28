# Theme & Color Mode Rules

NOZOMI supports **dark** and **light** color modes. Dark mode is the current default. Light mode tokens exist but are not yet wired to settings.

---

## Source of truth

| File | Purpose |
|------|---------|
| `src/styles/themes/dark.css` | All dark-mode color tokens (`[data-theme="dark"]`) |
| `src/styles/themes/light.css` | All light-mode color tokens (`[data-theme="light"]`) — must mirror dark keys |
| `src/styles/themes/presentation.css` | Atmospheric `.nozomi-*` utilities (`var(--*)` only) |
| `src/app/globals.css` | Layout, motion, typography imports |
| `src/styles/themeDefaults.ts` | PWA/OG hex only (sync with `--background` per mode) |

`html` carries `data-theme="dark"` | `data-theme="light"` (see `src/app/layout.tsx`).

---

## Mandatory rule for new UI

When adding or changing **anything that uses color** (button, page, panel, chip, shadow, gradient, SVG fill, Tailwind `bg-*` / `text-*` / `border-*`, inline `style`, config glow strings, PWA `theme_color`, etc.):

1. **Do not** hardcode hex/rgb/hsl in components or shared CSS.
2. **Do** use semantic CSS variables: `var(--accent)`, `var(--danger)`, `var(--overlay-subtle)`, etc.
3. **Do** add the token to **both** `dark.css` and `light.css` with the same variable name.
4. If a new semantic is needed (e.g. `--status-sync`), add it to both theme files before using it in UI.
5. For alpha variants, prefer existing `--*-a**` tokens or add a paired token in both theme files.

### Allowed exceptions (still document in PR)

- Temporary prototypes behind a feature flag (must be converted before merge).
- Third-party assets that cannot be themed.
- `theme_color` / manifest hex — keep in sync with `--background` for the active default mode.

### Forbidden

- `bg-white/5`, `text-[#7a5cff]`, `rgba(122, 92, 255, 0.12)` in TSX/TS unless mapping to a theme token.
- Adding a color only to `dark.css`.
- New colors only in `globals.css` `:root` (non-color tokens only in `:root`).

---

## Token naming

- **Semantic**: `--accent`, `--danger`, `--surface-2`, `--glow-reward`
- **RGB channel**: `--rgb-accent` (for rare custom alphas in presentation CSS only)
- **Alpha shorthand**: `--accent-a12` (= 12% accent)

---

## Presentation CSS

`presentation.css` uses only theme variables, so switching `data-theme` on `<html>` updates atmosphere automatically. Tune light values in `light.css` before enabling the settings toggle.

---

## Verification scripts

```bash
npm run check:theme
```

- `verify-theme-parity.mjs` — same token keys in `dark.css` and `light.css`
- `verify-no-hardcoded-ui-colors.mjs` — no `#hex` or `rgba(` in UI TS/TSX (theme files excluded)

After changing `presentation.css` literals, run `node scripts/apply-presentation-theme-vars.mjs`.

---

## Checklist (PR / review)

- [ ] `npm run check:theme` passes
- [ ] No new raw color literals in `src/features`, `src/components`, or `src/config`
- [ ] New/changed tokens exist in `dark.css` **and** `light.css`
- [ ] Overlays use `--overlay-subtle`, `--overlay-panel`, etc. (not `bg-white/5` / `bg-black/40`)
- [ ] UI still readable in dark mode (default)
- [ ] `rules/ui-rules.md` color section still accurate
