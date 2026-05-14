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

  let activeIndex = Math.min(1, cards.length - 1);

  const getVisibleCount = () => {
    const styles = getComputedStyle(slider);
    const visibleCount = Number.parseInt(
      styles.getPropertyValue("--testimonial-card-visible-count"),
      10,
    );

    return Number.isNaN(visibleCount) ? 3 : visibleCount;
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

  cards.forEach((_, index) => {
    const dot = document.createElement("button");

    dot.className = "kickstart-testimonials__dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.addEventListener("click", () => setActiveIndex(index));
    dotsContainer.append(dot);
  });

  previousButton.addEventListener("click", () =>
    setActiveIndex(activeIndex - 1),
  );
  nextButton.addEventListener("click", () => setActiveIndex(activeIndex + 1));
  window.addEventListener("resize", updateSlider);

  updateSlider();
})();
