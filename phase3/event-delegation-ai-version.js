function initEventDelegationBoard() {
  // ===== DOM REFERENCES =====
  const elements = {
    input: document.getElementById('element-text'),
    typeSelect: document.getElementById('element-type'),
    addBtn: document.getElementById('add-element'),
    clearBtn: document.getElementById('clear-board'),
    board: document.getElementById('delegation-board'),
    emptyMessage: document.querySelector('#delegation-board .empty-message'),
    // Info panel elements
    elementCount: document.getElementById('element-count'),
    interactionCount: document.getElementById('interaction-count'),
    lastAction: document.getElementById('last-action'),
    targetElement: document.getElementById('target-element'),
  };

  // ===== APPLICATION STATE =====
  const state = {
    elements: new Map(), // Using Map for O(1) lookups by ID
    totalInteractions: 0,
    selectedElement: null,
  };

  // ===== UTILITY FUNCTIONS =====
  const utils = {
    generateId: () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

    formatTimestamp: () => new Date().toLocaleString(),

    getTargetDescription(target) {
      if (target.classList.contains('delete-btn')) {
        const elementText = target.parentElement.textContent.replace('×', '').trim();
        return `Delete button (${elementText.slice(0, 15)}${elementText.length > 15 ? '...' : ''})`;
      }
      if (target.classList.contains('board-element')) {
        const elementText = target.textContent.replace('×', '').trim();
        const elementType = target.classList[1] || 'element';
        return `${elementType} - "${elementText.slice(0, 15)}${
          elementText.length > 15 ? '...' : ''
        }"`;
      }
      if (target.id === 'delegation-board') {
        return 'Board container (empty space)';
      }
      return target.tagName?.toLowerCase() || 'Unknown element';
    },

    validateInput(text) {
      return text && text.trim().length > 0;
    },
  };

  // ===== UI UPDATE FUNCTIONS =====
  const ui = {
    updateInfoPanel(lastActionData = null) {
      elements.elementCount.textContent = state.elements.size;
      elements.interactionCount.textContent = state.totalInteractions;

      if (lastActionData) {
        const { action, elementType, timestamp } = lastActionData;
        elements.lastAction.textContent = `${elementType} was ${action} at ${timestamp}`;
      } else if (state.elements.size === 0) {
        elements.lastAction.textContent = 'Board cleared';
      }
    },

    updateTargetInfo(target) {
      elements.targetElement.textContent = utils.getTargetDescription(target);
    },

    toggleEmptyMessage() {
      elements.emptyMessage.style.display = state.elements.size === 0 ? 'block' : 'none';
    },

    clearSelection() {
      if (state.selectedElement) {
        state.selectedElement.classList.remove('selected');
        state.selectedElement = null;
      }
    },

    selectElement(element) {
      this.clearSelection();
      element.classList.add('selected');
      state.selectedElement = element;
    },
  };

  // ===== ELEMENT MANAGEMENT =====
  const elementManager = {
    create() {
      const inputValue = elements.input.value.trim();
      const elementType = elements.typeSelect.value;

      // Validation
      if (!utils.validateInput(inputValue)) {
        elements.input.focus();
        return;
      }

      // Create element data
      const elementData = {
        id: utils.generateId(),
        text: inputValue,
        type: elementType,
        createdAt: utils.formatTimestamp(),
        interactions: 0,
      };

      // Create DOM element
      const elementDOM = this.createElementDOM(elementData);
      console.log(elementDOM);
      // Update state and UI
      state.elements.set(elementData.id, { data: elementData, dom: elementDOM });
      console.log(state);
      elements.board.appendChild(elementDOM);
      elements.input.value = '';

      ui.toggleEmptyMessage();
      ui.updateInfoPanel({
        action: 'created',
        elementType: elementType,
        timestamp: elementData.createdAt,
      });

      return elementData.id;
    },

    createElementDOM(elementData) {
      const element = document.createElement('div');
      element.className = `board-element ${elementData.type}`;
      element.dataset.id = elementData.id;
      element.textContent = elementData.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.setAttribute('aria-label', `Delete ${elementData.text}`);

      element.appendChild(deleteBtn);
      return element;
    },

    delete(elementId) {
      const elementRecord = state.elements.get(elementId);
      if (!elementRecord) return false;

      const { data, dom } = elementRecord;

      // Remove from DOM and state
      dom.remove();
      state.elements.delete(elementId);

      // Clear selection if this element was selected
      if (state.selectedElement === dom) {
        state.selectedElement = null;
      }

      ui.toggleEmptyMessage();
      ui.updateInfoPanel({
        action: 'deleted',
        elementType: data.type,
        timestamp: utils.formatTimestamp(),
      });

      return true;
    },

    select(elementId) {
      const elementRecord = state.elements.get(elementId);
      if (!elementRecord) return false;

      const { data, dom } = elementRecord;

      // Update interaction count
      data.interactions++;

      ui.selectElement(dom);
      ui.updateInfoPanel({
        action: 'selected',
        elementType: data.type,
        timestamp: utils.formatTimestamp(),
      });

      return true;
    },

    clear() {
      // Clear all elements
      state.elements.clear();
      state.selectedElement = null;

      // Reset board HTML
      elements.board.innerHTML = '';
      elements.board.appendChild(elements.emptyMessage);

      ui.toggleEmptyMessage();
      ui.updateInfoPanel();
    },
  };

  // ===== EVENT HANDLERS =====
  const eventHandlers = {
    handleBoardClick(event) {
      state.totalInteractions++;
      console.log(event.target);
      ui.updateTargetInfo(event.target);

      // Handle different click targets
      if (event.target.classList.contains('delete-btn')) {
        const elementDOM = event.target.closest('.board-element');
        if (elementDOM) {
          elementManager.delete(elementDOM.dataset.id);
        }
      } else if (event.target.classList.contains('board-element')) {
        elementManager.select(event.target.dataset.id);
      }

      // Always update interaction count
      ui.updateInfoPanel();
    },

    handleAddElement() {
      elementManager.create();
    },

    handleClearBoard() {
      if (state.elements.size > 0) {
        const confirmed = confirm(
          `Are you sure you want to clear all ${state.elements.size} elements?`
        );
        if (confirmed) {
          elementManager.clear();
        }
      }
    },

    handleKeyPress(event) {
      // Allow Enter key to add element
      if (event.key === 'Enter' && event.target === elements.input) {
        elementManager.create();
      }
    },
  };

  // ===== INITIALIZATION =====
  function init() {
    // Set up event listeners
    elements.board.addEventListener('click', eventHandlers.handleBoardClick);
    elements.addBtn.addEventListener('click', eventHandlers.handleAddElement);
    elements.clearBtn.addEventListener('click', eventHandlers.handleClearBoard);
    elements.input.addEventListener('keypress', eventHandlers.handleKeyPress);

    // Initialize UI
    ui.updateInfoPanel();
    ui.toggleEmptyMessage();

    // Set initial target info
    elements.targetElement.textContent = 'None';

    // Focus input for better UX
    elements.input.focus();

    console.log('Event Delegation Board initialized successfully');
  }

  // Initialize the application
  init();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initEventDelegationBoard);
