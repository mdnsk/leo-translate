export default {
  /**
   * Set option value
   *
   * @param key
   * @param val
   */
  setOption (key, val) {
    return this.getAllOptions()
      .then(options => {
        options[key] = val;

        return browser.storage.local.set({ options });
      });
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
