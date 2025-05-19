document.addEventListener('DOMContentLoaded', () => {
  const mainImage = document.getElementById('mainImage');
  const thumbnails = document.querySelectorAll('.thumbnail');
  const themeControls = document.getElementById('themeControls');
  const borderControls = document.getElementById('borderControls');
  //   console.log(themeControls);
  //   console.log(borderControls);

  // Info display elements
  const currentSrcSpan = document.getElementById('currentSrc');
  const currentThemeSpan = document.getElementById('currentTheme');
  const currentBorderSpan = document.getElementById('currentBorder');
  const imageInfoDisplayP = document.querySelector('#imageInfoDisplay p:first-child');

  // Function to update the info display
  function updateInfoDisplay() {
    currentSrcSpan.textContent = mainImage.getAttribute('src');
    currentThemeSpan.textContent = mainImage.getAttribute('data-current-theme') || 'none';
    currentBorderSpan.textContent = mainImage.getAttribute('data-border-color') || 'default';

    // Display custom info from the active thumbnail
    const activeThumbnail = document.querySelector('.thumbnail.active');
    if (activeThumbnail && activeThumbnail.hasAttribute('data-info')) {
      imageInfoDisplayP.textContent = activeThumbnail.getAttribute('data-info');
    } else if (!activeThumbnail && mainImage.hasAttribute('data-original-alt')) {
      // If no thumbnail is active but we have original alt, show it
      imageInfoDisplayP.textContent = mainImage.getAttribute('data-original-alt');
    } else {
      imageInfoDisplayP.textContent = 'Select a thumbnail or apply an effect!';
    }
  }

  // --- Thumbnail Click Functionality ---
  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', () => {
      // Get the 'data-large-src' attribute from the clicked thumbnail
      const largeSrc = thumbnail.getAttribute('data-large-src');
      // Get the 'alt' attribute from the clicked thumbnail
      const altText = thumbnail.getAttribute('alt');

      if (largeSrc) {
        // Set the 'src' attribute of the main image
        mainImage.setAttribute('src', largeSrc);
        // Set the 'alt' attribute of the main image
        mainImage.setAttribute('alt', altText);
        // Store original alt in a data attribute for later use if needed
        mainImage.setAttribute('data-original-alt', altText);
      }

      // Update active state for thumbnails
      thumbnails.forEach((t) => t.classList.remove('active'));
      thumbnail.classList.add('active');

      updateInfoDisplay();
    });
  });

  // --- Theme Control Functionality ---
  themeControls.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
      // Get the 'data-theme' attribute from the clicked button
      const theme = event.target.getAttribute('data-theme');
      if (theme) {
        // Set the 'data-current-theme' attribute on the main image
        mainImage.setAttribute('data-current-theme', theme);

        // Update button active states
        themeControls
          .querySelectorAll('button')
          .forEach((btn) => btn.removeAttribute('data-active'));
        event.target.setAttribute('data-active', 'true');
      }
      updateInfoDisplay();
    }
  });

  // --- Border Control Functionality ---
  borderControls.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
      // Get the 'data-border' attribute from the clicked button
      const borderColor = event.target.getAttribute('data-border');
      if (borderColor) {
        if (borderColor === 'default') {
          // If 'default', remove the custom border attribute to revert to CSS default
          mainImage.removeAttribute('data-border-color');
        } else {
          mainImage.setAttribute('data-border-color', borderColor);
        }

        // Update button active states
        borderControls
          .querySelectorAll('button')
          .forEach((btn) => btn.removeAttribute('data-active'));
        event.target.setAttribute('data-active', 'true');
      }
      updateInfoDisplay();
    }
  });

  // Initial info display update
  updateInfoDisplay();
});
