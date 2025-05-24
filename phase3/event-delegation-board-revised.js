function initEventDelegationBoard() {
  const data = {
    input: document.getElementById('element-text'),
    type: document.getElementById('element-type'),
  };
  const controls = {
    add: document.getElementById('add-element'),
    clear: document.getElementById('clear-board'),
  };
  const infoPanel = {
    elementInfo: document.getElementById('element-count'),
    interactionCountInfo: document.getElementById('interaction-count'),
    lastActionInfo: document.getElementById('last-action'),
    targetInfo: document.getElementById('target-element'),
  };
  let para = document.querySelector('#delegation-board .empty-message');
  let board = document.getElementById('delegation-board');

  Object.entries(controls).forEach(([key, el]) => {
    el.addEventListener('click', () => {
      if (key === 'add') {
        createElement();
      } else {
        board.innerHTML = '';
        board.appendChild(para);
      }
    });
  });

  const elementDataList = [];

  const eventInfo = {
    totalElements: 0,
    totalInteractions: 0,
    lastAction: 'None',
    targetElement: 'None',
  };

  function createElement() {
    if (para) para.style.display = 'none';
    const inputText = data.input.value;
    const elementType = data.type.value;
    const uniqueID = `id-${Date.now()}`;

    const div = document.createElement('div');
    div.classList.add('board-element', elementType);
    div.setAttribute('data-id', uniqueID);

    div.textContent = `${inputText}`;
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.textContent = 'x';

    div.appendChild(deleteBtn);
    board.appendChild(div);
    data.input.value = '';
    const elementData = {
      name: elementType,
      id: div.getAttribute('data-id'),
      state: 'created',
      time: new Date().toLocaleString(),
    };
    elementDataList.push(elementData);
    console.log(elementData);
    eventInfo.totalElements++;
    eventInfo.lastAction = 'created';
    //const currentElement = elementDataList.find((obj) => obj.id === uniqueID);
    updateEventsDisplay(eventInfo, elementData);
  }

  function updateEventsDisplay(data, elementData) {
    infoPanel.elementInfo.textContent = data.totalElements;
    infoPanel.interactionCountInfo.textContent = data.totalInteractions;
    infoPanel.lastActionInfo.textContent =
      elementData === null || elementData === undefined
        ? 'None'
        : elementData === 0
        ? 'Board Cleared'
        : `${elementData.name} was ${elementData.state} at ${new Date().toLocaleString()}`;
    infoPanel.targetInfo.textContent = data.targetElement;
  }

  function getTargetDescription(target) {
    if (target.classList.contains('delete-btn')) {
      return `Delete button (${target.parentElement.textContent.slice(0, 20)}...)`;
    } else if (target.classList.contains('board-element')) {
      return `${target.className} - "${target.textContent.slice(0, 20)}..."`;
    } else if (target.id === 'delegation-board') {
      return 'Board container (empty space)';
    } else {
      return target.tagName || 'Unknown element';
    }
  }
  board.addEventListener('click', (e) => {
    eventInfo.totalInteractions++;
    let elName = e.target.getAttribute('data-id');
    let currentElement = elementDataList.find((obj) => obj.id === elName);
    switch (true) {
      case e.target.classList.contains('board-element'):
        alert(`${currentElement.name} was Selected`);
        currentElement.state = 'selected';
        break;
      case e.target.classList.contains('delete-btn'):
        let parent = e.target.closest('.board-element');
        currentElement = elementDataList.find((obj) => obj.id === parent.dataset.id);
        currentElement.state = 'deleted';
        eventInfo.totalElements--;

        parent.remove();
        elementDataList.pop(currentElement);
        if (elementDataList.length === 0) para.style.display = 'block';
        break;
      default:
        break;
    }
    eventInfo.targetElement = getTargetDescription(e.target);
    //console.log(eventInfo, currentElement);
    updateEventsDisplay(eventInfo, currentElement);
  });

  controls.clear.addEventListener('click', () => {
    elementDataList.length = 0;
    eventInfo.totalElements = 0;
    para.style.display = 'block';
    updateEventsDisplay(eventInfo, 0);
  });

  updateEventsDisplay(eventInfo, null);
}

document.addEventListener('DOMContentLoaded', initEventDelegationBoard);
