# Portfolio site

A static site (no build step) with a generative particle background,
built to be hosted for free on GitHub Pages.

## Files

- `index.html` — page content and structure
- `style.css` — colors, type, layout
- `script.js` — the moving background + scroll progress bar
- `assets/` — put your CV PDF and any images here

## Before you publish — things to replace

- [ ] Your real name / surname in `index.html` (`<h1>` and page `<title>`)
- [ ] The bio paragraph in the About section if you want to adjust the tone
- [ ] Project repository / demo links (currently `href="#"` placeholders)
- [ ] Email address (`mailto:your.email@example.com`)
- [ ] GitHub and LinkedIn URLs in the Contact section
- [ ] `assets/CV.pdf` — add your actual CV PDF with that exact filename,
      or update the link in the "Download CV" button to match your filename

## Running it locally

No build tools needed — just open `index.html` in a browser, or for a local
server (recommended, avoids some browser file:// restrictions):

```bash
cd portfolio
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publishing on GitHub Pages

1. Create a new repository on GitHub. If you want it at `yourusername.github.io`
   (your main portfolio URL), name the repo exactly `yourusername.github.io`.
   Otherwise any repo name works — it'll be published at
   `yourusername.github.io/repo-name`.
2. Push these files to the repo:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio site"
   git branch -M main
   git remote add origin https://github.com/yourusername/REPO-NAME.git
   git push -u origin main
   ```
3. On GitHub: go to the repo → **Settings → Pages** → under "Build and
   deployment", set Source to **Deploy from a branch**, branch `main`,
   folder `/ (root)` → Save.
4. Wait a minute or two, then your site is live at the URL GitHub shows you.

## Customizing further

- **Colors** are all CSS variables at the top of `style.css` (`:root`) —
  change `--accent-amber` and `--accent-mint` to retheme the whole site.
- **Background motion** — in `script.js`, `linkDist` controls how far apart
  particles can be and still connect with a line; `maxSpeed` controls drift
  speed. Lower both for a calmer background.
- **Adding a project** — copy one `<article class="project">...</article>`
  block in `index.html` and edit its content.
- Motion respects `prefers-reduced-motion`, so visitors with that OS setting
  get a static frame instead of the animation.
