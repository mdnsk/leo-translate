import { iframeResizer } from 'iframe-resizer';

const iframeId = 'leoTranslateIFrame';

let mouseX = 0;
let mouseY = 0;

document.body.addEventListener('mousedown', e => {
  if (e.button === 0) {
    const container = document.getElementById(iframeId);

    if (container !== null) {
      container.style.display = 'none';
    }
  } else if (e.button === 2) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
});

chrome.runtime.onMessage.addListener(message => {
  const style = getIframe().style;

  if (message.id === 'context-menu-clicked') {
    style.display = 'block';
    style.top = mouseY+'px';
    style.left = mouseX+'px';
  } else if (message.id === 'translate-close') {
    style.display = 'none';
  }
});

function getIframe () {
  let container = document.getElementById(iframeId);

  if (container === null) {
    container = document.createElement('iframe');

    const defaultStyles = {
      position: 'absolute',
      display: 'none',
      border: 'none',
      zIndex: 10000
    };

    container.id = iframeId;

    for (const styleName in defaultStyles) {
      container.style[styleName] = defaultStyles[styleName];
    }

    document.body.appendChild(container);

    container.onload = () => {
      iframeResizer({}, '#'+container.id);
    };

    container.src = chrome.extension.getURL('/templates/context-popup.html');
  }

  return container;
}
