// Declare default values for options.
export const defaultValues = Object.freeze({
  // Enable context capturing
  contextCapturing: false,

  // Double Click Translation settings
  doubleClick:      true,
  doubleClickCtrl:  false,
  doubleClickAlt:   false,
  doubleClickMeta:  false,

  // Enable hover translation for all sites
  hoverTranslation: false,
  hoverTimeout:     300,

  // Sites for those global hover translation settings are inverted
  // For example, if hover translation enabled for all sites, for these sites it is disabled.
  hoverExclude:     [],

  // Theme (css files)
  theme:            'blackberry',

  // Play sound automatically for translated word
  audioAutoPlay:    false
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

        for (const key in defaultValues) {
            if (defaultValues.hasOwnProperty(key)) {
                options[key] = getOptionValue(typeof data === 'object' ? data.options : {}, key);
            }
        }

        return resolve(options);
      })
    });
  },

  setOption (key, val) {
    return this.getAllOptions().then(options => {
      if (options[key] === undefined) {
        throw new Error('Undefined option '+key);
      }

      options[key] = val;

      return this.setAllOptions(options);
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
