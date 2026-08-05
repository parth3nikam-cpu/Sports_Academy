const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const planButtons = document.querySelectorAll('[data-plan]');
const selectedPlan = document.querySelector('#selected-plan');
const selectedPrice = document.querySelector('#selected-price');
const registrationLink = document.querySelector('#continue-registration');

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

planButtons.forEach((button) => {
  button.addEventListener('click', () => {
    planButtons.forEach((item) => item.closest('.pricing-card').classList.remove('selected'));
    button.closest('.pricing-card').classList.add('selected');
    selectedPlan.textContent = button.dataset.plan;
    selectedPrice.textContent = button.dataset.price;
    registrationLink.classList.remove('disabled');
    registrationLink.removeAttribute('aria-disabled');
    const planMessage = `I would like to register for the ${button.dataset.plan} subscription (${button.dataset.price}).`;
    registrationLink.href = `index.html?plan=${encodeURIComponent(planMessage)}#contact`;
    document.querySelector('#payment').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

registrationLink.addEventListener('click', (event) => {
  if (registrationLink.classList.contains('disabled')) event.preventDefault();
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
