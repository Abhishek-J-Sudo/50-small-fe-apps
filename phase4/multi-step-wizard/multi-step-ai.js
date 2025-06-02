function initMultiStepWizard() {
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

    // Initialize field data structure
    initializeField(field) {
      const fieldData = {
        value: '',
        isValid: false,
        isTouched: false,
        error: '',
        element: field,
        rules: VALIDATION_RULES[field.name] || {},
      };

      // Find parent step-content and get its data-step value
      const stepContainer = field.closest('.step-content');
      const step = stepContainer ? Number(stepContainer.dataset.step) : null;
      const steps = step ? [step] : [];
      const fieldState = { ...fieldData, steps };

      this.allFields.set(field.name, fieldState);
      this.initialState.set(field.name, { ...fieldData });
    }

    // Update field value and trigger validation
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

    // Go to specific step
    goToStep(stepNumber) {
      if (stepNumber >= 1 && stepNumber <= 4) {
        this.currentStep = stepNumber;
        this.notifyStateChange();
      }
    }

    // Validate fields in specific step
    validateStep(stepNumber) {
      let isStepValid = true;

      for (const [fieldName, field] of this.allFields) {
        // Only validate fields that belong to this step
        if (field.steps.includes(stepNumber)) {
          if (!this.validateField(fieldName)) {
            isStepValid = false;
          }
        }
      }
      return isStepValid;
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

    // Validate single field
    validateField(fieldName) {
      const field = this.allFields.get(fieldName);
      if (!field) return false;

      const { value, rules } = field;
      let isValid = true;
      let error = '';

      // Required field validation
      if (rules.required && (!value || value.trim().length === 0)) {
        isValid = false;
        error = rules.errorMessage;
      }
      // Pattern validation (email, phone)
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

      return isValid;
    }

    // Validate entire form
    validateForm() {
      let isFormValid = true;

      for (const [fieldName] of this.allFields) {
        if (!this.validateField(fieldName)) {
          isFormValid = false;
        }
      }

      return isFormValid;
    }

    // Check if form is ready for submission
    isFormReady() {
      return Array.from(this.allFields.values()).every((field) => {
        if (!field.rules.required) return true;
        return field.isTouched && field.isValid;
      });
    }

    // Get form summary data
    getFormSummary() {
      const requiredFields = Array.from(this.allFields.values()).filter((f) => f.rules.required);
      const completedFields = requiredFields.filter((f) => f.isTouched && f.isValid);

      return {
        isValid: this.isFormReady(),
        totalRequired: requiredFields.length,
        completed: completedFields.length,
        remaining: requiredFields.length - completedFields.length,
        isSubmitted: this.isSubmittedSteps[this.currentStep],
      };
    }

    // Reset form to initial state
    reset() {
      for (const [fieldName, initialData] of this.initialState) {
        const currentField = this.allFields.get(fieldName);
        Object.assign(currentField, {
          value: initialData.value,
          isValid: initialData.isValid,
          isTouched: initialData.isTouched,
          error: initialData.error,
        });

        // Reset DOM
        currentField.element.value = '';
        currentField.element.classList.remove('field-invalid', 'field-valid');
      }

      // Reset checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
        const checkboxItem = checkbox.closest('.checkbox-item');
        if (checkboxItem) {
          checkboxItem.classList.remove('checked');
        }
      });

      // Reset all steps and go to step 1
      this.isSubmittedSteps = { 1: false, 2: false, 3: false, 4: false };
      this.currentStep = 1;
      this.notifyStateChange();
    }

    // Get field data for external access
    getFieldData(fieldName) {
      return this.allFields.get(fieldName);
    }

    // Get all form data
    getFormData() {
      const data = {};
      for (const [fieldName, field] of this.allFields) {
        data[fieldName] = field.value;
      }

      // Add checkbox interests
      const checkedInterests = [];
      const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
      interestCheckboxes.forEach((checkbox) => {
        checkedInterests.push(checkbox.value);
      });
      data.interests = checkedInterests;

      // Add newsletter checkbox
      const newsletterCheckbox = document.getElementById('newsletter');
      data.newsletter = newsletterCheckbox ? newsletterCheckbox.checked : false;

      return data;
    }

    // Notify UI of state changes
    notifyStateChange() {
      // Trigger UI updates - observer pattern
      this.onStateChange?.();
    }

    // Set state change callback
    setStateChangeCallback(callback) {
      this.onStateChange = callback;
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

    // Update all UI elements based on current state
    updateUI() {
      this.updateFieldStyles();
      this.updateNavButtons();
      this.updateStepIndicators();
      this.updateFieldFeedback();
    }

    updateFieldStyles() {
      for (const [, field] of this.state.allFields) {
        const { element, isTouched, isValid, steps } = field;

        // Clean old classes
        element.classList.remove('field-valid', 'field-invalid');

        // If the step is submitted or the field is touched
        if (steps.includes(this.state.currentStep)) {
          if (this.state.isSubmittedSteps[this.state.currentStep] || isTouched) {
            element.classList.add(isValid ? 'field-valid' : 'field-invalid');
          }
        }
      }
    }

    updateNavButtons() {
      const { nextBtn, prevBtn } = this.elements;

      // Previous button logic
      prevBtn.disabled = this.state.currentStep === 1;

      // Next button logic
      if (this.state.currentStep === 4) {
        nextBtn.textContent = 'Submit';
        nextBtn.className = 'nav-button btn-success';
      } else {
        nextBtn.textContent = 'Next';
        nextBtn.className = 'nav-button btn-secondary';
      }

      // Disable next if current step is invalid (only if step was attempted)
      if (this.state.isSubmittedSteps[this.state.currentStep]) {
        nextBtn.disabled = !this.state.isStepValid(this.state.currentStep);
      } else {
        nextBtn.disabled = false;
      }
    }

    updateStepIndicators() {
      // Update step content visibility
      const allSteps = document.querySelectorAll(SELECTORS.stepContent);
      allSteps.forEach((step) => {
        step.classList.remove('active');
      });

      const currentStepElement = document.querySelector(
        `${SELECTORS.stepContent}[data-step="${this.state.currentStep}"]`
      );
      if (currentStepElement) {
        currentStepElement.classList.add('active');
      }

      // Update progress bar
      const progressSteps = document.querySelectorAll(SELECTORS.progressSteps);
      const progressLines = document.querySelectorAll(SELECTORS.progressLines);

      progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNumber < this.state.currentStep) {
          step.classList.add('completed');
        } else if (stepNumber === this.state.currentStep) {
          step.classList.add('active');
        }
      });

      progressLines.forEach((line, index) => {
        const stepNumber = index + 1;
        line.classList.remove('completed');

        if (stepNumber < this.state.currentStep) {
          line.classList.add('completed');
        }
      });

      // Update step indicator text
      if (this.elements.stepIndicator) {
        this.elements.stepIndicator.textContent = `Step ${this.state.currentStep} of 4`;
      }

      // Update summary if on step 4
      if (this.state.currentStep === 4) {
        this.updateSummary();
      }
    }

    updateSummary() {
      const formData = this.state.getFormData();

      // Personal Information Summary
      const personalSummary = document.getElementById('personalSummary');
      if (personalSummary) {
        personalSummary.innerHTML = `
          <div class="summary-item"><span>Name:</span><span>${formData.firstName} ${
          formData.lastName
        }</span></div>
          <div class="summary-item"><span>Email:</span><span>${formData.email}</span></div>
          <div class="summary-item"><span>Phone:</span><span>${
            formData.phone || 'Not provided'
          }</span></div>
        `;
      }

      // Preferences Summary
      const preferencesSummary = document.getElementById('preferencesSummary');
      if (preferencesSummary) {
        const interestsText =
          formData.interests.length > 0 ? formData.interests.join(', ') : 'None selected';
        preferencesSummary.innerHTML = `
          <div class="summary-item"><span>Category:</span><span>${formData.category}</span></div>
          <div class="summary-item"><span>Interests:</span><span>${interestsText}</span></div>
        `;
      }

      // Details Summary
      const detailsSummary = document.getElementById('detailsSummary');
      if (detailsSummary) {
        detailsSummary.innerHTML = `
          <div class="summary-item"><span>Experience:</span><span>${
            formData.experience
          }</span></div>
          <div class="summary-item"><span>Newsletter:</span><span>${
            formData.newsletter ? 'Yes' : 'No'
          }</span></div>
          <div class="summary-item"><span>Comments:</span><span>${
            formData.comments || 'None'
          }</span></div>
        `;
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
            if (errorElement) {
              errorElement.style.display = 'none';
            }
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

    clearStatus() {
      // Show wizard container
      this.elements.form.style.display = 'block';

      // Hide success message
      if (this.elements.successMessage) {
        this.elements.successMessage.classList.remove('show');
      }
    }

    showStepValidationError(step) {
      // Create or update error message
      let errorContainer = document.getElementById('step-error-message');

      if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'step-error-message';
        errorContainer.className = 'step-error-message';
        errorContainer.style.cssText = `
      background: #fee;
      border: 1px solid #f88;
      color: #c00;
      padding: 10px;
      border-radius: 5px;
      margin: 10px 0;
      display: none;
    `;

        // Insert before navigation buttons
        const navigation = document.querySelector('.wizard-navigation');
        if (navigation) {
          navigation.parentNode.insertBefore(errorContainer, navigation);
        }
      }

      // Show appropriate error message
      const errorMessages = {
        1: 'Please fill in all required personal information fields.',
        2: 'Please select a category and at least one interest.',
        3: 'Please select your experience level.',
        4: 'Please review your information before submitting.',
      };

      errorContainer.textContent = errorMessages[step] || 'Please complete all required fields.';
      errorContainer.style.display = 'block';

      // Hide error after 5 seconds
      setTimeout(() => {
        errorContainer.style.display = 'none';
      }, 5000);
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
      console.log(this);
      // Field validation on blur
      form.addEventListener('blur', this.handleFieldBlur.bind(this), true);

      // Real-time input feedback
      form.addEventListener('input', this.handleFieldInput.bind(this), true);

      // Form submission
      form.addEventListener('submit', this.handleSubmit.bind(this));

      // Button clicks (next, prev, reset)
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

      // First validate the step
      this.state.validateStep(step);

      if (this.state.isStepValid(step)) {
        // Only mark as submitted if valid
        this.state.isSubmittedSteps[step] = true;

        if (step < 4) {
          this.state.goToStep(step + 1);
        } else {
          // Final submit
          const formData = this.state.getFormData();
          console.log('Form submitted:', formData);
          this.ui.showSuccessMessage(formData);
        }
      } else {
        // MISSING: Handle invalid step case
        console.log('Step validation failed');

        // Mark step as submitted to show errors
        this.state.isSubmittedSteps[step] = true;

        // Force UI update to show validation errors
        this.state.notifyStateChange();

        // Optional: Show user feedback
        this.ui.showStepValidationError(step);
      }
    }

    handleButtonClick(e) {
      if (e.target.nodeName.toLowerCase() === 'button') {
        if (e.target.id === 'reset-btn') {
          e.preventDefault();
          this.state.reset();
          this.ui.clearStatus();
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
    // Create UI controller
    const uiController = new UIController(stateManager);

    // Set up state change notifications
    stateManager.setStateChangeCallback(() => {
      uiController.updateUI();
    });

    // Create event controller
    new EventController(stateManager, uiController);

    // Initial UI update
    uiController.updateUI();

    // Return controllers for external access if needed
    return { stateManager, uiController };
  }

  return initialize();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initMultiStepWizard);
