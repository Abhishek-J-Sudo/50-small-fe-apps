document.addEventListener('DOMContentLoaded', () => {
  const progressText = document.querySelector('.pie-text');
  const range = document.querySelector('[type="range"]');

  function updateProgress(percent) {
    // Update the CSS variable for the SVG
    document.documentElement.style.setProperty('--percent', percent);
    // Update the text in the SVG
    progressText.textContent = percent + '%';
  }

  // Event listener for the range input
  range.addEventListener('input', () => {
    const newPercent = parseInt(range.value);
    updateProgress(newPercent);
  });

  // Initialize with the starting value
  updateProgress(parseInt(range.value));
});
