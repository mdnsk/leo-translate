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
  BACKGROUND_SHOW_NOTIFICATION,
  BACKGROUND_ADD_WORD_TO_DICTIONARY
} from '../messages';

import { removeHtmlTags, extractHostname, returnJsonIfOk } from '../helpers';

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
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
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
  } else if (message.id === BACKGROUND_ADD_WORD_TO_DICTIONARY) {
    browser.cookies.get({
      url: `https://api.lingualeo.com/`,
      name: 'userid'
    }).then(async cookie => {
      const { word, translation, context } = message;

      const body = JSON.stringify({
        apiVersion: '1.0.1',
        userId: cookie?.value,
        port: '1001',
        data: [{
          action: 'add',
          valueList: {
            wordValue: word,
            wordSetId: 3,
            translation: {
              tr: translation,
              ctx: context,
              pic: "https://contentcdn.lingualeo.com/uploads/1611_1361481210.jpg"
            }
          },
        }],
      });

      const headers = { 'Content-Type': 'application/json' };

      const response = await fetch(
        `https://api.lingualeo.com/SetWords`,
        { body, method: 'POST', credentials: 'include', headers }
      );

      sendResponse(response.ok && await response.json() || { error_msg: 'Couldn\'t add word to dictionary' });
    });

    return true;
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
