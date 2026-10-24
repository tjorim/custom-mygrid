# Website development and publishing

The hub uses Astro to build a static landing page and documentation with the
existing green and cream design. It needs no server runtime, client framework,
remote fonts or analytics. There are no JavaScript interactions to carry over:
section links, scrollable tables and native disclosure controls work without JS.

## Local development

From the repository root, use Node **24.14.0** (`nvm use`) and npm **10.9.8**.
Astro and the Markdown processor are pinned in `package.json`; commit changes to
`package-lock.json` together with dependency changes. CI explicitly installs the
pinned npm version before running `npm ci`.

```sh
npm install --global npm@10.9.8
npm ci
npm run dev
```

Open <http://127.0.0.1:4321/custom-mygrid/>. Markdown, layout and CSS edits refresh
in development. After adding assets, restart the command to copy them again.
To inspect exactly what will be published:

```sh
npm test
npm run build
npm run check:site
npm run preview
```

Preview uses the same URL and repository prefix. `npm test` runs focused routing
tests and works immediately after `npm ci`, without a prior build. After
`npm run build`, `npm run check:site` validates all output pages, internal links,
fragments, local assets and legacy redirect targets, and that every shared page
carries its canonical URL, Open Graph image and description. The old
`python3 scripts/build-site.py` entry point now delegates to the Astro build;
install dependencies first.

## Project structure

- `site/src/pages/index.astro`: the custom landing page, with its original content.
- `site/src/layouts/SiteLayout.astro`: shared metadata (canonical URL, Open Graph, icons),
  skip link, header and footer.
- `site/src/pages/404.astro`: the not-found page GitHub Pages serves for unknown URLs.
- `site/src/pages/docs/[...slug].astro`: documentation shell, navigation, table of
  contents and explicit GitHub source/edit links.
- `site/src/styles/global.css`: shared design and responsive documentation styles.
- `docs/*.md`: the canonical setup guides, index, architecture and API reference.
  These stay in place so existing GitHub links and contributor habits still work.
- `site/README.md`: this guide, also rendered at `docs/website/`.
- `site/lib/paths.mjs` and `remark-links.mjs`: shared routing and Markdown URL
  rewriting, without changing the source Markdown.
- `site/lib/nav.mjs`: the grouped documentation navigation. `site/lib/describe.mjs`
  derives each page's meta description from its first paragraph.
- `scripts/prepare-site.mjs`: copies `assets/`, optional `docs/assets/`, and
  `LICENSE` into generated `site/public/`, and adds `.nojekyll`.
- `_site/`: generated static output, ignored together with `site/public/` and
  Astro's cache. There are no hand-maintained HTML copies of the Markdown.

## Markdown routes and links

`docs/README.md` renders at `/custom-mygrid/docs/`; other `docs/*.md` files render
at `/custom-mygrid/docs/<filename>/`. The route discovers all Markdown in that
directory automatically. Add every new page to the documentation navigation
in `site/lib/nav.mjs`; `npm test` fails when a published page is missing. This contributor guide renders at `docs/website/`.

Astro's Unified Markdown processor supplies GitHub-flavored tables, fenced code
highlighting and heading IDs. A Remark transform resolves relative links from the
**source file's directory**, maps Markdown destinations to published routes, and
preserves query strings and anchors. Markdown links and reference definitions
share the same transform. Relative images under `assets/` or `docs/assets/` are
served from those paths within the prefix. Put documentation images in
`docs/assets/` and reference them as `assets/example.png`; use Markdown image
syntax so the transform sees them. Links to other repository files use GitHub.
External URLs, mail links and fragment-only links are left intact. Keep raw HTML
URLs prefix-aware yourself; they do not pass through the Markdown URL transform.

Existing landing page section IDs and documentation heading IDs remain usable.
Astro generates static refresh pages for legacy `docs/*.md` paths and
`site/README.md`, since GitHub Pages cannot issue HTTP redirects. Existing GitHub
URLs remain valid source links. Guide links on the landing page now open the hub.

## Repository prefix

`site/astro.config.mjs` sets `site: 'https://tjorim.github.io'`, static output and
trailing slashes. `site/lib/paths.mjs` defines `/custom-mygrid/` once; layouts,
landing page links, Markdown transforms and compatibility routes all use it.
Astro prefixes its generated CSS assets. Do not add a second prefix manually.
For another repository, change the site origin, base and repository URL, then run
the production build and link checker under that prefix before publishing.

## CI and deployment

In GitHub **Settings → Pages**, choose **GitHub Actions** as the source.
The Website workflow installs the pinned Node and npm toolchain, runs `npm ci`,
builds all pages and validates output for both pull requests and pushes to `main`.
Its path filters include Markdown, site sources, assets, build scripts, dependency
manifests and the Node pin. It uploads `_site/` with `upload-pages-artifact` and
uses the existing Pages deploy job only on `main`. Manual runs on `main` can
redeploy; manual runs on other branches build and test without publishing.
Expected public URL: <https://tjorim.github.io/custom-mygrid/>.

This layout is reusable without a shared package or identical branding: preserve
each project's Markdown locations, derive routes from them, share one page shell,
centralize the base path, pin dependencies, and verify the prefixed build in PR CI.
Search is deferred: six documentation pages are readily reachable through the
navigation and per-page contents list.
