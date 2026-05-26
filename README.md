# isagenix-cursor-ai

## Optimizely Kickstart 90 CSS

Reusable CSS for the Kickstart 90 page lives in
[`optimizely/kickstart-90-reusable.css`](optimizely/kickstart-90-reusable.css).

The stylesheet is scoped to `.optly-kickstart` so it can be pasted into
Optimizely custom CSS without affecting the rest of the host page.

```html
<div class="optly-kickstart">
  <!-- Kickstart variation markup -->
</div>
```

Override experiment changes with CSS custom properties instead of editing
component rules:

```css
.optly-kickstart {
  --ks-color-brand-accent: #aa028b;
  --ks-hero-image: url("https://example.com/hero-desktop.jpg");
  --ks-hero-mobile-image: url("https://example.com/hero-mobile.jpg");
  --ks-button-background: var(--ks-color-brand-accent);
}

.optly-kickstart .kickstart-feature-card--nutrition {
  --ks-feature-card-image: url("https://example.com/card-desktop.jpg");
  --ks-feature-card-mobile-image: url("https://example.com/card-mobile.jpg");
}
```

Most reusable variables use the `--ks-*` prefix to avoid collisions with
existing site or Optimizely campaign styles.
