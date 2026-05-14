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
