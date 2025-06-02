function initFormStateManager() {
  // ============================================================================
  // CONFIGURATION & CONSTANTS
  // ============================================================================

  const SELECTORS = {
    form: '#managed-form',
    fields: 'input, textarea, select',
    submitBtn: '#submit-btn',
    formStatus: '#form-status',
    charCount: '#char-count',
    stateDisplays: {
      values: '#values-display',
      validation: '#validation-display',
      touched: '#touched-display',
      summary: '#summary-display',
    },
  };

  const VALIDATION_RULES = {
    name: {
      required: true,
      minLength: 1,
      errorMessage: 'Please enter a valid name',
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Please enter a valid email',
    },
    age: {
      required: true,
      min: 18,
      max: 100,
      errorMessage: 'Please enter age between 18-100',
    },
    message: {
      required: false,
      maxLength: 200,
      errorMessage: 'Maximum 200 characters allowed',
    },
  };

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  class FormStateManager {
    constructor() {
      this.fields = new Map();
      this.ui = new Map();
      this.initialState = new Map();
      this.isSubmitted = false;
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

      this.fields.set(field.name, fieldData);
      // Store initial state for reset functionality
      this.initialState.set(field.name, { ...fieldData, element: field });
    }

    // Update field value and trigger validation
    updateField(fieldName, value, shouldValidate = true) {
      const field = this.fields.get(fieldName);
      if (!field) return;

      field.value = value;
      field.isTouched = true;

      if (shouldValidate) {
        this.validateField(fieldName);
      }

      this.notifyStateChange();
    }

    // Validate single field
    validateField(fieldName) {
      const field = this.fields.get(fieldName);
      if (!field) return false;

      const { value, rules } = field;
      let isValid = true;
      let error = '';

      // Required field validation
      if (rules.required && (!value || value.trim().length === 0)) {
        isValid = false;
        error = rules.errorMessage;
      }
      // Pattern validation (email)
      else if (rules.pattern && !rules.pattern.test(value)) {
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
      // Numeric validations
      else if (rules.min !== undefined || rules.max !== undefined) {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < rules.min || numValue > rules.max) {
          isValid = false;
          error = rules.errorMessage;
        }
      }

      field.isValid = isValid;
      field.error = error;

      return isValid;
    }

    // Validate entire form
    validateForm() {
      let isFormValid = true;

      for (const [fieldName] of this.fields) {
        if (!this.validateField(fieldName)) {
          isFormValid = false;
        }
      }

      return isFormValid;
    }

    // Check if form is ready for submission
    isFormReady() {
      return Array.from(this.fields.values()).every((field) => {
        if (!field.rules.required) return true;
        return field.isTouched && field.isValid;
      });
    }

    // Get form summary data
    getFormSummary() {
      const requiredFields = Array.from(this.fields.values()).filter((f) => f.rules.required);
      const completedFields = requiredFields.filter((f) => f.isTouched && f.isValid);

      return {
        isValid: this.isFormReady(),
        totalRequired: requiredFields.length,
        completed: completedFields.length,
        remaining: requiredFields.length - completedFields.length,
        isSubmitted: this.isSubmitted,
      };
    }

    // Reset form to initial state
    reset() {
      for (const [fieldName, initialData] of this.initialState) {
        const currentField = this.fields.get(fieldName);
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

      this.isSubmitted = false;
      this.notifyStateChange();
    }

    // Get field data for external access
    getFieldData(fieldName) {
      return this.fields.get(fieldName);
    }

    // Get all form data
    getFormData() {
      const data = {};
      for (const [fieldName, field] of this.fields) {
        data[fieldName] = field.value;
      }
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

  // ============================================================================
  // UI CONTROLLER
  // ============================================================================

  class UIController {
    constructor(stateManager) {
      this.state = stateManager;
      console.log(this.state);
      this.elements = this.initializeElements();
      console.log(this.elements);
    }

    initializeElements() {
      return {
        form: document.querySelector(SELECTORS.form),
        submitBtn: document.querySelector(SELECTORS.submitBtn),
        formStatus: document.querySelector(SELECTORS.formStatus),
        charCount: document.querySelector(SELECTORS.charCount),
        displays: {
          values: document.querySelector(SELECTORS.stateDisplays.values),
          validation: document.querySelector(SELECTORS.stateDisplays.validation),
          touched: document.querySelector(SELECTORS.stateDisplays.touched),
          summary: document.querySelector(SELECTORS.stateDisplays.summary),
        },
      };
    }

    // Update all UI elements based on current state
    updateUI() {
      this.updateStateDisplays();
      this.updateFieldStyles();
      this.updateSubmitButton();
      this.updateCharacterCounter();
      this.updateFieldFeedback();
    }

    updateStateDisplays() {
      const { displays } = this.elements;

      // Values display
      let valuesText = '';
      for (const [fieldName, field] of this.state.fields) {
        const displayValue =
          field.value.length > 20 ? `${field.value.slice(0, 20)}...` : field.value;
        valuesText += `${fieldName}: ${displayValue}\n`;
      }
      displays.values.textContent = valuesText;

      // Validation display
      let validationText = '';
      for (const [fieldName, field] of this.state.fields) {
        validationText += `${fieldName}: ${field.isValid}\n`;
      }
      displays.validation.textContent = validationText;

      // Touched display
      let touchedText = '';
      for (const [fieldName, field] of this.state.fields) {
        touchedText += `${fieldName}: ${field.isTouched}\n`;
      }
      displays.touched.textContent = touchedText;

      // Summary display
      const summary = this.state.getFormSummary();
      const summaryText = `Form Valid: ${summary.isValid ? 'Yes' : 'No'}
Fields Completed: ${summary.completed}/${summary.totalRequired}
Remaining: ${summary.remaining}
Submitted: ${summary.isSubmitted ? 'Yes' : 'No'}`;
      displays.summary.textContent = summaryText;
    }

    updateFieldStyles() {
      for (const [, field] of this.state.fields) {
        const { element, isTouched, isValid } = field;

        element.classList.remove('field-valid', 'field-invalid');

        if (isTouched) {
          element.classList.add(isValid ? 'field-valid' : 'field-invalid');
        }
      }
    }

    updateSubmitButton() {
      const isReady = this.state.isFormReady();
      this.elements.submitBtn.disabled = !isReady;
    }

    updateCharacterCounter() {
      const messageField = this.state.getFieldData('message');
      if (messageField) {
        const count = messageField.value.length;
        this.elements.charCount.textContent = count;
        this.elements.charCount.parentElement.classList.toggle('over-limit', count > 200);
      }
    }

    updateFieldFeedback() {
      for (const [fieldName, field] of this.state.fields) {
        const feedbackElement = document.getElementById(`${fieldName}-feedback`);
        if (feedbackElement) {
          feedbackElement.textContent = field.isTouched && !field.isValid ? field.error : '';
          feedbackElement.className = `field-feedback ${field.error ? 'error' : 'success'}`;
        }
      }
    }

    showSubmissionResult(data) {
      let resultHTML = 'Form submitted successfully!<br><br>';
      for (const [fieldName, value] of Object.entries(data)) {
        resultHTML += `${fieldName}: ${value}<br>`;
      }
      this.elements.formStatus.innerHTML = resultHTML;
      this.elements.formStatus.className = 'status-message success';
    }

    clearStatus() {
      this.elements.formStatus.innerHTML = '';
      this.elements.formStatus.className = 'status-message';
      this.elements.charCount.textContent = '0';
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  class EventController {
    constructor(stateManager, uiController) {
      this.state = stateManager;
      this.ui = uiController;
      this.setupEventListeners();
    }

    setupEventListeners() {
      const { form } = this.ui.elements;

      // Field validation on blur
      form.addEventListener('blur', this.handleFieldBlur.bind(this), true);

      // Real-time input for character counting and live feedback
      form.addEventListener('input', this.handleFieldInput.bind(this), true);

      // Form submission and reset
      form.addEventListener('submit', this.handleSubmit.bind(this));
      form.addEventListener('click', this.handleButtonClick.bind(this));
    }

    handleFieldBlur(e) {
      const field = e.target;
      if (field.name && this.state.fields.has(field.name)) {
        this.state.updateField(field.name, field.value.trim());
      }
    }

    handleFieldInput(e) {
      const field = e.target;
      if (field.name && this.state.fields.has(field.name)) {
        // For message field, update immediately for character counting
        if (field.name === 'message') {
          this.state.updateField(field.name, field.value, true);
        }
      }
    }

    handleSubmit(e) {
      e.preventDefault();

      if (this.state.validateForm() && this.state.isFormReady()) {
        const formData = this.state.getFormData();
        this.state.isSubmitted = true;
        this.ui.showSubmissionResult(formData);
        this.state.notifyStateChange();
      }
    }

    handleButtonClick(e) {
      if (e.target.type === 'button' && e.target.id === 'reset-btn') {
        e.preventDefault();
        this.state.reset();
        this.ui.clearStatus();
      }
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function initialize() {
    // Create state manager
    const stateManager = new FormStateManager();

    // Initialize form fields
    const fields = document.querySelectorAll(SELECTORS.fields);
    console.log(fields);
    fields.forEach((field) => {
      if (field.name) {
        stateManager.initializeField(field);
      }
    });
    console.log(stateManager);
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

  // Start the application
  return initialize();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initFormStateManager);
