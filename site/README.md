# custom-mygrid website

A buildless static landing page. No package manager, remote fonts, analytics or
JavaScript is required. All page assets are served locally; external links lead
to the source repositories and GitHub-rendered Markdown documentation.

## Preview

From the repository root:

```sh
python3 scripts/build-site.py
python3 -m http.server 8080 --directory _site --bind 127.0.0.1
```

Open http://127.0.0.1:8080. The same relative asset paths also work under the
published `/custom-mygrid/` prefix. The build replaces `_site/`, copies `site/`
(except this README), shared `assets/`, and the root `LICENSE`, and adds
`.nojekyll`. Generated output is ignored by Git. Run the build again after edits.

## Publish

In GitHub **Settings → Pages**, choose **GitHub Actions** as the source.
The Website workflow assembles an artifact for pull requests and deploys only
from `main`. A manual workflow run on `main` can redeploy it.
Expected public URL: https://tjorim.github.io/custom-mygrid/.

Long-form content lives in `docs/` and is rendered by GitHub, not by this build.
Keep library documentation in its own repository and link to it. The VoltBridge
API reference lives in `docs/voltbridge-api.md`; it is linked from the landing
page and is not copied into the site build.
