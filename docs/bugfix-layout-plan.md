# Layout/Responsiveness Bugfix Plan

Branch: `feat/motion-animations`. Static Vite + React + Tailwind + motion/react portfolio.
No DB, no test runner installed → "staging DB e2e" reduces to **build + dev-server + multi-width screenshot** verification.

## Root causes (systematic-debugging Phase 1/2)

### S1 — Skills folder trapped inside bento + glitch pop
- Expanded overlay is `position: fixed` (`SkillFolder.tsx`), but its ancestor `BentoCard` is a `motion.div` with `whileHover={{ y:-3 }}` → **transform creates a containing block for `position:fixed`**, and `BentoCard` also has `overflow-hidden`. Result: "fullscreen" overlay is clipped to the card.
- Shared `layoutId="folder-bg"` layout projection fights the transformed ancestor → pop in/out glitch.
- **Fix:** render expanded overlay through `createPortal(document.body)` to escape the transformed/overflow-hidden ancestor. Keep `layoutId` (shared-layout works across portal).

### S2 — Hero ("I'm Alex") is a tiny box
- In `Hero.tsx`, `col-span-1 md:col-span-2 row-span-2` sit on **`BentoCard`**, but the grid item is the empty-className `SectionReveal` wrapper → spans never apply → Hero squished into one 1/4 column with `min-h-380` = tall-narrow box.
- **Fix:** move span classes onto `SectionReveal` (the grid child); `BentoCard` gets `h-full`. Restores the intended 2×2 hero that pairs with QuickLinks' `row-span-2`.

### S3 — Stats card too big
- `Experience` `BentoCard` uses `h-full justify-between` → stretches to tallest row sibling and spreads STATS label to top / stats to bottom with a huge gap.
- **Fix:** caption stays top, wrap the 3 stats in `flex-1 flex flex-col justify-center gap-6` (centered cluster, no spread). Height then follows the now-correct grid.

### S4 — Tech-stack ticker not implemented properly
- `TechStackTicker` renders bare loose text (`col-span-1 md:col-span-2 lg:col-span-3`, no container) → reads as unstyled floating text, awkward grid placement.
- Marquee logic itself is fine (two byte-identical copies, `scrollWidth/2` wrap). Edge-fade clipping a word is expected.
- **Fix:** make it a full-width band (`col-span-full`) with hairline `border-y` framing + label, so it reads as an intentional marquee strip.

### S5 — Not responsive
- Largely a consequence of S2 (broken desktop grid). Plus Hero font `clamp` min (3.5rem) can overflow ~320px phones.
- **Fix:** lower Hero clamp min to ~2.75rem; verify no horizontal overflow at 375 / 768 / 1280; confirm grid stacks cleanly on mobile.

## Scope guard
Touch only: `SkillFolder.tsx` (S1), `Hero.tsx` (S2/S5), `About.tsx`→Experience (S3), `TechStackTicker.tsx` (S4). No changes to cursor/typewriter/aurora/works domains.

## Verify (step 6)
`tsc -b` + `vite build` clean; dev server screenshots at 375/768/1280; folder opens fullscreen-centered without clipping; hero 2×2; stats compact; ticker full-width band scrolling.
