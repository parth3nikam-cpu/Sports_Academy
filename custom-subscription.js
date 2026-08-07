const progressBar = document.querySelector('#work-page-progress-bar');

function updatePageProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
}

window.addEventListener('scroll', updatePageProgress, { passive: true });
updatePageProgress();

const processDetails = {
  listen: {
    step: 'Stage 01',
    title: 'We begin by listening',
    copy: 'Before recommending a program, we learn about the athlete’s age, experience, interests, goals, schedule, and comfort level. Families can ask questions without pressure, and athletes have room to tell us what they enjoy.',
    outcome: 'A welcoming start and a plan based on real needs.'
  },
  plan: {
    step: 'Stage 02',
    title: 'We create a plan with purpose',
    copy: 'We connect the athlete with an appropriate sport, training level, schedule, and duration. We explain what the plan includes, what equipment may be needed, and what progress can reasonably look like.',
    outcome: 'Clear expectations and training that matches the athlete.'
  },
  coach: {
    step: 'Stage 03',
    title: 'We coach the person and the player',
    copy: 'Sessions combine useful repetition, age-appropriate challenge, coach feedback, and encouragement. Athletes learn how to move, think, communicate, recover from mistakes, and keep working toward their goals.',
    outcome: 'Better skills, stronger confidence, and meaningful practice.'
  },
  review: {
    step: 'Stage 04',
    title: 'We review, celebrate, and adapt',
    copy: 'We notice what has improved and where the athlete needs more support. Coaches can adjust the focus, pace, or next goal, while families stay informed and athletes see that steady effort matters.',
    outcome: 'A plan that grows as the athlete grows.'
  }
};

const stepButtons = [...document.querySelectorAll('.work-step-button')];
const detailStep = document.querySelector('#detail-step');
const detailTitle = document.querySelector('#detail-title');
const detailCopy = document.querySelector('#detail-copy');
const detailOutcome = document.querySelector('#detail-outcome');
const detailPanel = document.querySelector('#work-step-detail');

stepButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const detail = processDetails[button.dataset.step];
    stepButtons.forEach((stepButton) => {
      const isActive = stepButton === button;
      stepButton.classList.toggle('is-active', isActive);
      stepButton.setAttribute('aria-pressed', String(isActive));
    });
    detailStep.textContent = detail.step;
    detailTitle.textContent = detail.title;
    detailCopy.textContent = detail.copy;
    detailOutcome.textContent = detail.outcome;
    detailPanel.classList.remove('detail-updated');
    window.requestAnimationFrame(() => detailPanel.classList.add('detail-updated'));
  });
});

const scheduleDetails = {
  school: {
    label: 'After-school training',
    title: 'Train after classes, without rushing the day.',
    copy: 'Tell us when school ends and how much travel time you need. We will help identify a practical training window based on coach and program availability.',
    action: 'Build around your schedule'
  },
  weekend: {
    label: 'Weekend options',
    title: 'Make training part of a balanced weekend.',
    copy: 'Weekend sessions can work well for busy school weeks and family routines. Share your preferred day and time so our team can check current availability.',
    action: 'Plan weekend training'
  },
  hours: {
    label: 'Flexible daily hours',
    title: 'Choose the daily training time that fits your goal.',
    copy: 'Our custom-plan builder lets you choose from 1 to 24 training hours per day. The academy confirms a safe, practical schedule with you before registration is finalized.',
    action: 'Choose daily hours'
  },
  custom: {
    label: 'Custom plan duration',
    title: 'Choose anything from one day to a full year.',
    copy: 'Select 1 to 365 training days and see package discounts automatically. You can combine your duration with the sport and daily hours that fit your needs.',
    action: 'Create a custom plan'
  }
};

const scheduleButtons = [...document.querySelectorAll('.schedule-choice')];
const scheduleLabel = document.querySelector('#schedule-label');
const scheduleTitle = document.querySelector('#schedule-title');
const scheduleCopy = document.querySelector('#schedule-copy');
const scheduleAction = document.querySelector('#schedule-action');

scheduleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const detail = scheduleDetails[button.dataset.schedule];
    scheduleButtons.forEach((choice) => {
      const isActive = choice === button;
      choice.classList.toggle('is-active', isActive);
      choice.setAttribute('aria-pressed', String(isActive));
    });
    scheduleLabel.textContent = detail.label;
    scheduleTitle.textContent = detail.title;
    scheduleCopy.textContent = detail.copy;
    scheduleAction.textContent = detail.action;
  });
});

document.querySelectorAll('.work-accordion-item button').forEach((button) => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    button.querySelector('[aria-hidden="true"]').textContent = isOpen ? '+' : '−';
    answer.hidden = isOpen;
  });
});

const revealItems = document.querySelectorAll('.reveal-item');
const counters = document.querySelectorAll('.work-counter');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCounter(counter) {
  if (counter.dataset.animated) return;
  counter.dataset.animated = 'true';
  const target = Number(counter.dataset.count);
  if (reducedMotion) {
    counter.textContent = String(target);
    return;
  }
  const startTime = performance.now();
  const duration = 900;
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = String(Math.round(target * eased));
    if (progress < 1) window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
}

if ('IntersectionObserver' in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.querySelectorAll?.('.work-counter').forEach(animateCounter);
      if (entry.target.matches('.work-counter')) animateCounter(entry.target);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  revealItems.forEach((item) => revealObserver.observe(item));
  counters.forEach((counter) => revealObserver.observe(counter));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
  counters.forEach(animateCounter);
}

document.querySelector('#current-year').textContent = new Date().getFullYear();
