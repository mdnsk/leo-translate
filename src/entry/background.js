import {
  CONTENT_OPEN_POPUP,
  PROXY_CONTENT_MOUSE,
  PROXY_CONTENT_GET_DATA,
  PROXY_CONTENT_OPEN_POPUP,
  PROXY_CONTENT_CLOSE_POPUP,
  PROXY_CONTENT_RESIZE_POPUP,
  PROXY_CONTENT_REFRESH_POPUP,
  PROXY_ALL_CONTENT_REFRESH_OPTIONS,
  BROWSER_ACTION_CURRENT_HOST,
  BACKGROUND_GET_CURRENT_HOST,
  BACKGROUND_SHOW_NOTIFICATION
} from '../messages';
import { removeHtmlTags, extractHostname } from '../helpers';

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
    }
  });
}

// Listen for message to show in system notification
chrome.runtime.onMessage.addListener(function (message, sender) {
  // Messages that should be sent to the current tab.
  const proxyMessages = [
    PROXY_CONTENT_MOUSE,
    PROXY_CONTENT_GET_DATA,
    PROXY_CONTENT_OPEN_POPUP,
    PROXY_CONTENT_CLOSE_POPUP,
    PROXY_CONTENT_RESIZE_POPUP,
    PROXY_CONTENT_REFRESH_POPUP
  ];

  // Messages that should be sent to all tabs.
  const proxyMessagesAll = [ PROXY_ALL_CONTENT_REFRESH_OPTIONS ];

  if (message.id === BACKGROUND_SHOW_NOTIFICATION) {
    chrome.notifications.create({
      type: 'basic',
      title: 'Leo Translate',
      iconUrl: 'icons/icon.svg',
      message: removeHtmlTags(message.text)
    });
  } else if (message.id === BACKGROUND_GET_CURRENT_HOST) {
    browser.tabs.query({ currentWindow: true, active: true }).then(function (tabs) {
      if (tabs[0] !== undefined) {
        chrome.runtime.sendMessage({
          id: BROWSER_ACTION_CURRENT_HOST,
          host: extractHostname(tabs[0].url)
        });
      }
    });
  } else if (proxyMessages.indexOf(message.id) > -1) {
    if (sender.tab) {
      chrome.tabs.sendMessage(sender.tab.id, message);
    }

    // We have not sender.tab property if message was sent from browser action
    // So we need to find the current tab.
    else {
      browser.tabs.query({currentWindow: true, active: true}).then(function (tabs) {
        if (tabs[0] !== undefined) {
          chrome.tabs.sendMessage(tabs[0].id, message);
        }
      });
    }
  } else if (proxyMessagesAll.indexOf(message.id) > -1) {
    browser.tabs.query({}).then(function (tabs) {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, message);
      }
    })
  }
});
