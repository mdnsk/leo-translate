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
    return browser.storage.local.set({ options });
  },

  /**
   * Return option by key
   *
   * @param key
   */
  getOption (key) {
    return browser.storage.local.get({ options: {} })
      .then(data => getOptionValue(data.options, key))
      .then(option => {
        console.log(option);
        return options;
      })
  },

  /**
   * Return all options
   */
  getAllOptions () {
    return browser.storage.local.get({ options: {}})
      .then(data => {
        const options = {};

        for (const key in defaultValues) {
          if (defaultValues.hasOwnProperty(key)) {
            options[key] = getOptionValue(data.options, key);
          }
        }

        return options;
      });
  }
};
