// Store last context message here because it can be requested later
let lastContextMessage = {
  id: 'context-menu-clicked',
  text: '',
  url: '',
  title: ''
};

// Create context item
chrome.contextMenus.create({
  id: 'leo-translate',
  title: 'Translate with Leo',
  contexts: ['selection'],
  onclick: (info, tab) => {
    lastContextMessage.text = info.selectionText;
    lastContextMessage.title = tab.title;
    lastContextMessage.url = tab.url;

    chrome.tabs.sendMessage(tab.id, lastContextMessage);
  }
});

// Listen for request for lastContentMessage
// It is requested when ContextPopup's create event fires.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.id === 'vue-context-popup-created') {
    sendResponse(lastContextMessage);
  }
});

// Listen for close translate message
chrome.runtime.onMessage.addListener(message => {
  if (message.id === 'vue-translate-close') {
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
      for (let tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { id: 'translate-close' });
      }
    });
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
