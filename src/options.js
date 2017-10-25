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
   * @param def Default value
   */
  getOption (key, def) {
    return browser.storage.local.get({ options: { [key]: def } })
      .then(data => data.options[key]);
  },

  /**
   * Return all options
   */
  getAllOptions () {
    return browser.storage.local.get({ options: {}})
      .then(data => data.options);
  }
};
