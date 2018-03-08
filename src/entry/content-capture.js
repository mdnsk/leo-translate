import optionsStorage from '../options';
import ContextExtractor from '../ContextExtractor';
import {
  PROXY_CONTENT_MOUSE,
  PROXY_CONTENT_OPEN_POPUP,
  PROXY_CONTENT_CLOSE_POPUP,
  PROXY_CONTENT_REFRESH_POPUP
} from '../messages'

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
  if (! options.doubleClick) {
    return;
  }

  // If there's a key constraint.
  if (options.doubleClickCtrl || options.doubleClickAlt || options.doubleClickMeta) {

    // If there are no conditions that have passed a check.
    if (! (isAltClick(e) || isCtrlClick(e) || isCmdClick(e))) {
      return;
    }
  }

  captureSelection();
});

chrome.runtime.onMessage.addListener(message => {
  if (message.id === PROXY_CONTENT_REFRESH_POPUP && message.frameIndex === getSelfFrameIndex()) {
    captureSelection();
  }
});

function captureSelection () {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  // Do nothing if there are no english letters.
  if (! containsAnyEnglishLetter(text)) {
    return;
  }

  openPopup(text, selection);
}

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

    if (options.contextCapturing) {
      message.context = new ContextExtractor(selection).getContext().getSentence();
    }

    sendMessage(message);
  }
}

function isAltClick (e) {
  return options.doubleClickAlt && e.altKey;
}

function isCtrlClick (e) {
  return options.doubleClickCtrl && e.ctrlKey;
}

function isCmdClick (e) {
  return options.doubleClickMeta && e.metaKey;
}

function containsAnyEnglishLetter (text) {
  return /.*[a-zA-Z].*/.test(text);
}

function sendMessage (message) {
  message['frameIndex'] = getSelfFrameIndex();

  chrome.runtime.sendMessage(message);
}

function getSelfFrameIndex () {
  let index = -1;

  for (let i = 0; i < window.top.frames.length; i++) {
    if (window.top.frames[i] === self) {
      index = i;
    }
  }

  return index;
}
