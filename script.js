(function () {
  const slider = document.querySelector("[data-testimonial-slider]");

  if (!slider) {
    return;
  }

  const track = slider.querySelector("[data-slider-track]");
  const slides = Array.from(slider.querySelectorAll("[data-slider-card]"));
  const prevButton = slider.querySelector("[data-slider-prev]");
  const nextButton = slider.querySelector("[data-slider-next]");
  const dotsContainer = slider.querySelector("[data-slider-dots]");
  const mobileQuery = window.matchMedia("(max-width: 767px)");
  const cloneCount = Math.min(3, slides.length);
  let activeIndex = 0;
  let autoplayId;
  let currentTrackIndex = cloneCount;
  let pendingSnap = false;
  let snapTimeout;

  if (!track || slides.length === 0) {
    return;
  }

  function createClone(slide) {
    const clone = slide.cloneNode(true);

    clone.classList.add("is-clone");
    clone.setAttribute("aria-hidden", "true");
    return clone;
  }

  const beforeClones = slides.slice(-cloneCount).map(createClone);
  const afterClones = slides.slice(0, cloneCount).map(createClone);

  track.prepend(...beforeClones);
  track.append(...afterClones);

  const trackSlides = [...beforeClones, ...slides, ...afterClones];
  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = "kickstart-testimonials__dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial group ${index + 1}`);
    dot.addEventListener("click", () => {
      setActiveSlide(index);
    });
    dotsContainer.append(dot);
    return dot;
  });

  function getSlideStep() {
    if (trackSlides.length < 2) {
      return trackSlides[0]?.getBoundingClientRect().width || 0;
    }

    return (
      trackSlides[cloneCount + 1].offsetLeft -
      trackSlides[cloneCount].offsetLeft
    );
  }

  function getMobileOffset(trackIndex) {
    const targetSlide = trackSlides[trackIndex];
    const slideWidth = targetSlide.offsetWidth;
    const viewportWidth = Math.min(
      window.innerWidth,
      document.documentElement.clientWidth,
      slider.getBoundingClientRect().width,
    );
    const centerOffset = (viewportWidth - slideWidth) / 2;

    return centerOffset - targetSlide.offsetLeft;
  }

  function getDesktopOffset(index) {
    return index * getSlideStep();
  }

  function updateDots() {
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function updateActiveCards(trackIndex) {
    trackSlides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === trackIndex);
      slide.classList.remove("is-visible");
    });

    slides.forEach((slide, index) => {
      const visibleOffset =
        (index - activeIndex + slides.length) % slides.length;
      const isVisible = mobileQuery.matches
        ? index === activeIndex
        : visibleOffset >= 0 && visibleOffset < cloneCount;

      slide.classList.toggle("is-visible", isVisible);
    });
  }

  function moveToTrackIndex(trackIndex, animate = true) {
    currentTrackIndex = trackIndex;

    if (mobileQuery.matches) {
      const offset = getMobileOffset(currentTrackIndex);

      track.scrollLeft = 0;
      track.style.transition = animate ? "" : "none";
      track.style.transform = `translateX(${offset}px)`;
    } else {
      track.style.transform = "";
      track.scrollTo({
        left: getDesktopOffset(currentTrackIndex),
        behavior: animate ? "smooth" : "auto",
      });
    }

    updateActiveCards(currentTrackIndex);

    if (!animate && mobileQuery.matches) {
      void track.offsetHeight;
      track.style.transition = "";
    }
  }

  function snapToRealSlide() {
    pendingSnap = false;
    moveToTrackIndex(cloneCount + activeIndex, false);
  }

  function scheduleSnap(animate) {
    window.clearTimeout(snapTimeout);

    if (!animate) {
      snapToRealSlide();
      return;
    }

    if (!mobileQuery.matches) {
      snapTimeout = window.setTimeout(snapToRealSlide, 460);
    }
  }

  function setActiveSlide(index, animate = true) {
    if (index > slides.length - 1) {
      activeIndex = 0;
      pendingSnap = true;
      moveToTrackIndex(cloneCount + slides.length, animate);
      updateDots();
      scheduleSnap(animate);
      return;
    }

    if (index < 0) {
      activeIndex = slides.length - 1;
      pendingSnap = true;
      moveToTrackIndex(cloneCount - 1, animate);
      updateDots();
      scheduleSnap(animate);
      return;
    }

    activeIndex = index;
    pendingSnap = false;
    window.clearTimeout(snapTimeout);
    moveToTrackIndex(cloneCount + activeIndex, animate);
    updateDots();
  }

  function startAutoplay() {
    stopAutoplay();

    if (!mobileQuery.matches) {
      return;
    }

    const autoplayInterval =
      Number.parseInt(
        getComputedStyle(slider)
          .getPropertyValue("--testimonial-autoplay-interval")
          .trim(),
        10,
      ) || 3000;

    autoplayId = window.setInterval(() => {
      setActiveSlide(activeIndex + 1);
    }, autoplayInterval);
  }

  function stopAutoplay() {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = undefined;
    }
  }

  prevButton.addEventListener("click", () => {
    setActiveSlide(activeIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    setActiveSlide(activeIndex + 1);
  });

  track.addEventListener("transitionend", (event) => {
    if (
      event.target === track &&
      event.propertyName === "transform" &&
      mobileQuery.matches &&
      pendingSnap
    ) {
      snapToRealSlide();
    }
  });

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  window.addEventListener("resize", () => {
    setActiveSlide(activeIndex, false);
    startAutoplay();
  });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", () => {
      setActiveSlide(activeIndex, false);
      startAutoplay();
    });
  }

  setActiveSlide(0, false);
  startAutoplay();
})();
