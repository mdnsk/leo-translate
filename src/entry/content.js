import ContextExtractor from '../ContextExtractor';

const IFRAME_ID = 'leoTranslateIFrame';

let mouseX = 0;
let mouseY = 0;

document.body.addEventListener('mousedown', e => {
  if (e.button === 0) {
    const container = document.getElementById(IFRAME_ID);

    if (container !== null) {
      container.style.display = 'none';
    }
  } else if (e.button === 2) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
});

// Listen for messages from the iFrame
window.addEventListener('message', e => {
  if (chrome.extension.getURL('') === e.origin+'/') {
    const iFrame = getIFrame();

    if (e.data.id === 'vue-popup-resized') {
      iFrame.width  = iFrame.contentWindow.document.body.scrollWidth;
      iFrame.height = iFrame.contentWindow.document.body.scrollHeight;
    } else if (e.data.id === 'vue-popup-get-context') {
      sendContextToIFrame(iFrame);
    }
  }
});

chrome.runtime.onMessage.addListener(message => {
  const iFrame = getIFrame();

  if (message.id === 'context-menu-clicked') {
    iFrame.style.display = 'block';
    iFrame.style.top = mouseY+'px';
    iFrame.style.left = mouseX+'px';

    sendContextToIFrame(iFrame);
  } else if (message.id === 'translate-close') {
    iFrame.style.display = 'none';
  }
});

function getIFrame () {
  let container = document.getElementById(IFRAME_ID);

  if (container === null) {
    container = document.createElement('iframe');

    const defaultStyles = {
      position: 'absolute',
      display: 'none',
      border: 'none',
      zIndex: 10000,
      boxShadow: '0 0 1px 0'
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

function sendContextToIFrame (iFrame, context = null) {
  iFrame.contentWindow.postMessage({
    id: 'content-context',
    context: context === null ? new ContextExtractor(getSelection()).getContext().getSentence() : context
  }, chrome.extension.getURL(''));
}
