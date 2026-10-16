# Fatima Humbatova — Cozy Pixel Portfolio V3.1

A personal, static website for graduate applications and professional networking. Responsive, dependency-free, and ready for free GitHub Pages hosting. The design uses warm graphite/amber, JetBrains Mono across every section, a subtle pixel atmosphere and mouse-reactive elements.

## Sections

- **Home** — short skippable intro, three animated statements ("Always learning. Always building. Always protecting."), progressive typewriter description, and the *original moving* coding illustration integrated into the scene.
- **My Journey** — an SVG journey path that draws according to scroll progress with frame-rate-independent smoothing (not wheel-step jumps), four short milestones, hover/focus amber pulses, a mobile-specific curved path, and a small completion animation at the final milestone. Media.az interview remains linked with RU language label.
- **Projects** — six cards: TraceTrust, Digital Evidence, ExoSearch AI, PhishGuard AI (published), SentinelFlow IDS (clearly marked upcoming), Cyber RECon Defender winner. Cyber RECon links to the official certificate, U.S. Cyber Command story, and DVIDS team photo.
- **Experience** — three professional/teaching positions.
- **Connect** — a small once-only terminal command reveal, “Let’s build something meaningful,” and LinkedIn/GitHub/email.

## Technical features

- Plain HTML, CSS, and JavaScript; no build step or npm dependencies.
- **Real animation:** `assets/fatima-cozy-desk.webm` is a smaller WebM encode of the supplied 61-frame GIF (`assets/fatima-cozy-desk-original.gif`). Autoplay is silent and looping. The original GIF remains as an HTML fallback, while a WebP poster appears during video loading.
- The pixel rain, cursor glow, hover tilt, pointer-following warm desk light, scroll-traced journey SVG, terminal button microinteractions, scroll reveals, and experience timeline use native browser APIs.
- Motion effects respect `prefers-reduced-motion`; animated hero playback is paused in that mode.
- Font: JetBrains Mono loaded from Google Fonts with a system monospace fallback. No font files are included.

## Run locally

Open `index.html` in a modern browser, or from this directory:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000. The video and PDFs are static local assets. Internet is only used for Google Fonts and when someone clicks an external link.

## External source links

- [Media.az interview — Russian, 1 June 2026](https://media.az/society/azerbajdzhanskaya-studentka-pokoryaet-ssha-zoloto-cyberrecon-2026-intervyu-s-fatimoj-gumbatovoj)
- [U.S. Cyber Command / DVIDS official report — 2026 Cyber RECon](https://www.dvidshub.net/news/567953/student-researchers-tackle-real-world-cyber-challenges-uscybercoms-26-cyber-recon)
- [DVIDS official FIU Defender team photo](https://www.dvidshub.net/image/9756545/student-researchers-tackle-real-world-cyber-challenges-uscybercoms-26-cyber-recon)

## V3.1 motion refinement

The journey track is a faint **continuous** line (not dotted). The foreground path uses SVG arc-length and time-smoothed scroll interpolation rather than jumping to each wheel tick. At the fourth milestone a one-time, subtle halo and **“Milestone reached. The story continues.”** message appear. With reduced motion enabled, the complete path and final text are visible without animations. This is a design metaphor, not a statement that the academic journey is finished.
