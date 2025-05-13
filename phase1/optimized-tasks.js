document.addEventListener('DOMContentLoaded', () => {
  function initToggler() {
    const container = document.getElementById('class-toggler');
    const toggleButton = container.querySelector('button');
    const title = container.querySelector('h1');

    // Simplified toggle using the built-in toggle method
    toggleButton.addEventListener('click', () => {
      title.classList.toggle('active');
    });
  }

  function initStyleChange() {
    const container = document.getElementById('style-change');
    const demoButton = container.querySelector('.demo-button');
    const toggleButton = container.querySelector('.button');

    // Using style configurations for cleaner state management
    const styles = {
      state1: {
        backgroundColor: 'red',
        height: '100px',
        width: '200px',
        color: 'white',
        transform: 'rotate(0deg)',
      },
      state2: {
        backgroundColor: 'peachpuff', // Fixed color name
        height: '60px',
        width: '140px',
        color: 'white',
        transform: 'rotate(45deg)',
      },
    };

    let isFirstState = true;

    toggleButton.addEventListener('click', () => {
      // Apply transition property first
      demoButton.style.transition = 'all ease 1s';

      // Apply all style properties from the appropriate state object
      const currentStyles = isFirstState ? styles.state1 : styles.state2;
      Object.entries(currentStyles).forEach(([property, value]) => {
        demoButton.style[property] = value;
      });

      // Toggle state for next click
      isFirstState = !isFirstState;
    });
  }

  function initElementCreator() {
    const container = document.getElementById('element-creator');
    const images = container.querySelectorAll('img');
    const dotsContainer = container.querySelector('.dots-container');

    // Clear existing dots
    dotsContainer.innerHTML = '';

    // Create a document fragment for better performance
    const fragment = document.createDocumentFragment();

    // Create dots that correspond to images
    images.forEach((image, index) => {
      const dot = document.createElement('div');
      dot.classList.add('dots');

      // Add data attribute for potential future functionality
      dot.dataset.imageIndex = index;

      fragment.appendChild(dot);
    });

    // Append all dots at once (more efficient)
    dotsContainer.appendChild(fragment);
  }

  function initAttributeManager() {
    const container = document.getElementById('attribute-manager');
    const attributeSelector = document.getElementById('attr');
    const inputField = document.getElementById('inputAttr');
    const changeButton = container.querySelector('button');
    const targetImage = container.querySelector('img');

    // Get disable/enable buttons by their position in the form section
    const formSection = container.querySelector('.flex-row:last-of-type');
    const [disableButton, enableButton] = formSection.querySelectorAll('button');
    const lastNameInput = document.getElementById('lname');

    // Use input event for real-time updates
    inputField.addEventListener('input', (e) => {
      // No need to store in variable as we can access value directly when needed
    });

    changeButton.addEventListener('click', () => {
      const selectedAttribute = attributeSelector.value;
      const inputValue = inputField.value;

      if (!inputValue.trim()) {
        return; // Don't set empty values
      }

      // Map attribute values to their DOM properties
      const attributeMap = {
        'img-url': { name: 'src', value: inputValue },
        alt: { name: 'alt', value: inputValue },
        height: { name: 'height', value: inputValue },
        width: { name: 'width', value: inputValue },
      };

      // Set the selected attribute if it exists in our map
      if (attributeMap[selectedAttribute]) {
        targetImage.setAttribute(
          attributeMap[selectedAttribute].name,
          attributeMap[selectedAttribute].value
        );
      }

      // Clear input after setting attribute
      inputField.value = '';
    });

    // Handle disable/enable functionality
    disableButton.addEventListener('click', () => {
      lastNameInput.setAttribute('disabled', '');
    });

    enableButton.addEventListener('click', () => {
      lastNameInput.removeAttribute('disabled');
    });
  }

  function initMultiEventHandler() {
    const eventsLogged = document.querySelector('.display-events');
    const mouseButton = document.querySelector('.button1');
    const childEle = document.getElementById('child');
    let time = new Date().toLocaleTimeString();
    let count = 0;
    let counting = false;
    let timeoutId;

    function handleMouseEvent(e) {
      const output = document.createElement('div');
      const timer = document.createElement('div');
      if (e.type === 'click') {
        output.textContent = 'Button Clicked' + ' //' + time;
        eventsLogged.appendChild(output);
      } else if (e.type === 'dblclick') {
        output.textContent = 'Double button Clicked' + ' //' + time;
        eventsLogged.appendChild(output);
      } else if (e.type === 'mouseover') {
        mouseButton.style.backgroundColor = 'red';
        output.textContent = 'Mouse over' + ' //' + time;
        eventsLogged.appendChild(output);
      } else if (e.type === 'mouseout') {
        mouseButton.style.backgroundColor = '';
        output.textContent = 'Mouse out' + ' //' + time;
        eventsLogged.appendChild(output);
      } else if (e.type === 'contextmenu') {
        e.preventDefault();
        alert('Custom right-click action triggered!');
      } else if (e.type === 'mouseenter') {
        e.stopPropagation();
        output.textContent = 'Mouse enter - no bubble' + ' //' + time;
        eventsLogged.appendChild(output);
        childEle.style.height = '50px';
        childEle.style.width = '60px';
      } else if (e.type === 'mouseleave') {
        e.stopPropagation();
        output.textContent = 'Mouse leave - no bubble' + ' //' + time;
        eventsLogged.appendChild(output);
        childEle.style.height = '30px';
        childEle.style.width = '40px';
      } else if (e.type === 'mousedown') {
        output.textContent = 'Mousedown pressed' + ' //' + time;
        eventsLogged.appendChild(output);
        if (!counting) {
          counting = true;
          increaseCount();
        }
      } else if (e.type === 'mouseup') {
        output.textContent = 'Mousedown lifted' + ' //' + time;
        eventsLogged.appendChild(output);
        counting = false;
        clearInterval(timeoutId);
      }

      // For keydown event
      if (e.type === 'keydown') {
        // Check which key was pressed
        if (e.key === 'Enter' || e.key === ' ') {
          // Simulate a click when Enter or Space is pressed
          output.textContent = `Key pressed: ${e.key} (simulated click) //${time}`;
        } else if (e.key === 'ArrowUp') {
          output.textContent = `Arrow Up pressed //${time}`;
          // Maybe increase something
        } else if (e.key === 'ArrowDown') {
          output.textContent = `Arrow Down pressed //${time}`;
          // Maybe decrease something
        } else {
          output.textContent = `Key pressed: ${e.key} //${time}`;
        }
        eventsLogged.appendChild(output);
      }
      // For keyup event
      if (e.type === 'keyup') {
        output.textContent = `Key released: ${e.key} //${time}`;
        eventsLogged.appendChild(output);
      }

      // During any event, check for modifier keys
      if (e.shiftKey) {
        output.textContent += ' (with Shift)';
      }
      if (e.ctrlKey) {
        output.textContent += ' (with Ctrl)';
      }
      if (e.altKey) {
        output.textContent += ' (with Alt)';
      }

      function increaseCount() {
        if (counting) {
          count++;
          timer.textContent = `Count: ${count}`; // Update count display
          timeoutId = setTimeout(increaseCount, 100);
          if (!document.contains(timer)) {
            eventsLogged.appendChild(timer); // Append timer only once
          }
        }
      }
    }
    mouseButton.addEventListener('click', handleMouseEvent);
    mouseButton.addEventListener('dblclick', handleMouseEvent);
    mouseButton.addEventListener('mouseover', handleMouseEvent);
    mouseButton.addEventListener('mouseout', handleMouseEvent);
    childEle.addEventListener('mouseenter', handleMouseEvent);
    childEle.addEventListener('mouseleave', handleMouseEvent);
    mouseButton.addEventListener('contextmenu', handleMouseEvent);
    mouseButton.addEventListener('mousedown', handleMouseEvent);
    mouseButton.addEventListener('mouseup', handleMouseEvent);
    mouseButton.addEventListener('keydown', handleMouseEvent);
    mouseButton.addEventListener('keyup', handleMouseEvent);

    // Add focus events to show when the button gets/loses focus
    mouseButton.addEventListener('focus', (e) => {
      const output = document.createElement('div');
      output.textContent = `Button focused // ${new Date().toLocaleTimeString()}`;
      eventsLogged.appendChild(output);
      mouseButton.style.outline = '3px solid blue';
    });

    mouseButton.addEventListener('blur', (e) => {
      const output = document.createElement('div');
      output.textContent = `Button lost focus // ${new Date().toLocaleTimeString()}`;
      eventsLogged.appendChild(output);
      mouseButton.style.outline = '';
    });

    // Touch event handling
    mouseButton.addEventListener('touchstart', (e) => {
      const output = document.createElement('div');
      output.textContent = `Touch started // ${new Date().toLocaleTimeString()}`;
      eventsLogged.appendChild(output);

      // Prevent mouse events from firing after touch
      e.preventDefault();
    });

    mouseButton.addEventListener('touchend', (e) => {
      const output = document.createElement('div');
      output.textContent = `Touch ended // ${new Date().toLocaleTimeString()}`;
      eventsLogged.appendChild(output);

      // Prevent mouse events from firing after touch
      e.preventDefault();
    });

    // Detect long press
    let touchTimeout;
    mouseButton.addEventListener('touchstart', (e) => {
      touchTimeout = setTimeout(() => {
        const output = document.createElement('div');
        output.textContent = `Long press detected // ${new Date().toLocaleTimeString()}`;
        eventsLogged.appendChild(output);
      }, 800); // Detect press after 800ms
    });

    mouseButton.addEventListener('touchend', (e) => {
      clearTimeout(touchTimeout);
    });
  }

  // Initialize all components
  initToggler();
  initStyleChange();
  initElementCreator();
  initAttributeManager();
  initMultiEventHandler();
});
