document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output-area');
  const elementsArea = document.getElementById('elements-area');
  const generateButton = document.querySelector('.button1');
  const inputArea = document.getElementById('input-area');
  output.innerHTML = '';
  elementsArea.innerHTML = '';

  const sampleHTML = `<div class="container">
  <header>
    <h1 class="title main-title">Sample Heading</h1>
    <nav id="main-nav">
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section class="content">
      <p>This is a sample paragraph.</p>
      <button id="sample-button">Click Me</button>
    </section>
  </main>
</div>`;

  inputArea.value = sampleHTML;

  function initGenerateTree() {
    const input = document.getElementById('input-area').value.trim();

    if (!input) {
      output.innerHTML = '<em>Nothing to display. Paste/Type your HTML above.</em>';
      elementsArea.innerHTML = '<em>Nothing to display. Paste/Type your HTML above.</em>';
      return;
    }
    // Parse input into DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');
    console.log(doc);

    // Recursively process DOM tree
    function processNode(node, container) {
      if (node.nodeType === 3) {
        // Text node
        if (node.textContent.trim() === '') return;
        const textDiv = document.createElement('div');
        textDiv.textContent = `Text: "${node.textContent.trim()}"`;
        textDiv.style.marginLeft = '20px';
        container.appendChild(textDiv);
        console.log(textDiv);
        return;
      }

      const div = document.createElement('div');
      div.className = 'tree-node';

      const toggle = document.createElement('span');
      toggle.textContent = '[+]';
      toggle.className = 'toggle-icon';
      toggle.style.cursor = 'pointer';

      const label = document.createElement('span');
      label.innerHTML = `&lt;${formatNodeLabel(node)}&gt;`;
      console.log(label.innerHTML);

      // Element click — show details
      label.onclick = function (e) {
        e.stopPropagation();
        elementsArea.innerHTML = `
      <strong>Tag:</strong> ${node.nodeName.toLowerCase()}<br>
      <strong>Attributes:</strong> ${getAttributes(node)}<br>
      <strong>Content:</strong> ${node.innerHTML.trim() || '(empty)'}
        `;
      };

      div.appendChild(toggle);
      div.appendChild(label);
      console.log(div);

      const childContainer = document.createElement('div');
      childContainer.style.display = 'none';
      childContainer.className = 'child-container';

      div.appendChild(childContainer);
      container.appendChild(div);
      console.log(container);

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

      // process children
      Array.from(node.childNodes).forEach((child) => processNode(child, childContainer));
    }

    function formatNodeLabel(node) {
      let label = `<span class="tag-name">${node.nodeName.toLowerCase()}</span>`;

      if (node.id) {
        label += ` <span class="attr-id">#${node.id}</span>`;
      }

      if (node.className) {
        const classes = node.className
          .split(' ')
          .map((cls) => ` .${cls}`)
          .join('');
        label += ` <span class="attr-class">${classes}</span>`;
      }

      return label;
    }

    processNode(doc.body, output);
  }

  // Helper to get attribute string
  function getAttributes(node) {
    if (!node.attributes || node.attributes.length === 0) return '(none)';
    return Array.from(node.attributes)
      .map((a) => `${a.name}="${a.value}"`)
      .join(' ');
  }

  generateButton.addEventListener('click', () => {
    initGenerateTree();
  });
});
