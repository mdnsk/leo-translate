import optionsStorage from '../options';
import ContextExtractor from '../ContextExtractor';

const IFRAME_WIDTH = 250;
const IFRAME_VERTICAL_MARGIN = 3;
const IFRAME_ID = 'leoTranslateIFrame';

let selectionTop = 0;
let selectionLeft = 0;
let selectionBottom = 0;

let options = {};

// Fetch options from local storage
optionsStorage.getAllOptions().then(data => options = data);

// Listen for messages from the iFrame
window.addEventListener('message', e => {
  if (chrome.extension.getURL('') === e.origin+'/') {
    const iFrame = getIFrame();

    if (e.data.id === 'vue-popup-resized') {
      // Set height of iFrame
      iFrame.style.height = iFrame.contentWindow.document.body.scrollHeight+'px';

      // Set position of iFrame
      setPositionOfIFrame(iFrame);
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

  if (window.getSelection().toString().length > maxLength) {
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
      width: IFRAME_WIDTH+'px',
      height: '67px'
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

  setPositionOfIFrame(container);
}

function hideIFrame() {
  const container = document.getElementById(IFRAME_ID);

  if (container !== null) {
    container.style.display = 'none';
  }
}

function sendDataToIFrame (iFrame) {
  const selection = window.getSelection();

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

function setPositionOfIFrame (iFrame) {
  const selection = window.getSelection();

  // Refresh coordinates of a selection if it exists.
  if (selection.rangeCount > 0) {
    const rect = selection.getRangeAt(0).getBoundingClientRect();

    selectionTop = rect.top + window.scrollY;
    selectionBottom = rect.bottom + window.scrollY;
    selectionLeft = rect.left + window.scrollX;
  }

  const iFrameHeight = iFrame.offsetHeight + IFRAME_VERTICAL_MARGIN;
  const pageWidth = window.document.documentElement.clientWidth + window.scrollX;
  const pageHeight = window.document.documentElement.clientHeight + window.scrollY;

  const x = selectionLeft + IFRAME_WIDTH > pageWidth ? pageWidth - IFRAME_WIDTH : selectionLeft;
  const y = selectionBottom + iFrameHeight > pageHeight && selectionTop - iFrameHeight > 0 ? selectionTop - iFrameHeight : selectionBottom + IFRAME_VERTICAL_MARGIN;

  iFrame.style.top = y+'px';
  iFrame.style.left = x+'px';
}
