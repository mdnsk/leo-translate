// Messages between content scripts through background.js
export const PROXY_CONTENT_MOUSE = 'proxy-content-mouse';
export const PROXY_CONTENT_GET_DATA = 'proxy-content-get-data';
export const PROXY_CONTENT_OPEN_POPUP = 'proxy-content-open-popup';
export const PROXY_CONTENT_CLOSE_POPUP = 'proxy-content-close-popup';
export const PROXY_CONTENT_RESIZE_POPUP = 'proxy-content-resize-popup';

// Messages from background to content scripts
export const CONTENT_OPEN_POPUP = 'content-open-popup';

// Messages to background from anywhere
export const BACKGROUND_SHOW_NOTIFICATION = 'background-show-notification';
