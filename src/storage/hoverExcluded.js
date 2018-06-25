export default {
  /**
   * Returns list of sites which are excluded from global hover translation settings.
   *
   * @returns {Promise<Array>}
   */
  getAll () {
    return new Promise(resolve => chrome.storage.local.get({ hoverExcluded: [] }, data => resolve(data.hoverExcluded)));
  },

  /**
   * Sets sites which are excluded from global hover translation settings.
   *
   * @param sites Array
   * @returns {Promise<Array>}
   */
  setAll (sites) {
    return new Promise(resolve => chrome.storage.local.set({ hoverExcluded: sites }, resolve));
  },

  /**
   * Clear list of sites which are excluded from global hover translation settings.
   *
   * @returns {Promise}
   */
  clear () {
    return this.setAll([]);
  }
};
