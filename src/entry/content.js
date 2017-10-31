import optionsStorage from '../options';
import ContextExtractor from '../ContextExtractor';

const IFRAME_WIDTH = 250;
const IFRAME_ID = 'leoTranslateIFrame';

let mouseX = 0;
let mouseY = 0;
let options = {};

// Fetch options from local storage
optionsStorage.getAllOptions().then(data => options = data);

document.body.addEventListener('mousedown', e => {
  if (e.button === 0) {
    hideIFrame();
  }

  if (e.button === 2 || e.button === 0) {
    mouseX = e.pageX + IFRAME_WIDTH > window.document.body.clientWidth ? window.document.body.clientWidth - IFRAME_WIDTH : e.pageX;
    mouseY = e.pageY;
  }
});

document.body.addEventListener('dblclick', e => {
  if (options['double-click']) {
    // If there's a key constraint.
    if (options['double-click-ctrl'] || options['double-click-alt']) {

      // If there's no a condition that has passed a check.
      if (! (isAltClick() || isCtrlClick())) {
        return;
      }
    }

    callTranslatePopup();

    function isAltClick () {
      return options['double-click-alt'] && e.altKey;
    }

    function isCtrlClick () {
      return options['double-click-ctrl'] && e.ctrlKey;
    }
  }
});

// Listen for messages from the iFrame
window.addEventListener('message', e => {
  if (chrome.extension.getURL('') === e.origin+'/') {
    const iFrame = getIFrame();

    if (e.data.id === 'vue-popup-resized') {
      iFrame.width  = iFrame.contentWindow.document.body.scrollWidth;
      iFrame.height = iFrame.contentWindow.document.body.scrollHeight;
    } else if (e.data.id === 'vue-popup-get-data') {
      sendDataToIFrame(iFrame);
    } else if (e.data.id === 'vue-translate-close') {
      hideIFrame();
    }
  }
});

chrome.runtime.onMessage.addListener(message => {
  if (message.id === 'context-menu-clicked') {
    callTranslatePopup();
  }
});

function callTranslatePopup () {
  const maxLength = ContextExtractor.LIMIT * 2;

  if (getSelection().toString().length > maxLength) {
    chrome.runtime.sendMessage({
      id: 'show-notification',
      text: 'The selection is too long! It must be less than '+maxLength+' characters.'
    });
  } else {
    const iFrame = getIFrame();

    showIFrame(iFrame);
    sendDataToIFrame(iFrame);
  }
}

function getIFrame () {
  let container = document.getElementById(IFRAME_ID);

  if (container === null) {
    container = document.createElement('iframe');

    const defaultStyles = {
      position: 'absolute',
      display: 'none',
      border: 'none',
      zIndex: 10000,
      boxShadow: '0 0 1px 0',
      width: IFRAME_WIDTH
    };

    container.id = IFRAME_ID;

    for (const styleName in defaultStyles) {
      container.style[styleName] = defaultStyles[styleName];
    }

    document.body.appendChild(container);

    container.src = chrome.extension.getURL('/templates/context-popup.html');
  }

  return container;
}

function showIFrame (iFrame = null) {
  const container = iFrame || getIFrame();

  container.style.display = 'block';
  container.style.top = mouseY+'px';
  container.style.left = mouseX+'px';
}

function hideIFrame() {
  const container = document.getElementById(IFRAME_ID);

  if (container !== null) {
    container.style.display = 'none';
  }
}

function sendDataToIFrame (iFrame) {
  const selection = getSelection();

  const message = {
    id: 'content-data',
    url: document.URL,
    text: selection.toString(),
    title: document.title,
    context: ''
  };

  if (options['context-capturing']) {
    message['context'] = new ContextExtractor(selection).getContext().getSentence();
  }

  iFrame.contentWindow.postMessage(message, chrome.extension.getURL(''));
}
