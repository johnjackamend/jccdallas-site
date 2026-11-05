# jccdallas.org

Static site for the Aaron Family JCC of Dallas, hosted on Netlify. Pushes to `main` deploy automatically.

- Pages: one folder per URL with an `index.html`
- Programs and events: `data/programs.json` (feeds /events, the homepage, and the site-wide search band)
- J Collective posts: `data/blog.json` plus a page per post under `j-collective/`
- Redirects: `_redirects` (Netlify format); headers: `_headers`
- Staff portal: `/staff-portal/`, content managed in a Google Sheet (see Claude Project notes)
- Images: Webflow CDN (`cdn.prod.website-files.com`, kept alive on the free Webflow plan) and `jdallas-assets.netlify.app`
