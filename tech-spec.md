# Technical Specification — Bento Portfolio

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^14.2.0 | Framework (App Router, next/font, next/image, next/dynamic) |
| react | ^18.3.0 | UI library |
| react-dom | ^18.3.0 | React DOM renderer |
| typescript | ^5.5.0 | Type safety |
| tailwindcss | ^3.4.0 | Utility-first CSS |
| postcss | ^8.4.0 | CSS processing |
| autoprefixer | ^10.4.0 | Vendor prefixing |
| @types/node | ^20.0.0 | Node.js type definitions |
| @types/react | ^18.3.0 | React type definitions |
| @types/react-dom | ^18.3.0 | ReactDOM type definitions |
| motion | ^11.0.0 | Animation library (framer-motion successor) |
| three | ^0.165.0 | WebGL 3D engine |
| @react-three/fiber | ^8.16.0 | React renderer for Three.js |
| @react-three/drei | ^9.105.0 | R3F helpers (useful for contact globe) |
| @types/three | ^0.165.0 | Three.js type definitions |
| lucide-react | ^0.400.0 | Icon set |
| lenis | ^1.1.0 | Smooth scroll |

---

## Component Inventory

### Layout

| Component | Source | Notes |
|-----------|--------|-------|
| layout.tsx | Custom | Root layout — loads fonts via next/font, initializes Lenis, mounts AuroraCanvas. Contains the bento grid CSS container. |
| NavHeader | Custom | Fixed glass pill bar. Wraps SmoothTabs. Scroll-triggered visibility via motion.useScroll. Renders logo + nav tabs + resume icon. Mobile: collapses to hamburger. |
| AuroraCanvas | Custom | Three.js aurora background. Loaded via next/dynamic with ssr:false. pointer-events:none. |

### Sections

| Component | Source | Notes |
|-----------|--------|-------|
| Hero | Custom | 2x2 bento cell. Name, headline (Display token), TypewriterHero tagline, status row with pulsing dot, profile photo (absolute positioned). |
| QuickLinks | Custom | Two stacked sub-cards: Resume download + Social icons row (GitHub, LinkedIn, Twitter, Mail). |
| Works | Custom | Desktop: 3 AppStoreCards in a sub-grid. Mobile: single ProjectCarousel with cards that also expand via AppStoreCard. |
| About | Custom | Large card with ScrollHighlight bio text + stat counters at bottom. |
| Skills | Custom | Summary text + SkillFolder (modified IOSAppFolder) + decorative skill icon row. |
| TechStackTicker | Custom | Full-width TickerX marquee. |
| Contact | Custom | Two side-by-side cards: contact form (wider) + sign-off with decorative globe (desktop only). |
| Footer | Custom | Minimal bar: copyright, tech note, back-to-top. No bento card wrapper. |

### Reusable Components

| Component | Source | Notes |
|-----------|--------|-------|
| BentoCard | Custom | Glass card wrapper. motion.div with whileHover for translateY(-3px) lift + CSS transition for border color. Base for all content tiles. |
| PillButton | Custom | 3 variants (Primary / Outline / Accent). motion.button with whileTap scale. Used in resume card, project CTAs, contact submit. |
| SectionReveal | Custom | Scroll-triggered entrance wrapper. motion.div with whileInView. Supports staggerChildren for grouped cards. |

### Motion Components (from user files, adapted)

| Component | Source | Notes |
|-----------|--------|-------|
| TypewriterHero | TextEffects.tsx (TypewriterCycle) | Cycles phrases with type/delete animation. Used in Hero tagline. |
| SkillTicker | Tickers.tsx (TickerX) | Horizontal infinite marquee. Slows on hover. |
| ScrollHighlight | ScrollEffects.tsx | Word-by-word opacity illumination driven by scroll progress. Used in About bio. |
| TextReveal | TextEffects.tsx | Word-by-word spring rise from behind mask. Used for section header entrances. |
| SmoothTabs | SmoothTabs.tsx | Sliding active pill between tabs via shared layoutId. Used in NavHeader. |
| ProjectCard | AppStoreCard.tsx | Preview card expanding to fullscreen detail panel via shared layoutId. Each instance requires unique layoutId prop (project slug). |
| ProjectCarousel | CarouselFreeScroll.tsx | Horizontal drag-to-scroll with momentum. Mobile only (< 768px via CSS/conditional render). |
| SkillFolder | IOSAppFolder.tsx | Folder icon expanding to fullscreen blurred overlay with staggered items. Dot grid has floating idle animation. |
| ContactGlobe | Custom (Three.js) | Wireframe sphere, slow Y rotation. Only renders desktop (>=1024px). Lightweight — SphereGeometry + MeshBasicMaterial wireframe. |

### Hooks

| Hook | Purpose |
|------|---------|
| useLenis | Initializes Lenis once at layout level, connects raf loop, exposes instance via ref (not context — only NavHeader calls scrollTo). |

---

## Animation Implementation

| Animation | Library | Approach | Complexity |
|-----------|---------|----------|------------|
| **🔒 Fluid Aurora Background** | Three.js + R3F | Custom ShaderMaterial on PlaneGeometry(2,2,256,256). Fragment shader: 6-octave FBM noise driving color mixing across dark indigo/teal/navy palette. uTime uniform updated each frame via useFrame. Orthographic camera. | **High** |
| Section Reveal (card entrances) | Motion | whileInView trigger with viewport={{ once: true, margin: "-8%" }}. Parent container uses staggerChildren: 0.1. Children animate opacity 0→1, y 40→0, scale 0.97→1. | Low |
| Typewriter Cycle | Motion + React state | setTimeout chain: type characters → pause → delete → next phrase. Blinking cursor via CSS animation. | Low |
| TickerX (marquee) | Motion | useAnimationFrame for frame-synced positioning. useMotionValue for x position. Content duplicated; seamless wrap via loop() helper. Edge mask via CSS gradient. Hover halves speed prop. | Medium |
| Scroll Highlight (word illuminate) | Motion | useScroll with target ref. Per-word useTransform mapping scrollYProgress to opacity [0.15, 1]. Each word's range is i/totalWords to (i+1)/totalWords. | Medium |
| Text Reveal (word rise) | Motion | whileInView trigger. Parent variants with staggerChildren: 0.07. Child variants: y "120%" → 0 with spring (stiffness:200, damping:22). Words wrapped in overflow:hidden spans. | Low |
| Smooth Tabs (pill slide) | Motion | Shared layoutId="active-tab-pill" on a motion.span behind active tab. Spring transition (stiffness:400, damping:32) auto-animates position between tabs. | Low |
| App Store Card Expand | Motion | Shared layoutId between preview card and expanded modal. AnimatePresence for overlay backdrop. Inner content fades in with delay:0.15 after layout settles. Unique layoutId per instance required. | Medium |
| Project Carousel Drag | Motion | drag="x" with dragConstraints computed from track vs viewport width. dragElastic:0.12, dragTransition power:0.3/timeConstant:280. Resize observer recalculates constraints. | Medium |
| iOS Folder Open/Close | Motion + AnimatePresence | Backdrop: opacity 0→1 + backdrop-filter blur(0→24px). Items stagger in with scale:0.4→1, staggerChildren:0.04, spring. Close reverses. Escape key handler. | Medium |
| Hero Status Dot Pulse | Motion | animate prop with scale [1,1.3,1] + opacity [1,0.7,1], repeat:infinity, duration:2s. Purely declarative, no scroll trigger. | Low |
| Contact Globe Rotation | Three.js (R3F) | useFrame increments mesh.rotation.y by 0.002 each frame. SphereGeometry + MeshBasicMaterial wireframe. | Low |
| Nav Header Scroll Reveal | Motion | useScroll to detect scroll past 300px. Animate opacity 0→1, y -20→0 with spring. | Low |
| Card Hover Lift | Motion | whileHover={{ y: -3 }} with CSS transition on border-color. No shadow — lift against aurora provides depth. | Low |
| Social Icon Hover | Motion | whileHover scale:1.1 + backgroundColor change. whileTap scale:0.95. | Low |
| Stats Counter | Motion | useMotionValue + useTransform with whileInView trigger. Counts from 0 to target over 1.5s easeOut. | Low |
| Contact Form States | Motion | AnimatePresence for button text swap (Send → Sending→ Sent! → Send). Submit is client-side mock only. | Low |
| Skill Folder Dot Float | Motion | Per-dot y:[0,-3,0] with random duration (2-3s) and delay (0-1s), repeat:infinity. | Low |

---

## State & Logic Plan

### 1. Three.js Loading (SSR Skip)

The aurora shader references `window` (via WebGL context) and must never execute server-side. **Strategy:** Wrap the entire AuroraCanvas component in `next/dynamic` with `ssr: false` and `loading: null` (renders nothing while loading — the body background color #030303 provides a seamless dark fallback). Import at the layout level.

```tsx
// In layout.tsx:
const AuroraCanvas = dynamic(() => import("./components/AuroraCanvas"), {
  ssr: false,
  loading: () => null,
});
```

### 2. Lenis Instance Sharing

Lenis must be initialized once and its `scrollTo` method accessed by NavHeader tabs. **Strategy:** A custom `useLenis` hook that initializes Lenis in a useEffect, stores the instance in a useRef, and returns the ref. The hook is called once in layout.tsx. NavHeader receives the lenis instance ref as a prop (or imports the hook if ref is lifted). The raf loop uses `requestAnimationFrame` calling `lenis.raf(time)` — connected to Motion's animation frame loop by calling `lenis.raf` inside a standard raf callback, NOT inside Motion's useFrame (those are separate systems).

```tsx
// Pattern:
const lenisRef = useRef<Lenis | null>(null);
useEffect(() => {
  const lenis = new Lenis({ duration: 1.2, ... });
  lenisRef.current = lenis;
  function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  return () => lenis.destroy();
}, []);
// NavHeader calls: lenisRef.current?.scrollTo("#sectionId")
```

### 3. AppStoreCard layoutId Uniqueness

Each ProjectCard instance shares a `layoutId` between its preview and expanded states. If two cards share the same layoutId, Motion cannot distinguish them and the animation breaks. **Strategy:** Pass a unique `layoutId` prop derived from the project slug (e.g., `` `project-${project.slug}` ``). The parent Works section maps over a projects data array, injecting the slug into each ProjectCard.

### 4. Desktop/Mobile Adaptive Rendering

Two components render conditionally by viewport:
- **Works section:** Desktop shows ProjectCard grid; mobile shows ProjectCarousel (which contains ProjectCard instances that also expand).
- **ContactGlobe:** Desktop only (>=1024px).

**Strategy:** Use a `useMediaQuery` hook (CSS matchMedia) rather than JS breakpoints. Initialize with a safe server-side default (`false` for mobile features, `true` for desktop-only features won't work for SSR). Better: render both and use CSS `display: none/block` at breakpoints. The carousel can be `display: none` on desktop; the globe conditionally rendered via a hook that checks `typeof window !== "undefined"`.

### 5. Form Submission (Mock)

The contact form has no backend. **Strategy:** useState tracks submission phase: `"idle" | "sending" | "sent"`. On submit, set "sending", setTimeout 1.5s → "sent", setTimeout 2s → "idle". Button text/icon swaps via AnimatePresence.

---

## Other Key Decisions

**Fonts via next/font/google:** Load Space Grotesk (400,500,600,700), Inter (400,500), and JetBrains Mono (400) with `display: "swap"` and `subsets: ["latin"]`. Assign CSS variable names (--font-space-grotesk, --font-inter, --font-jetbrains-mono) and reference in Tailwind config fontFamily.

**No shadcn/ui:** The design's glassmorphic aesthetic and motion-heavy interactions don't align with shadcn's default styling. All UI is custom-built with Tailwind + Motion. No shadcn init needed.

**No additional animation libraries:** GSAP is not needed — Motion (framer-motion) covers all animation requirements (whileInView, useScroll, useTransform, drag, AnimatePresence, layoutId). Adding GSAP would be redundant.

**Image strategy:** Use next/image for the profile photo and project thumbnails with proper `sizes` and `priority` (avatar gets priority as it's above fold). Project images use `loading="lazy"`.

**Reduced motion:** Implement a `useReducedMotion` check (Motion provides `useReducedMotion` hook). When true: freeze aurora uTime at 0, disable all whileInView animations (render at final state), disable ticker auto-scroll (show static list), disable typewriter (show final text immediately).

**File structure under app/:**
```
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── sections/
│   ├── Hero.tsx
│   ├── QuickLinks.tsx
│   ├── Works.tsx
│   ├── About.tsx
│   ├── Skills.tsx
│   ├── TechStackTicker.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── components/
│   ├── BentoCard.tsx
│   ├── PillButton.tsx
│   ├── NavHeader.tsx
│   ├── SectionReveal.tsx
│   ├── AuroraCanvas.tsx
│   ├── SkillFolder.tsx
│   ├── ProjectCarousel.tsx
│   ├── ProjectCard.tsx
│   ├── TypewriterHero.tsx
│   ├── SkillTicker.tsx
│   ├── ScrollHighlight.tsx
│   ├── TextReveal.tsx
│   ├── SmoothTabs.tsx
│   └── ContactGlobe.tsx
├── hooks/
│   └── useLenis.ts
└── types/
    └── index.ts
```
