document.addEventListener('DOMContentLoaded', () => {
  function mouseTracker() {
    const hoverBox = document.querySelector('.box');
    const dot = document.querySelector('.tracker-dot');
    const boxes = document.querySelector('.visual-box');
    const boxArray = boxes.querySelectorAll('div');
    const toolTip = document.querySelector('.tooltip');

    let x, y;
    const quadrants = [
      { x: [0, 200], y: [0, 200], color: 'red', index: 0 },
      { x: [200, 400], y: [0, 200], color: 'green', index: 1 },
      { x: [0, 200], y: [200, 400], color: 'blue', index: 2 },
      { x: [200, 400], y: [200, 400], color: 'yellow', index: 3 },
    ];

    hoverBox.addEventListener('mousemove', (e) => {
      const rect = hoverBox.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      //console.log(`Inside box: X=${x}, Y=${y}`);
      dot.style.transition = '';
      dot.style.left = x + 'px';
      dot.style.top = y + 'px';
      toolTip.textContent = `X: ${x}, Y: ${y}`;
      const activeQuadrant = quadrants.find(
        (q) => x >= q.x[0] && x < q.x[1] && y >= q.y[0] && y < q.y[1]
      );

      if (activeQuadrant) {
        clearStyles();
        console.log(activeQuadrant);
        boxArray[activeQuadrant.index].style.backgroundColor = activeQuadrant.color;
      }

      /* if (x < 200 && y < 200) {
        clearStyles();
        boxArray[0].style.backgroundColor = 'red';
      } else if (x < 200 && y > 200) {
        clearStyles();
        boxArray[2].style.backgroundColor = 'blue';
      } else if (x > 200 && y < 200) {
        clearStyles();
        boxArray[1].style.backgroundColor = 'green';
      } else if (x > 200 && y > 200) {
        clearStyles();
        boxArray[3].style.backgroundColor = 'yellow';
      } */
    });

    hoverBox.addEventListener('mouseleave', (e) => {
      clearStyles();
      (x = 0), (y = 0);
      dot.style.transition = 'ease 1s';
      dot.style.left = 0 + 'px';
      dot.style.top = 0 + 'px';
      toolTip.textContent = `X: ${x}, Y: ${y}`;
    });

    function clearStyles() {
      boxArray.forEach((box) => {
        box.style.backgroundColor = '';
      });
    }
  }

  mouseTracker();
});
