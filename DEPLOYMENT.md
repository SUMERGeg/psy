# GitHub Pages

Repository: https://github.com/SUMERGeg/psy
Website: https://SUMERGeg.github.io/psy/

Settings → Pages → Source: **GitHub Actions**.
Pushes to `main` run `.github/workflows/pages.yml`: install locked dependencies, run tests, export Next.js, check all seven visible pages and local assets, then deploy the static artifact.

The deployment uses `SITE_MODE=preview`, preserves demo content and `noindex,nofollow` metadata. It is publicly accessible; noindex is not access protection. Production content approval checks remain intact.

Local development remains `npm ci` then `npm run dev` on port 3000, without `/psy`.

To reproduce the Pages export in PowerShell:

```powershell
$env:GITHUB_PAGES='true'
$env:SITE_MODE='preview'
$env:SITE_URL='https://SUMERGeg.github.io'
npm run build
node --experimental-strip-types scripts/prepare-pages-export.mjs
node scripts/check-pages-export.mjs
```

Next.js exports to `.next-pages/` via its custom `distDir`; GitHub deploys that directory at `/psy/`. Images are already compressed WebP and served directly because Pages has no Next.js image server. Next.js handles the prefix for links and fonts; the image and animated-router helpers handle their own prefix explicitly.

`.env.local`, build output, development notes and original Instagram screenshots are not included in the repository upload.
