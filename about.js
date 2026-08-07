const founderAvatar = document.querySelector('#founder-avatar');
const founderMonogram = document.querySelector('#founder-monogram');

function showFounderFallback() {
  founderAvatar.hidden = true;
  founderMonogram.hidden = false;
}

founderAvatar.addEventListener('error', showFounderFallback);
if (founderAvatar.complete && founderAvatar.naturalWidth === 0) {
  showFounderFallback();
}

document.querySelector('#current-year').textContent = new Date().getFullYear();
