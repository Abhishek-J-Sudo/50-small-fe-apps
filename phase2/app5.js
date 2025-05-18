const messages = [
  {
    title: 'Task Complete',
    message: "I just did in 5 seconds what would take you all day. You're welcome.",
    icon: '🚀',
  },
  {
    title: 'Update Available',
    message:
      'Your system is out of date. Like, seriously outdated. Even my grandma has a newer version.',
    icon: '🔄',
  },
  {
    title: 'Error Detected',
    message: "Found an error in your code. Don't worry, happens to beginners all the time.",
    icon: '❌',
  },
  {
    title: 'File Saved',
    message: "I've saved your file. Next time try not to wait until the last minute.",
    icon: '💾',
  },
  {
    title: 'Connection Lost',
    message:
      'WiFi dropped. Have you tried turning it off and on again? Classic solution for classics like you.',
    icon: '📶',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.main-notification-container');
  const generateButton = document.querySelector('#notification-toast .button');
  let notificationCount = 0;

  generateButton.addEventListener('click', () => {
    // Select a random message each time button is clicked
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    generateNotification(randomMessage);
  });

  function generateNotification(message) {
    // Create a unique ID for this notification
    const notificationId = `notification-${Date.now()}`;

    // Create notification element
    const div = document.createElement('div');
    div.className = 'notification-container';
    div.id = notificationId;
    div.innerHTML = `<h3>${message.icon} ${message.title}</h3><p>${message.message}</p>`;

    // Calculate position based on existing notifications
    const offset = notificationCount * 120; // 80px for each notification (adjust as needed)
    div.style.top = `${offset}px`;

    // Add to container
    container.appendChild(div);
    notificationCount++;

    // Apply animations
    setTimeout(() => {
      const newNotification = document.getElementById(notificationId);
      newNotification.style.transform = 'translateX(0%)';
      newNotification.classList.add('show-line');
    }, 10);

    // Remove after delay
    setTimeout(() => {
      const toRemove = document.getElementById(notificationId);
      toRemove.style.opacity = '0';

      // Additional cleanup after fade out
      setTimeout(() => {
        if (toRemove && toRemove.parentNode) {
          toRemove.parentNode.removeChild(toRemove);
          notificationCount--;

          // Reposition remaining notifications
          const remainingNotifications = document.querySelectorAll('.notification-container');
          remainingNotifications.forEach((notification, index) => {
            notification.style.top = `${index * 120}px`;
          });
        }
      }, 1000); // Wait for fade out transition to complete
    }, 10000);
  }
});
