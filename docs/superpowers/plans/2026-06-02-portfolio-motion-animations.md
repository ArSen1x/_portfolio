# Portfolio Motion Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the portfolio's motion animations to match the referenced motion.dev examples, add a free-motion unified cursor system, and fix the build-breaking errors.

**Architecture:** All animation uses the already-installed `motion` package (free; no Motion+). Cursor effects are unified into one `<CustomCursor>` mounted at App root that reads `data-cursor*` attributes on targets. Existing reveal/typewriter/folder/ticker components are re-tuned in place.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind 3, `motion` ^12 (import from `motion/react`), Lenis, Three.js (unchanged).

**Verification note:** No test runner is installed. Verification is via `npx tsc --noEmit -p tsconfig.app.json` (0 errors), `npm run build` (succeeds), `grep` assertions, and manual `npm run dev` observation. All commands run from `app/`.

---

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `app/src/components/CustomCursor.tsx` | Unified spring cursor; reads `data-cursor*` | Create |
| `app/src/App.tsx` | Mount `<CustomCursor/>`; import migration | Modify |
| `app/src/components/ProjectCard.tsx` | `data-cursor="view"` on preview | Modify |
| `app/src/components/ProjectCarousel.tsx` | `data-cursor="drag"` on track | Modify |
| `app/src/components/NavHeader.tsx` | `data-cursor-magnetic` on pills/resume | Modify |
| `app/src/components/PillButton.tsx` | `data-cursor-magnetic` | Modify |
| `app/src/sections/QuickLinks.tsx` | `data-cursor-magnetic` on social icons | Modify |
| `app/src/components/TypewriterHero.tsx` | Natural typing variance + caret | Modify |
| `app/src/components/TextReveal.tsx` | Word blur-rise on view | Modify |
| `app/src/components/ScrollHighlight.tsx` | Scroll splitText feel | Modify |
| `app/src/components/SkillFolder.tsx` | Blur backdrop + stagger; drop unused `i` | Modify |
| `app/src/components/SkillTicker.tsx` | Seamless wrap + hover-slow | Modify |
| `app/src/sections/TechStackTicker.tsx` | Ticker tuning | Modify |
| `app/src/sections/Works.tsx` | Remove unused `ProjectCarousel` import | Modify |
| `app/src/sections/Contact.tsx` | Remove unused `Clock`/`Shield`/`Heart` | Modify |
| `app/src/sections/About.tsx` | Remove unused `useRef` | Modify |
| `app/src/pages/Home.tsx` | Dead Vite boilerplate | Delete |
| ~18 files importing `framer-motion` | Import migration | Modify |

---

## Task 1: Fixes — unblock build (import migration + unused vars + dead file)

**Files:**
- Modify: all files matching `from "framer-motion"` under `app/src`
- Modify: `app/src/sections/Works.tsx`, `app/src/sections/Contact.tsx`, `app/src/sections/About.tsx`, `app/src/components/SkillFolder.tsx:49`
- Delete: `app/src/pages/Home.tsx`

- [ ] **Step 1: Migrate all `framer-motion` imports → `motion/react`**

Run (from `app/`):
```bash
grep -rl 'framer-motion' src | xargs sed -i '' 's#"framer-motion"#"motion/react"#g'
```

- [ ] **Step 2: Verify no `framer-motion` import remains**

Run: `grep -rn 'framer-motion' src ; echo "exit=$?"`
Expected: no matches (grep exit=1).

- [ ] **Step 3: Remove unused imports**

In `src/sections/Works.tsx` — delete the `ProjectCarousel` import line (line ~3: `import { ProjectCarousel } from "@/components/ProjectCarousel";`).
In `src/sections/Contact.tsx` — in the `lucide-react` import (line ~3) remove `Clock`, `Shield`, `Heart` (keep the rest).
In `src/sections/About.tsx` — in the `react` import (line ~19) remove `useRef` (keep `useState`/`useEffect` etc.).
In `src/components/SkillFolder.tsx:49` — change the map callback param from `(item, i) =>` to `(item) =>` (the index `i` is unused; if a sibling uses `i` as a key, replace that key with `item`/a stable field instead).

- [ ] **Step 4: Delete dead boilerplate**

Run (from repo root): `git rm app/src/pages/Home.tsx`
(Confirm nothing imports it: `grep -rn "pages/Home" app/src` → no matches.)

- [ ] **Step 5: Typecheck + build**

Run (from `app/`):
```bash
npx tsc --noEmit -p tsconfig.app.json && npm run build
```
Expected: typecheck 0 errors, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix(build): migrate framer-motion->motion/react, drop unused imports, remove dead Home page"
```

---

## Task 2: CustomCursor component

**Files:**
- Create: `app/src/components/CustomCursor.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

type CursorState =
  | { variant: "default" }
  | { variant: "label"; label: string }
  | { variant: "magnetic"; rect: DOMRect };

const FOLLOW = { stiffness: 500, damping: 40, mass: 0.6 };
const MAGNET = { stiffness: 350, damping: 35, mass: 0.8 };

export function CustomCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>({ variant: "default" });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const fx = useSpring(x, FOLLOW);
  const fy = useSpring(y, FOLLOW);

  useEffect(() => {
    if (reduce) {
      setEnabled(false);
      return;
    }
    setEnabled(!window.matchMedia("(pointer: coarse)").matches);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;
    document.body.style.cursor = "none";

    function onMove(e: PointerEvent) {
      const el = (e.target as Element | null)?.closest?.(
        "[data-cursor],[data-cursor-magnetic]"
      ) as HTMLElement | null;

      if (el?.hasAttribute("data-cursor-magnetic")) {
        const rect = el.getBoundingClientRect();
        x.set(rect.left + rect.width / 2);
        y.set(rect.top + rect.height / 2);
        setState({ variant: "magnetic", rect });
        return;
      }

      x.set(e.clientX);
      y.set(e.clientY);
      if (el) {
        const v = el.getAttribute("data-cursor") ?? "";
        const label = el.getAttribute("data-cursor-label") ?? v;
        setState({ variant: "label", label });
      } else {
        setState((s) => (s.variant === "default" ? s : { variant: "default" }));
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.body.style.cursor = "";
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const inner =
    state.variant === "magnetic"
      ? {
          width: state.rect.width,
          height: state.rect.height,
          borderRadius: 14,
          opacity: 0.2,
        }
      : state.variant === "label"
      ? { width: "auto", height: 30, borderRadius: 999, opacity: 1 }
      : { width: 16, height: 16, borderRadius: 999, opacity: 1 };

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ x: fx, y: fy }}
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white px-3 text-xs font-medium text-obsidian"
        style={{
          mixBlendMode: state.variant === "label" ? "normal" : "difference",
        }}
        animate={inner}
        transition={state.variant === "magnetic" ? MAGNET : FOLLOW}
      >
        <AnimatePresence mode="wait">
          {state.variant === "label" && state.label && (
            <motion.span
              key={state.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap"
            >
              {state.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
```

Note: the default/magnetic states have no `px` content but the inner keeps `px-3`; that is harmless for the dot because width is fixed at 16. If the dot looks oversized, the executor may move `px-3` into the label branch only — verify visually in Step 4.

- [ ] **Step 2: Typecheck**

Run (from `app/`): `npx tsc --noEmit -p tsconfig.app.json`
Expected: 0 errors.

- [ ] **Step 3: Mount in App**

In `app/src/App.tsx`, import and render the cursor as the last child of the root `div` (it is `position: fixed`, so order only affects DOM, not layout):
```tsx
import { CustomCursor } from "@/components/CustomCursor";
```
Add `<CustomCursor />` just before the closing `</div>` of the root element (after `<main>`).

- [ ] **Step 4: Manual check**

Run: `npm run dev`. Move the mouse: a white dot should follow with a slight spring lag, native cursor hidden. Resize devtools to a touch/coarse-pointer emulation or enable "reduce motion" in OS → cursor disappears, native cursor returns.

- [ ] **Step 5: Commit**

```bash
git add app/src/components/CustomCursor.tsx app/src/App.tsx
git commit -m "feat(cursor): unified spring CustomCursor with data-cursor contract"
```

---

## Task 3: Wire cursor targets

**Files:**
- Modify: `app/src/components/ProjectCard.tsx`, `app/src/components/ProjectCarousel.tsx`, `app/src/components/NavHeader.tsx`, `app/src/components/PillButton.tsx`, `app/src/sections/QuickLinks.tsx`

- [ ] **Step 1: ProjectCard preview → label cursor**

Read `ProjectCard.tsx`. On the outermost preview element (the clickable card container, the one with the project click handler / `layoutId` preview), add:
```tsx
data-cursor="view" data-cursor-label="View"
```

- [ ] **Step 2: ProjectCarousel track → drag cursor**

Read `ProjectCarousel.tsx`. On the draggable track element (the `motion.div` with `drag="x"`), add:
```tsx
data-cursor="drag" data-cursor-label="Drag"
```

- [ ] **Step 3: Magnetic targets**

In `NavHeader.tsx`: add `data-cursor-magnetic` to the resume `motion.a` (line ~50) and to each nav tab button rendered by `SmoothTabs` (if tabs are inside `SmoothTabs`, add the attribute on the tab `<button>` there, or wrap — keep it simple: add to the resume link and the mobile menu buttons).
In `PillButton.tsx`: add `data-cursor-magnetic` to the root `motion.button` (line ~32).
In `QuickLinks.tsx`: add `data-cursor-magnetic` to each social icon `motion.a` (line ~45).

- [ ] **Step 4: Typecheck + manual**

Run (from `app/`): `npx tsc --noEmit -p tsconfig.app.json`
Then `npm run dev`: hovering a project card shows the "View" pill; hovering nav pills / buttons / social icons makes the cursor expand to wrap them; the carousel shows "Drag".

- [ ] **Step 5: Commit**

```bash
git add app/src/components/ProjectCard.tsx app/src/components/ProjectCarousel.tsx app/src/components/NavHeader.tsx app/src/components/PillButton.tsx app/src/sections/QuickLinks.tsx
git commit -m "feat(cursor): wire data-cursor targets (view/drag/magnetic)"
```

---

## Task 4: Rework TypewriterHero (natural typing)

**Files:**
- Modify: `app/src/components/TypewriterHero.tsx`

- [ ] **Step 1: Apply natural typing + reduced-motion**

Read `TypewriterHero.tsx`. Replace the fixed type/delete timing with randomized per-character delays and a reduced-motion fallback. Use these constants and helper:
```tsx
import { useReducedMotion } from "motion/react";
// ...
const TYPE_MIN = 55;   // ms per char (fast)
const TYPE_MAX = 110;  // ms per char (slow) — randomize between for "natural" feel
const DELETE_MS = 40;  // ms per char while deleting
const HOLD_MS = 1600;  // pause when a phrase is fully typed
const rand = (a: number, b: number) => a + Math.floor(Math.random() * (b - a));
```
- While typing: schedule the next character with `setTimeout(..., rand(TYPE_MIN, TYPE_MAX))`.
- When a phrase completes: wait `HOLD_MS`, then delete at `DELETE_MS` per char, then advance to the next phrase (cycle).
- Always clear the pending timeout in the effect cleanup (`return () => clearTimeout(t)`).
- Reduced motion: `const reduce = useReducedMotion();` — if `reduce`, render the first/current phrase in full immediately and skip all timers.
- Keep the existing blinking caret (CSS). If none exists, add a caret span with a CSS blink animation:
```tsx
<span className="ml-0.5 inline-block w-[2px] animate-[blink_1s_steps(1)_infinite] bg-current align-middle" style={{ height: "1em" }} />
```
And ensure a `@keyframes blink { 50% { opacity: 0 } }` exists in `index.css` (add if missing).

- [ ] **Step 2: Typecheck + manual**

Run (from `app/`): `npx tsc --noEmit -p tsconfig.app.json`
Then `npm run dev`: the hero tagline types at a slightly irregular human pace, pauses, deletes, cycles; caret blinks. With OS reduce-motion on, text shows complete and static.

- [ ] **Step 3: Commit**

```bash
git add app/src/components/TypewriterHero.tsx app/src/index.css
git commit -m "feat(typewriter): natural typing variance, caret, reduced-motion fallback"
```

---

## Task 5: Rework TextReveal + ScrollHighlight

**Files:**
- Modify: `app/src/components/TextReveal.tsx`, `app/src/components/ScrollHighlight.tsx`

- [ ] **Step 1: TextReveal — add blur to the word rise**

Read `TextReveal.tsx`. In the child variants, add `filter` blur alongside the existing y/opacity so each word un-blurs as it rises:
```tsx
const childVariants = {
  hidden: { y: "120%", opacity: 0, filter: "blur(8px)" },
  show: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 200, damping: 22 },
  },
};
```
Keep parent `staggerChildren: 0.07` and `whileInView="show"` with `viewport={{ once: true }}`. Words remain wrapped in `overflow-hidden` spans.

- [ ] **Step 2: ScrollHighlight — confirm scroll splitText feel**

Read `ScrollHighlight.tsx`. It already maps `scrollYProgress` → per-word opacity `[0.15, 1]`. Optionally enhance to match splitText by also lifting blur on the active word:
```tsx
const opacity = useTransform(progress, range, [0.15, 1]);
const blur = useTransform(progress, range, ["blur(4px)", "blur(0px)"]);
// style={{ opacity, filter: blur }}
```
Keep the `offset: ["start 0.85", "start 0.25"]`. If the reveal finishes too early/late, widen to `["start 0.9", "end 0.4"]` and verify.

- [ ] **Step 3: Typecheck + manual**

Run (from `app/`): `npx tsc --noEmit -p tsconfig.app.json`
Then `npm run dev`: section headers rise word-by-word un-blurring; the About bio illuminates word-by-word as you scroll.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/TextReveal.tsx app/src/components/ScrollHighlight.tsx
git commit -m "feat(text): blur-rise reveal + scroll splitText illumination"
```

---

## Task 6: Rework SkillFolder (iOS app folder)

**Files:**
- Modify: `app/src/components/SkillFolder.tsx`

- [ ] **Step 1: Tune backdrop + stagger to the reference**

Read `SkillFolder.tsx`. Ensure the open/close matches ios-app-folder:
- Backdrop overlay variant: `initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(24px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }}`.
- Items container: `staggerChildren: 0.04`.
- Each item variant: `hidden: { scale: 0.4, opacity: 0 }`, `show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }`.
- Confirm `AnimatePresence` wraps the overlay and the Escape-key handler closes it (keep existing).
- Confirm the unused index `i` from Task 1 Step 3 is already removed.

- [ ] **Step 2: Typecheck + manual**

Run (from `app/`): `npx tsc --noEmit -p tsconfig.app.json`
Then `npm run dev`: clicking the skills folder blurs the backdrop in and pops the items with a staggered spring; Escape / backdrop click closes with the reverse.

- [ ] **Step 3: Commit**

```bash
git add app/src/components/SkillFolder.tsx
git commit -m "feat(folder): match ios-app-folder blur backdrop + staggered item spring"
```

---

## Task 7: Rework SkillTicker + TechStackTicker

**Files:**
- Modify: `app/src/components/SkillTicker.tsx`, `app/src/sections/TechStackTicker.tsx`

- [ ] **Step 1: Seamless marquee + hover-slow**

Read both files. Ensure the marquee:
- Renders the content list **twice** back-to-back for a seamless wrap.
- Uses `useAnimationFrame` to advance a `useMotionValue` x; when `x <= -contentWidth` (measure one copy via a ref's `scrollWidth / 2`), wrap by adding `contentWidth` back (modulo), so there is no visible jump.
- Halves speed on hover: track hover state and multiply the per-frame delta by `0.5` when hovered.
- Edge fade via CSS mask gradient on the container (keep if present).
Confirm the `whileInView` entrance on the wrapper keeps `viewport={{ once: true }}`.

- [ ] **Step 2: Typecheck + manual**

Run (from `app/`): `npx tsc --noEmit -p tsconfig.app.json`
Then `npm run dev`: the tech-stack ticker scrolls continuously with no jump at the wrap point and slows when hovered.

- [ ] **Step 3: Commit**

```bash
git add app/src/components/SkillTicker.tsx app/src/sections/TechStackTicker.tsx
git commit -m "feat(ticker): seamless wrap + hover-slow marquee"
```

---

## Task 8: Final verification

- [ ] **Step 1: Full typecheck + build**

Run (from `app/`):
```bash
npx tsc --noEmit -p tsconfig.app.json && npm run build
```
Expected: 0 type errors, build succeeds.

- [ ] **Step 2: Assert no legacy import + lint**

Run (from `app/`):
```bash
grep -rn 'framer-motion' src ; echo "grep-exit=$?"
npm run lint
```
Expected: no `framer-motion` matches (grep-exit=1); lint passes (or only pre-existing warnings).

- [ ] **Step 3: Manual smoke (npm run dev)**

Confirm end-to-end: cursor follow + label + magnetic + drag; typewriter natural typing; text reveal blur-rise; about scroll illumination; folder open/close; ticker seamless + hover-slow; touch/reduced-motion disables cursor and freezes timed animations.

- [ ] **Step 4: Final commit (if any pending changes)**

```bash
git add -A
git commit -m "chore: final verification pass for motion animations"
```

---

## Self-Review

- **Spec coverage:** Fixes (Task 1) ✓ build blocker + dep migration + dead file. Cursor system (Tasks 2–3) ✓ component + data-cursor contract + guards + target wiring. Reworks (Tasks 4–7) ✓ typewriter, text-reveal/scroll-highlight, folder, ticker. Verification (Task 8) ✓ matches spec §7.
- **Placeholder scan:** Concrete code/constants/commands in every code step; rework steps name exact variant objects and timings. No TBDs.
- **Type consistency:** `CursorState` variants (`default`/`label`/`magnetic`) and `data-cursor` / `data-cursor-label` / `data-cursor-magnetic` attribute names are used identically in CustomCursor (Task 2) and the wiring (Task 3).
- **Known soft spots (call out, don't block):** exact spring/timing values are tuned-to-taste approximations of the paid Motion+ originals; final values confirmed by manual observation in each task's check step.
