const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const daysSlider = document.querySelector('#training-days');
const daysValue = document.querySelector('#training-days-value');
const sportSelect = document.querySelector('#custom-sport');
const registrationButton = document.querySelector('#custom-register-button');
const discountBannerImage = document.querySelector('#discount-banner-image');
const discountBannerFallback = document.querySelector('#discount-banner-fallback');
const dailyRate = 15;

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

function showDiscountFallback() {
  discountBannerImage.hidden = true;
  discountBannerFallback.hidden = false;
}

discountBannerImage.addEventListener('error', showDiscountFallback);
if (discountBannerImage.complete && discountBannerImage.naturalWidth === 0) {
  showDiscountFallback();
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
  const days = Number(daysSlider.value);
  const sport = sportSelect.value;
  const regularPrice = days * dailyRate;
  const discount = getDiscount(days);
  const savings = regularPrice * discount;
  const total = regularPrice - savings;

  daysValue.textContent = `${days} ${days === 1 ? 'day' : 'days'}`;
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

daysSlider.addEventListener('input', updatePlanSummary);
sportSelect.addEventListener('change', updatePlanSummary);

registrationButton.addEventListener('click', (event) => {
  if (registrationButton.classList.contains('disabled')) event.preventDefault();
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
updatePlanSummary();
