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

  // ========================================
  // STATE MANAGEMENT (functional approach)
  // ========================================

  const createFormState = () => {
    // State variables (like React useState)
    let allFields = new Map();
    let initialState = new Map();
    let isSubmittedSteps = { 1: false, 2: false, 3: false, 4: false };
    let currentStep = 1;
    let onStateChange = null;

    // Initialize field data structure
    const initializeField = (field) => {
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

      allFields.set(field.name, fieldState);
      initialState.set(field.name, { ...fieldState });
    };

    // Update field value and trigger validation
    const updateField = (fieldName, value, shouldValidate = true) => {
      const field = allFields.get(fieldName);
      if (!field) return;

      field.value = value;
      field.isTouched = true;

      if (shouldValidate) {
        validateField(fieldName);
      }

      notifyStateChange();
    };

    // Go to specific step
    const goToStep = (stepNumber) => {
      if (stepNumber >= 1 && stepNumber <= 4) {
        currentStep = stepNumber;
        notifyStateChange();
      }
    };

    // Validate fields in specific step
    const validateStep = (stepNumber) => {
      let isStepValid = true;

      for (const [fieldName, field] of allFields) {
        if (field.steps.includes(stepNumber)) {
          if (!validateField(fieldName)) {
            isStepValid = false;
          }
        }
      }
      return isStepValid;
    };

    // Check if step is valid
    const isStepValid = (stepNumber) => {
      let missingFields = [];

      for (const [fieldName, field] of allFields) {
        if (field.steps.includes(stepNumber)) {
          if (field.rules.required && (!field.isValid || !field.isTouched)) {
            missingFields.push(fieldName);
          }
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

      return missingFields.length === 0;
    };

    // Validate single field
    const validateField = (fieldName) => {
      const field = allFields.get(fieldName);
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
    };

    // Get all form data
    const getFormData = () => {
      const data = {};
      for (const [fieldName, field] of allFields) {
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
    };

    // Notify UI of state changes
    const notifyStateChange = () => {
      onStateChange?.();
    };

    // Set state change callback
    const setStateChangeCallback = (callback) => {
      onStateChange = callback;
    };

    // Getters for state (like React state access)
    const getState = () => ({
      allFields,
      currentStep,
      isSubmittedSteps,
    });

    const setState = (updates) => {
      if (updates.currentStep !== undefined) currentStep = updates.currentStep;
      if (updates.isSubmittedSteps !== undefined)
        isSubmittedSteps = { ...isSubmittedSteps, ...updates.isSubmittedSteps };
      notifyStateChange();
    };

    // Return all functions (like a custom hook)
    return {
      initializeField,
      updateField,
      goToStep,
      validateStep,
      isStepValid,
      validateField,
      getFormData,
      setStateChangeCallback,
      getState,
      setState,
    };
  };

  // ========================================
  // UI MANAGEMENT (functional approach)
  // ========================================

  const createUIController = (state) => {
    // Initialize elements (like useRef in React)
    const elements = {
      form: document.querySelector(SELECTORS.form),
      nextBtn: document.querySelector(SELECTORS.nextBtn),
      prevBtn: document.querySelector(SELECTORS.prevBtn),
      stepIndicator: document.querySelector(SELECTORS.stepIndicator),
      successMessage: document.querySelector(SELECTORS.successMessage),
    };

    // Update all UI elements based on current state
    const updateUI = () => {
      updateFieldStyles();
      updateNavButtons();
      updateStepIndicators();
      updateFieldFeedback();
    };

    const updateFieldStyles = () => {
      const { allFields, currentStep, isSubmittedSteps } = state.getState();

      for (const [, field] of allFields) {
        const { element, isTouched, isValid, steps } = field;

        element.classList.remove('field-valid', 'field-invalid');

        if (steps.includes(currentStep)) {
          if (isSubmittedSteps[currentStep] || isTouched) {
            element.classList.add(isValid ? 'field-valid' : 'field-invalid');
          }
        }
      }
    };

    const updateNavButtons = () => {
      const { currentStep, isSubmittedSteps } = state.getState();
      const { nextBtn, prevBtn } = elements;

      // Previous button logic
      prevBtn.disabled = currentStep === 1;

      // Next button logic
      if (currentStep === 4) {
        nextBtn.textContent = 'Submit';
        nextBtn.className = 'nav-button btn-success';
      } else {
        nextBtn.textContent = 'Next';
        nextBtn.className = 'nav-button btn-secondary';
      }

      // Disable next if current step is invalid (only if step was attempted)
      if (isSubmittedSteps[currentStep]) {
        nextBtn.disabled = !state.isStepValid(currentStep);
      } else {
        nextBtn.disabled = false;
      }
    };

    const updateStepIndicators = () => {
      const { currentStep } = state.getState();

      // Update step content visibility
      const allSteps = document.querySelectorAll(SELECTORS.stepContent);
      allSteps.forEach((step) => {
        step.classList.remove('active');
      });

      const currentStepElement = document.querySelector(
        `${SELECTORS.stepContent}[data-step="${currentStep}"]`
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

        if (stepNumber < currentStep) {
          step.classList.add('completed');
        } else if (stepNumber === currentStep) {
          step.classList.add('active');
        }
      });

      progressLines.forEach((line, index) => {
        const stepNumber = index + 1;
        line.classList.remove('completed');

        if (stepNumber < currentStep) {
          line.classList.add('completed');
        }
      });

      // Update step indicator text
      if (elements.stepIndicator) {
        elements.stepIndicator.textContent = `Step ${currentStep} of 4`;
      }

      // Update summary if on step 4
      if (currentStep === 4) {
        updateSummary();
      }
    };

    const updateSummary = () => {
      const formData = state.getFormData();

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
    };

    const updateFieldFeedback = () => {
      const { allFields } = state.getState();

      for (const [fieldName, field] of allFields) {
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
    };

    const showSuccessMessage = () => {
      elements.form.style.display = 'none';
      if (elements.successMessage) {
        elements.successMessage.classList.add('show');
      }
    };

    const showStepValidationError = (step) => {
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

        const navigation = document.querySelector('.wizard-navigation');
        if (navigation) {
          navigation.parentNode.insertBefore(errorContainer, navigation);
        }
      }

      const errorMessages = {
        1: 'Please fill in all required personal information fields.',
        2: 'Please select a category and at least one interest.',
        3: 'Please select your experience level.',
        4: 'Please review your information before submitting.',
      };

      errorContainer.textContent = errorMessages[step] || 'Please complete all required fields.';
      errorContainer.style.display = 'block';

      setTimeout(() => {
        errorContainer.style.display = 'none';
      }, 5000);
    };

    return {
      updateUI,
      showSuccessMessage,
      showStepValidationError,
      elements,
    };
  };

  // ========================================
  // EVENT MANAGEMENT (functional approach)
  // ========================================

  const createEventController = (state, ui) => {
    // Event handlers (like React event handlers)
    const handleFieldBlur = (e) => {
      const field = e.target;
      if (field.name && state.getState().allFields.has(field.name)) {
        state.updateField(field.name, field.value.trim());
      }
    };

    const handleFieldInput = (e) => {
      const field = e.target;

      if (field.name && state.getState().allFields.has(field.name)) {
        state.updateField(field.name, field.value, true);
      }

      // Handle checkboxes (interests)
      if (field.type === 'checkbox' && field.name === 'interests') {
        const checkboxItem = field.closest('.checkbox-item');
        if (checkboxItem) {
          checkboxItem.classList.toggle('checked', field.checked);
        }
        // Trigger state change notification
        state.setStateChangeCallback(() => ui.updateUI())();
      }

      // Handle newsletter checkbox
      if (field.type === 'checkbox' && field.name === 'newsletter') {
        state.setStateChangeCallback(() => ui.updateUI())();
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const { currentStep, isSubmittedSteps } = state.getState();

      state.validateStep(currentStep);

      if (state.isStepValid(currentStep)) {
        // Update submitted steps
        state.setState({
          isSubmittedSteps: { [currentStep]: true },
        });

        if (currentStep < 4) {
          state.goToStep(currentStep + 1);
        } else {
          const formData = state.getFormData();
          console.log('Form submitted:', formData);
          ui.showSuccessMessage();
        }
      } else {
        console.log('Step validation failed');
        state.setState({
          isSubmittedSteps: { [currentStep]: true },
        });
        ui.showStepValidationError(currentStep);
      }
    };

    const handleButtonClick = (e) => {
      if (e.target.nodeName.toLowerCase() === 'button') {
        if (e.target.id === 'nextBtn') {
          e.preventDefault();
          handleSubmit(e);
        } else if (e.target.id === 'prevBtn') {
          e.preventDefault();
          const { currentStep } = state.getState();
          if (currentStep > 1) {
            state.goToStep(currentStep - 1);
          }
        }
      }
    };

    // Setup event listeners (like useEffect in React)
    const setupEventListeners = () => {
      const { form } = ui.elements;

      form.addEventListener('blur', handleFieldBlur, true);
      form.addEventListener('input', handleFieldInput, true);
      form.addEventListener('submit', handleSubmit);
      form.addEventListener('click', handleButtonClick);
    };

    return {
      setupEventListeners,
      handleFieldBlur,
      handleFieldInput,
      handleSubmit,
      handleButtonClick,
    };
  };

  // ========================================
  // INITIALIZATION (like main React component)
  // ========================================

  const initialize = () => {
    // Create state management (like useState)
    const state = createFormState();

    // Initialize fields
    const fields = document.querySelectorAll(SELECTORS.allFields);
    fields.forEach((field) => {
      if (field.name) {
        state.initializeField(field);
      }
    });

    // Create UI controller (like component render logic)
    const ui = createUIController(state);

    // Set up state change notifications (like useEffect)
    state.setStateChangeCallback(() => {
      ui.updateUI();
    });

    // Create event controller (like event handlers)
    const events = createEventController(state, ui);
    events.setupEventListeners();

    // Initial UI update
    ui.updateUI();

    return { state, ui, events };
  };

  return initialize();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initMultiStepWizard);
