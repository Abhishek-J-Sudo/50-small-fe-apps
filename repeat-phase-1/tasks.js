document.addEventListener('DOMContentLoaded', () => {
  // App 1
  function initToggleClass() {
    //fetch elements
    const elements = document.querySelector('#app1');
    const button = elements.querySelector('button');
    //add listener to the button
    button.addEventListener('click', () => {
      const para = elements.querySelector('p');
      const randomBGColor =
        '#' +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, '0'); // set random color
      document.documentElement.style.setProperty('--randomColor', randomBGColor);
      para.classList.toggle('bgcolor'); //finally toggle color
    });
  }

  function initStyleManipulator() {
    const elements = document.querySelector('#app2');
    const button = elements.querySelector('button');
    const shape = document.querySelector('.box');

    const styles = {
      box: {
        width: '200px',
        height: '200px',
        backgroundColor: '#3498db',
        borderRadius: '0%',
        border: 'none',
      },
      rectangle: {
        width: '300px',
        height: '200px',
        backgroundColor: '#2ecc71',
        borderRadius: '0%',
        border: 'none',
      },
      circle: {
        width: '200px',
        height: '200px',
        backgroundColor: '#e74c3c',
        borderRadius: '50%',
        border: 'none',
      },
      triangle: {
        width: '200px',
        height: '200px',
        borderLeft: '100px solid transparent',
        borderRight: '100px solid transparent',
        borderBottom: '150px solid #9b59b6',
        backgroundColor: 'white',
        borderRadius: '0%',
      },
      ellipse: {
        width: '250px',
        height: '150px',
        backgroundColor: '#f39c12',
        borderRadius: '50% / 50%',
        border: 'none',
      },
    };

    let keys = Object.keys(styles);
    let index = 0;

    button.addEventListener('click', () => {
      shape.style.transition = 'all ease 1s';
      let currentStyle = styles[keys[index]];

      Object.entries(currentStyle).forEach(([property, value]) => {
        shape.style[property] = value;
      });
      // Move to next style (loop back to 0)
      index = (index + 1) % keys.length;
    });
  }

  function initElementCreator() {
    const outputArea = document.querySelector('.output-area');
    const dropdownSelect = document.querySelector('.elements');
    const createButton = document.querySelector('#app3 button');
    const clearButton = document.querySelector('#app3 button:last-of-type');
    const list = {
      p: '<p>This is a paragrah</p>',
      h1: '<h1>Headline</h1>',
      button: '<button>Button</button>',
      span: '<span>This is a text in span</span>',
    };
    let inputValue = 'h1';

    dropdownSelect.addEventListener('change', (e) => {
      inputValue = e.target.value;
    });

    createButton.addEventListener('click', () => {
      if (list.hasOwnProperty(inputValue)) {
        outputArea.innerHTML += list[inputValue];
      }
    });

    clearButton.addEventListener('click', () => {
      outputArea.innerHTML = '';
    });
  }

  initToggleClass();
  initStyleManipulator();
  initElementCreator();
});
