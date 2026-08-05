const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const daysSelect = document.querySelector('#training-days');
const sportSelect = document.querySelector('#custom-sport');
const registrationButton = document.querySelector('#custom-register-button');
const dailyRate = 15;

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

for (let day = 1; day <= 365; day += 1) {
  const option = document.createElement('option');
  option.value = String(day);
  option.textContent = `${day} ${day === 1 ? 'day' : 'days'}`;
  daysSelect.appendChild(option);
}

function getDiscount(days) {
  if (days >= 121) return 0.15;
  if (days >= 70) return 0.10;
  if (days >= 51) return 0.05;
  return 0;
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function updatePlanSummary() {
  const days = Number(daysSelect.value) || 0;
  const sport = sportSelect.value;
  const regularPrice = days * dailyRate;
  const discount = getDiscount(days);
  const savings = regularPrice * discount;
  const total = regularPrice - savings;

  document.querySelector('#summary-sport').textContent = sport || 'Not selected';
  document.querySelector('#summary-days').textContent = String(days);
  document.querySelector('#summary-regular').textContent = formatMoney(regularPrice);
  document.querySelector('#summary-discount').textContent = `${discount * 100}% off`;
  document.querySelector('#summary-savings').textContent = formatMoney(savings);
  document.querySelector('#summary-total').textContent = formatMoney(total);

  if (days && sport) {
    const planMessage = `I would like to register for a custom ${sport} subscription with ${days} training days. Regular price: ${formatMoney(regularPrice)}. Discount: ${discount * 100}%. Estimated total: ${formatMoney(total)}.`;
    registrationButton.href = `index.html?plan=${encodeURIComponent(planMessage)}#contact`;
    registrationButton.classList.remove('disabled');
    registrationButton.removeAttribute('aria-disabled');
  } else {
    registrationButton.href = 'index.html#contact';
    registrationButton.classList.add('disabled');
    registrationButton.setAttribute('aria-disabled', 'true');
  }
}

daysSelect.addEventListener('change', updatePlanSummary);
sportSelect.addEventListener('change', updatePlanSummary);

registrationButton.addEventListener('click', (event) => {
  if (registrationButton.classList.contains('disabled')) event.preventDefault();
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
