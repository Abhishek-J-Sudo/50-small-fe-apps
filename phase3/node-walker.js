document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.controls button');
  const [previous, next] = buttons;
  const nodeInfo = document.getElementById('nodeInfo');
  const position = nodeInfo.querySelector('#position');
  const nodeType = nodeInfo.querySelector('#nodeType');
  const preSibling = nodeInfo.querySelector('#prevSibling');
  const nextSibling = nodeInfo.querySelector('#nextSibling');
  const nodes = document.querySelectorAll('.node');

  let index = 0;
  let currentNode = nodes[0];
  currentNode.classList.add('active');

  let count = nodes.length;
  console.log(currentNode);

  buttons.forEach((f) => {
    f.addEventListener('click', () => {
      traverseNodes(f.id);
    });
  });

  updateInfo();

  function traverseNodes(buttonPressed) {
    if (buttonPressed === 'nextBtn') {
      if (!currentNode.nextElementSibling) {
        index = 0;
        currentNode = nodes[index];
        markActive(currentNode);
        updateInfo();
      } else {
        currentNode = currentNode.nextElementSibling;
        markActive(currentNode);
        index++;
        updateInfo();
      }
    } else {
      if (!currentNode.previousElementSibling) {
        currentNode = nodes[count - 1];
        index = nodes.length - 1;
        markActive(currentNode);
        updateInfo();
      } else {
        currentNode = currentNode.previousElementSibling;
        markActive(currentNode);
        index--;
        updateInfo();
      }
    }
    // if (buttonPressed === 'prevBtn') {
    //   if (currentNode === nodes[0]) {
    //     currentNode = nodes[count - 1];
    //     index = count - 1;
    //     console.log(currentNode, index);
    //   } else {
    //     index--;
    //     currentNode = nodes[index];
    //     console.log(currentNode, index);
    //   }
    // }
  }
  function markActive(node) {
    nodes.forEach((n) => n.classList.remove('active'));
    node.classList.add('active');
  }

  function updateInfo() {
    position.textContent = index + 1;
    nodeType.textContent = currentNode.getAttribute('data-type');
    if (index === 0) preSibling.textContent = `You are at first node`;
    else preSibling.textContent = nodes[index - 1].textContent;
    if (index === nodes.length - 1) nextSibling.textContent = `You are the last node`;
    else if (index + 1 < nodes.length) nextSibling.textContent = nodes[index + 1].textContent;
  }
});
