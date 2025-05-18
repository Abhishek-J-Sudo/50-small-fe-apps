document.addEventListener('DOMContentLoaded', () => {
  // Get modal elements
  const focusTrapEle = document.querySelector('#focus-trap');
  const button = focusTrapEle.querySelector('button');
  const modal = document.querySelector('#myModal');
  const close = document.querySelector('.close');

  // Open and close modal handlers
  button.addEventListener('click', () => {
    modal.style.display = 'block';
    enableFocusTrap();
  });

  close.addEventListener('click', () => {
    modal.style.display = 'none';
    disableFocusTrap();
  });

  // Focus trap implementation
  let focusableElements = [];
  let firstFocusableElement = null;
  let lastFocusableElement = null;

  // Function to get all focusable elements inside the modal
  function getFocusableElements() {
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Get all focusable elements within the modal
    focusableElements = Array.from(modal.querySelectorAll(selector));

    // Set first and last elements for easy reference
    firstFocusableElement = focusableElements[0];
    lastFocusableElement = focusableElements[focusableElements.length - 1];
  }

  // Function to handle keydown events
  function trapTabKey(e) {
    // Check if Tab key was pressed
    if (e.key === 'Tab') {
      // If Shift + Tab and focus is on first element, move to last element
      if (e.shiftKey && document.activeElement === firstFocusableElement) {
        e.preventDefault();
        lastFocusableElement.focus();
      }
      // If Tab and focus is on last element, move to first element
      else if (!e.shiftKey && document.activeElement === lastFocusableElement) {
        e.preventDefault();
        firstFocusableElement.focus();
      }
    }

    // Close modal if Escape key is pressed
    if (e.key === 'Escape') {
      modal.style.display = 'none';
      disableFocusTrap();
    }
  }

  // Store the element that had focus before modal opened
  let previouslyFocusedElement = null;

  // Function to enable focus trap
  function enableFocusTrap() {
    // Store currently focused element to restore later
    previouslyFocusedElement = document.activeElement;

    // Get all focusable elements in the modal
    getFocusableElements();

    // Set focus to the first focusable element
    if (firstFocusableElement) {
      setTimeout(() => {
        firstFocusableElement.focus();
      }, 50); // Small delay to ensure modal is visible first
    }

    // Add event listener for tab key
    document.addEventListener('keydown', trapTabKey);

    // Add visual indicator for focus (optional)
    addFocusStyles();
  }

  // Function to disable focus trap
  function disableFocusTrap() {
    // Remove event listener
    document.removeEventListener('keydown', trapTabKey);

    // Restore focus to element that had it before modal opened
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }

    // Remove visual focus indicators
    removeFocusStyles();
  }

  // Add visual styles to show focus (optional enhancement)
  function addFocusStyles() {
    // Add a CSS class to modal to indicate focus trap is active
    modal.classList.add('focus-trap-active');

    // Add event listeners for focus to highlight the active element
    focusableElements.forEach((element) => {
      element.addEventListener('focus', () => {
        element.classList.add('focus-highlight');
      });

      element.addEventListener('blur', () => {
        element.classList.remove('focus-highlight');
      });
    });
  }

  // Remove visual styles
  function removeFocusStyles() {
    modal.classList.remove('focus-trap-active');

    focusableElements.forEach((element) => {
      element.classList.remove('focus-highlight');
    });
  }

  // Click outside modal to close (optional enhancement)
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      disableFocusTrap();
    }
  });
});
