# Your Apartment Malta — Digital Guest Book

A small, mobile-first website that recreates the *Your Apartment Malta* guest book PDF as an
app-like experience: a home screen with an icon menu, and a separate screen for each section.

**Style** (matching the PDF)
- **Titles** → *Playfair Display* (serif)
- **Accents / signature** → *Sacramento* (script — e.g. “Your Apartment Malta”, “Enjoy your stay!”)
- **Body & labels** → *Poppins* (sans-serif)
- Warm off-white background, near-black ink, cream panels, delicate line-art icons.

---

## Run / preview locally

It's a plain static site — no build step. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(or just open `index.html`, though a server is recommended so fonts/images load cleanly).

## Deploy

Upload the whole folder to any static host:
- **Netlify / Vercel** — drag-and-drop the folder, done.
- **GitHub Pages** — push and enable Pages.
- **Your own hosting** — copy `index.html` + the `assets/` folder via FTP.

Only these are needed in production: `index.html`, `assets/`. The `.claude/` folder is just
local-preview tooling and can be ignored/omitted.

---

## Structure

```
index.html            All screens + the inline SVG icon set + a tiny hash router
assets/css/style.css  All styling and the design tokens (colors/fonts) at the top
assets/js/app.js      Screen navigation, sticky top bar, copy-password button,
                      section nav (Things to do), Wi-Fi QR generation
assets/js/qrcode.min.js  Vendored QR library (davidshimjs/qrcodejs, MIT) — Wi-Fi QR
assets/img/           Optimised photos extracted from the original PDF
```

Navigation uses URL hashes (`#wifi`, `#emergency`, …), so the browser **Back** button works
and any screen can be linked directly. The top bar’s back arrow returns to the previous screen.

## Editing content

All text lives in `index.html`, grouped by screen in clearly-commented `<section>` blocks.
Common things you may want to change:

| What | Where (search in `index.html`) |
|------|--------------------------------|
| Wi-Fi name / password | `id="wifi"` in `index.html` (the displayed value **and** the `data-copy="…"` on the Copy button) **and** the QR text in `assets/js/app.js` (`text: 'WIFI:T:WPA;S:…;P:…;;'`). Update all three so the QR stays in sync. |
| Phone / email / Instagram | search `tel:`, `mailto:`, `instagram.com` |
| “Message the host” button | search `wa.me` (currently opens WhatsApp — change to `tel:` or `sms:` if preferred) |
| Address | search `Triq Il-Konservatorju` |
| Any section text | find the matching `<!-- SECTION -->` comment |

To change the **colors or fonts**, edit the `:root { … }` variables at the top of
`assets/css/style.css`.

### ⚠️ One section needs your real content
The PDF had a **“Kitchen & Other Areas”** menu item but no text for it, so that screen
(`id="kitchen"`) currently has a friendly **placeholder**. Replace it with the real details
(appliance notes, coffee machine, what’s provided, etc.).

### Notes on the content
- Text was transcribed from the PDF with **obvious typos fixed** (e.g. “addicional” → “additional”,
  “Marsaxlock” → “Marsaxlokk”) and lightly tidied for clarity. All facts — phone numbers, addresses,
  Wi-Fi password, place names, prices — were kept exactly as in the PDF; please double-check them.
- The placeholder *“Lorem ipsum”* line from the PDF’s “Before You Go” page was removed.

## Photos
The images in `assets/img/` were extracted from the PDF and resized/compressed for the web
(~1.6 MB total). Some original photos in the PDF were phone screenshots with on-screen UI and
were skipped; a few extra clean photos remain available in `~/Downloads/gb_imgs/` if you’d like
to add more (e.g. the courtyard). To swap a photo, replace the file in `assets/img/` (keep the
same name) or update the `src` in `index.html`.

## Add to Home Screen
The page includes the meta tags so guests can “Add to Home Screen” on iOS/Android and open it
like a native app.
