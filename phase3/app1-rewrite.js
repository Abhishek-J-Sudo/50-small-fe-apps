document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input-area');
  const generateButton = document.querySelector('.button1');
  const output = document.getElementById('output-area');
  const elementsArea = document.getElementById('elements-area');

  const sampleHTML = `<div class="container">
  <main>
    <section class="content">
      <p>This is a sample paragraph.</p>
      <button id="sample-button">Click Me</button>
    </section>
  </main>
</div>`;

  input.value = sampleHTML;
  output.innerHTML = '';
  elementsArea.innerHTML = '';

  function initGenerateTree() {
    const inputValue = document.getElementById('input-area').value.trim();
    if (!inputValue) {
      output.innerHTML = '<em>Please paste/type HTML code in the Input Area.</em>';
      elementsArea.innerHTML = '<em>Please paste/type HTML code in the Input Area.</em>';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(inputValue, 'text/html');

    function processDOMNodes(node, container) {
      if (node.nodeType === 3) {
        // Text node
        if (node.textContent.trim() === '') return;
        const textDiv = document.createElement('div');
        textDiv.textContent = `Text: "${node.textContent.trim()}"`;
        textDiv.style.marginLeft = '20px';
        container.appendChild(textDiv);
        return;
      }

      const div = document.createElement('div');
      div.className = 'tree-node';

      const childContainer = document.createElement('div');
      childContainer.style.display = 'none';
      childContainer.className = 'child-container';

      const toggle = document.createElement('span');
      toggle.textContent = '[+]';
      toggle.className = 'icon';
      toggle.style.cursor = 'pointer';

      const displayDivs = document.createElement('span');
      displayDivs.innerHTML = `&lt;${formatNode(node)}&gt;`;

      div.appendChild(toggle);
      div.appendChild(displayDivs);
      div.appendChild(childContainer);
      console.log(div);
      container.appendChild(div);

      toggle.onclick = function (e) {
        e.stopPropagation();
        if (childContainer.style.display === 'none') {
          toggle.textContent = '[-]';
          childContainer.style.display = 'block';
        } else {
          toggle.textContent = '[+]';
          childContainer.style.display = 'none';
        }
      };

      displayDivs.onclick = function (e) {
        e.stopPropagation();
        elementsArea.innerHTML = `
      <strong>Tag:</strong> ${node.nodeName.toLowerCase()}<br>
      <strong>Attributes:</strong> ${getAttributes(node)}<br>
      <strong>Content:</strong> ${node.innerHTML.trim() || '(empty)'}
        `;
      };
      // process children
      Array.from(node.childNodes).forEach((child) => processDOMNodes(child, childContainer));
    }

    function formatNode(node) {
      let tagName = `<span class="tag-name">${node.nodeName.toLowerCase()}</span>`;
      if (node.id) {
        tagName += ` <span class="attr-id">#${node.id}</span>`;
      }
      if (node.className) {
        const classes = node.className
          .split(' ')
          .map((cls) => ` .${cls}`)
          .join('');
        tagName += ` <span class="attr-class">${classes}</span>`;
      }
      return tagName;
    }

    function getAttributes(node) {
      if (!node.attributes || node.attributes.length === 0) return '(none)';
      return Array.from(node.attributes)
        .map((a) => `${a.name}="${a.value}"`)
        .join(' ');
    }

    Array.from(doc.body.childNodes).forEach((node) => {
      processDOMNodes(node, output);
    });
  }

  generateButton.addEventListener('click', () => {
    initGenerateTree();
  });
});
