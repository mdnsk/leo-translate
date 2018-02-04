import Popup from '../Popup';
import ContextExtractor from '../ContextExtractor';
import {
  removeHtmlTags,
  getBodyOffset
} from '../helpers';
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
let rect = { top: 0, bottom: 0, left: 0 };

chrome.runtime.onMessage.addListener(message => {
  if (message.id === PROXY_CONTENT_GET_DATA) {
    popup.sendData(data);
  }

  else if (message.id === PROXY_CONTENT_RESIZE_POPUP) {
    popup.refreshHeight(message.height).setPosition(rect, getBodyOffset());
  }

  else if (message.id === PROXY_CONTENT_CLOSE_POPUP) {
    popup.hide();
  }

  else if (message.id === CONTENT_OPEN_POPUP || message.id === PROXY_CONTENT_OPEN_POPUP) {

    if (checkSelectionLength(message.text)) {
      // Apply body offset to received coordinates.
      // We need if because the popup is placed inside the body element.
      const rectBody = getBodyOffset()

      data = {
        context: message.context,
        text: removeHtmlTags(message.text)
      };

      if (message.id === PROXY_CONTENT_OPEN_POPUP) {
        rect = mergeRects(message.rect, rectBody);

        if (message.frameIndex > -1) {
          searchFrame(window.frames[message.frameIndex], frame => {
            const rectFrame = frame.getBoundingClientRect();

            rect = mergeRects(rect, {
              top: rectFrame.top,
              left: rectFrame.left
            });
          });
        }
      } else if (message.id === CONTENT_OPEN_POPUP) {
        rect = mergeRects({ top: mouse.y, left: mouse.x }, rectBody);
      }

      popup
        .refreshSelectionScrolls()
        .show()
        .sendData(data)
        .setPosition(rect, getBodyOffset());
    }
  }

  else if (message.id === PROXY_CONTENT_MOUSE) {
    mouse = {
      x: message.x,
      y: message.y
    };

    if (message.frameIndex > -1) {
      searchFrame(window.frames[message.frameIndex], frame => {
        const rectFrame = frame.getBoundingClientRect();

        mouse.x += rectFrame.left;
        mouse.y += rectFrame.top;
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

function mergeRects(...rects) {
  const result = { top: 0, left: 0, bottom: 0 };

  rects.forEach(item => {
    result.top += item.top;
    result.left += item.left;
    result.bottom += item.bottom === undefined ? item.top : item.bottom;
  });

  return result;
}
