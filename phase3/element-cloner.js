function initElementCloner() {
  const options = {
    deepClone: document.getElementById('deep-clone'),
    cloneEvents: document.getElementById('clone-events'),
  };
  const { deepClone, cloneEvents } = options;
  const resetButton = document.getElementById('reset-target');
  const elementTypes = document.querySelectorAll('[data-element-type]');
  const targetArea = document.getElementById('clone-target');
  const infoPanels = document.querySelector('.info-panel2');
  const sourceElements = {};

  elementTypes.forEach((el) => {
    const type = el.dataset.elementType;
    sourceElements[type] = el;
  });

  elementTypes.forEach((type) => {
    type.addEventListener('click', () => {
      const placeholder = document.querySelector('.empty-message');
      if (placeholder) placeholder.remove();

      const isDeepCloned = deepClone.checked;
      const isEventListenerAttached = cloneEvents.checked;
      const clone = type.cloneNode(isDeepCloned);
      clone.classList.add('cloned-element');

      if (isEventListenerAttached) {
        addClickListener(clone);
        clone.classList.add('cloned-listener');
      }
      targetArea.appendChild(clone);

      const data = {
        clone: clone,
        deepCloned: isDeepCloned,
        eventListenerAttached: isEventListenerAttached,
      };

      updateInfoPanel(data);
    });
  });

  resetButton.addEventListener('click', () => {
    targetArea.innerHTML = '';
    targetArea.innerHTML = `<p class="empty-message">Cloned elements will appear here</p>`;
  });

  function addClickListener(el) {
    el.addEventListener('click', () => {
      const styles = {
        active: 'aquamarine',
        inactive: '#f9f9f9',
      };

      const nodeAttr = el.getAttribute('data-element-type');
      switch (nodeAttr) {
        case 'button':
          alert('Button Clicked');
          break;
        case 'input':
          alert('Input Clicked');
          break;
        case 'nested':
          alert('Nested Element Clicked');
          break;
        case 'event':
          infoPanels.style.backgroundColor =
            infoPanels.style.backgroundColor === styles.active ? styles.inactive : styles.active;
          break;
        default:
          break;
      }
    });
  }

  function updateInfoPanel(data) {
    const cloneInfo = document.getElementById('clone-info');
    let cloneText = data.deepCloned ? `Deep clone` : `No Deep Clone`;
    let type = data.clone.getAttribute('data-element-type');
    cloneInfo.textContent = `${data.clone.nodeName} of type ${type} is cloned via ${cloneText}`;
  }

  addClickListener(sourceElements.event);
}

document.addEventListener('DOMContentLoaded', initElementCloner);
