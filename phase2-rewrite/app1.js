document.addEventListener('DOMContentLoaded', () => {
  const lights = document.querySelectorAll('.lights');
  const startButton = document.querySelector('#traffic-lights button');
  const [green, yellow, red] = lights;

  const states = {
    OFF: 'off',
    GREEN: 'green',
    YELLOW: 'yellow',
    RED: 'red',
  };

  const { OFF, GREEN, YELLOW, RED } = states;

  const styles = {
    [GREEN]: 'background-color: #00ff00; box-shadow: 0 0 15px 2px rgba(0, 255, 0, 1);',
    [YELLOW]: 'background-color: yellow; box-shadow: 0 0 15px 2px rgb(255, 255, 0)',
    [RED]: 'background-color: red; box-shadow: 0 0 15px 2px rgb(255, 0, 0)',
  };

  const nextStateMap = {
    [GREEN]: YELLOW,
    [YELLOW]: RED,
    [RED]: GREEN,
    [OFF]: GREEN,
  };

  const durations = {
    [RED]: 6000,
    [YELLOW]: 2000,
    [GREEN]: 3000,
    [OFF]: 0,
  };

  let currentState = states.OFF;
  let timerID = null;
  let isRunning = false;
  updateLightsUI();

  function updateLightsUI() {
    green.style.cssText = styles[GREEN];
    yellow.style.cssText = styles[YELLOW];
    red.style.cssText = styles[RED];

    green.style.opacity = 0.2;
    yellow.style.opacity = 0.2;
    red.style.opacity = 0.2;
    //console.log(currentState);
    // Activate the current light
    switch (currentState) {
      case states.GREEN:
        green.style.opacity = 1;
        break;
      case states.YELLOW:
        yellow.style.opacity = 1;
        break;
      case states.RED:
        red.style.opacity = 1;
        break;
      // For OFF state, all lights remain dimmed
    }
  }

  startButton.addEventListener('click', () => {
    if (isRunning) {
      stopLights();
      startButton.textContent = 'Start';
    } else {
      startLights();
      startButton.textContent = 'Stop';
    }
  });

  function stopLights() {
    isRunning = false;
    clearTimeout(timerID);
    currentState = states.OFF;
    updateLightsUI();
  }

  function startLights() {
    isRunning = true;
    if (currentState === states.OFF) moveToNextStage();
    else scheduleNext();
  }

  function moveToNextStage() {
    currentState = nextStateMap[currentState];
    updateLightsUI();
    if (isRunning) scheduleNext();
  }

  function scheduleNext() {
    if (timerID) clearTimeout(timerID);
    const duration = durations[currentState];
    timerID = setTimeout(moveToNextStage, duration);
  }
});
