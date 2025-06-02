function initFormStateManager() {
  const form = document.getElementById('managed-form');
  const fields = form.querySelectorAll('input, textarea, select');
  const idToKey = {
    'submit-btn': 'submitBtn',
    'reset-btn': 'resetBtn',
  };

  const idToKey2 = {
    'values-display': 'valuesDisplay',
    'validation-display': 'validationDisplay',
    'touched-display': 'touchedDisplay',
    'summary-display': 'summaryDisplay',
  };
  const buttons = {};
  form.querySelectorAll('button[id]').forEach((btn) => {
    const key = idToKey[btn.id] || btn.id;
    buttons[key] = btn;
  });
  const { submitBtn, resetBtn } = buttons;
  const formStatus = document.getElementById('form-status');
  const formState = {};
  const stateSection = document.querySelectorAll('.state-section .state-content');
  const liveState = {};
  stateSection.forEach((key) => {
    const key2 = idToKey2[key.id] || key.id;
    liveState[key2] = key;
  });

  const formsData = {
    element: new Map(),
  };

  fields.forEach((field) => {
    const name = field.name;
    if (name) {
      formState[name] = {
        value: '',
        valid: false,
        error: '',
        touched: false,
        required: field.required,
      };
    }
  });

  fields.forEach((field) => {
    field.addEventListener('blur', (e) => {
      validateField(e.target);
    });
  });

  function validateField(field) {
    const value = field.value.trim();
    const name = field.name;
    let valid = true;

    switch (name) {
      case 'name':
        valid = value.length > 0;
        break;
      case 'email':
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'age':
        const num = Number(value);
        valid = !isNaN(num) && num >= 18 && num <= 100;
        break;
      case 'message':
        valid = value.length <= 200;
        break;
    }
    console.log(name);
    if (valid) {
      formState[name].value = value;
      formState[name].valid = true;
      formState[name].touched = true;
      field.classList.remove('field-invalid');
      displayError(name);
    } else {
      formState[name].error = true;
      displayError(name);
      field.classList.add('field-invalid');
    }
    enableSubmit(formState);
  }

  function displayError(inputName) {
    const feedbackField = document.getElementById(`${inputName}-feedback`);
    if (formState[inputName].valid) {
      feedbackField.textContent = '';
      return;
    }
    if (inputName === 'message') {
      feedbackField.textContent = `Maximum 200 characters allowed`;
      return;
    }
    feedbackField.textContent = `Please enter valid ${inputName}`;
  }

  function enableSubmit(data) {
    const isFormValid = Object.values(data).every((field) => {
      if (!field.required) return true;
      return field.touched && field.valid;
    });
    isFormValid
      ? submitBtn.removeAttribute('disabled')
      : submitBtn.setAttribute('disabled', 'disabled');
  }

  function handleFormAction(e) {
    const action = e.target.type;
    console.log(action);
    if (!action) return;
    if (action === 'submit') {
      e.preventDefault();
      handleSubmit();
    }
    if (action === 'reset') {
      e.preventDefault();
      handleReset();
    }
  }

  function handleSubmit() {
    let submittedDetails = '';
    Object.entries(formState).forEach(([key, field]) => {
      submittedDetails += `${key}:${field.value}<br>`;
    });

    formStatus.innerHTML = `Details submitted<br><br> ${submittedDetails}`;
  }

  function handleReset() {
    formStatus.innerHTML = '';
    fields.forEach((f) => {
      f.value = '';
    });
  }

  function updateLiveStateInfo() {
    liveState.valuesDisplay.textContent = 'Some text';
    liveState.validationDisplay.textContent = 'Some text';
    liveState.touchedDisplay.textContent = 'Some text';
    liveState.summaryDisplay.textContent = 'Some text';
  }

  function init() {
    form.addEventListener('click', handleFormAction);
    updateLiveStateInfo();
  }
  init();
}

document.addEventListener('DOMContentLoaded', initFormStateManager);
