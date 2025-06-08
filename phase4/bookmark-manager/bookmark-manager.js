function initBookmarkManager() {
  const SELECTORS = {
    formContainer: '#bookmark-form',
    formFields: 'input, textarea, select',
    bookmarkList: '#bookmarks-list',
    bmNotFound: '#empty-state',
    noResult: '#no-results',
    totalBM: '#total-bookmarks',
    categoryCount: '#categories-count',
    searchControls: '.search-controls',
    search: '#search-bookmarks',
    categoryFilter: '#filter-category',
    cancelBtn: '#cancel-edit',
  };

  const formValidationRules = {
    title: {
      required: true,
      minLength: 1,
      errorMessage: 'Please enter a valid title',
    },
    url: {
      required: true,
      pattern: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/,
      errorMessage: 'Please enter a valid URL',
    },
    description: {
      required: false,
      maxLength: 25,
      errorMessage: 'Description must be short under 25 characters',
    },
    category: {
      required: false,
    },
  };

  const createDataController = () => {
    const bookmarkData = new Map();
    const fieldsMap = new Map();
    const initialFormState = new Map();
    let bookmarkId = 1;
    let currentFilteredMap = new Map();
    let isSubmitted = false;

    const filtersState = {
      search: '',
      category: '',
    };

    // Helper to check if any filters are active
    const hasActiveFilters = () => {
      return !!(filtersState.search || filtersState.category);
    };

    const initializeField = (field) => {
      const fieldData = {
        value: '',
        isValid: false,
        isTouched: false,
        error: '',
        element: field,
        rules: formValidationRules[field.name] || {},
      };

      fieldsMap.set(field.name, fieldData);
      initialFormState.set(field.name, { ...fieldData, element: field });
      console.log(fieldsMap);
    };

    const addBookmarkData = (formData) => {
      const id = bookmarkId++;
      formData.id = id; // assign id to formData
      bookmarkData.set(id, formData);
      console.log(bookmarkData);
    };

    const getCurrentFilteredMap = () => currentFilteredMap;
    const setCurrentFilteredMap = (newMap) => {
      currentFilteredMap = new Map(newMap);
    };

    return {
      initializeField,
      initialFormState,
      fieldsMap,
      bookmarkData,
      filtersState,
      addBookmarkData,
      hasActiveFilters,
      getCurrentFilteredMap,
      setCurrentFilteredMap,
      bookmarkId,
    };
  };

  const createBusinessController = (dataController) => {
    const {
      fieldsMap,
      initialFormState,
      bookmarkData,
      filtersState,
      setCurrentFilteredMap,
      getCurrentFilteredMap,
    } = dataController;

    const updateField = (fieldName, value, shouldValidate = true) => {
      const field = fieldsMap.get(fieldName);
      if (!field) return;

      field.value = value;
      field.isTouched = true;

      if (shouldValidate) {
        validateField(fieldName);
      }

      notifyStateChange();
    };

    const validateField = (fieldName) => {
      const field = fieldsMap.get(fieldName);
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
    };

    const validateForm = () => {
      let isFormValid = true;

      for (const [fieldName] of fieldsMap) {
        if (!validateField(fieldName)) {
          isFormValid = false;
        }
      }

      return isFormValid;
    };

    const isFormReady = () => {
      return Array.from(fieldsMap.values()).every((field) => {
        if (!field.rules.required) return true;
        return field.isTouched && field.isValid;
      });
    };
    // Get all form data
    const getFormData = () => {
      const data = {};
      for (const [fieldName, field] of fieldsMap) {
        let value = field.value;

        if (fieldName === 'category' && value === '') {
          value = 'General';
        }

        data[fieldName] = value;
      }
      console.log(data);
      return data;
    };

    const reset = () => {
      for (const [fieldName, initialData] of initialFormState) {
        const currentField = fieldsMap.get(fieldName);
        console.log(currentField.element.name);
        Object.assign(currentField, {
          value: initialData.value,
          isValid: initialData.isValid,
          isTouched: initialData.isTouched,
          error: initialData.error,
        });

        // Reset DOM
        if (currentField.element.name !== 'category') currentField.element.value = '';
        currentField.element.classList.remove('field-invalid', 'field-valid');
      }

      isSubmitted = false;
      notifyStateChange();
    };

    const searchBookmarks = (searchTerm, sourceMap) => {
      try {
        if (!searchTerm || searchTerm.trim() === '') {
          return new Map(sourceMap);
        }

        const term = searchTerm.toLowerCase().trim();
        const filteredEntries = Array.from(sourceMap.entries()).filter(([, bookmark]) => {
          return (
            bookmark.title.toLowerCase().includes(term) ||
            bookmark.description.toLowerCase().includes(term) ||
            bookmark.category.toLowerCase().includes(term)
          );
        });

        return new Map(filteredEntries);
      } catch (error) {
        console.error('Error searching products:', error);
        return sourceMap;
      }
    };

    const filterByCategory = (category, sourceMap) => {
      try {
        if (!category || category.trim() === '') {
          return new Map(sourceMap);
        }

        const filteredEntries = Array.from(sourceMap.entries()).filter(
          ([, product]) => product.category.toLowerCase() === category.toLowerCase()
        );
        return new Map(filteredEntries);
      } catch (error) {
        console.error('Error filtering by category:', error);
        return sourceMap;
      }
    };

    // Enhanced filter application with performance tracking
    const applyAllFilters = () => {
      try {
        let resultMap = bookmarkData;

        // Apply filters in order of selectivity (most restrictive first)
        if (filtersState.search) {
          resultMap = searchBookmarks(filtersState.search, resultMap);
        }
        if (filtersState.category) {
          resultMap = filterByCategory(filtersState.category, resultMap);
        }
        // Update the current filtered map
        setCurrentFilteredMap(resultMap);

        return resultMap;
      } catch (error) {
        console.error('Error applying filters:', error);
        return new Map(bookmarkData);
      }
    };

    // Notify UI of state changes
    const notifyStateChange = () => {
      // Trigger UI updates - observer pattern
      onStateChange?.();
    };

    // Set state change callback
    const setStateChangeCallback = (callback) => {
      onStateChange = callback;
    };

    return {
      setStateChangeCallback,
      notifyStateChange,
      updateField,
      validateForm,
      isFormReady,
      getFormData,
      searchBookmarks,
      filterByCategory,
      applyAllFilters,
      reset,
    };
  };

  const createUIController = (dataController, businessController) => {
    const {
      fieldsMap,
      bookmarkData,
      filtersState,
      setCurrentFilteredMap,
      getCurrentFilteredMap,
      isSubmitted,
    } = dataController;
    const { applyAllFilters } = businessController;
    const elements = Object.fromEntries(
      Object.entries(SELECTORS).map(([key, selector]) => [key, document.querySelector(selector)])
    );
    //console.log(elements);

    const updateUI = () => {
      updateFieldStyles();
      updateFieldFeedback();
      updateStats(bookmarkData);
    };

    const createBookmarkCard = (data) => {
      const card = document.createElement('div');
      card.className = 'bookmark-card';
      card.id = data.id;

      // Header
      const header = document.createElement('div');
      header.className = 'bookmark-header';

      const title = document.createElement('h3');
      title.className = 'bookmark-title';
      title.textContent = data.title;

      header.appendChild(title);
      card.appendChild(header);

      // URL
      const url = document.createElement('a');
      url.className = 'bookmark-url';
      url.href = data.url;
      url.target = '_blank';
      url.textContent = data.url;
      card.appendChild(url);

      // Description
      const desc = document.createElement('p');
      desc.className = 'bookmark-description';
      desc.textContent = data.description;
      card.appendChild(desc);

      // Footer
      const footer = document.createElement('div');
      footer.className = 'bookmark-footer';

      const category = document.createElement('span');
      category.className = 'bookmark-category';
      category.textContent = data.category;

      const actions = document.createElement('div');
      actions.className = 'bookmark-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-small btn-edit';
      editBtn.textContent = 'Edit';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-small btn-delete';
      deleteBtn.textContent = 'Delete';
      deleteBtn.dataset.mode = 'delete';

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      footer.appendChild(category);
      footer.appendChild(actions);

      card.appendChild(footer);

      return card;
    };

    const updateFieldStyles = () => {
      for (const [, field] of fieldsMap) {
        const { element, isTouched, isValid, value } = field;

        element.classList.remove('field-valid', 'field-invalid');

        if (isTouched) {
          element.classList.add(isValid ? 'field-valid' : 'field-invalid');
        }
        if (isTouched & isValid) elements.cancelBtn.style.display = 'block';
      }
    };

    const updateFieldFeedback = () => {
      for (const [fieldName, field] of fieldsMap) {
        const feedbackElement = document.getElementById(`${fieldName}-error`);
        if (feedbackElement) {
          feedbackElement.textContent = field.isTouched && !field.isValid ? field.error : '';
          //feedbackElement.className = `field-feedback ${field.error ? 'error' : 'success'}`;
        }
      }
    };

    const filterManager = (target) => {
      try {
        if (!target) return;
        // Clear any previous validation errors
        target.classList.remove('error');

        if (target === elements.search) {
          filtersState.search = target.value.trim();
        } else if (target === elements.categoryFilter) {
          filtersState.category = target.value;
        }
        const filteredMap = applyAllFilters();
        filteredMap.size === 0
          ? (elements.noResult.style.display = 'block')
          : (elements.noResult.style.display = 'none');
        renderBookmarkCards(filteredMap);
      } catch (error) {
        console.error('Error in filter manager:', error);
      }
    };

    const updateStats = (bookmarkData) => {
      let state = '';
      bookmarkData.size === 0 ? (state = 'block') : (state = 'none');
      elements.bmNotFound.style.display = state;
      // Total bookmarks
      elements.totalBM.textContent = bookmarkData.size || 0;

      // Unique categories count
      const categories = new Set();
      bookmarkData.forEach((data) => {
        categories.add(data.category);
      });

      elements.categoryCount.textContent = categories.size || 0;
    };

    const getCategoryDropdown = (selectedCategory) => {
      const categories = elements.categoryFilter.querySelectorAll('option');
      const select = document.createElement('select');
      select.className = 'edit-category';

      // Selected value on top
      const selectedOption = document.createElement('option');
      selectedOption.value = selectedCategory.toLowerCase();
      selectedOption.textContent = selectedCategory;
      selectedOption.selected = true;
      select.appendChild(selectedOption);

      // Add other options
      Array.from(categories)
        .map((el) => el.textContent.trim()) // extract actual text
        .filter((cat) => cat.toLowerCase() !== selectedCategory.toLowerCase())
        .forEach((cat) => {
          const option = document.createElement('option');
          option.value = cat.toLowerCase();
          option.textContent = cat;
          select.appendChild(option);
        });

      return select;
    };

    const handleEdit = (id) => {
      const currentData = getCurrentFilteredMap();
      const data = currentData.get(id);
      console.log(data);
      if (!data) return;

      const card = data.cardElement;
      if (!card) return;
      // Make fields editable inside the card
      const titleElem = card.querySelector('.bookmark-title');
      const urlElem = card.querySelector('.bookmark-url');
      const descElem = card.querySelector('.bookmark-description');
      const categoryElem = card.querySelector('.bookmark-category');

      // Replace text with input fields (inline editing)
      titleElem.innerHTML = `<input type="text" class="edit-title" value="${data.title}">`;
      urlElem.innerHTML = `<input type="url" class="edit-url" value="${data.url}">`;
      descElem.innerHTML = `<textarea class="edit-description">${data.description}</textarea>`;
      categoryElem.innerHTML = '';
      categoryElem.appendChild(getCategoryDropdown(data.category));

      // Change buttons: hide Edit, show Save (or toggle)
      const editBtn = card.querySelector('.btn-edit');
      const deleteBtn = card.querySelector('.btn-delete');

      //save button
      editBtn.textContent = 'Save';
      editBtn.replaceWith(editBtn.cloneNode(true)); // remove old listener
      editBtn.addEventListener('click', () => handleSave(id));

      //cancel button
      deleteBtn.textContent = 'Cancel';
      deleteBtn.dataset.mode = 'cancel';
      deleteBtn.disabled = false;
    };

    const handleSave = (id) => {
      const data = bookmarkData.get(id);
      if (!data) return;

      const card = data.cardElement;
      if (!card) return;

      // Get updated values from inputs inside the card
      const newTitle = card.querySelector('.edit-title').value.trim();
      const newUrl = card.querySelector('.edit-url').value.trim();
      const newDesc = card.querySelector('.edit-description').value.trim();
      const newCategory = card.querySelector('.edit-category').value.trim();

      // Update data Map
      data.title = newTitle;
      data.url = newUrl;
      data.description = newDesc;
      data.category = newCategory;

      // Replace inputs back to normal text
      card.querySelector('.bookmark-title').textContent = newTitle;
      const urlElem = card.querySelector('.bookmark-url');
      urlElem.href = newUrl;
      urlElem.textContent = newUrl;
      card.querySelector('.bookmark-description').textContent = newDesc;
      card.querySelector('.bookmark-category').textContent = newCategory;

      // Reset buttons: Save → Edit
      const editBtn = card.querySelector('.btn-edit');
      const deleteBtn = card.querySelector('.btn-delete');

      editBtn.textContent = 'Edit';
      editBtn.removeEventListener('click', () => handleSave(id));
      editBtn.addEventListener('click', () => handleEdit(id));

      deleteBtn.disabled = false;

      // Optionally notify state changed, update stats, etc.
      notifyStateChange();
    };

    const handleDelete = (id) => {
      const data = bookmarkData.get(id);
      if (!data) return;

      bookmarkData.delete(id);
      // Remove the card element from DOM
      if (data.cardElement && data.cardElement.parentNode) {
        data.cardElement.parentNode.removeChild(data.cardElement);
      }
      // Update filtered map if needed
      setCurrentFilteredMap(bookmarkData);

      // Re-render updated list
      renderBookmarkCards(getCurrentFilteredMap());

      // Update stats
      updateUI();
    };

    const renderBookmarkCards = (map) => {
      elements.bookmarkList.innerHTML = ''; // Clear existing
      for (const data of map.values()) {
        const card = createBookmarkCard(data);
        elements.bookmarkList.appendChild(card);
        data.cardElement = card;
      }
    };

    return {
      elements,
      updateUI,
      createBookmarkCard,
      filterManager,
      renderBookmarkCards,
      handleDelete,
      handleEdit,
    };
  };

  const createEventController = (dataController, uiController, businessController) => {
    const { elements, renderBookmarkCards, filterManager, handleDelete, handleEdit } = uiController;
    const { fieldsMap, addBookmarkData, bookmarkData, setCurrentFilteredMap } = dataController;
    const { updateField, notifyStateChange, getFormData, validateForm, isFormReady, reset } =
      businessController;

    const handleFieldBlur = (e) => {
      const field = e.target;
      if (field.name && fieldsMap.has(field.name)) {
        updateField(field.name, field.value.trim());
      }
    };

    const handleFieldInput = (e) => {
      const field = e.target;
      if (field.name && fieldsMap.has(field.name)) {
        // For message field, update immediately for character counting
        if (field.name === 'message') {
          updateField(field.name, field.value, true);
        }
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();

      if (validateForm() && isFormReady()) {
        const formData = getFormData();
        // console.log(formData);
        addBookmarkData(formData);
        isSubmitted = true;
        renderBookmarkCards(bookmarkData);
        setCurrentFilteredMap(bookmarkData);
        //console.log(bookmarkData);
        notifyStateChange();
        elements.cancelBtn.style.display = 'none';
        reset();
      }
    };

    const handleButtonClick = (e) => {
      if (e.target.type === 'button' && e.target.id === 'cancel-edit') {
        e.preventDefault();
        elements.cancelBtn.style.display = 'none';
        reset();
      }
    };

    const handleSearchActions = (e) => {
      const field = e.target;
      // console.log(field);
      filterManager(field);
    };

    const handleBookmarkUpdates = (e) => {
      if (e.target.classList.contains('btn-edit')) {
        const id = e.target.closest('.bookmark-card').id;
        handleEdit(Number(id));
      }
      if (e.target.classList.contains('btn-delete')) {
        const id = e.target.closest('.bookmark-card').id;
        const mode = e.target.dataset.mode;
        if (mode === 'delete') {
          handleDelete(Number(id));
        } else if (mode === 'cancel') {
          renderBookmarkCards(bookmarkData);
        }
      }
    };

    const setupEventListeners = () => {
      // Field validation on blur
      elements.formContainer.addEventListener('blur', handleFieldBlur, true);

      // Real-time input for character counting and live feedback
      elements.formContainer.addEventListener('input', handleFieldInput, true);

      // Form submission and reset
      elements.formContainer.addEventListener('submit', handleSubmit);
      elements.formContainer.addEventListener('click', handleButtonClick);

      //Search Listeners
      elements.searchControls.addEventListener('input', handleSearchActions);
      elements.bookmarkList.addEventListener('click', handleBookmarkUpdates);
    };

    return {
      setupEventListeners,
    };
  };

  const initialize = () => {
    const dataController = createDataController();
    const businessController = createBusinessController(dataController);
    const uiController = createUIController(dataController, businessController);
    const eventController = createEventController(dataController, uiController, businessController);

    const formFields = document.querySelectorAll(SELECTORS.formFields);
    formFields.forEach((field) => {
      if (field.name) {
        dataController.initializeField(field);
      }
    });
    businessController.setStateChangeCallback(() => {
      uiController.updateUI();
    });

    // Initial UI update
    uiController.updateUI();

    //console.log(dataController.initialFormState);
    //initialize listeners
    eventController.setupEventListeners();
  };
  return initialize();
}

document.addEventListener('DOMContentLoaded', initBookmarkManager);
