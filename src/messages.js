// Messages between content scripts through background.js
export const PROXY_CONTENT_MOUSE = 'proxy-content-mouse';
export const PROXY_CONTENT_GET_DATA = 'proxy-content-get-data';
export const PROXY_CONTENT_OPEN_POPUP = 'proxy-content-open-popup';
export const PROXY_CONTENT_CLOSE_POPUP = 'proxy-content-close-popup';
export const PROXY_CONTENT_RESIZE_POPUP = 'proxy-content-resize-popup';
export const PROXY_CONTENT_REFRESH_POPUP = 'proxy-content-refresh-popup';

// Messages that should be sent to all tabs
export const PROXY_ALL_CONTENT_REFRESH_OPTIONS = 'proxy-content-refresh-options';

// Messages from background to content scripts
export const CONTENT_OPEN_POPUP = 'content-open-popup';

// Messages to background from anywhere
export const BACKGROUND_GET_CURRENT_HOST = 'background-get-current-host';
export const BACKGROUND_SHOW_NOTIFICATION = 'background-show-notification';

// Message from background to browser action
export const BROWSER_ACTION_CURRENT_HOST = 'browser-action-current-host';
