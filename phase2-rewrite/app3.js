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
  const container = document.querySelector('.notification-container');
  const startToast = document.querySelector('#notification-toast button');

  let notificationCount = 0;

  startToast.addEventListener('click', () => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    generateNotification(randomMessage);
  });

  function generateNotification(message) {
    const notificationID = `notification-${Date.now()}`;

    const div = document.createElement('div');
    div.classList.add('notification');
    div.id = notificationID;
    div.innerHTML = `<icon>${message.icon}</icon> <span>${message.title} </span> <p>${message.message}</p>`;

    const offset = notificationCount * 120;
    div.style.top = offset;
    container.appendChild(div);
    notificationCount++;

    setTimeout(() => {
      const newNotification = document.getElementById(notificationID);
      newNotification.style.transform = 'translateX(0%)';
      newNotification.classList.add('show-line');
    }, 10);

    setTimeout(() => {
      const toRemove = document.getElementById(notificationID);
      toRemove.style.opacity = '0';
      setTimeout(() => {
        if (toRemove && toRemove.parentNode) toRemove.parentNode.removeChild(toRemove);
        notificationCount--;

        const remainingNotifications = document.querySelectorAll('.notification');
        remainingNotifications.forEach((notification, index) => {
          notification.style.top = `${index * 120}px`;
        });
      }, 1000);
    }, 10000);
  }
});
