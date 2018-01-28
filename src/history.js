export default {
  addWord (word, meaning, soundUrl) {
    return this.getAll().then(history => {
      const wordIndex = history.findIndex(item => item.word === word);

      if (wordIndex === -1) {
        history.push({
          word,
          soundUrl,
          meanings: [ meaning ],
        });
      } else {
        const currentItem = history[wordIndex];

        if (currentItem.meanings.indexOf(meaning) === -1) {
          currentItem.meanings.push(meaning);
        }

        history = history.filter((element, index) => index !== wordIndex);

        history.push(currentItem);
      }

      if (history.length > 10) {
        history = history.slice(-10);
      }

      return browser.storage.local.set({ history });
    });
  },

  getAll () {
    return browser.storage.local.get({ history: [] })
      .then(data => {
        const all = [];

        // Convert old string words to object representation.
        data.history.forEach(item => {
          if (typeof item === 'string') {
            item = {
              word: item,
              soundUrl: '',
              meanings: []
            };
          }

          all.push(item);
        });

        return all;
      });
  },

  clear () {
    return browser.storage.local.set({history: []});
  }
};
