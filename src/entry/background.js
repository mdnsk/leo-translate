import {
  CONTENT_OPEN_POPUP,
  PROXY_CONTENT_MOUSE,
  PROXY_CONTENT_GET_DATA,
  PROXY_CONTENT_OPEN_POPUP,
  PROXY_CONTENT_CLOSE_POPUP,
  PROXY_CONTENT_RESIZE_POPUP,
  BACKGROUND_SHOW_NOTIFICATION,
} from '../messages';
import { removeHtmlTags } from '../helpers';

// Create context item
if (chrome.contextMenus !== undefined) {
  chrome.contextMenus.create({
    id: 'leo-translate',
    title: 'Translate with Leo',
    contexts: ['selection'],
    onclick: (info, tab) => {
      chrome.tabs.sendMessage(tab.id, {
        id: CONTENT_OPEN_POPUP,
        text: info.selectionText,
        context: ''
      });
    },
    icons: {
      '16': '../icons/icon.svg'
    }
  });
}

// Listen for message to show in system notification
chrome.runtime.onMessage.addListener((message, sender) => {
  const proxyMessages = [
    PROXY_CONTENT_MOUSE,
    PROXY_CONTENT_GET_DATA,
    PROXY_CONTENT_OPEN_POPUP,
    PROXY_CONTENT_CLOSE_POPUP,
    PROXY_CONTENT_RESIZE_POPUP
  ];

  if (message.id === BACKGROUND_SHOW_NOTIFICATION) {
    chrome.notifications.create({
      type: 'basic',
      title: 'Leo Translate',
      iconUrl: 'icons/icon.svg',
      message: removeHtmlTags(message.text)
    });
  } else if (proxyMessages.indexOf(message.id) > -1) {
    chrome.tabs.sendMessage(sender.tab.id, message);
  }
});
