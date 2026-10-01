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
  const accountingType = quoteForm.querySelector('#accounting-type');
  const activityGroup = quoteForm.querySelector('[data-required-group="activity"]');
  const activityOptions = [...quoteForm.querySelectorAll('[data-activity-option]')];
  const documentCount = quoteForm.querySelector('#document-count');
  const unitCount = quoteForm.querySelector('#unit-count');
  const bankOperations = quoteForm.querySelector('#bank-operations');
  const accountingField = quoteForm.querySelector('[data-accounting-field]');
  const taxField = quoteForm.querySelector('[data-tax-field]');
  const unitCountField = quoteForm.querySelector('[data-unit-count-field]');
  const bankOperationsField = quoteForm.querySelector('[data-bank-operations-field]');
  const uepikWarning = quoteForm.querySelector('[data-uepik-warning]');
  let currentStep = 0;

  const personalTaxOptions = [
    { value: 'Skala podatkowa', label: 'Skala podatkowa' },
    { value: 'Podatek liniowy', label: 'Podatek liniowy' },
    { value: 'Ryczałt ewidencjonowany', label: 'Ryczałt ewidencjonowany' }
  ];
  const companyTaxOptions = [
    { value: 'CIT klasyczny', label: 'CIT klasyczny' },
    { value: 'CIT estoński', label: 'CIT estoński' }
  ];
  const accountingOptions = {
    books: [
      { value: 'KPiR', label: 'Książka przychodów i rozchodów (KPiR)' },
      { value: 'Pełna księgowość', label: 'Pełna księgowość' }
    ],
    organization: [
      { value: 'UEPiK', label: 'UEPiK' },
      { value: 'Pełna księgowość', label: 'Pełna księgowość' }
    ]
  };
  const businessRules = {
    jdg: { activity: 'business', accounting: accountingOptions.books, tax: personalTaxOptions },
    civil: { activity: 'business', accounting: accountingOptions.books, tax: personalTaxOptions },
    capital: { activity: 'business', accounting: null, tax: companyTaxOptions },
    limited: { activity: 'business', accounting: null, tax: companyTaxOptions },
    association: { activity: 'organization', accounting: accountingOptions.organization, tax: null },
    foundation: { activity: 'organization', accounting: accountingOptions.organization, tax: null },
    community: { activity: 'business', accounting: null, tax: null }
  };
  const activityChoices = {
    business: [
      { value: 'Handlowa', label: 'Handlowa' },
      { value: 'Usługowa', label: 'Usługowa' },
      { value: 'Produkcyjna', label: 'Produkcyjna' }
    ],
    organization: [
      { value: 'Działalność statutowa', label: 'Działalność statutowa' },
      { value: 'Działalność gospodarcza', label: 'Działalność gospodarcza' }
    ]
  };
  const documentRanges = {
    jdg: ['Do 30', '31–50', '51–70', 'Powyżej 70'],
    civil: ['Do 30', '31–50', '51–70', 'Powyżej 70'],
    capital: ['Do 30', '31–50', '51–70', 'Powyżej 70'],
    limited: ['Do 30', '31–50', '51–70', 'Powyżej 70'],
    association: ['Do 30', '31–50', '51–70', 'Powyżej 70'],
    foundation: ['Do 30', '31–50', '51–70', 'Powyżej 70'],
    community: ['Do 30', '31–50', '51–70', 'Powyżej 70']
  };

  const replaceSelectOptions = (select, placeholder, options) => {
    select.replaceChildren(new Option(placeholder, ''));
    options.forEach(({ value, label }) => select.add(new Option(label, value)));
  };

  const selectedBusinessProfile = () => businessType.selectedOptions[0]?.dataset.businessProfile ?? '';

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

  const clearGroupError = (group) => {
    group.classList.remove('is-invalid');
    group.querySelector('.field-error')?.remove();
  };

  const showGroupError = (group) => {
    clearGroupError(group);
    group.classList.add('is-invalid');
    const fieldError = document.createElement('span');
    fieldError.className = 'field-error';
    fieldError.textContent = 'Wybierz co najmniej jedną opcję.';
    group.querySelector('.choice-grid').insertAdjacentElement('afterend', fieldError);
  };

  const validateStep = (step) => {
    const fields = [...step.querySelectorAll('input, select, textarea')];
    let firstInvalidField = null;
    fields.forEach((field) => {
      clearFieldError(field);
      if (!field.disabled && !field.checkValidity()) {
        showFieldError(field);
        if (!firstInvalidField) firstInvalidField = field;
      }
    });
    step.querySelectorAll('[data-required-group]').forEach((group) => {
      clearGroupError(group);
      const checkboxes = [...group.querySelectorAll('input[type="checkbox"]')].filter((field) => !field.disabled);
      if (checkboxes.length && !checkboxes.some((field) => field.checked)) {
        showGroupError(group);
        if (!firstInvalidField) firstInvalidField = checkboxes[0];
      }
    });
    if (firstInvalidField) {
      firstInvalidField.focus();
      return false;
    }
    return true;
  };

  const updateBusinessFields = () => {
    const profile = selectedBusinessProfile();
    const rules = businessRules[profile];
    const availableActivities = rules ? activityChoices[rules.activity] : [];

    activityOptions.forEach((option, index) => {
      const choice = availableActivities[index];
      const input = option.querySelector('input');
      input.disabled = !choice;
      input.checked = false;
      option.hidden = !choice;
      if (choice) {
        input.value = choice.value;
        option.querySelector('span').textContent = choice.label;
      }
    });

    const accountingChoices = rules?.accounting ?? [];
    accountingField.hidden = accountingChoices.length === 0;
    accountingType.disabled = accountingChoices.length === 0;
    replaceSelectOptions(accountingType, 'Wybierz rodzaj księgowości', accountingChoices);

    const taxChoices = rules?.tax ?? [];
    taxField.hidden = taxChoices.length === 0;
    taxType.disabled = taxChoices.length === 0;
    replaceSelectOptions(taxType, 'Wybierz formę opodatkowania', taxChoices);

    const ranges = documentRanges[profile] ?? [];
    replaceSelectOptions(documentCount, 'Wybierz zakres', ranges.map((range) => ({ value: range, label: range })));

    const hasUnits = profile === 'community';
    unitCountField.hidden = !hasUnits;
    unitCount.disabled = !hasUnits;
    replaceSelectOptions(unitCount, 'Wybierz zakres', hasUnits
      ? documentRanges.community.map((range) => ({ value: range, label: range }))
      : []);

    updateAccountDependentFields();
    clearGroupError(activityGroup);
  };

  const updateAccountDependentFields = () => {
    const isKpir = accountingType.value === 'KPiR';
    bankOperationsField.hidden = isKpir;
    bankOperations.disabled = isKpir;
    if (isKpir) {
      bankOperations.value = '';
      clearFieldError(bankOperations);
    }
    uepikWarning.hidden = accountingType.value !== 'UEPiK';
  };

  const updateStep = () => {
    steps.forEach((step, index) => {
      const isCurrent = index === currentStep;
      step.hidden = !isCurrent;
      step.disabled = !isCurrent;
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

  const resetDependentAnswers = () => {
    steps.slice(1).forEach((step) => {
      step.querySelectorAll('input, select, textarea').forEach((field) => {
        if (field.type === 'checkbox' || field.type === 'radio') field.checked = false;
        else if (field.tagName === 'SELECT') field.selectedIndex = 0;
        else field.value = '';
        clearFieldError(field);
      });
      step.querySelectorAll('[data-required-group]').forEach(clearGroupError);
    });
  };

  businessType.addEventListener('change', () => {
    resetDependentAnswers();
    updateBusinessFields();
  });

  accountingType.addEventListener('change', updateAccountDependentFields);

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
    if (!event.target.matches('input, select, textarea')) return;
    clearFieldError(event.target);
    const group = event.target.closest('[data-required-group]');
    if (group && group.querySelector('input[type="checkbox"]:checked')) clearGroupError(group);
  });

  quoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (currentStep !== steps.length - 1) return;

    const disabledSteps = steps.map((step) => step.disabled);
    steps.forEach((step) => {
      step.disabled = false;
    });
    let firstInvalidStep = -1;
    steps.some((step, index) => {
      if (validateStep(step)) return false;
      firstInvalidStep = index;
      return true;
    });
    const formData = firstInvalidStep === -1 ? new FormData(quoteForm) : null;
    steps.forEach((step, index) => {
      step.disabled = disabledSteps[index];
    });
    if (firstInvalidStep !== -1) {
      currentStep = firstInvalidStep;
      updateStep();
      const firstInvalidField = steps[currentStep].querySelector('.is-invalid input:not(:disabled), input.is-invalid, select.is-invalid, textarea.is-invalid');
      firstInvalidField?.focus();
      return;
    }
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

  updateBusinessFields();
  updateStep();
}
