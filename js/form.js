const quoteForm = document.querySelector('#quote-form');

if (quoteForm) {
  const steps = [...quoteForm.querySelectorAll('.form-step')];
  const nextButton = quoteForm.querySelector('.form-next');
  const backButton = quoteForm.querySelector('.form-back');
  const submitButton = quoteForm.querySelector('.form-submit');
  const errorMessage = quoteForm.querySelector('#form-error');
  const successMessage = quoteForm.querySelector('#form-success');
  const progressBar = quoteForm.querySelector('#form-progress-bar');
  const stepLabel = quoteForm.querySelector('#form-step-label');
  const progressValue = quoteForm.querySelector('#form-progress-value');
  const taxType = quoteForm.querySelector('#tax-type');
  const businessType = quoteForm.querySelector('#business-type');
  let currentStep = 0;

  const taxOptions = {
    jdg: ['Skala podatkowa', 'Podatek liniowy', 'Ryczałt ewidencjonowany'],
    other: ['CIT klasyczny', 'CIT estoński']
  };

  const clearFieldError = (field) => {
    field.classList.remove('is-invalid');
    const fieldError = field.parentElement.querySelector(`[data-error-for="${field.id}"]`);
    if (fieldError) fieldError.remove();
  };

  const showFieldError = (field) => {
    clearFieldError(field);
    field.classList.add('is-invalid');
    const fieldError = document.createElement('span');
    fieldError.className = 'field-error';
    fieldError.dataset.errorFor = field.id;
    fieldError.textContent = field.type === 'checkbox' ? 'Zaznacz zgodę, aby przejść dalej.' : 'Uzupełnij to pole.';
    field.insertAdjacentElement('afterend', fieldError);
  };

  const validateStep = (step) => {
    const fields = [...step.querySelectorAll('input, select, textarea')];
    let firstInvalidField = null;
    fields.forEach((field) => {
      clearFieldError(field);
      if (!field.checkValidity()) {
        showFieldError(field);
        if (!firstInvalidField) firstInvalidField = field;
      }
    });
    if (firstInvalidField) {
      firstInvalidField.focus();
      return false;
    }
    return true;
  };

  const updateTaxOptions = () => {
    const selectedValue = businessType.value === 'JDG' ? 'jdg' : 'other';
    taxType.innerHTML = '<option value="">Wybierz formę opodatkowania</option>';
    taxOptions[selectedValue].forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.textContent = option;
      taxType.append(optionElement);
    });
  };

  const updateStep = () => {
    steps.forEach((step, index) => {
      const isCurrent = index === currentStep;
      step.hidden = !isCurrent;
      step.classList.toggle('is-active', isCurrent);
    });
    const progress = ((currentStep + 1) / steps.length) * 100;
    stepLabel.textContent = `Krok ${currentStep + 1} z ${steps.length}`;
    progressValue.textContent = `${progress}%`;
    progressBar.style.width = `${progress}%`;
    backButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
    errorMessage.hidden = true;
  };

  businessType.addEventListener('change', updateTaxOptions);

  nextButton.addEventListener('click', () => {
    if (!validateStep(steps[currentStep])) return;
    currentStep += 1;
    updateStep();
    steps[currentStep].querySelector('input, select, textarea')?.focus();
  });

  backButton.addEventListener('click', () => {
    currentStep -= 1;
    updateStep();
  });

  quoteForm.addEventListener('input', (event) => {
    if (event.target.matches('input, select, textarea')) clearFieldError(event.target);
  });

  quoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateStep(steps[currentStep])) return;

    const formData = new FormData(quoteForm);
    formData.append('_subject', 'Nowe zapytanie ofertowe — Usługi Księgowe MIŁO');
    formData.append('_replyto', formData.get('email'));
    submitButton.disabled = true;
    nextButton.disabled = true;
    backButton.disabled = true;
    errorMessage.hidden = true;
    submitButton.textContent = 'Wysyłanie...';

    try {
      const response = await fetch(quoteForm.dataset.endpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Formspree response error');
      successMessage.hidden = false;
      quoteForm.querySelectorAll('fieldset, .form-progress, .progress-track, .form-actions').forEach((element) => {
        element.hidden = true;
      });
    } catch (error) {
      errorMessage.textContent = 'Nie udało się wysłać formularza. Spróbuj ponownie lub napisz bezpośrednio na ksiegowymilo@gmail.com.';
      errorMessage.hidden = false;
      submitButton.disabled = false;
      nextButton.disabled = false;
      backButton.disabled = false;
      submitButton.textContent = 'Wyślij zapytanie';
    }
  });

  updateTaxOptions();
  updateStep();
}
