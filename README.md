# Open When letters for Shreya

A private birthday website for Shreya with fifteen personalised letters, trip photographs and Dhruv's birthday voice memo.

## Design

The site uses a warm editorial style with cream paper tones, forest green, burgundy and dusty rose. It is responsive across desktop and mobile. Photographs use contained framing so faces and important details are not cropped.

Every original letter, introduction, closing message and photo caption is preserved exactly in the source. `scripts/check.mjs` protects that copy with fixed content hashes and verifies every photo and audio asset before deployment.

## Local development

Run the content and asset checks:

```bash
node scripts/check.mjs
```

Preview the site:

```bash
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Then open <http://127.0.0.1:4173/>. Stop the preview with `Ctrl+C`.

## Source

The deployed static site is in `dist/`:

* `index.html` contains the page structure and fixed page copy.
* `style.css` contains the responsive editorial design.
* `letters.js` contains the fifteen exact letter texts and photo assignments.
* `app.js` renders the cards and accessible letter dialog.
* `media/` contains the supplied photographs and voice memo.

The hosting project is identified by `.openai/hosting.json`.
