export default {
  addWord (word) {
    return this.getAll().then(history => {
      if (history.indexOf(word) === -1) {
        if (history.length > 10) {
          history.shift();
        }

        history.push(word);

        return browser.storage.local.set({ history });
      }
    });
  },

  getAll () {
    return browser.storage.local.get('history')
      .then(data => data.history ? data.history : []);
  },

  clear () {
    return browser.storage.local.set({history: []});
  }
};
