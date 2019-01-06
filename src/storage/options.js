// Declare default values for options.
export const defaultValues = Object.freeze({
  // Enable context capturing
  contextCapturing: false,
  contextAutoTranslate: false,

  // Double Click Translation settings
  doubleClick:      true,
  doubleClickCtrl:  false,
  doubleClickAlt:   false,
  doubleClickMeta:  false,

  // Enable hover translation for all sites
  hoverTranslation: false,
  hoverTimeout:     300,
  hoverAlt:         true,
  hoverCtrl:        false,
  hoverShift:       false,

  // Theme (css files)
  theme:            'blackberry',

  // Play sound automatically for translated word
  audioAutoPlay:    false,

  // Network settings
  privateMode:      true
});

function getOptionValue (options, key) {
  return options[key] !== undefined ? options[key] : defaultValues[key];
}

export default {
  /**
   * Return option by key
   *
   * @param key
   */
  getOption (key) {
    return new Promise(resolve => {
      chrome.storage.local.get({ options: {} }, data => resolve(getOptionValue(data.options, key)));
    });
  },

  /**
   * Return all options
   */
  getAllOptions () {
    return new Promise(resolve => {
      chrome.storage.local.get({ options: {}}, data => {
        const options = {};

        for (const key of Object.keys(defaultValues)) {
          options[key] = getOptionValue(typeof data === 'object' ? data.options : {}, key);
        }

        return resolve(options);
      })
    });
  },

  /**
   * Set all options
   *
   * @param options
   */
  setAllOptions (options) {
    return new Promise(resolve => chrome.storage.local.set({ options }, resolve));
  }
};
