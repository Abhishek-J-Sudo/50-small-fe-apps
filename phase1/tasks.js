document.addEventListener('DOMContentLoaded', () => {
  function initToggler() {
    const container = document.getElementById('class-toggler');
    const toggleButton = container.querySelector('button');
    const title = container.querySelector('h1');

    toggleButton.addEventListener('click', () => {
      if (title.classList.contains('active')) title.classList.remove('active');
      else title.classList.add('active');
    });
  }

  function initStyleChange() {
    const container = document.getElementById('style-change');
    const demoButton = container.querySelector('.demo-button');
    const toggleButton = container.querySelector('.button');
    //console.log(container, demoButton, toggleButton);
    let clickCounter = 0;
    toggleButton.addEventListener('click', () => {
      if (clickCounter === 0) {
        clickCounter = 1;
        demoButton.style.transition = 'all ease 1s';
        demoButton.style.backgroundColor = 'red';
        demoButton.style.height = '100px';
        demoButton.style.width = '200px';
        demoButton.style.color = 'white';
        demoButton.style.transform = 'rotate(0deg)';
      } else if (clickCounter === 1) {
        demoButton.style.transition = 'all ease 1s';
        demoButton.style.backgroundColor = 'peach';
        demoButton.style.height = '60px';
        demoButton.style.width = '140px';
        demoButton.style.color = 'white';
        demoButton.style.transform = 'rotate(45deg)';
        clickCounter = 0;
      }
    });
  }

  function initElementCreator() {
    const container = document.getElementById('element-creator');
    const gridNumber = container.querySelectorAll('img');
    const dotsContainer = container.querySelector('.dots-container');
    dotsContainer.innerHTML = '';

    gridNumber.forEach(() => {
      const dots = document.createElement('div');
      dots.classList.add('dots');
      dotsContainer.appendChild(dots);
    });
  }

  function initAttributeManager() {
    const container = document.getElementById('attribute-manager');
    const dropdownList = document.getElementById('attr');
    const inputValue = document.getElementById('inputAttr');
    const changeButton = container.querySelector('button');
    const allButtons = container.querySelectorAll('button');
    const disableButtons = [...allButtons].slice(-2);
    console.log(disableButtons);
    let input = '';

    inputValue.addEventListener('change', (e) => {
      input = e.target.value;
      console.log(input);
    });

    changeButton.addEventListener('click', () => {
      const selectedIndex = dropdownList.selectedIndex;
      const img = container.querySelector('img');

      if (selectedIndex === 0) img.setAttribute('src', input);
      else if (selectedIndex === 1) img.setAttribute('alt', input);
      else if (selectedIndex === 2) img.setAttribute('height', input);
      else if (selectedIndex === 3) img.setAttribute('width', input);

      inputValue.value = '';
    });

    disableButtons.forEach((button, index) => {
      const inputField = document.getElementById('lname');
      button.addEventListener('click', () => {
        if (index === 0) inputField.setAttribute('disabled', '');
        else inputField.removeAttribute('disabled');
      });
    });
  }

  initToggler();
  initStyleChange();
  initElementCreator();
  initAttributeManager();
});
