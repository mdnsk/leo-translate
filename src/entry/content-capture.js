import optionsStorage from '../options';
import ContextExtractor from '../ContextExtractor';

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
    window.parent.postMessage({
      id: 'leo-translate-mouse',
      x: e.clientX,
      y: e.clientY
    }, '*');
  }
});

document.body.addEventListener('dblclick', e => {
  if (options['double-click']) {
    // If there's a key constraint.
    if (options['double-click-ctrl'] || options['double-click-alt'] || options['double-click-alt']) {

      // If there are no conditions that have passed a check.
      if (! (isAltClick(e) || isCtrlClick(e) || isCmdClick(e))) {
        return;
      }
    }

    openPopup();
  }
});

function closePopup () {
  chrome.runtime.sendMessage({ id: 'close-popup' });
}

function openPopup () {
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const rect = selection.getRangeAt(0).getBoundingClientRect();

    const message = {
      id: 'leo-translate-open-popup',
      text: selection.toString(),
      context: '',
      isMain: window.parent === window.self,
      rect: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left
      }
    };

    if (options['context-capturing']) {
      message.context = new ContextExtractor(selection).getContext().getSentence();
    }

    window.parent.postMessage(message, '*');
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
