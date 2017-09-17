const config = {
  api: 'https://api.lingualeo.com',
  url: 'https://lingualeo.com',

  // API paths
  getTranslations: '/gettranslates',
  addWordToDictionary: '/addword',

  // Site paths
  openWordInDictionary: '/glossary/learn/internet?utm_source=ll_plugin&utm_medium=plugin&utm_campaign=simplifiedcontent#'
};

function prepareParams (paramsObj) {
  const params = new URLSearchParams();

  params.append('port', 1001);

  for (const param in paramsObj) {
    params.append(param, paramsObj[param]);
  }

  return params;
}

export default {
  /**
   * Adds the wort into the dictionary.
   *
   * @param word
   * @param translation
   * @param pageUrl
   * @param pageTitle
   * @param context
   * @returns {Promise}
   */
  addWordToDictionary (word, translation, pageUrl, pageTitle, context = '') {
    const body = prepareParams({
      word,
      context,
      tword: translation,
      context_url: pageUrl,
      context_title: pageTitle
    });

    return fetch(config.api+config.addWordToDictionary+'?port=1001', {
        body,
        method: 'POST',
        credentials: 'same-origin'
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      });
  },

  /**
   * Returns all the translations of the word.
   *
   * @param word
   * @returns {Promise}
   */
  getTranslations (word) {
    const body = prepareParams({
      word,
      include_media: 1,
      app_word_forms: 1
    });

    return fetch(config.api+config.getTranslations+'?port=1001', {
        body,
        method: 'POST'
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      });
  },

  /**
   * Returns the link to the word in the dictionary.
   *
   * @param word
   * @returns {string}
   */
  getWordDictionaryUrl (word) {
    return config.url+config.openWordInDictionary+encodeURIComponent(word);
  }
};
