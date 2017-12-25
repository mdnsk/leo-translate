// Create context item
chrome.contextMenus.create({
  id: 'leo-translate',
  title: 'Translate with Leo',
  contexts: ['selection'],
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(tab.id, { id: 'context-menu-clicked' });
  },
  icons: {
    '16': '../icons/icon.svg'
  }
});

// Listen for message to show in system notification
chrome.runtime.onMessage.addListener(message => {
  if (message.id === 'show-notification' || message.id === 'vue-show-notification') {
    chrome.notifications.create({
      type: 'basic',
      title: 'Leo Translate',
      message: message.text,
      iconUrl: 'icons/icon.svg'
    });
  }
});
