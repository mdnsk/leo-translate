import { BACKGROUND_ADD_WORD_TO_DICTIONARY } from './messages';
import { returnJsonIfOk } from './helpers';

const config = {
  api: 'https://api.lingualeo.com',
  url: 'https://lingualeo.com',

  // API paths
  getTranslations: '/gettranslates',
  addWordToDictionary: '/addword',
  translateFromRussian: '/translate.php',

  // Site paths
  openWordInDictionary: '/glossary/learn/internet?utm_source=ll_plugin&utm_medium=plugin&utm_campaign=simplifiedcontent#'
};

export default {
  /**
   * Adds the wort into the dictionary.
   *
   * @param word
   * @param translation
   * @param context
   * @returns {Promise}
   */
  addWordToDictionary (word, translation, context = '') {
    return browser.runtime.sendMessage({ id: BACKGROUND_ADD_WORD_TO_DICTIONARY, word, translation, context });
  },

  /**
   * Returns all the translations of the word.
   *
   * @param word
   * @returns {Promise}
   */
  getTranslations (word) {
    const body = encodeParams({
      word,
      include_media: 1,
      app_word_forms: 1
    });

    return fetch(
        `${config.api}${config.getTranslations}?port=1001`,
        { body, method: 'POST', credentials: 'same-origin' }
      )
      .then(returnJsonIfOk);
  },

  /**
   * Returns the link to the word in the dictionary.
   *
   * @param word
   * @returns {string}
   */
  getWordDictionaryUrl (word) {
    return config.url+config.openWordInDictionary+encodeURIComponent(word);
  },

  /**
   * Returns English translation of Russian word.
   *
   * @param q      The sentence to translate
   * @param source Origin language
   * @param target Target language
   * @returns {Promise}
   */
  translateSentence (q, source = 'ru', target = 'en') {
    const body = encodeParams({ q, source, target });

    return fetch(
        `${config.api}${config.translateFromRussian}?${body}`,
        { method: 'GET', credentials: 'omit' }
      )
      .then(returnJsonIfOk);
  }
};

function encodeParams (paramsObj) {
  const params = new URLSearchParams();

  params.append('port', 1001);

  for (const param in paramsObj) {
    params.append(param, paramsObj[param]);
  }

  return params;
}
