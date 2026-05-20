(function () {
  const slider = document.querySelector("[data-slider]");

  if (!slider) {
    return;
  }

  const track = slider.querySelector("[data-track]");
  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const prevButton = slider.querySelector("[data-prev]");
  const nextButton = slider.querySelector("[data-next]");
  const dotsContainer = slider.querySelector("[data-dots]");
  const mobileQuery = window.matchMedia("(max-width: 767px)");
  let activeIndex = 0;
  let autoplayId;
  let isJumping = false;

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);

  firstClone.classList.add("is-clone");
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.classList.add("is-clone");
  lastClone.setAttribute("aria-hidden", "true");
  track.prepend(lastClone);
  track.append(firstClone);

  const mobileSlides = [lastClone, ...slides, firstClone];
  const dots = Array.from({ length: getDesktopMaxIndex() + 1 }, (_, index) => {
    const dot = document.createElement("button");
    dot.className = "testimonial-slider__dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial group ${index + 1}`);
    dot.addEventListener("click", () => {
      setActiveSlide(index);
    });
    dotsContainer.append(dot);
    return dot;
  });

  function getSlideStep() {
    if (slides.length < 2) {
      return slides[0]?.getBoundingClientRect().width || 0;
    }

    return slides[1].offsetLeft - slides[0].offsetLeft;
  }

  function getDesktopMaxIndex() {
    return Math.max(slides.length - 3, 0);
  }

  function getClampedIndex(index) {
    return Math.min(Math.max(index, 0), getDesktopMaxIndex());
  }

  function getMobileOffset(trackIndex) {
    const targetSlide = mobileSlides[trackIndex];
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
    return -(index * getSlideStep());
  }

  function updateDots() {
    dots.forEach((dot, index) => {
      dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  }

  function updateActiveCards(trackIndex) {
    mobileSlides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === trackIndex);
    });
  }

  function moveToMobileTrackIndex(trackIndex, animate = true) {
    const offset = getMobileOffset(trackIndex);

    track.style.transition = animate ? "" : "none";
    track.style.transform = `translateX(${offset}px)`;
    updateActiveCards(trackIndex);

    if (!animate) {
      void track.offsetHeight;
      track.style.transition = "";
    }
  }

  function resetMobilePosition() {
    isJumping = true;
    moveToMobileTrackIndex(activeIndex + 1, false);
    isJumping = false;
  }

  function setActiveSlide(index, animate = true) {
    if (mobileQuery.matches) {
      if (index > slides.length - 1) {
        activeIndex = 0;
        moveToMobileTrackIndex(slides.length + 1, animate);
        return;
      }

      if (index < 0) {
        activeIndex = slides.length - 1;
        moveToMobileTrackIndex(0, animate);
        return;
      }

      activeIndex = index;
      moveToMobileTrackIndex(activeIndex + 1, animate);
      return;
    }

    activeIndex = getClampedIndex(index);
    track.style.transition = "";
    track.style.transform = `translateX(${getDesktopOffset(activeIndex)}px)`;
    updateActiveCards(activeIndex + 1);
    updateDots();
  }

  function startAutoplay() {
    stopAutoplay();

    if (!mobileQuery.matches) {
      return;
    }

    autoplayId = window.setInterval(() => {
      setActiveSlide(activeIndex + 1);
    }, 3000);
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

  track.addEventListener("transitionend", () => {
    if (!mobileQuery.matches || isJumping) {
      return;
    }

    resetMobilePosition();
  });

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  window.addEventListener("resize", () => {
    setActiveSlide(activeIndex);
    startAutoplay();
  });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", () => {
      setActiveSlide(activeIndex);
      startAutoplay();
    });
  }

  setActiveSlide(0, false);
  startAutoplay();
})();
