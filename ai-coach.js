const coachMarkup = `
  <button class="coach-launcher" id="coach-launcher" type="button" aria-expanded="false" aria-controls="coach-assistant">
    <span class="coach-launcher-icon" aria-hidden="true">AI</span>
    <span>Ask Coach</span>
  </button>

  <aside class="coach-assistant" id="coach-assistant" aria-label="AI Coach Assistant" aria-hidden="true">
    <header class="coach-header">
      <div class="coach-avatar" aria-hidden="true">P</div>
      <div>
        <strong>Peak AI Coach</strong>
        <span><i aria-hidden="true"></i> Ready to help</span>
      </div>
      <button class="coach-close" id="coach-close" type="button" aria-label="Close AI Coach">&times;</button>
    </header>

    <div class="coach-messages" id="coach-messages" aria-live="polite">
      <div class="coach-message assistant-message">Hi! I am your Peak AI Coach. Ask me about sports, training, schedules, equipment, plans, payments, or registration.</div>
      <div class="coach-suggestions" aria-label="Suggested questions">
        <button type="button" data-question="Which sport suits an 8-year-old?">Choose a sport</button>
        <button type="button" data-question="How does the academy work?">How we work</button>
        <button type="button" data-question="What subscriptions are available?">Subscriptions</button>
        <button type="button" data-question="Can I build a custom plan?">Custom plan</button>
        <button type="button" data-question="How can I register?">Registration</button>
      </div>
    </div>

    <form class="coach-input-form" id="coach-input-form">
      <label class="sr-only" for="coach-input">Ask the AI Coach a question</label>
      <input id="coach-input" name="question" type="text" autocomplete="off" placeholder="Ask your coach..." required>
      <button type="submit" aria-label="Send question">Send</button>
    </form>
  </aside>
`;

if (!document.querySelector('#coach-assistant')) {
  document.body.insertAdjacentHTML('beforeend', coachMarkup);
}

const coachLauncher = document.querySelector('#coach-launcher');
const coachAssistant = document.querySelector('#coach-assistant');
const coachClose = document.querySelector('#coach-close');
const coachForm = document.querySelector('#coach-input-form');
const coachInput = document.querySelector('#coach-input');
const coachMessages = document.querySelector('#coach-messages');

const coachAnswers = {
  sport: 'For an 8-year-old, soccer, basketball, swimming, tennis, and beginner cricket are all strong options. The best fit depends on what the child enjoys, so an introductory session is a helpful place to start.',
  equipment: 'Most beginners need comfortable sports clothing, suitable athletic shoes, and a water bottle. Specialist equipment depends on the sport, so ask the academy before buying expensive gear.',
  timings: 'Training times vary by sport, age group, coach, and season. The custom plan supports 1 to 24 hours per selected day, and the academy confirms a safe, practical schedule before registration.',
  greeting: 'Hi! I can help with sports, equipment, training, schedules, subscriptions, payments, the academy process, and registration. What would you like to know?',
  fallback: 'I could not find a close match for that question. Try asking about sports, equipment, schedules, fees, subscriptions, custom plans, how we work, or registration. You can also browse the full FAQ.'
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

function getBuiltInAnswer(question) {
  const questionText = question.toLowerCase();
  if (/\b(hi|hello|hey)\b/.test(questionText)) return coachAnswers.greeting;
  if (/time|timing|schedule|open|hour/.test(questionText)) return coachAnswers.timings;
  if (/equipment|gear|bring|wear/.test(questionText)) return coachAnswers.equipment;
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

function sendLinkedAnswer(message, href, label) {
  window.setTimeout(() => addCoachMessage(message, 'assistant', { href, label }), 300);
}

async function askCoach(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  const lowerQuestion = cleanQuestion.toLowerCase();
  addCoachMessage(cleanQuestion, 'user');

  if (/custom subscription|custom plan|build.*plan|make.*subscription|own subscription|choose.*days|choose.*hours/.test(lowerQuestion)) {
    sendLinkedAnswer('Build a custom plan by choosing a sport, 1 to 24 hours per day, 1 to 365 training days, and your payment preferences. Pricing and discounts update automatically.', 'custom-subscription.html', 'Build a custom plan');
    return;
  }
  if (/subscription|subscribe|membership|payment plan|hourly|monthly|quarterly|annual|six month|6 month/.test(lowerQuestion)) {
    sendLinkedAnswer('Compare hourly, monthly, quarterly, six-month, and annual training options on the Subscriptions page.', 'subscriptions.html', 'View subscriptions');
    return;
  }
  if (/how.*work|customer care|treat.*customer|training approach|flexib|coaching process/.test(lowerQuestion)) {
    sendLinkedAnswer('Peak listens first, builds a suitable plan, coaches with purpose, and reviews progress. The academy emphasizes respectful service, clear communication, quality training, and flexible scheduling.', 'how-we-work.html', 'See how we work');
    return;
  }
  if (/founder|about.*academy|about.*you|mission|academy story/.test(lowerQuestion)) {
    sendLinkedAnswer('Read the founder’s story, academy purpose, values, and athlete-first vision on the About Me page.', 'about.html', 'Visit About Me');
    return;
  }
  if (/register|registration|enroll|enrol|join|sign up|contact/.test(lowerQuestion)) {
    sendLinkedAnswer('Complete the contact form with your details, preferred sport, and message. The academy team will follow up with availability and next steps.', 'index.html#contact', 'Go to registration');
    return;
  }
  if (/fee|fees|cost|price/.test(lowerQuestion)) {
    sendLinkedAnswer('Pricing depends on the chosen plan. Compare fixed subscriptions or build a custom plan with live pricing.', 'subscriptions.html', 'Compare prices');
    return;
  }
  if (/faq|questions|help center/.test(lowerQuestion)) {
    sendLinkedAnswer('The FAQ contains detailed answers about programs, equipment, schedules, fees, safety, subscriptions, and registration.', 'faq.html', 'Browse all FAQs');
    return;
  }

  await knowledgeReady;
  const answer = findKnowledgeAnswer(cleanQuestion) || getBuiltInAnswer(cleanQuestion);
  window.setTimeout(() => addCoachMessage(answer, 'assistant'), 300);
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

coachAssistant.querySelectorAll('[data-question]').forEach((button) => {
  button.addEventListener('click', () => askCoach(button.dataset.question));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && coachAssistant.classList.contains('open')) {
    setCoachOpen(false);
    coachLauncher.focus();
  }
});
