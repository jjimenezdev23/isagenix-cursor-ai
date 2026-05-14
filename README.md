# isagenix-cursor-ai

## Kickstart 90 CSS foundation

The `styles/kickstart-90.css` file initializes the Kickstart 90 visual system from the supplied screenshot.

It includes:

- Color variables for the core foundation, section backgrounds, and typography palette.
- Typography variables for the display, heading, body, eyebrow, and CTA scale.
- Base reset styles, semantic element defaults, and reusable `.section`, `.container`, `.card`, `.button`, `.cta`, and type utility classes.

Import it once at the app entry point or in the main stylesheet:

```css
@import "./styles/kickstart-90.css";
```

The `index.html` file shows the first Kickstart 90 hero section without the header. The hero uses CSS variables for the annotated Nunito Sans type, magenta label/CTA, headline sizing, and background treatment.

To add the real hero image, set the `--hero-image` variable. The image is rendered on `.kickstart-hero::after` as an absolute decorative layer, while `.kickstart-hero::before` keeps the white readability overlay separate.

```css
:root {
  --hero-image: url("./assets/kickstart-hero.jpg");
  --hero-image-position: center right;
  --hero-image-size: cover;
}
```

The second section is the Kickstart 90 overview with three feature cards. Each card image is also variable-driven through `--feature-card-image`, so real imagery can be assigned per card class:

```css
.kickstart-feature-card--nutrition {
  --feature-card-image: url("./assets/nutrition.jpg");
}
```

The nutrition proof section includes a Vimeo-ready video panel. Replace the placeholder inside `.kickstart-video-panel` with a Vimeo iframe when the video ID is available:

```html
<iframe
  src="https://player.vimeo.com/video/VIMEO_ID"
  title="Kickstart 90 nutrition video"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
></iframe>
```

The rewards section uses a variable-driven media layer and prize cards. Swap in the real left-side image with:

```css
:root {
  --rewards-media-image: url("./assets/rewards.jpg");
}
```
