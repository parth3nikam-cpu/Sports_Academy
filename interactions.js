const interactiveSelector = 'button, a.button, .main-nav a, .text-action, .coach-action-link';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function isUnavailable(element) {
  return element.disabled || element.getAttribute('aria-disabled') === 'true';
}

function addInteractionRipple(element, event = null) {
  if (prefersReducedMotion.matches || isUnavailable(element)) return;

  const bounds = element.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'site-button-ripple';
  ripple.setAttribute('aria-hidden', 'true');
  ripple.style.left = `${event ? event.clientX - bounds.left : bounds.width / 2}px`;
  ripple.style.top = `${event ? event.clientY - bounds.top : bounds.height / 2}px`;
  ripple.style.setProperty('--ripple-size', `${Math.max(bounds.width, bounds.height) * 2.15}px`);
  element.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function enhanceInteractiveElement(element) {
  if (element.dataset.siteInteractive === 'true') return;
  element.dataset.siteInteractive = 'true';
  element.classList.add('site-interactive');

  const lightLayer = document.createElement('span');
  lightLayer.className = 'site-interaction-layer';
  lightLayer.setAttribute('aria-hidden', 'true');
  element.appendChild(lightLayer);

  element.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || prefersReducedMotion.matches || isUnavailable(element)) return;
    const bounds = element.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    element.style.setProperty('--interaction-x', `${x}px`);
    element.style.setProperty('--interaction-y', `${y}px`);

    if (element.matches('.main-nav a')) {
      element.style.setProperty('--nav-x', `${(x - (bounds.width / 2)) * 0.1}px`);
      element.style.setProperty('--nav-y', `${(y - (bounds.height / 2)) * 0.13}px`);
    }
  });

  element.addEventListener('pointerleave', () => {
    element.classList.remove('is-interaction-pressed');
    element.style.setProperty('--nav-x', '0px');
    element.style.setProperty('--nav-y', '0px');
  });

  element.addEventListener('pointerdown', (event) => {
    if (isUnavailable(element)) return;
    element.classList.add('is-interaction-pressed');
    addInteractionRipple(element, event);
  });

  ['pointerup', 'pointercancel'].forEach((eventName) => {
    element.addEventListener(eventName, () => element.classList.remove('is-interaction-pressed'));
  });

  element.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key) || event.repeat || isUnavailable(element)) return;
    element.classList.remove('is-key-activated');
    window.requestAnimationFrame(() => element.classList.add('is-key-activated'));
    addInteractionRipple(element);
  });

  element.addEventListener('animationend', (event) => {
    if (event.animationName === 'site-key-activate') element.classList.remove('is-key-activated');
  });
}

function enhanceWithin(root) {
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  if (root.matches?.(interactiveSelector)) enhanceInteractiveElement(root);
  root.querySelectorAll?.(interactiveSelector).forEach(enhanceInteractiveElement);
}

enhanceWithin(document);

const interactionObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach(enhanceWithin);
  });
});

interactionObserver.observe(document.body, { childList: true, subtree: true });
