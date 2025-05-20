// Node Walker - Navigate Siblings
function initNodeWalker() {
  // Element references
  const container = document.querySelector('.node-container');
  const nodes = Array.from(container.querySelectorAll('.node'));
  const controls = {
    prev: document.getElementById('prevBtn'),
    next: document.getElementById('nextBtn'),
  };
  const info = {
    position: document.getElementById('position'),
    total: document.getElementById('total'),
    type: document.getElementById('nodeType'),
    prevSibling: document.getElementById('prevSibling'),
    nextSibling: document.getElementById('nextSibling'),
  };

  // State
  let currentIndex = 0;

  // Initialize
  function init() {
    // Set total node count
    info.total.textContent = nodes.length;

    // Set up event delegation
    document.querySelector('.controls').addEventListener('click', handleNavigation);

    // Set initial active node
    activateNode(0);
  }

  // Event handler
  function handleNavigation(event) {
    if (event.target.tagName !== 'BUTTON') return;

    // Determine direction
    const direction = event.target.id === 'nextBtn' ? 1 : -1;

    // Calculate new index with circular navigation
    // (adding nodes.length ensures we don't get a negative result)
    const newIndex = (currentIndex + direction + nodes.length) % nodes.length;
    // Activate the new node
    activateNode(newIndex);
  }

  // Node activation
  function activateNode(index) {
    // Update state
    currentIndex = index;

    // Clear previous active state
    nodes.forEach((node) => node.classList.remove('active'));

    // Set new active state
    const currentNode = nodes[currentIndex];
    currentNode.classList.add('active');

    // Update information panel
    updateInfoPanel(currentNode, currentIndex);
  }

  // Update information display
  function updateInfoPanel(node, index) {
    // Get node info
    const nodeInfo = {
      position: index + 1,
      type: node.getAttribute('data-type'),
      prevNode: index > 0 ? nodes[index - 1] : null,
      nextNode: index < nodes.length - 1 ? nodes[index + 1] : null,
    };

    // Update display
    info.position.textContent = nodeInfo.position;
    info.type.textContent = nodeInfo.type;

    // Handle edge cases with descriptive messages
    info.prevSibling.textContent = nodeInfo.prevNode
      ? nodeInfo.prevNode.textContent
      : 'You are at the first node';

    info.nextSibling.textContent = nodeInfo.nextNode
      ? nodeInfo.nextNode.textContent
      : 'You are at the last node';
  }

  // Initialize the application
  init();
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initNodeWalker);
