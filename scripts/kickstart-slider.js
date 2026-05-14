(() => {
  const slider = document.querySelector("[data-testimonial-slider]");

  if (!slider) {
    return;
  }

  const track = slider.querySelector("[data-slider-track]");
  const cards = Array.from(slider.querySelectorAll("[data-slider-card]"));
  const previousButton = slider.querySelector("[data-slider-prev]");
  const nextButton = slider.querySelector("[data-slider-next]");
  const dotsContainer = slider.querySelector("[data-slider-dots]");

  if (
    !track ||
    cards.length === 0 ||
    !previousButton ||
    !nextButton ||
    !dotsContainer
  ) {
    return;
  }

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let activeIndex = Math.min(1, cards.length - 1);
  let autoplayTimer;
  let hasFocusWithin = false;
  let isPointerOver = false;

  const getVisibleCount = () => {
    const styles = getComputedStyle(slider);
    const visibleCount = Number.parseInt(
      styles.getPropertyValue("--testimonial-card-visible-count"),
      10,
    );

    return Number.isNaN(visibleCount) ? 3 : visibleCount;
  };

  const getAutoplayInterval = () => {
    const styles = getComputedStyle(slider);
    const interval = Number.parseInt(
      styles.getPropertyValue("--testimonial-autoplay-interval"),
      10,
    );

    return Number.isNaN(interval) ? 5000 : interval;
  };

  const getVisibleIndices = () => {
    const visibleCount = getVisibleCount();

    if (visibleCount <= 1) {
      return [activeIndex];
    }

    return [-1, 0, 1].map(
      (offset) => (activeIndex + offset + cards.length) % cards.length,
    );
  };

  const updateSlider = () => {
    const visibleIndices = getVisibleIndices();

    cards.forEach((card, index) => {
      const isActive = index === activeIndex;
      const visiblePosition = visibleIndices.indexOf(index);
      const isVisible = visiblePosition !== -1;

      card.classList.toggle("is-active", isActive);
      card.classList.toggle("is-visible", isVisible);
      card.setAttribute("aria-hidden", isActive ? "false" : "true");
      card.style.order = isVisible ? String(visiblePosition + 1) : "";
    });

    Array.from(dotsContainer.children).forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    track.scrollTo({ left: 0, behavior: "smooth" });
  };

  const setActiveIndex = (index) => {
    activeIndex = (index + cards.length) % cards.length;
    updateSlider();
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
  };

  const startAutoplay = () => {
    stopAutoplay();

    if (
      cards.length <= 1 ||
      reducedMotionQuery.matches ||
      document.hidden ||
      hasFocusWithin ||
      isPointerOver
    ) {
      return;
    }

    autoplayTimer = window.setInterval(() => {
      setActiveIndex(activeIndex + 1);
    }, getAutoplayInterval());
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  cards.forEach((_, index) => {
    const dot = document.createElement("button");

    dot.className = "kickstart-testimonials__dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.addEventListener("click", () => {
      setActiveIndex(index);
      restartAutoplay();
    });
    dotsContainer.append(dot);
  });

  previousButton.addEventListener("click", () => {
    setActiveIndex(activeIndex - 1);
    restartAutoplay();
  });
  nextButton.addEventListener("click", () => {
    setActiveIndex(activeIndex + 1);
    restartAutoplay();
  });
  slider.addEventListener("mouseenter", () => {
    isPointerOver = true;
    stopAutoplay();
  });
  slider.addEventListener("mouseleave", () => {
    isPointerOver = false;
    startAutoplay();
  });
  slider.addEventListener("focusin", () => {
    hasFocusWithin = true;
    stopAutoplay();
  });
  slider.addEventListener("focusout", (event) => {
    hasFocusWithin = slider.contains(event.relatedTarget);
    startAutoplay();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }

    startAutoplay();
  });
  reducedMotionQuery.addEventListener("change", restartAutoplay);
  window.addEventListener("resize", updateSlider);

  updateSlider();
  startAutoplay();
})();
