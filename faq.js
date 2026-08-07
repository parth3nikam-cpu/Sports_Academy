const searchInput = document.querySelector('#faq-search-input');
const faqList = document.querySelector('#faq-list');
const faqCount = document.querySelector('#faq-count');
const faqEmpty = document.querySelector('#faq-empty');
const filterButtons = document.querySelectorAll('[data-category]');

let faqEntries = [];
let activeCategory = 'All';

const starterEntries = [
  { question: 'Which sport suits an 8-year-old?', keywords: 'child age beginner sport', answer: 'Soccer, basketball, swimming, tennis, and beginner cricket can all suit an 8-year-old. The best choice depends on the child\'s interests. We recommend an introductory session before choosing.' },
  { question: 'What equipment is needed?', keywords: 'equipment gear kit', answer: 'Most beginners need comfortable sports clothing, suitable athletic shoes, and a water bottle. Specialist equipment depends on the sport, so ask us before buying expensive gear.' },
  { question: 'What are the academy timings?', keywords: 'schedule time weekend', answer: 'Timings vary by sport, age group, and season. Contact us with your preferred sport for the current schedule.' },
  { question: 'What is the fee?', keywords: 'fees cost price', answer: 'Fees vary by sport, program length, session frequency, and training level. Use the contact form for the current rate.' },
  { question: 'What subscription plans are available?', keywords: 'subscription membership hourly monthly quarterly annual payment', answer: 'Peak offers hourly training for $15 per hour, monthly training for $350, quarterly training for $650, a six-month plan for $800, and an annual plan for $1,200.' },
  { question: 'How can I register?', keywords: 'join enroll sign up', answer: 'Complete the contact form with your details and preferred sport. Our team will contact you with schedule, fee, placement, and enrollment information.' }
];

function parseKnowledge(fileText) {
  return fileText.split(/^---\s*$/m).map((block) => {
    const question = block.match(/^Q:\s*(.+)$/m)?.[1]?.trim();
    const keywords = block.match(/^Keywords:\s*(.+)$/m)?.[1]?.trim() || '';
    const answer = block.match(/^A:\s*([\s\S]+)$/m)?.[1]?.trim();
    return question && answer ? { question, keywords, answer } : null;
  }).filter(Boolean);
}

function getCategory(entry) {
  const text = `${entry.question} ${entry.keywords}`.toLowerCase();
  if (/equipment|gear|bring|wear|kit|bat|ball|racket|goggles/.test(text)) return 'Equipment';
  if (/fee|cost|price|payment|discount|refund|scholarship/.test(text)) return 'Fees';
  if (/register|enroll|join|sign up|documents|change sports/.test(text)) return 'Registration';
  if (/time|schedule|weekend|duration|days per week|miss|arrive/.test(text)) return 'Schedule';
  if (/safe|safety|injury|medical|nutrition|eat|allergy/.test(text)) return 'Safety';
  if (/sport|program|age|beginner|teen|adult|coach|competitive|private|camp|tournament/.test(text)) return 'Programs';
  return 'General';
}

function isSubscriptionQuestion(entry) {
  const text = `${entry.question} ${entry.keywords}`.toLowerCase();
  return /subscription|subscribe|membership|hourly|monthly|quarterly|six month|6 months|annual|yearly|custom plan|cash back|cashback|payment choices/.test(text);
}

function isHowWeWorkQuestion(entry) {
  const text = `${entry.question} ${entry.keywords}`.toLowerCase();
  return /how we work|coaching stages|customer service|treat customers|family support|training approach|flexible schedule/.test(text);
}

function createFaqItem(entry, index) {
  const item = document.createElement('article');
  const answerId = `faq-answer-${index}`;
  item.className = 'faq-item';
  item.innerHTML = `
    <button class="faq-question" type="button" aria-expanded="false" aria-controls="${answerId}">
      <span><small>${getCategory(entry)}</small>${entry.question}</span>
      <i aria-hidden="true">+</i>
    </button>
    <div class="faq-answer" id="${answerId}" hidden><p></p></div>
  `;
  item.querySelector('.faq-answer p').textContent = entry.answer;
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  if (isSubscriptionQuestion(entry)) {
    const subscriptionLink = document.createElement('a');
    subscriptionLink.className = 'faq-subscription-link';
    const isCustomPlan = /custom|build|own|choose.*days|flexible days/.test(`${entry.question} ${entry.keywords}`.toLowerCase());
    subscriptionLink.href = isCustomPlan ? 'custom-subscription.html' : 'subscriptions.html';
    subscriptionLink.textContent = isCustomPlan ? 'Build a Custom Subscription' : 'View Subscriptions & Payment';
    answer.appendChild(subscriptionLink);
  } else if (isHowWeWorkQuestion(entry)) {
    const processLink = document.createElement('a');
    processLink.className = 'faq-subscription-link';
    processLink.href = 'how-we-work.html';
    processLink.textContent = 'Explore How We Work';
    answer.appendChild(processLink);
  }
  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    button.querySelector('i').textContent = isOpen ? '+' : '-';
    answer.hidden = isOpen;
  });
  return item;
}

function renderFaqs() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const visibleEntries = faqEntries.filter((entry) => {
    const matchesCategory = activeCategory === 'All' || getCategory(entry) === activeCategory;
    const matchesSearch = !searchTerm || `${entry.question} ${entry.keywords} ${entry.answer}`.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  faqList.replaceChildren(...visibleEntries.map(createFaqItem));
  faqCount.textContent = `${visibleEntries.length} ${visibleEntries.length === 1 ? 'question' : 'questions'}`;
  faqEmpty.hidden = visibleEntries.length !== 0;
}

searchInput.addEventListener('input', renderFaqs);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    renderFaqs();
  });
});

document.querySelector('#current-year').textContent = new Date().getFullYear();

fetch('ai-coach-knowledge.txt')
  .then((response) => {
    if (!response.ok) throw new Error('FAQ knowledge could not be loaded.');
    return response.text();
  })
  .then((fileText) => {
    faqEntries = parseKnowledge(fileText);
    renderFaqs();
  })
  .catch(() => {
    faqEntries = starterEntries;
    renderFaqs();
  });
