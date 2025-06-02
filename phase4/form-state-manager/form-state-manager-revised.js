function initFormStateManager() {
  const form = document.getElementById('managed-form');
  const fields = form.querySelectorAll('input, textarea, select');
  const infoFields = document.querySelectorAll('.state-content');
  const submitBtn = document.getElementById('submit-btn');
  const reset = document.getElementById('.reset-deleteBtn');
  const formStatus = document.getElementById('form-status');
  const charCountElement = document.getElementById('char-count');
  const formsData = {
    formElements: new Map(),
    buttons: new Map(),
    infoElements: new Map(),
  };

  fields.forEach((field) => {
    const name = field.name;
    if (name) {
      formsData.formElements.set(name, {
        data: {
          value: '',
          valid: false,
          error: '',
          touched: false,
          required: field.required,
        },
        dom: field,
      });
    }
  });

  // Copy map for reset
  const initialFormElements = new Map();
  formsData.formElements.forEach((value, key) => {
    const { dom, ...safeValue } = value;
    initialFormElements.set(key, structuredClone(safeValue));
  });

  infoFields.forEach((field) => {
    const name = field.id;
    if (name) {
      formsData.infoElements.set(name, { dom: field });
    }
  });
  console.log(formsData.formElements);
  console.log(formsData.infoElements);
  console.log(formsData.infoElements.get('validation-display'));
  let reqFieldsCount = Array.from(formsData.formElements.values()).every(({ data }) => {
    let count = 0;
    if (data.required) count++;
    return count;
  });

  console.log(reqFieldsCount);
  const utils = {
    validateName(value) {
      const valid = value.length > 0;
      return valid;
    },

    validateEmail(value) {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      return valid;
    },

    validateAge(value) {
      const num = Number(value);
      const valid = !isNaN(num) && num >= 18 && num <= 100;
      return valid;
    },

    validateMessage(value) {
      const valid = value.length <= 200;
      return valid;
    },

    enableSubmit(data) {
      const isFormValid = Array.from(data.values()).every(({ data }) => {
        if (!data.required) return true;
        return data.touched && data.valid;
      });
      isFormValid
        ? submitBtn.removeAttribute('disabled')
        : submitBtn.setAttribute('disabled', 'disabled');
    },

    calcFormSummary(elData) {
      let FormValid = false;
      let touchedCount = 0;
      let fieldsFilledCount = 0;

      let reqFieldsCount = 0;
      formsData.formElements.forEach(({ data }) => {
        if (data.required) reqFieldsCount++;
      });

      if (elData) {
        console.log(elData.formElements);
        FormValid = Array.from(elData.formElements.values()).every(({ data }) => {
          if (!data.required) return true;
          if (data.touched) touchedCount++;
          if (data.valid) fieldsFilledCount++;
          return data.touched && data.valid;
        });
        // reqFieldsCount = reqFieldsCount - touchedCount;
      }

      const summaryData = {
        validity: FormValid,
        fieldsCompleted: fieldsFilledCount,
        fieldsRemaining: reqFieldsCount - fieldsFilledCount,
        submissionState: formStatus.innerHTML === '' ? false : true,
      };

      console.log(summaryData);
      return summaryData;
    },
  };

  const ui = {
    updateFormStatePanel(data = null) {
      let valuesHTML = {
        field: '',
        validation: '',
        touched: '',
        summary: '',
      };
      const obj = !data ? formsData : data;
      //console.log(obj);
      for (let [key, value] of obj.formElements.entries()) {
        valuesHTML.field += `${key} : ${
          value.data.value.length > 10 && key === 'message'
            ? `${value.data.value.slice(0, 20)}..`
            : value.data.value
        }\n`;
        valuesHTML.validation += `${key} : ${value.data.valid}\n`;
        valuesHTML.touched += `${key} : ${value.data.touched}\n`;
      }
      const summaryData = utils.calcFormSummary(data);
      const { validity, fieldsCompleted, fieldsRemaining, submissionState } = summaryData;
      valuesHTML.summary = `Form Validity: ${
        validity === false ? `Invalid` : `Valid`
      }\nFields Completed: ${fieldsCompleted}\nRequired fields Remain: ${fieldsRemaining}\nSubmitted: ${
        submissionState === false ? `Not Submitted` : `Submitted`
      }`;

      /* Object.entries(summaryData).forEach(([key, value]) => {
        valuesHTML.summary += `${key}: ${value}`;
      }); */

      obj.infoElements.get('values-display').dom.textContent = `${valuesHTML.field}`;
      obj.infoElements.get('validation-display').dom.textContent = `${valuesHTML.validation}`;
      obj.infoElements.get('touched-display').dom.textContent = `${valuesHTML.touched}`;
      obj.infoElements.get('summary-display').dom.textContent = `${valuesHTML.summary}`;
    },

    toggleDisplayError(inputName, state) {
      const feedbackField = document.getElementById(`${inputName}-feedback`);
      // console.log(feedbackField, state);
      if (state) {
        feedbackField.textContent = '';
        return;
      }
      if (inputName === 'message') {
        feedbackField.textContent = `Maximum 200 characters allowed`;
        return;
      }
      feedbackField.textContent = `Please enter valid ${inputName}`;
    },
  };

  const formActions = {
    handleFormAction(e) {
      const action = e.target.type;
      console.log(action);
      if (!action) return;
      if (action === 'submit') {
        e.preventDefault();
        formActions.handleSubmit();
      }
      if (action === 'reset') {
        e.preventDefault();
        formActions.handleReset();
      }
    },

    handleCharacterCount(e) {
      charCountElement.textContent = e.target.value.length;
      let valid = '';
      e.target.value.length <= 200 ? (valid = true) : (valid = false);
      formsData.formElements.get('message').data.valid = valid;
      ui.updateFormStatePanel(formsData);
      ui.toggleDisplayError(e.target.id, valid);
    },

    validateField(field) {
      const value = field.value.trim();
      const name = field.name;
      let valid = false;
      switch (name) {
        case 'name':
          valid = utils.validateName(value);
          break;
        case 'email':
          valid = utils.validateEmail(value);
          break;
        case 'age':
          valid = utils.validateAge(value);
          break;
        case 'message':
          valid = utils.validateMessage(value);
          break;
      }
      console.log(name);
      if (valid) {
        formsData.formElements.get(name).data.valid = valid;
        formsData.formElements.get(name).data.value = value;
        field.classList.remove('field-invalid');
      } else {
        formsData.formElements.get(name).data.error = true;
        field.classList.add('field-invalid');
      }
      ui.toggleDisplayError(name, valid);
      formsData.formElements.get(name).data.touched = true;
      ui.updateFormStatePanel(formsData);
      utils.enableSubmit(formsData.formElements);
    },

    handleSubmit() {
      let submittedDetails = '';
      for (const [key, field] of formsData.formElements.entries()) {
        submittedDetails += `${key}: ${field.data.value}<br>`;
      }

      formStatus.innerHTML = `Details submitted<br><br> ${submittedDetails}`;
      ui.updateFormStatePanel(formsData);
    },

    handleReset() {
      formStatus.innerHTML = '';
      fields.forEach((f) => {
        f.value = '';
      });
      formsData.formElements.forEach((field, key) => {
        const initial = initialFormElements.get(key);
        field.data = structuredClone(initial.data); // reset data
      });
      charCountElement.textContent = '0';
      ui.updateFormStatePanel(formsData);
    },
  };

  function init() {
    // Form field listeners
    fields.forEach((field) => {
      field.addEventListener('blur', (e) => {
        formActions.validateField(e.target);
      });
    });
    //Form button listeners
    const messageField = document.getElementById('message');
    messageField.addEventListener('input', formActions.handleCharacterCount);
    form.addEventListener('click', formActions.handleFormAction);
    ui.updateFormStatePanel();
  }
  init();
}

document.addEventListener('DOMContentLoaded', initFormStateManager);
