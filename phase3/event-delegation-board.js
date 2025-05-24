function initEventDelegationBoard() {
  const data = {
    input: document.getElementById('element-text'),
    type: document.getElementById('element-type'),
  };

  const para = document.querySelector('#delegation-board .empty-message');
  const controls = {
    add: document.getElementById('add-element'),
    clear: document.getElementById('clear-board'),
  };

  let board = document.getElementById('delegation-board');

  const infoPanel = {
    elementInfo: document.getElementById('element-count'),
    interactionCountInfo: document.getElementById('interaction-count'),
    lastActionInfo: document.getElementById('last-action'),
    targetInfo: document.getElementById('target-element'),
  };

  const countLog = {
    elementCount: 0,
    interactionCount: 0,
  };
  let actionLogs = [];

  const eventInfo = {
    countLog: null,
    actionLog: null,
  };

  updateEventInfo('countLog', countLog);

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

  function createElement() {
    if (para) para.remove(para);
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
    countLog.elementCount++;
    data.input.value = '';
    updateEventInfo('countLog', countLog);
  }

  function updateEventInfo(type, data) {
    console.log(type, data);
    switch (type) {
      case 'countLog':
        infoPanel.elementInfo.textContent = data.elementCount;
        infoPanel.interactionCountInfo.textContent = data.interactionCount;
        break;
      case 'actionLog':
        data === (null || undefined)
          ? (infoPanel.lastActionInfo.textContent = '')
          : (infoPanel.lastActionInfo.textContent = `${data.name} was ${data.action} at ${data.timestamp}`);
      default:
        break;
    }
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

  function handleAction(data) {
    actionLogs.push({
      name: data.elementName,
      id: data.elementID,
      action: data.state,
      timestamp: Date.now(),
    });
  }

  board.addEventListener('click', (e) => {
    countLog.interactionCount++;
    let elName = e.target.classList[1];
    const pushData = {
      elementName: '',
      elementID: e.target.getAttribute('data-id'),
      state: '',
    };
    console.log(pushData);
    switch (true) {
      case e.target.classList.contains('board-element'):
        alert(`${elName} was Selected`);
        pushData.elementName = elName;
        pushData.state = 'selected';
        handleAction(pushData);
        break;
      case e.target.classList.contains('delete-btn'):
        let parent = e.target.closest('.board-element');
        pushData.elementName = parent.classList[1];
        pushData.state = 'deleted';
        handleAction(pushData);
        parent.remove();
        break;
      default:
        document.getElementById('target-element').textContent = getTargetDescription(e.target);
        break;
    }

    const logInfo = actionLogs.find((obj) => obj.id === e.target.getAttribute('data-id'));
    console.log(logInfo);
    updateEventInfo('countLog', countLog);
    updateEventInfo('actionLog', logInfo);
    document.getElementById('target-element').textContent = getTargetDescription(e.target);
  });
}

document.addEventListener('DOMContentLoaded', initEventDelegationBoard);
