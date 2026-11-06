# 🍵 Matcha · The Art of Taking a Pause

Developed by Gisela Rosibel Scarpin.

A Spanish-language portfolio landing page about turning matcha preparation into a daily ritual.

## 📥 Clone and run the project locally

You’ll need Node.js **22.23.4 or later** and pnpm.

```sh
git clone https://github.com/giselars/matcha-ritual-web.git
cd matcha-ritual-web
pnpm install
pnpm dev
```

Open the local URL printed by Astro, usually `http://localhost:4321`. The page loads images and video from Cloudinary and Libre Baskerville from Google Fonts.

To build and preview the production site, run `pnpm build` followed by `pnpm preview`. Astro writes the static files to `dist/`.

## 📸 Desktop and mobile screenshots

### Desktop

![Desktop view of the Matcha landing page](docs/screenshots/desktop.jpg)

### Mobile

![Mobile view of the Matcha landing page](docs/screenshots/mobile.jpg)

## 🔧 Solution overview

- A responsive landing page introduces matcha, walks through its preparation, and presents a sample product collection and FAQ. The products are illustrative.
- The ritual gallery supports keyboard navigation and manual playback controls. It pauses autoplay when the tab is hidden and respects the visitor’s reduced-motion preference.
- Product details open in native dialogs, and the hero video has a play/pause control.

## 🏗️ Proposed architecture

Astro builds a single static page from section components. The shared layout defines the document metadata and loads global styles. Small JavaScript modules handle the ritual gallery, product dialogs, video playback, and animations in the browser. The site can be deployed to a static host.

## 📁 Project structure

```text
src/
├── pages/index.astro        # Landing page and browser script entry point
├── layouts/Layout.astro     # Page metadata, font, and global CSS
├── components/             # Landing page sections and product dialog
├── scripts/
│   ├── landing.js           # Product dialogs, icons, and hero video controls
│   ├── motion.js            # Scroll reveals and FAQ animations
│   └── ritual-gallery.js    # Ritual tabs and playback
└── styles/matcha.css        # Global and responsive styles
public/
├── favicon.svg
└── assets/icons/           # Local SVG icons and their license
docs/                        # Screenshots and creative roadmap
tests/ritual-gallery.test.mjs # Ritual gallery tests
```

## 🛠️ Technologies used

- **Astro** for static HTML and reusable page components.
- **CSS and JavaScript** for responsive layouts and browser interactions.
- **GSAP and ScrollTrigger** for entrance and scroll animations.
- **Cloudinary** for images and video, **pnpm** for dependency management, and **Node.js** for the build and test tooling.

## 🧪 Tests

```sh
node --test
```

The three ritual gallery tests cover autoplay and pause conditions, keyboard selection, image-load failure and retry, and rapid selection changes.
