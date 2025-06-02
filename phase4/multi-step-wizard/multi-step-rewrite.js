function initMultiStepFormManager() {
  const SELECTORS = {
    form: '.wizard-container',
    allFields: 'input, textarea, select',
    nextBtn: '#nextBtn',
    prevBtn: '#prevBtn',
    stepContent: '.step-content',
    progressSteps: '.progress-step',
    progressLines: '.progress-line',
    stepIndicator: '#stepIndicator',
    checkboxItems: '.checkbox-item',
    successMessage: '#successMessage',
  };

  const VALIDATION_RULES = {
    firstName: {
      required: true,
      minLength: 1,
      errorMessage: 'Please enter a valid first name',
    },
    lastName: {
      required: true,
      minLength: 1,
      errorMessage: 'Please enter a valid last name',
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Please enter a valid email',
    },
    phone: {
      required: false,
      pattern: /^\+?\d{7,15}$/,
      errorMessage: 'Please enter a valid phone number',
    },
    category: {
      required: true,
      errorMessage: 'Please select a category',
    },
    interests: {
      required: false,
    },
    experience: {
      required: true,
      errorMessage: 'Please select your experience level',
    },
    comments: {
      required: false,
      maxLength: 500,
      errorMessage: 'Maximum 500 characters allowed for comments',
    },
    newsletter: {
      required: false,
    },
  };

  class FormStateManager {
    constructor() {
      this.allFields = new Map();
      this.ui = new Map();
      this.initialState = new Map();
      this.isSubmittedSteps = { 1: false, 2: false, 3: false, 4: false };
      this.currentStep = 1;
    }

    //initialize field data structure
    initializeField(field) {
      const fieldData = {
        value: '',
        isValid: false,
        isTouched: false,
        error: '',
        element: field,
        rules: VALIDATION_RULES[field.name] || {},
      };

      const stepContainer = field.closest('.step-content');
      const step = stepContainer ? Number(stepContainer.dataset.step) : null;
      const steps = step ? [step] : [];
      const fieldState = { ...fieldData, steps };

      this.allFields.set(field.name, fieldState);
      this.initialState.set(field.name, { ...fieldState });
    }

    goToStep(stepNumber) {
      if (stepNumber >= 1 && stepNumber <= 4) {
        this.currentStep = stepNumber;
        this.notifyStateChange();
      }
    }

    notifyStateChange() {
      this.onStateChange?.();
    }

    setStateChangeCallback(callback) {
      this.onStateChange = callback;
    }

    validateStep(stepNumber) {
      let isStepValid = true;
      for (const [fieldName, field] of this.allFields) {
        if (field.steps.includes(stepNumber)) {
          if (!this.validateField(fieldName)) isStepValid = false;
        }
      }
      console.log('isStepValid', isStepValid);
      return isStepValid;
    }

    validateField(fieldName) {
      const field = this.allFields.get(fieldName);
      if (!field) return false;
      const { value, rules } = field;
      let isValid = true;
      let error = '';

      //required field validation
      if (rules.required && (!value || value.trim().length === 0)) {
        isValid = false;
        error = rules.errorMessage;
      }
      //pattern validation
      else if (value && rules.pattern && !rules.pattern.test(value)) {
        isValid = false;
        error = rules.errorMessage;
      }
      // Length validations
      else if (rules.minLength && value.length < rules.minLength) {
        isValid = false;
        error = rules.errorMessage;
      } else if (rules.maxLength && value.length > rules.maxLength) {
        isValid = false;
        error = rules.errorMessage;
      }

      field.isValid = isValid;
      field.error = error;
      console.log(field, isValid);
      return isValid;
    }

    updateField(fieldName, value, shouldValidate = true) {
      const field = this.allFields.get(fieldName);
      if (!field) return;

      field.value = value;
      field.isTouched = true;
      if (shouldValidate) {
        this.validateField(fieldName);
      }
      this.notifyStateChange();
    }

    // Check if step is valid
    isStepValid(stepNumber) {
      let missingFields = [];

      for (const [fieldName, field] of this.allFields) {
        if (field.steps.includes(stepNumber)) {
          // If field is required and not valid
          if (field.rules.required && (!field.isValid || !field.isTouched)) {
            missingFields.push(fieldName);
          }
          // If field has value but is invalid
          if (field.isTouched && !field.isValid) {
            missingFields.push(fieldName);
          }
        }
      }

      // Special validation for step 2 - interests
      if (stepNumber === 2) {
        const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
        if (interestCheckboxes.length === 0) {
          missingFields.push('interests');
        }
      }

      // Store missing fields for error reporting (optional)
      this.lastValidationErrors = missingFields;

      return missingFields.length === 0;
    }
  }

  class UIController {
    constructor(stateManager) {
      this.state = stateManager;
      this.elements = this.initializeElements();
    }

    initializeElements() {
      return {
        form: document.querySelector(SELECTORS.form),
        nextBtn: document.querySelector(SELECTORS.nextBtn),
        prevBtn: document.querySelector(SELECTORS.prevBtn),
        stepIndicator: document.querySelector(SELECTORS.stepIndicator),
        successMessage: document.querySelector(SELECTORS.successMessage),
      };
    }

    updateUI() {
      this.updateNavButtons();
      this.updateStepIndicators();
      this.updateFieldStyles();
      this.updateFieldFeedback();
    }

    updateNavButtons() {
      const { nextBtn, prevBtn } = this.elements;
      prevBtn.disabled = this.state.currentStep === 1;
      console.log(prevBtn.disabled);

      if (this.state.currentStep === 4) {
        nextBtn.textContent = 'Submit';
        nextBtn.className = 'nav-button btn-success';
      } else {
        nextBtn.textContent = 'Next';
        nextBtn.className = 'nav-button btn-secondary';
      }
    }

    updateStepIndicators() {
      const allSteps = document.querySelectorAll(SELECTORS.stepContent);
      allSteps.forEach((step) => {
        step.classList.remove('active');
      });

      const currentStepElement = document.querySelector(
        `${SELECTORS.stepContent}[data-step="${this.state.currentStep}"]`
      );
      // console.log(currentStepElement);
      if (currentStepElement) {
        currentStepElement.classList.add('active');
      }

      //progress bar
      const progressSteps = document.querySelectorAll(SELECTORS.progressSteps);
      const progressLines = document.querySelectorAll(SELECTORS.progressLines);

      progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove(('active', 'completed'));
        if (stepNumber < this.state.currentStep) step.classList.add('completed');
        else if (stepNumber === this.state.currentStep) step.classList.add('active');
      });

      progressLines.forEach((line, index) => {
        const stepNumber = index + 1;
        line.classList.remove('completed');

        if (stepNumber < this.state.currentStep) {
          line.classList.add('completed');
        }
      });

      if (this.elements.stepIndicator) {
        this.elements.stepIndicator.textContent = `Step ${this.state.currentStep} of 4`;
      }
      // Update summary if on step 4
      if (this.state.currentStep === 4) {
        this.updateSummary();
      }
    }

    updateFieldStyles() {
      for (const [, field] of this.state.allFields) {
        const { element, isTouched, isValid, steps } = field;

        element.classList.remove('field-valid', 'field-invalid');

        if (steps.includes(this.state.currentStep)) {
          if (this.state.isSubmittedSteps[this.state.currentStep] || isTouched) {
            element.classList.add(isValid ? 'field-valid' : 'field-invalid');
          }
        }
      }
    }

    showSuccessMessage(data) {
      // Hide the wizard container
      this.elements.form.style.display = 'none';

      // Show success message
      if (this.elements.successMessage) {
        this.elements.successMessage.classList.add('show');
      }
    }

    updateFieldFeedback() {
      for (const [fieldName, field] of this.state.allFields) {
        const fieldGroup = field.element.closest('.form-group');
        if (fieldGroup) {
          const errorElement = fieldGroup.querySelector('.error-message');

          if (field.isTouched && !field.isValid && field.error) {
            fieldGroup.classList.add('error');
            if (errorElement) {
              errorElement.style.display = 'block';
              errorElement.textContent = field.error;
            }
          } else {
            fieldGroup.classList.remove('error');
            if (errorElement) errorElement.style.display = 'none';
          }
        }
      }
    }
  }

  class EventController {
    constructor(stateManager, uiController) {
      this.state = stateManager;
      this.ui = uiController;
      this.setupEventListeners();
    }

    setupEventListeners() {
      const { form } = this.ui.elements;

      //field validation on blur
      form.addEventListener('blur', this.handleFieldBlur.bind(this), true);

      //input validation - realtime
      form.addEventListener('input', this.handleFieldInput.bind(this), true);
      // Form submission
      form.addEventListener('submit', this.handleSubmit.bind(this));

      //button click - next, prev, reset
      form.addEventListener('click', this.handleButtonClick.bind(this));
    }

    handleFieldBlur(e) {
      const field = e.target;
      if (field.name && this.state.allFields.has(field.name)) {
        this.state.updateField(field.name, field.value.trim());
      }
    }

    handleFieldInput(e) {
      const field = e.target;

      if (field.name && this.state.allFields.has(field.name)) {
        // Handle text inputs and selects
        this.state.updateField(field.name, field.value, true);
      }

      // Handle checkboxes (interests)
      if (field.type === 'checkbox' && field.name === 'interests') {
        // Update checkbox visual feedback
        const checkboxItem = field.closest('.checkbox-item');
        if (checkboxItem) {
          checkboxItem.classList.toggle('checked', field.checked);
        }

        // Trigger UI update for step validation
        this.state.notifyStateChange();
      }

      // Handle newsletter checkbox
      if (field.type === 'checkbox' && field.name === 'newsletter') {
        this.state.notifyStateChange();
      }
    }

    handleSubmit(e) {
      e.preventDefault();
      const step = this.state.currentStep;
      this.state.validateStep(step);
      if (this.state.isStepValid(step)) {
        this.state.isSubmittedSteps[step] = true;
        if (step < 4) this.state.goToStep(step + 1);
        else {
          const formData = this.state.getFormData();
          console.log('Form submitted', formData);
          this.ui.showSuccessMessage(formData);
        }
      } else {
        console.log('Step Validation failed');
        this.state.isSubmittedSteps[step] = true;
        this.state.notifyStateChange();
        //this.ui.showStepValidationError(step);
      }
    }

    handleButtonClick(e) {
      if (e.target.nodeName.toLowerCase() === 'button') {
        if (e.target.id === 'reset-btn') {
          e.preventDefault();
        } else if (e.target.id === 'nextBtn') {
          e.preventDefault();
          this.handleSubmit(e);
        } else if (e.target.id === 'prevBtn') {
          e.preventDefault();
          if (this.state.currentStep > 1) {
            this.state.goToStep(this.state.currentStep - 1);
          }
        }
      }
    }
  }

  function initialize() {
    const stateManager = new FormStateManager();
    const fields = document.querySelectorAll(SELECTORS.allFields);

    fields.forEach((field) => {
      if (field.name) {
        stateManager.initializeField(field);
      }
    });

    //state change callback
    stateManager.setStateChangeCallback(() => {
      uiController.updateUI();
    });

    //create UI controller
    const uiController = new UIController(stateManager);
    new EventController(stateManager, uiController);
  }

  return initialize();
}

document.addEventListener('DOMContentLoaded', initMultiStepFormManager);
