const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

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

document.querySelector('#current-year').textContent = new Date().getFullYear();

const contactForm = document.querySelector('#academy-contact-form');
const formStatus = document.querySelector('#form-status');
const submitButton = contactForm.querySelector('button[type="submit"]');
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: responseData.toString()
    });

    formStatus.textContent = `Thanks, ${name}! Your message was sent successfully. We will contact you soon.`;
    contactForm.reset();
  } catch (error) {
    formStatus.classList.add('error');
    formStatus.textContent = 'We could not send your message. Please check your connection and try again.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send Message';
  }
});
