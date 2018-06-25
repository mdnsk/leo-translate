import optionsStorage from '../options';
import ContextExtractor from '../ContextExtractor';
import { getWordFromCaretPosition } from '../rangeHelpers';
import {
  PROXY_CONTENT_MOUSE,
  PROXY_CONTENT_OPEN_POPUP,
  PROXY_CONTENT_CLOSE_POPUP,
  PROXY_CONTENT_REFRESH_POPUP,
  PROXY_ALL_CONTENT_REFRESH_OPTIONS
} from '../messages'

let options = {};

// Fetch options from local storage
optionsStorage.getAllOptions().then(onGetAllOptionsListener);

document.body.addEventListener('mousedown', onMousedownListener);
document.body.addEventListener('dblclick', onDblclickListener);

chrome.runtime.onMessage.addListener(onRuntimeMessageEventListener);


// Event Listeners

function onGetAllOptionsListener (data) {
  options = data;

  // Is this host excluded from global hover translation settings?
  let hostExcluded = Array.isArray(options.hoverExclude) && options.hoverExclude.indexOf(window.location.host) !== -1;

  // Add Translate on MouseOver handler
  if (options.hoverTranslation && !hostExcluded || !options.hoverTranslation && hostExcluded) {
    document.body.addEventListener('mousemove', onHoverTranslationListener);
  } else {
    document.body.removeEventListener('mousemove', onHoverTranslationListener);
  }
}

function onMousedownListener (e) {
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
}

function onDblclickListener (e) {
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
}

function onRuntimeMessageEventListener (message) {
  if (message.id === PROXY_CONTENT_REFRESH_POPUP && message.frameIndex === getSelfFrameIndex()) {
    captureSelection();
  } else if (message.id === PROXY_ALL_CONTENT_REFRESH_OPTIONS) {
    // Reload options
    optionsStorage.getAllOptions().then(onGetAllOptionsListener);
  }
}

let onHoverTranslationTimer;

function onHoverTranslationListener (e) {
  clearTimeout(onHoverTranslationTimer);

  onHoverTranslationTimer = setTimeout(function () {
    const range = getWordFromCaretPosition(document.caretPositionFromPoint(e.x, e.y), e.x, e.y);
    const text = range !== null ? range.toString() : null;

    if (text !== null && text.length > 0) {
      openPopup(text, range);
    }
  }, options.hoverTimeout);
}


// Helpers

function captureSelection () {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  // Do nothing if there are no english letters.
  if (! containsAnyEnglishLetter(text)) {
    return;
  }

  if (selection.rangeCount > 0) {
    openPopup(text, selection.getRangeAt(0));
  }
}

function closePopup () {
  sendMessage({ id: PROXY_CONTENT_CLOSE_POPUP });
}

function openPopup (text, range) {
  const rect = range.getBoundingClientRect();

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
    message.context = new ContextExtractor(range).getContext().getSentence();
  }

  sendMessage(message);
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
