# Portfolio Motion Animations — Design Spec

**Date:** 2026-06-02
**Status:** Approved (pending spec review)
**Scope:** Rework existing motion animations to match motion.dev references, add a free-motion cursor system, fix build blockers.

---

## 1. Goal

Bring the portfolio's animations in line with the referenced motion.dev examples, add interactive cursor effects, and fix the issues that currently break the production build.

The cursor examples on motion.dev use **Motion+** (a paid `<Cursor>` component). Decision: **rebuild equivalents with the free `motion` library already installed** — no new dependency, no license. The existing text-reveal / typewriter / ios-folder / ticker components are already free reimplementations and will be **re-tuned** to match the reference behavior.

## 2. Decisions (locked)

| Decision | Choice |
|----------|--------|
| Cursor implementation | Free rebuild with base `motion` (`useMotionValue` + `useSpring` + pointer events) |
| Cursor architecture | **Unified global cursor** — one `<CustomCursor>` at App root, targets opt in via `data-cursor*` attributes |
| Existing animations | Rework all four (typewriter, text-reveal/scroll-highlight, ios-folder, ticker) to match refs |
| Dependency fix | Migrate `framer-motion` imports → `motion/react` (the real declared dep) |

## 3. Necessary fixes (prerequisite)

### 3.1 Build blocker — `npm run build` currently fails
`tsc -b` errors on 6 unused locals (`noUnusedLocals`). Dev (vite) hides this; prod build is broken.

| File:line | Unused | Fix |
|-----------|--------|-----|
| `sections/Works.tsx:3` | `ProjectCarousel` | Remove import (or wire it — see 6.5) |
| `sections/Contact.tsx:3` | `Clock`, `Shield`, `Heart` | Remove from import |
| `sections/About.tsx:19` | `useRef` | Remove from import |
| `components/SkillFolder.tsx:49` | `i` | Drop unused map index |

### 3.2 Dependency mismatch
Every file imports `from "framer-motion"`, but `package.json` declares only `motion` ^12 — `framer-motion` resolves only as a transitive copy (fragile). **Fix:** repo-wide replace `from "framer-motion"` → `from "motion/react"` (~18 files). All hooks used (`motion`, `AnimatePresence`, `useScroll`, `useTransform`, `useMotionValue`, `useAnimationFrame`, `animate`, plus new `useSpring`, `useReducedMotion`) export from `motion/react`.

## 4. Cursor system architecture

### 4.1 Component
`components/CustomCursor.tsx` — mounted once in `App.tsx`, after content. Renders nothing when disabled (see 4.5).

### 4.2 Pointer tracking
- `x = useMotionValue(0)`, `y = useMotionValue(0)`; one `window` `pointermove` listener updates them (raw tip position).
- Follower position = `useSpring(x/y, { stiffness, damping })` → produces the lag/"follow" feel (cursor-follow example).
- Tip layer (optional small dot) can read raw values for an instant pointer; follower reads spring values.

### 4.3 Variant detection (the `data-cursor` contract)
On `pointermove`, resolve `e.target.closest('[data-cursor], [data-cursor-magnetic]')` and set state:

```ts
type CursorState =
  | { variant: "default" }
  | { variant: "label"; label: string }      // custom-content
  | { variant: "magnetic"; rect: DOMRect };   // floating-target
```

| Attribute | Effect | Maps to example |
|-----------|--------|-----------------|
| (none) | small dot following with spring | cursor-follow |
| `data-cursor="view"` / `data-cursor-label="View ↗"` | follower grows into a pill showing the label/icon | cursor-custom-content |
| `data-cursor="drag"` | follower shows drag affordance (↔ icon) | cursor-custom-content |
| `data-cursor-magnetic` | follower morphs (width/height/border-radius) to wrap the hovered element's bounding rect, centered on it | cursor-floating-target |

### 4.4 Rendering
- Fixed, `top:0 left:0`, `translate(x,y)` via motion style, `translate(-50%,-50%)` centering.
- `z-index: 9999`, `pointer-events: none`.
- `mix-blend-mode: difference` (optional) so the white follower stays visible over the dark aurora.
- Magnetic: animate `width/height/borderRadius` to target rect (spring); position to target center. On leave → spring back to dot.
- Label: `AnimatePresence` for label text swap; follower scale + padding animate in.

### 4.5 Guards (no cursor when inappropriate)
Disabled (component returns `null`, native cursor restored) when:
- `window.matchMedia("(pointer: coarse)")` — touch devices.
- `useReducedMotion()` is true.

When enabled, set `cursor: none` on `body` (scoped, restored on unmount / when disabled).

### 4.6 Target wiring
| Element | Attribute |
|---------|-----------|
| `ProjectCard` preview | `data-cursor="view"` `data-cursor-label="View"` |
| `ProjectCarousel` track | `data-cursor="drag"` |
| `NavHeader` pills, `PillButton`, social icons | `data-cursor-magnetic` |

## 5. Rework existing animations (match refs)

### 5.1 TypewriterHero (→ Typewriter example)
- Per-character delay with natural variance (base ~60–110ms randomized), pause at full phrase (~1.6s), faster delete (~40ms), then next phrase.
- Blinking caret via CSS.
- Reduced-motion: render final phrase, no animation.

### 5.2 TextReveal + ScrollHighlight (→ text-reveal / splitText)
- `TextReveal`: keep word-level split + `whileInView` stagger (0.07), add `blur(8px)→0` alongside the y-rise + opacity. Spring (stiffness 200, damping 22). `viewport={{ once: true }}`.
- `ScrollHighlight`: already scroll-linked per-word opacity (matches splitText scroll reveal). Keep; optionally add subtle blur on dimmed words. Verify offset feels right.

### 5.3 SkillFolder (→ ios-app-folder)
- Backdrop: `opacity 0→1` + `backdrop-filter blur(0→24px)`.
- Items: `scale 0.4→1`, `staggerChildren 0.04`, spring. Close reverses.
- Keep Escape-to-close. Add `data-cursor` on the folder trigger if useful.

### 5.4 SkillTicker / TechStackTicker (→ Ticker)
- Duplicated content for seamless wrap via `useAnimationFrame` + `useMotionValue` (loop helper). Confirm width measurement.
- Hover halves speed.
- Reduced-motion: static list.

## 6. Out of scope / notes

- No backend; contact form stays a client-side mock.
- Aurora canvas + ContactGlobe (Three.js) unchanged.
- `pages/Home.tsx` is dead Vite boilerplate — delete (trivial cleanup).
- `ProjectCarousel` mobile wiring: if removing the unused import is chosen over wiring it, the `data-cursor="drag"` target moves to wherever a draggable exists. Wiring carousel for mobile is a stretch goal, not required.

## 7. Verification

1. `npx tsc --noEmit -p tsconfig.app.json` → 0 errors.
2. `npm run build` → succeeds.
3. `npm run dev` manual check: cursor follows with spring lag; grows to label over project cards; wraps nav pills (magnetic); shows drag over carousel; hidden on touch + reduced-motion (native cursor returns).
4. Reworked animations: typewriter natural typing, text reveal blur-rise on scroll, folder open/close stagger, ticker seamless + hover-slow.
5. No `from "framer-motion"` left in repo (`grep -rn 'framer-motion' app/src` empty).

## 8. File change summary

**New:** `components/CustomCursor.tsx`
**Mount:** `App.tsx` (+ render `<CustomCursor/>`, migrate import)
**Rework:** `TypewriterHero.tsx`, `TextReveal.tsx`, `ScrollHighlight.tsx`, `SkillFolder.tsx`, `SkillTicker.tsx`, `sections/TechStackTicker.tsx`
**Wire data-cursor:** `ProjectCard.tsx`, `ProjectCarousel.tsx`, `NavHeader.tsx`, `PillButton.tsx`, `QuickLinks.tsx` (socials)
**Fix unused:** `Works.tsx`, `Contact.tsx`, `About.tsx`, `SkillFolder.tsx`
**Import migration (`framer-motion`→`motion/react`):** all ~18 motion-using files
**Delete:** `pages/Home.tsx`
