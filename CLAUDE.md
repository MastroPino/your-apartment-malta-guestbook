# Your Apartment Malta — Guest Book

Static mobile-first guest book for a Floriana (Malta) short-stay
apartment. Built from a PDF brief, deployed on GitHub Pages.

## Coordinates

- **Local path** — `/Users/andreacalabro/Sites/Personal/your-apartment-malta-guestbook`
- **Repo** — https://github.com/MastroPino/your-apartment-malta-guestbook
- **Live** — https://mastropino.github.io/your-apartment-malta-guestbook/
- **Deploy** — GitHub Pages from `main` (no build step, push = deploy)

## Stack

Plain HTML/CSS/JS. **Single `index.html`** containing all 15 screens
(`.screen` divs); a tiny hash-router in `assets/js/app.js` activates one
at a time. No bundler, no framework. Sticky topbar with back button,
scroll-spy on Things to do, copy-to-clipboard for the Wi-Fi password,
live-rendered Wi-Fi QR (re-renders on `prefers-color-scheme` change),
universal "Send a message to the host" CTA auto-injected on most
screens, dark mode driven by `@media (prefers-color-scheme: dark)`.

## Screens

`home`, `host`, `checkin`, `wifi`, `houseinfo`, `kitchen`, `rules`,
`emergency`, `transport`, `thingstodo`, `eat`, `nearest`, `beforeyougo`,
`faq`, `reviews`.

## Brand tokens (re-skin API)

The top of `assets/css/style.css` exposes a **PUBLIC BRAND API** —
~12 CSS custom properties under `:root`. Changing those values
re-skins the entire site without touching component rules. The block
is split between PUBLIC (typography, brand palette, surface palette,
radii) and INTERNAL (legacy aliases, layout constants).

Dark mode re-maps `--brand-primary`, `--brand-on-primary`, `--paper`,
`--ink` etc. inside `@media (prefers-color-scheme: dark)`.

## Local preview

```
.claude/launch.json  →  python3 .claude/serve.py  (port 4321)
```

Started with `mcp__Claude_Preview__preview_start name=guestbook`.

## Working agreements

- **Italiano** in conversation, English in the site copy.
- **No emojis** in code/docs unless explicitly requested.
- **No `*.md` files** unless explicitly requested (this one was requested).
- **CSS cache version** — when shipping CSS edits, bump the `?v=N`
  query in `index.html`'s `<link>` so browsers refetch.
- **Brand-token first** — when changing colors/fonts/radii, edit the
  token, not the component rule. Components reference `var(--token)`.

## Sibling project

`/Users/andreacalabro/Sites/Personal/your-apartment-catania-guestbook`
will be a second guidebook (Catania, Italy) based on this one. See
its `BRIEF.md` for the kickoff scope.
