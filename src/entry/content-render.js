import Popup from '../Popup';
import ContextExtractor from '../ContextExtractor';

const popup = new Popup();

let data = {};
let mouse = {x: 0, y: 0};

window.addEventListener('message', e => {
  // Listen for message from the Add-on's PopUp
  if (chrome.extension.getURL('') === e.origin+'/') {
    if (e.data.id === 'vue-popup-resized') {
      popup.refreshHeight().setPosition(data.rect);
    } else if (e.data.id === 'vue-popup-get-data') {
      popup.sendData(data);
    } else if (e.data.id === 'vue-translate-close') {
      popup.hide();
    }
  }

  // Listen for messages from content-capture.js which is embedded in each iFrame.
  else if (e.data.id === 'leo-translate-open-popup'
    && checkSelectionLength(e.data.text)
    && checkSelectionLength(e.data.context)) {

    data = e.data;

    if (! data.isMain) {
      const frame = searchFrame(e.source);

      if (frame !== null) {
        const rect = frame.getBoundingClientRect();

        data = Object.assign({}, data, {
          rect: {
            top: data.rect.top + rect.top,
            bottom: data.rect.bottom + rect.top,
            left: data.rect.left + rect.left
          }
        });
      }
  }

    popup.show().sendData(data).setPosition(data.rect);
  }

  else if (e.data.id === 'leo-translate-mouse') {
    const frame = searchFrame(e.source);

    mouse = {
      x: parseInt(e.data.x),
      y: parseInt(e.data.y)
    };

    if (frame !== null) {
      const rect = frame.getBoundingClientRect();

      mouse.x += rect.left;
      mouse.y += rect.top;
    }
  }
});

chrome.runtime.onMessage.addListener(message => {
  if (message.id === 'context-menu-clicked' && checkSelectionLength(message.text)) {
    data = message;

    popup.show().sendData(data).setPosition({ left: mouse.x, top: mouse.y, bottom: mouse.y });
  } else if (message.id === 'close-popup') {
    popup.hide();
  }
});

function searchFrame (contentWindow) {
  const frames = document.querySelectorAll('iframe');

  for (let i = 0; i < frames.length; i++) {
    if (frames[i].contentWindow === contentWindow) {
      return frames[i];
    }
  }

  return null;
}

function checkSelectionLength (text) {
  const maxLength = ContextExtractor.LIMIT * 2;

  if (text.length > maxLength) {
    chrome.runtime.sendMessage({
      id: 'show-notification',
      text: 'The selection is too long! It must be less than '+maxLength+' characters.'
    });

    return false;
  }

  return true;
}
