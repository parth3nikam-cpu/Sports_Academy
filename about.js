const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const founderAvatar = document.querySelector('#founder-avatar');
const founderMonogram = document.querySelector('#founder-monogram');

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navigation.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

function showFounderFallback() {
  founderAvatar.hidden = true;
  founderMonogram.hidden = false;
}

founderAvatar.addEventListener('error', showFounderFallback);
if (founderAvatar.complete && founderAvatar.naturalWidth === 0) {
  showFounderFallback();
}

document.querySelector('#current-year').textContent = new Date().getFullYear();
