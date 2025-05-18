document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const lightBox = document.querySelector('.lights');
  const [greenLight, redLight, yellowLight] = lightBox.querySelectorAll('div');
  const startButton = document.querySelector('#traffic-light .button');

  // Define our states
  const states = {
    OFF: 'off',
    RED: 'red',
    YELLOW: 'yellow',
    GREEN: 'green',
  };

  // Define durations for each state (in milliseconds)
  const durations = {
    [states.RED]: 6000,
    [states.YELLOW]: 2000,
    [states.GREEN]: 3000,
    [states.OFF]: 0,
  };

  // Track the current state and timer
  let currentState = states.OFF;
  let timerID = null;
  let isRunning = false;

  // State transition mapping (what comes next after each state)
  const nextStateMap = {
    [states.GREEN]: states.YELLOW,
    [states.YELLOW]: states.RED,
    [states.RED]: states.GREEN,
    [states.OFF]: states.GREEN,
  };

  // Initialize the traffic light (all dimmed)
  updateLightsUI();

  // Add click event listener to the button
  startButton.addEventListener('click', () => {
    if (isRunning) {
      stopSequence();
      startButton.textContent = 'Start';
    } else {
      startSequence();
      startButton.textContent = 'Stop';
    }
  });

  // Function to start the traffic light sequence
  function startSequence() {
    isRunning = true;

    // If we're starting from OFF state, transition to GREEN
    if (currentState === states.OFF) {
      transitionToNextState();
    } else {
      // Continue from current state
      scheduleNextTransition();
    }
  }

  // Function to stop the sequence
  function stopSequence() {
    isRunning = false;
    clearTimeout(timerID);
    currentState = states.OFF;
    updateLightsUI();
  }

  // Function to transition to the next state
  function transitionToNextState() {
    // Determine the next state based on the current state
    currentState = nextStateMap[currentState];

    // Update the UI to reflect the new state
    updateLightsUI();

    // Schedule the next transition if we're still running
    if (isRunning) {
      scheduleNextTransition();
    }
  }

  // Function to schedule the next state transition
  function scheduleNextTransition() {
    // Clear any existing timer
    if (timerID) {
      clearTimeout(timerID);
    }

    // Schedule the next transition based on the duration of the current state
    const duration = durations[currentState];
    timerID = setTimeout(transitionToNextState, duration);
  }

  // Function to update the UI based on the current state
  function updateLightsUI() {
    // Set all lights to dimmed
    greenLight.style.opacity = 0.2;
    yellowLight.style.opacity = 0.2;
    redLight.style.opacity = 0.2;

    // Activate the current light
    switch (currentState) {
      case states.GREEN:
        greenLight.style.opacity = 1;
        break;
      case states.YELLOW:
        yellowLight.style.opacity = 1;
        break;
      case states.RED:
        redLight.style.opacity = 1;
        break;
      // For OFF state, all lights remain dimmed
    }
  }
});
