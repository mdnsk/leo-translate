import Popup from '../Popup';
import ContextExtractor from '../ContextExtractor';
import {
  PROXY_CONTENT_MOUSE,
  PROXY_CONTENT_OPEN_POPUP,
  PROXY_CONTENT_CLOSE_POPUP,
  PROXY_CONTENT_RESIZE_POPUP,
  PROXY_CONTENT_GET_DATA,
  CONTENT_OPEN_POPUP,
  BACKGROUND_SHOW_NOTIFICATION
} from '../messages';

const popup = new Popup();

let data = {};
let mouse = { x: 0, y: 0 };

chrome.runtime.onMessage.addListener(message => {
  if (message.id === PROXY_CONTENT_GET_DATA) {
    popup.sendData(data);
  }

  else if (message.id === PROXY_CONTENT_RESIZE_POPUP) {
    popup.refreshHeight().setPosition(data.rect);
  }

  else if (message.id === PROXY_CONTENT_CLOSE_POPUP) {
    popup.hide();
  }

  else if (message.id === CONTENT_OPEN_POPUP || message.id === PROXY_CONTENT_OPEN_POPUP) {

    if (checkSelectionLength(message.text)) {
      data = Object.assign({}, message, {
        text: removeHtmlTags(message.text)
      });

      if (message.id === PROXY_CONTENT_OPEN_POPUP && message.frameIndex > -1) {
        searchFrame(window.frames[message.frameIndex], frame => {
          const rect = frame.getBoundingClientRect();

          data = Object.assign({}, data, {
            rect: {
              top: data.rect.top + rect.top,
              bottom: data.rect.bottom + rect.top,
              left: data.rect.left + rect.left
            }
          });
        });
      } else if (message.id === CONTENT_OPEN_POPUP) {
        data.rect = { left: mouse.x, top: mouse.y, bottom: mouse.y };
      }

      popup.show().sendData(data).setPosition(data.rect);
    }
  }

  else if (message.id === PROXY_CONTENT_MOUSE) {
    mouse = {
      x: message.x,
      y: message.y
    };

    if (message.frameIndex > -1) {
      searchFrame(window.frames[message.frameIndex], frame => {
        const rect = frame.getBoundingClientRect();

        mouse.x += rect.left;
        mouse.y += rect.top;
      });
    }
  }
});

function searchFrame (contentWindow, cb = null) {
  const frames = document.querySelectorAll('iframe');

  for (let i = 0; i < frames.length; i++) {
    if (frames[i].contentWindow === contentWindow) {
      if (typeof cb === 'function') {
        cb(frames[i]);
      }

      return frames[i];
    }
  }

  return null;
}

function checkSelectionLength (text) {
  const maxLength = ContextExtractor.LIMIT * 2;

  if (text.length > maxLength) {
    chrome.runtime.sendMessage({
      id: BACKGROUND_SHOW_NOTIFICATION,
      text: 'The selection is too long! It must be less than '+maxLength+' characters.'
    });

    return false;
  }

  return true;
}

function removeHtmlTags (text) {
  return text.replace(/[<>]/g, '');
}
