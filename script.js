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

const requestedPlan = new URLSearchParams(window.location.search).get('plan');
if (requestedPlan) {
  document.querySelector('#message').value = requestedPlan;
}

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

const coachLauncher = document.querySelector('#coach-launcher');
const coachAssistant = document.querySelector('#coach-assistant');
const coachClose = document.querySelector('#coach-close');
const coachForm = document.querySelector('#coach-input-form');
const coachInput = document.querySelector('#coach-input');
const coachMessages = document.querySelector('#coach-messages');

const coachAnswers = {
  sport: 'For an 8-year-old, soccer, basketball, swimming, tennis, and beginner cricket are all great choices. The best fit depends on what the child enjoys: team play, individual skill, water activities, or fast movement. We recommend trying an introductory session before choosing.',
  equipment: 'Equipment depends on the sport. Most beginners need comfortable sports clothing, athletic shoes, and a water bottle. Soccer usually needs shin guards and cleats; basketball needs court shoes; cricket needs a bat, pads, gloves, and helmet; swimming needs a swimsuit, goggles, and cap. Ask us before buying specialist gear because some programs provide starter equipment.',
  timings: 'Academy timings vary by sport, age group, and season. Youth sessions are generally scheduled after school on weekdays, with additional morning and afternoon sessions on weekends. Send us your preferred sport through the registration form and our team will confirm the current schedule.',
  fee: 'Fees vary by sport, program length, and training level. Introductory, group, camp, and performance programs have different rates. Use the registration form below and select your sport; our team will send you the current fee and any available trial-session options.',
  register: 'To register, go to the contact form on this page, enter your name, email, mobile number, select a sport, and send your message. Our academy team will contact you with the schedule, fee, and next steps.',
  greeting: 'Hi! I can help you choose a sport and answer questions about equipment, timings, fees, and registration. What would you like to know?',
  fallback: 'I can help with sport selection, equipment, academy timings, fees, and registration. Try asking one of those questions, or use the contact form for help from our academy team.'
};

let coachKnowledge = [];

function parseCoachKnowledge(fileText) {
  return fileText
    .split(/^---\s*$/m)
    .map((block) => {
      const question = block.match(/^Q:\s*(.+)$/m)?.[1]?.trim();
      const keywords = block.match(/^Keywords:\s*(.+)$/m)?.[1]?.trim();
      const answer = block.match(/^A:\s*([\s\S]+)$/m)?.[1]?.trim();
      if (!question || !answer) return null;
      return { question, keywords: keywords || '', answer };
    })
    .filter(Boolean);
}

const knowledgeReady = fetch('ai-coach-knowledge.txt')
  .then((response) => {
    if (!response.ok) throw new Error('Knowledge base could not be loaded.');
    return response.text();
  })
  .then((fileText) => {
    coachKnowledge = parseCoachKnowledge(fileText);
  })
  .catch(() => {
    // Local file previews can block text-file requests. Built-in answers remain available.
    coachKnowledge = [];
  });

function normalizeWords(text) {
  const ignoredWords = new Set(['a', 'an', 'and', 'are', 'can', 'do', 'for', 'how', 'i', 'is', 'of', 'the', 'to', 'what', 'which', 'with', 'you']);
  return [...new Set(text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((word) => word.length > 1 && !ignoredWords.has(word)))];
}

function findKnowledgeAnswer(question) {
  const userWords = normalizeWords(question);
  let bestMatch = null;
  let bestScore = 0;

  coachKnowledge.forEach((entry) => {
    const questionWords = normalizeWords(entry.question);
    const keywordWords = normalizeWords(entry.keywords);
    const questionScore = userWords.filter((word) => questionWords.includes(word)).length * 3;
    const keywordScore = userWords.filter((word) => keywordWords.includes(word)).length * 2;
    const score = questionScore + keywordScore;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  });

  return bestScore >= 2 ? bestMatch?.answer : null;
}

function getCoachAnswer(question) {
  const questionText = question.toLowerCase();
  if (/\b(hi|hello|hey)\b/.test(questionText)) return coachAnswers.greeting;
  if (/register|registration|enroll|enrol|join|sign up/.test(questionText)) return coachAnswers.register;
  if (/fee|fees|cost|price|payment/.test(questionText)) return coachAnswers.fee;
  if (/time|timing|schedule|open|hour/.test(questionText)) return coachAnswers.timings;
  if (/equipment|gear|need|bring|wear/.test(questionText)) return coachAnswers.equipment;
  if (/sport|8-year|8 year|child|kid|age/.test(questionText)) return coachAnswers.sport;
  return coachAnswers.fallback;
}

function addCoachMessage(message, sender, link = null) {
  const messageElement = document.createElement('div');
  messageElement.className = `coach-message ${sender}-message`;
  messageElement.textContent = message;
  if (link) {
    const actionLink = document.createElement('a');
    actionLink.className = 'coach-action-link';
    actionLink.href = link.href;
    actionLink.textContent = link.label;
    messageElement.appendChild(actionLink);
  }
  coachMessages.appendChild(messageElement);
  coachMessages.scrollTop = coachMessages.scrollHeight;
}

async function askCoach(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  addCoachMessage(cleanQuestion, 'user');
  await knowledgeReady;
  if (/custom subscription|custom plan|build.*plan|make.*subscription|own subscription|choose.*days/.test(cleanQuestion.toLowerCase())) {
    window.setTimeout(() => addCoachMessage(
      'You can create a custom sports subscription by choosing your sport and any number of training days from 1 to 365. Discounts are applied automatically.',
      'assistant',
      { href: 'custom-subscription.html', label: 'Build a custom subscription' }
    ), 350);
    return;
  }
  if (/subscription|subscribe|membership|payment|pay|hourly|monthly|quarterly|annual|six month|6 month/.test(cleanQuestion.toLowerCase())) {
    window.setTimeout(() => addCoachMessage(
      'You can compare all Peak training subscriptions and choose a payment plan on our subscriptions page.',
      'assistant',
      { href: 'subscriptions.html', label: 'View subscriptions & payment' }
    ), 350);
    return;
  }
  const answer = findKnowledgeAnswer(cleanQuestion) || getCoachAnswer(cleanQuestion);
  window.setTimeout(() => addCoachMessage(answer, 'assistant'), 350);
}

function setCoachOpen(isOpen) {
  coachAssistant.classList.toggle('open', isOpen);
  coachAssistant.setAttribute('aria-hidden', String(!isOpen));
  coachLauncher.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) coachInput.focus();
}

coachLauncher.addEventListener('click', () => {
  setCoachOpen(!coachAssistant.classList.contains('open'));
});

coachClose.addEventListener('click', () => setCoachOpen(false));

coachForm.addEventListener('submit', (event) => {
  event.preventDefault();
  askCoach(coachInput.value);
  coachForm.reset();
});

document.querySelectorAll('[data-question]').forEach((button) => {
  button.addEventListener('click', () => askCoach(button.dataset.question));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && coachAssistant.classList.contains('open')) {
    setCoachOpen(false);
    coachLauncher.focus();
  }
});
