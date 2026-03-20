# Elio Navarrete - Portfolio Website

![Portfolio Preview](assets/img/about/about-ElioNavarrete.jpg)

A modern, multi-page portfolio website for Elio Navarrete — QA Lead, Professor & Author. Built with a dark premium aesthetic inspired by L'Arc-en-Ciel's official site, featuring bilingual support (EN/ES), WCAG-accessible markup, and modular SCSS architecture.

## Live Website

Visit: [elionavarretev.github.io](https://elionavarretev.github.io)

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Main portfolio — hero slider, news ticker, dual panels, services, discography grid, book showcase, footer |
| `news.html` | Filterable news/timeline page with focus + type filters and i18n |
| `profile.html` | Full CV-style profile — experience, education, certifications, publications |
| `blog/index.html` | Blog hub — filterable card grid (QA Strategy, Automation, AI in Testing, Research, Teaching) |

### Blog Articles (13)

| Article | Category | Read Time |
|---------|----------|-----------|
| `blog/vibe-testing-ai-qa.html` | AI in Testing | 8 min |
| `blog/shift-left-testing.html` | QA Strategy | 9 min |
| `blog/e2e-best-practices-playwright.html` | Automation | 11 min |
| `blog/ai-test-maintenance.html` | AI in Testing | 8 min |
| `blog/telehealth-qa-team.html` | QA Strategy | 10 min |
| `blog/playwright-vs-cypress-2026.html` | Automation | 12 min |
| `blog/risk-based-testing.html` | QA Strategy | 9 min |
| `blog/api-testing-microservices.html` | Automation | 11 min |
| `blog/teaching-qa-universities.html` | Teaching | 9 min |
| `blog/cicd-pipeline-testing.html` | Automation | 10 min |
| `blog/quality-gates-when-to-ship.html` | QA Strategy | 9 min |
| `blog/state-test-automation-2026.html` | Research | 10 min |
| `blog/manual-to-ai-qa-transformation.html` | AI in Testing | 10 min |

## Tech Stack

### Core
- **HTML5** — Semantic markup with ARIA landmarks, skip-link, `.sr-only` utilities
- **SCSS** — Modular architecture (12 partials compiled to 2 CSS files)
- **JavaScript** — jQuery, Swiper.js, MixItUp, client-side i18n engine
- **Bootstrap 4** — Grid system and base components

### Key Libraries
- **Swiper.js** — Hero slider, news ticker, banner carousel
- **MixItUp** — Portfolio/discography filtering and blog card filtering
- **Prism.js** — Syntax highlighting for code blocks in blog articles
- **Font Awesome + Simple Line Icons** — Iconography
- **Animate.css** — Scroll-triggered animations

### Infrastructure
- **GitHub Pages** — Static hosting from `master` branch
- **Google Tag Manager** — Analytics
- **Google AdSense** — Monetization (blog articles)
- **Open Graph + Twitter Cards** — Social sharing metadata
- **JSON-LD** — Person + BreadcrumbList + BlogPosting structured data
- **hreflang** — EN/ES/x-default language alternates

## Project Structure

```
elionavarretev.github.io/
├── index.html                  # Main portfolio page
├── news.html                   # News / timeline page
├── profile.html                # CV / profile page
├── blog/
│   ├── index.html              # Blog hub with filterable cards
│   ├── vibe-testing-ai-qa.html # Blog article
│   ├── shift-left-testing.html # Blog article
│   ├── e2e-best-practices-playwright.html
│   ├── ai-test-maintenance.html
│   ├── telehealth-qa-team.html
│   ├── playwright-vs-cypress-2026.html
│   ├── risk-based-testing.html
│   ├── api-testing-microservices.html
│   ├── teaching-qa-universities.html
│   ├── cicd-pipeline-testing.html
│   ├── quality-gates-when-to-ship.html
│   ├── state-test-automation-2026.html
│   └── manual-to-ai-qa-transformation.html
├── ads.txt                     # Google AdSense publisher verification
├── sitemap.xml                 # XML sitemap (18 URLs)
├── robots.txt                  # Crawl directives
├── assets/
│   ├── css/
│   │   ├── main.css            # Compiled from SCSS
│   │   └── responsive.css      # Responsive breakpoints
│   ├── scss/
│   │   ├── main.scss           # SCSS entry point
│   │   ├── responsive.scss     # Responsive entry point
│   │   ├── colors/_presets.scss # Design tokens (colors, fonts, spacing)
│   │   ├── _global.scss        # Base styles, resets, utilities
│   │   ├── _navbar.scss        # Navigation bar
│   │   ├── _hero-area.scss     # Hero slider section
│   │   ├── _about.scss         # News banner, update info, book section
│   │   ├── _dual-panels.scss   # Professional/Academic split panels
│   │   ├── _portfolio.scss     # Discography/portfolio grid
│   │   ├── _service.scss       # Services section with overlay cards
│   │   ├── _footer.scss        # Site footer
│   │   ├── _news-page.scss     # News page styles
│   │   └── _profile-page.scss  # Profile page styles
│   ├── js/
│   │   ├── main.js             # Core interactions
│   │   ├── menu.js             # Mobile menu
│   │   ├── i18n.js             # Client-side EN/ES translation engine
│   │   ├── news.js             # News page data loader
│   │   └── hover-sound.js      # Hover sound effects
│   ├── data/
│   │   ├── i18n.json           # Translation strings (EN + ES)
│   │   └── news.json           # News items data
│   ├── img/
│   │   ├── about/              # Profile photo
│   │   ├── background/         # Hero backgrounds (WebP + JPG)
│   │   ├── books/              # Book cover images
│   │   ├── icons/              # Certification/tool logos (SVG)
│   │   ├── panels/             # Dual panel badges (SVG)
│   │   ├── portfolio/          # Portfolio card images
│   │   ├── slider/             # Hero slider photos
│   │   └── favi/               # Favicons and app icons
│   ├── fonts/                  # Web fonts
│   └── doc/                    # Documents (CV, certificates)
```

## i18n System

Client-side translation engine using `data-i18n` attributes:

```html
<span data-i18n="nav.home">HOME</span>
```

Translations loaded from `assets/data/i18n.json`. Language toggle in navbar switches between EN/ES with `localStorage` persistence.

## SCSS Compilation

```bash
# Install sass (one-time)
npm install

# Compile main styles
npx sass assets/scss/main.scss assets/css/main.css --no-source-map

# Compile responsive styles
npx sass assets/scss/responsive.scss assets/css/responsive.css --no-source-map
```

## Accessibility

- Skip-link navigation (`Skip to main content`)
- ARIA landmarks: `banner`, `navigation`, `main`, `contentinfo`, `region`
- `aria-label` on all nav elements and interactive controls
- `role="dialog"` on mobile menu overlay
- `.sr-only` utility for visually hidden content
- WCAG AA color contrast compliance
- Semantic heading hierarchy (h1-h4)
- `alt` attributes on all images

## SEO

- Canonical URLs and hreflang alternates (en/es/x-default)
- Open Graph and Twitter Card meta tags
- JSON-LD structured data (Person + BreadcrumbList)
- XML sitemap with 18 pages
- robots.txt with sitemap reference
- Semantic HTML5 elements throughout

## Local Development

```bash
git clone https://github.com/elionavarretev/elionavarretev.github.io.git
cd elionavarretev.github.io
npx http-server . -p 8090 -c-1
# Open http://localhost:8090
```

## Deployment

Push to `master` branch — GitHub Pages deploys automatically at `https://elionavarretev.github.io`.

## Contact

**Elio Navarrete**
- LinkedIn: [linkedin.com/in/eliojeff](https://www.linkedin.com/in/eliojeff)
- GitHub: [github.com/elionavarretev](https://github.com/elionavarretev)
- ORCID: [orcid.org/0000-0001-8810-2068](https://orcid.org/0000-0001-8810-2068)

## License

This project is open source and available under the [MIT License](LICENSE).

## Monetization

- **Google AdSense** — Integrated across all 18 pages via auto-ads script
- **ads.txt** — Publisher verification file at site root
- **Amazon Affiliate** — Book promotion links in navbar and blog articles

*Last updated: March 2026*
