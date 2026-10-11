# A little closer: birthday letters for Shreya

Private draft for 20 October 2026, created from the supplied brief. Fifteen interactive Open When letters, including the requested replacement for the next birthday category.

## What works

Responsive envelope gallery, category filters, accessible native letter dialogs, opened-letter progress, reduced motion support, browser-local letter editing, JSON export and import. No application subscriptions, APIs, paid assets or npm dependencies are required by this static source. Hosting provider availability and pricing are separate and not guaranteed by this repository.

## Important boundaries

All letter copy is a draft written for Dhruv to personalise. No photographs, audio or videos have been supplied yet. The favourite-memory letter has explicit blanks that must be replaced. No email has been sent or scheduled. There is no birthday date lock. This is a private owner-only Site, not yet ready to share with Shreya.

The Personalise controls save edits only to the current browser. Download the JSON and give it to Codex to update `dist/letters.js` and republish. They do not edit the live shared source. Opening letters is also remembered only on the current browser. Browser data clearing can erase both. Imported text is rendered with textContent, never HTML.

When the final content is ready, remove creator tools and draft notices for the recipient release, preserving the owner's local exported draft. Do not mistake hiding those controls for authentication. Actual access restrictions come from Sites hosting, not front-end JavaScript.

## Before birthday delivery

1. Personalise and approve all 15 letters, especially the memory blanks and birthday letter.
2. Supply a handful of photos, a short voice note for `hearmyvoice`, and optionally a birthday video for `howmuchiloveyou`. Only upload media intended for this gift.
3. Confirm her email, the exact birthday delivery time, and her timezone. Never infer midnight Sydney is midnight where she lives.
4. Choose restricted recipient access versus a public link. The Site currently supports external viewer invites, but adding her can send an invitation immediately. Do not invite her early or make the Site public without explicit approval.
5. Test the chosen recipient access and all supplied media. Owner access does not verify recipient access.
6. Finalise the email text and schedule delivery only with the confirmed recipient and timezone. No automation currently exists.

## Local development

Run `node scripts/check.mjs` for static checks. To preview, run `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist`, then open http://127.0.0.1:4173. Stop with Ctrl+C.

Source files: `dist/index.html`, `dist/style.css`, `dist/letters.js`, `dist/app.js`. Google Fonts are optional external typography assets; system fallbacks remain usable without them.
