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
