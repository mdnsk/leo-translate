export default {
  addWord (word) {
    return this.getAll().then(history => {
      if (history.indexOf(word) === -1) {
        history.push(word);

        if (history.length > 10) {
          history = history.slice(-10);
        }

        return browser.storage.local.set({ history });
      }
    });
  },

  getAll () {
    return browser.storage.local.get({ history: [] })
      .then(data => data.history);
  },

  clear () {
    return browser.storage.local.set({history: []});
  }
};
