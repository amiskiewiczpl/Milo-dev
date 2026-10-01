const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      mainNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const aboutCarousel = document.querySelector('[data-about-carousel]');

if (aboutCarousel) {
  const slides = [...aboutCarousel.querySelectorAll('[data-carousel-slide]')];
  const status = aboutCarousel.querySelector('[data-carousel-status]');
  const toggleButton = aboutCarousel.querySelector('[data-carousel-toggle]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeSlide = 0;
  let timer;
  let isPaused = reducedMotion.matches;
  let isHovered = false;
  let isFocused = false;

  const updateSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    status.textContent = `${activeSlide + 1} / ${slides.length}`;
  };

  const updateToggle = () => {
    const canPlay = isPaused;
    toggleButton.textContent = canPlay ? 'Wznów' : 'Pauza';
    toggleButton.setAttribute('aria-label', `${canPlay ? 'Wznów' : 'Wstrzymaj'} automatyczne przewijanie`);
    toggleButton.setAttribute('aria-pressed', String(canPlay));
  };

  const scheduleNextSlide = () => {
    window.clearTimeout(timer);
    if (isPaused || isHovered || isFocused || document.hidden) return;
    timer = window.setTimeout(() => {
      updateSlide(activeSlide + 1);
      scheduleNextSlide();
    }, 5000);
  };

  toggleButton.addEventListener('click', () => {
    isPaused = !isPaused;
    updateToggle();
    scheduleNextSlide();
  });

  aboutCarousel.addEventListener('mouseenter', () => {
    isHovered = true;
    scheduleNextSlide();
  });

  aboutCarousel.addEventListener('mouseleave', () => {
    isHovered = false;
    scheduleNextSlide();
  });

  aboutCarousel.addEventListener('focusin', () => {
    isFocused = true;
    scheduleNextSlide();
  });

  aboutCarousel.addEventListener('focusout', (event) => {
    if (!aboutCarousel.contains(event.relatedTarget)) {
      isFocused = false;
      scheduleNextSlide();
    }
  });

  document.addEventListener('visibilitychange', scheduleNextSlide);
  reducedMotion.addEventListener('change', (event) => {
    isPaused = event.matches;
    updateToggle();
    scheduleNextSlide();
  });

  updateToggle();
  scheduleNextSlide();
}
