import optionsStorage from '../options';
import ContextExtractor from '../ContextExtractor';
import { PROXY_CONTENT_MOUSE, PROXY_CONTENT_OPEN_POPUP, PROXY_CONTENT_CLOSE_POPUP } from '../messages'

let options = {};

// Fetch options from local storage
optionsStorage.getAllOptions().then(data => options = data);

document.body.addEventListener('mousedown', e => {
  // If left button clicked, close popup
  if (e.button === 0) {
    closePopup();
  }

  // If right button clicked, remember coordinates
  else if (e.button === 2) {
    sendMessage({
      id: PROXY_CONTENT_MOUSE,
      x: e.clientX,
      y: e.clientY
    });
  }
});

document.body.addEventListener('dblclick', e => {
  // Do nothing if dblclick handling is disabled.
  if (! options['double-click']) {
    return;
  }

  // If there's a key constraint.
  if (options['double-click-ctrl'] || options['double-click-alt'] || options['double-click-alt']) {

    // If there are no conditions that have passed a check.
    if (! (isAltClick(e) || isCtrlClick(e) || isCmdClick(e))) {
      return;
    }
  }

  const selection = window.getSelection();
  const text = selection.toString().trim();

  // Do nothing if there are no english letters.
  if (! containsAnyEnglishLetter(text)) {
    return;
  }

  openPopup(text, selection);
});

function closePopup () {
  sendMessage({ id: PROXY_CONTENT_CLOSE_POPUP });
}

function openPopup (text, selection) {
  if (selection.rangeCount > 0) {
    const rect = selection.getRangeAt(0).getBoundingClientRect();

    const message = {
      id: PROXY_CONTENT_OPEN_POPUP,
      text,
      context: '',
      rect: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left
      }
    };

    if (options['context-capturing']) {
      message.context = new ContextExtractor(selection).getContext().getSentence();
    }

    sendMessage(message);
  }
}

function isAltClick (e) {
  return options['double-click-alt'] && e.altKey;
}

function isCtrlClick (e) {
  return options['double-click-ctrl'] && e.ctrlKey;
}

function isCmdClick (e) {
  return options['double-click-meta'] && e.metaKey;
}

function containsAnyEnglishLetter (text) {
  return /.*[a-zA-Z].*/.test(text);
}

function sendMessage (message) {
  message['frameIndex'] = -1;

  for (let i = 0; i < window.top.frames.length; i++) {
    if (window.top.frames[i] === self) {
      message['frameIndex'] = i;
    }
  }

  chrome.runtime.sendMessage(message);
}
