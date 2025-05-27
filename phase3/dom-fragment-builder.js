function initFragmentBuilder() {
  const inputButtons = document.querySelector('.method-buttons');
  const perfMetrics = document.querySelectorAll('.metric-value');
  const [directMetrics, fragMetrics, perfGain] = perfMetrics;
  const directOutput = document.getElementById('direct-output');
  const fragOutput = document.getElementById('fragment-output');
  const outputs = {
    direct: directOutput,
    fragment: fragOutput,
  };
  const metrics = [];
  const clearControls = document.querySelector('.clear-controls');
  const pMap = {
    directPlaceholder: document.querySelector('#direct-output .empty-message'),
    fragPlaceholder: document.querySelector('#fragment-output .empty-message'),
  };

  const ui = {
    toggleEmptyMessage(data) {
      const placeholder = data.querySelector('.empty-message');
      const hasContent = data.children.length > 1; // 1 = placeholder itself

      if (placeholder) {
        placeholder.style.display = hasContent ? 'none' : 'block';
      }
    },
  };

  const eventHandlers = {
    handleElementCreation(e) {
      if (e.target.tagName === 'BUTTON') {
        const elementCount = document.querySelector('.input-group #element-count').value;
        const elementType = document.getElementById('element-type-select').value;
        const id = e.target.id;
        console.log('Clicked:', id);

        const actions = {
          'generate-direct': () => {
            const t0 = performance.now();
            elementManager.createMethod(elementCount, elementType, 'direct');
            const t1 = performance.now();
            utils.showMetrics(t0, t1, directMetrics, elementType);
          },

          'generate-fragment': () => {
            const t0 = performance.now();
            elementManager.createMethod(elementCount, elementType, 'fragment');
            const t1 = performance.now();
            utils.showMetrics(t0, t1, fragMetrics, elementType);
          },
          'generate-both': () => utils.compareBoth(elementType),
        };

        if (actions[id]) {
          actions[id]();
        } else {
          console.warn(`No action for: ${id}`);
        }
      }
    },

    handleClear(e) {
      e.target.id === 'clear-direct'
        ? ((outputs.direct.innerHTML = ''), outputs.direct.appendChild(pMap.directPlaceholder))
        : e.target.id === 'clear-fragment'
        ? ((outputs.fragment.innerHTML = ''), outputs.fragment.appendChild(pMap.fragPlaceholder))
        : ((outputs.direct.innerHTML = ''),
          (outputs.fragment.innerHTML = ''),
          outputs.direct.appendChild(pMap.directPlaceholder),
          outputs.fragment.appendChild(pMap.fragPlaceholder));
    },
  };

  const utils = {
    listCreation(count, mode) {
      const container = outputs[mode];
      container.innerHTML = '';
      const parent = mode === 'fragment' ? document.createDocumentFragment() : container;
      console.log(parent);

      for (let i = 1; i <= count; i++) {
        const li = document.createElement('li');
        li.textContent = `list${i}`;
        li.classList.add('list-item');
        parent.appendChild(li);
      }

      if (mode === 'fragment') {
        container.appendChild(parent);
      }
    },

    cardsCreation(count, mode) {
      const container = outputs[mode];
      container.innerHTML = '';
      const parent = mode === 'fragment' ? document.createDocumentFragment() : container;

      for (let i = 1; i <= count; i++) {
        const card = document.createElement('div');
        card.className = 'user-card';

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.textContent = '🧑'; // or use img if you want

        const info = document.createElement('div');
        info.className = 'user-info';

        const name = document.createElement('div');
        name.className = 'user-name';
        name.textContent = `User ${i}`;

        const email = document.createElement('div');
        email.className = 'user-email';
        email.textContent = `user${i}@example.com`;
        info.appendChild(name);
        info.appendChild(email);

        card.appendChild(avatar);
        card.appendChild(info);
        parent.appendChild(card);
      }
      if (mode === 'fragment') {
        container.appendChild(parent);
      }
    },

    complexCreation(count, mode) {
      const container = outputs[mode];
      container.innerHTML = '';
      const parent = mode === 'fragment' ? document.createDocumentFragment() : container;

      for (let i = 1; i <= count; i++) {
        const item = document.createElement('div');
        item.className = 'complex-item';

        const header = document.createElement('div');
        header.className = 'complex-header';

        const title = document.createElement('h3');
        title.className = 'complex-title';
        title.textContent = `Item ${i}`;

        const badge = document.createElement('span');
        badge.className = 'complex-badge';
        badge.textContent = i % 2 === 0 ? 'Even' : 'Odd';

        header.appendChild(title);
        header.appendChild(badge);

        const content = document.createElement('div');
        content.className = 'complex-content';
        content.textContent = `This is some descriptive content for item ${i}.`;

        item.appendChild(header);
        item.appendChild(content);

        parent.appendChild(item);
      }
      if (mode === 'fragment') {
        container.appendChild(parent);
      }
    },

    showMetrics(t1, t2, mode, type) {
      const time = t2 - t1;
      mode.textContent = `${time.toFixed(3)} ms`;
      metrics.push({
        node: mode,
        type: type,
        time: time,
      });
      console.log(metrics);
    },

    compareBoth(type) {
      const listMetrics = metrics.filter((m) => m.type === type);
      if (listMetrics.length < 2) {
        alert('Create via both methods to compare');
        return;
      } else {
        console.log(listMetrics);
        const diff = Math.abs(listMetrics[0].time - listMetrics[1].time);
        perfGain.textContent = `${diff.toFixed(1)}ms`;
      }
    },

    initPlaceholders() {
      document.querySelectorAll('.output-container').forEach((container) => {
        ui.toggleEmptyMessage(container);
      });
    },
  };

  const elementManager = {
    createMethod(count, type, method) {
      const taskMap = {
        list: utils.listCreation,
        cards: utils.cardsCreation,
        complex: utils.complexCreation,
      };

      const createFn = taskMap[type];
      if (createFn) {
        createFn(count, method);
        utils.initPlaceholders();
      } else {
        console.warn(`Unknown type: ${type}`);
      }
    },
  };

  function init() {
    inputButtons.addEventListener('click', eventHandlers.handleElementCreation);
    clearControls.addEventListener('click', eventHandlers.handleClear);
    utils.initPlaceholders();
    console.log('DOM Fragment Builder Initialized');
  }

  init();
}

document.addEventListener('DOMContentLoaded', initFragmentBuilder);
// Before reload
window.addEventListener('beforeunload', () => {
  localStorage.setItem('scrollPos', window.scrollY);
});

// After reload
window.addEventListener('load', () => {
  const scrollPos = localStorage.getItem('scrollPos');
  if (scrollPos) window.scrollTo(0, scrollPos);
});
