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
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeSlide = 0;
  let timer;

  const updateSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
  };

  const scheduleNextSlide = () => {
    window.clearTimeout(timer);
    if (reducedMotion.matches || document.hidden) return;
    timer = window.setTimeout(() => {
      updateSlide(activeSlide + 1);
      scheduleNextSlide();
    }, 5000);
  };

  document.addEventListener('visibilitychange', scheduleNextSlide);
  reducedMotion.addEventListener('change', scheduleNextSlide);

  scheduleNextSlide();
}
