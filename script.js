const navigation = document.querySelector('.main-nav');
const navigationLinks = [...navigation.querySelectorAll('a')];
const sectionNavigationLinks = navigationLinks.filter((link) => link.getAttribute('href')?.startsWith('#'));
const visibleNavigationSections = new Map();

if ('IntersectionObserver' in window) {
  const navigationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleNavigationSections.set(entry.target.id, entry.intersectionRatio);
      else visibleNavigationSections.delete(entry.target.id);
    });

    const activeSection = [...visibleNavigationSections.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    sectionNavigationLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${activeSection}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else if (link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -60% 0px', threshold: [0.05, 0.25, 0.5, 0.75] });

  sectionNavigationLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) navigationObserver.observe(section);
  });
}

const contactForm = document.querySelector('#academy-contact-form');
const messageField = document.querySelector('#message');
const formStatus = document.querySelector('#form-status');
const submitButton = contactForm.querySelector('button[type="submit"]');
const requestedPlan = new URLSearchParams(window.location.search).get('plan');

if (requestedPlan) {
  messageField.value = requestedPlan;
  contactForm.classList.add('plan-loaded');
  formStatus.textContent = 'Your selected plan has been added. Complete your details to continue.';
}

const programCards = [...document.querySelectorAll('.program-card')];
const selectedProgramName = document.querySelector('#selected-program-name');
const selectedProgramSummary = document.querySelector('#selected-program-summary');
const selectedProgramAction = document.querySelector('#selected-program-action');

function selectProgram(card) {
  programCards.forEach((programCard) => {
    const isSelected = programCard === card;
    programCard.classList.toggle('is-selected', isSelected);
    const selectButton = programCard.querySelector('.program-select');
    selectButton.setAttribute('aria-pressed', String(isSelected));
    selectButton.innerHTML = isSelected
      ? 'Selected <span aria-hidden="true">&#10003;</span>'
      : 'Choose program <span aria-hidden="true">&rarr;</span>';
  });

  selectedProgramName.textContent = card.dataset.program;
  selectedProgramSummary.textContent = card.dataset.summary;
}

programCards.forEach((card) => {
  card.querySelector('.program-select').addEventListener('click', () => selectProgram(card));

  card.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = card.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    card.style.setProperty('--spot-x', `${x}px`);
    card.style.setProperty('--spot-y', `${y}px`);
    card.style.setProperty('--tilt-x', `${((y / bounds.height) - 0.5) * -3}deg`);
    card.style.setProperty('--tilt-y', `${((x / bounds.width) - 0.5) * 3}deg`);
  });

  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  });
});

selectedProgramAction.addEventListener('click', () => {
  messageField.value = `I would like to learn more about the ${selectedProgramName.textContent} program.`;
});

const googleFormEndpoint = 'https://docs.google.com/forms/d/e/1FAIpQLSd_SSEP9a_roGx0edykitzeqfp6JHqs5gCLEzRBrrCy0YJifw/formResponse';

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  const name = contactForm.elements.name.value.trim();
  const responseData = new URLSearchParams({
    'entry.337899965': name,
    'entry.1642063683': contactForm.elements.email.value.trim(),
    'entry.1902716118': contactForm.elements.mobile.value.trim(),
    'entry.758413488': contactForm.elements.sport.options[contactForm.elements.sport.selectedIndex].text,
    'entry.1173633339': contactForm.elements.message.value.trim()
  });

  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  formStatus.classList.remove('error');
  formStatus.textContent = '';

  try {
    await fetch(googleFormEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: responseData.toString()
    });

    formStatus.textContent = `Thanks, ${name}! Your message was sent successfully. We will contact you soon.`;
    contactForm.reset();
    contactForm.classList.remove('plan-loaded');
  } catch (error) {
    formStatus.classList.add('error');
    formStatus.textContent = 'We could not send your message. Please check your connection and try again.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send Message';
  }
});
