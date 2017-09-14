import axios from 'axios';

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
    return axios.post(config.api+config.addWordToDictionary+'?port=1001', prepareParams({
        word,
        context,
        port: 1001,
        tword: translation,
        context_url: pageUrl,
        context_title: pageTitle
      }))
      .then(response => response.data);
  },

  /**
   * Returns all the translations of the word.
   *
   * @param word
   * @returns {Promise}
   */
  getTranslations (word) {
    return axios.post(config.api+config.getTranslations+'?port=1001', prepareParams({
        word,
        port: 1001,
        include_media: 1,
        app_word_forms: 1
      }))
      .then(response => response.data);
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
