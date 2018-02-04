// Declare default values for the options.
export const defaultValues = Object.freeze({
  contextCapturing: false,
  doubleClick:      true,
  doubleClickCtrl:  false,
  doubleClickAlt:   false,
  doubleClickMeta:  false,
  theme:            'leo-translate',
});

function getOptionValue (options, key) {
  return options[key] !== undefined ? options[key] : defaultValues[key];
}

export default {
  /**
   * Set all options
   *
   * @param options
   */
  setAllOptions (options) {
    return chrome.storage.local.set({ options });
  },

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
  }
};
