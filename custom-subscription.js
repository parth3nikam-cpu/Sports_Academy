const daysSlider = document.querySelector('#training-days');
const daysValue = document.querySelector('#training-days-value');
const hoursSlider = document.querySelector('#hours-per-day');
const hoursValue = document.querySelector('#hours-per-day-value');
const sportSelect = document.querySelector('#custom-sport');
const registrationButton = document.querySelector('#custom-register-button');
const discountBannerImage = document.querySelector('#discount-banner-image');
const discountBannerFallback = document.querySelector('#discount-banner-fallback');
const paymentOptions = [...document.querySelectorAll('#payment-options input[type="checkbox"]')];
const payUpfront = document.querySelector('#pay-upfront');
const payCash = document.querySelector('#pay-cash');
const payCard = document.querySelector('#pay-card');
const payOnline = document.querySelector('#pay-online');
const payThreeMonths = document.querySelector('#pay-three-months');
const paySixMonths = document.querySelector('#pay-six-months');
const paymentStatus = document.querySelector('#payment-status');
const cashbackSummary = document.querySelector('#summary-cashback');
const cashbackValue = document.querySelector('#summary-cashback-value');
const hourlyRate = 15;

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
  const hours = Number(hoursSlider.value);
  const sport = sportSelect.value;
  const regularPrice = days * hours * hourlyRate;
  const discount = getDiscount(days);
  const savings = regularPrice * discount;
  const total = regularPrice - savings;
  const cashBack = payUpfront.checked && payCash.checked ? total * 0.02 : 0;
  const selectedPayments = paymentOptions.filter((option) => option.checked).map((option) => option.dataset.paymentLabel);

  daysValue.textContent = `${days} ${days === 1 ? 'day' : 'days'}`;
  hoursValue.textContent = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  document.querySelector('#summary-sport').textContent = sport || 'Not selected';
  document.querySelector('#summary-hours').textContent = String(hours);
  document.querySelector('#summary-days').textContent = String(days);
  document.querySelector('#summary-regular').textContent = formatMoney(regularPrice);
  document.querySelector('#summary-discount').textContent = `${discount * 100}% off`;
  document.querySelector('#summary-savings').textContent = formatMoney(savings);
  document.querySelector('#summary-total').textContent = formatMoney(total);
  cashbackSummary.hidden = cashBack === 0;
  cashbackValue.textContent = formatMoney(cashBack);

  if (days && sport) {
    const paymentText = selectedPayments.length ? selectedPayments.join(', ') : 'Not selected yet';
    const cashBackText = cashBack ? ` Cash-back reward: ${formatMoney(cashBack)}.` : '';
    const planMessage = `I would like to register for a custom ${sport} subscription with ${hours} ${hours === 1 ? 'hour' : 'hours'} per day for ${days} training days. Regular price: ${formatMoney(regularPrice)}. Discount: ${discount * 100}%. Estimated total: ${formatMoney(total)}. Payment preferences: ${paymentText}.${cashBackText}`;
    registrationButton.href = `index.html?plan=${encodeURIComponent(planMessage)}#contact`;
    registrationButton.classList.remove('disabled');
    registrationButton.removeAttribute('aria-disabled');
  } else {
    registrationButton.href = 'index.html#contact';
    registrationButton.classList.add('disabled');
    registrationButton.setAttribute('aria-disabled', 'true');
  }
}

function updatePaymentChoices(changedOption) {
  if (changedOption === payCash && payCash.checked) payCard.checked = false;
  if (changedOption === payCard && payCard.checked) payCash.checked = false;
  if (changedOption === payThreeMonths && payThreeMonths.checked) paySixMonths.checked = false;
  if (changedOption === paySixMonths && paySixMonths.checked) payThreeMonths.checked = false;

  if (payUpfront.checked) {
    [payOnline, payThreeMonths, paySixMonths].forEach((option) => {
      option.checked = false;
      option.disabled = true;
    });
    [payCash, payCard].forEach((option) => { option.disabled = false; });
    paymentStatus.textContent = 'Upfront selected. Online and installment options are locked until upfront is unchecked.';
  } else if (payOnline.checked) {
    [payUpfront, payCash, payCard].forEach((option) => {
      option.checked = false;
      option.disabled = true;
    });
    [payThreeMonths, paySixMonths].forEach((option) => { option.disabled = false; });
    paymentStatus.textContent = 'Online selected. Upfront, cash, and card options are locked until online is unchecked.';
  } else {
    paymentOptions.forEach((option) => { option.disabled = false; });
    const selectedPayments = paymentOptions.filter((option) => option.checked);
    paymentStatus.textContent = selectedPayments.length
      ? `${selectedPayments.length} payment ${selectedPayments.length === 1 ? 'option' : 'options'} selected.`
      : 'Choose your preferred payment options.';
  }

  updatePlanSummary();
}

daysSlider.addEventListener('input', updatePlanSummary);
hoursSlider.addEventListener('input', updatePlanSummary);
sportSelect.addEventListener('change', updatePlanSummary);
paymentOptions.forEach((option) => {
  option.addEventListener('change', () => updatePaymentChoices(option));
});

registrationButton.addEventListener('click', (event) => {
  if (registrationButton.classList.contains('disabled')) event.preventDefault();
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
updatePlanSummary();
