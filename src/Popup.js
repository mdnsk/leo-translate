import { getBodyOffset } from './helpers';

export default class Popup {

  constructor () {
    // Constants
    this.ID = 'leoTranslatePopup';
    this.WIDTH = 250;
    this.MARGIN_Y = 3;

    this.DEFAULT_STYLES = {
      position: 'absolute',
      display: 'none',
      border: 'none',
      zIndex: 10000,
      boxShadow: '0 0 1px 0',
      width: this.WIDTH+'px',
      height: '67px'
    };

    // The Popup HTMLElement
    this.popup = null;

    // Set scrolls
    this.refreshSelectionScrolls();
  }

  show () {
    this.createPopup().style.display = 'block';

    return this;
  }

  hide () {
    if (this.popup !== null) {
      this.popup.style.display = 'none';
    }

    return this;
  }

  sendData ({ text, context }) {
    const message = {
      id: 'content-data',
      text,
      context,
      url: document.URL,
      title: document.title
    };

    this.createPopup().contentWindow.postMessage(message, chrome.extension.getURL(''));

    return this;
  }

  refreshHeight (height) {
    const popup = this.createPopup();

    popup.style.height = height+'px';

    return this;
  }

  refreshSelectionScrolls () {
    this.selectionScrollY = window.scrollY;
    this.selectionScrollX = window.scrollX;

    return this;
  }

  setPosition ({ left, top, bottom = null }) {
    top = parseInt(top) + this.selectionScrollY;
    left = parseInt(left) + this.selectionScrollX;
    bottom = parseInt(bottom) + this.selectionScrollY;

    const bodyOffset = getBodyOffset();

    const popupHeight = this.createPopup().offsetHeight + this.MARGIN_Y;
    const pageWidth = window.document.documentElement.clientWidth + window.scrollX + bodyOffset.left;
    const pageHeight = window.document.documentElement.clientHeight + window.scrollY + bodyOffset.top;

    const x = left + this.WIDTH > pageWidth ? pageWidth - this.WIDTH : left;
    const y = bottom + popupHeight > pageHeight && top - popupHeight > 0 ? top - popupHeight : bottom + this.MARGIN_Y;

    this.popup.style.top = y+'px';
    this.popup.style.left = x+'px';

    return this;
  }

  createPopup () {
    this.popup = document.getElementById(this.ID);

    if (this.popup === null) {
      this.popup = document.createElement('iframe');

      this.popup.id = this.ID;

      for (const styleName in this.DEFAULT_STYLES) {
        this.popup.style[styleName] = this.DEFAULT_STYLES[styleName];
      }

      document.body.appendChild(this.popup);

      this.popup.src = chrome.extension.getURL('/templates/popup-iframe.html');
    }

    return this.popup;
  }
};
