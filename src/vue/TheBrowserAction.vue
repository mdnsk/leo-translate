<template>
  <div class="the-browser-action">
    <input
        class="the-browser-action__search"
        v-model="input"
        placeholder="Type a word to translate..."
    >
    <button v-if="input.length > 0" class="the-browser-action__clear-search" type="button" @click="close">X</button>
    <translate
        v-show="showTranslate"
        :text="text"
        page-url=""
        page-title="From LeoTranslator browser extension"
        class="the-browser-action__translate"
        @close="close"
        @translate="translate"
    />
    <ul v-show="hasHistory && ! showTranslate" class="the-browser-action__history-list">
      <li v-for="item in history" class="the-browser-action__history-item">
        <a :href="getHistoryWordUrl(item.word)" class="the-browser-action__history-link">
          <span>{{ item.word }}</span>
        </a>
        <p class="the-browser-action__history-meanings">{{ item.meanings.join(', ') }}</p>
      </li>
    </ul>
    <template v-show="! showTranslate">
      <div class="the-browser-action__controls">
        <button class="btn" type="button" :disabled="! hasHistory" @click="clearHistory">
          Clear history
        </button>
        <button class="btn" type="button" @click="openOptionsPage">
          Settings
        </button>
        <label class="the-browser-action__hover-mode-checkbox" :class="{
          'the-browser-action__hover-mode-checkbox_active': hoverMode
        }">
          <input type="checkbox" :checked="hoverMode" @change="toggleHoverMode">
          Enable on hover translation for this site
        </label>
      </div>
    </template>
  </div>
</template>

<script>
  import api from '../leoApi';
  import debounce from 'debounce';
  import Translate from './Translate.vue';
  import history from '../storage/history';
  import options from '../storage/options';
  import hoverExcluded from '../storage/hoverExcluded';
  import {
    BACKGROUND_GET_CURRENT_HOST,
    BROWSER_ACTION_CURRENT_HOST,
    PROXY_ALL_CONTENT_REFRESH_OPTIONS
  } from '../messages';

  export default {
    components: { Translate },

    data () {
      return {
        text: '',
        input: '',
        history: [],

        // Host name of the current active page
        currentHost: null,

        // Sites for which on hover translate settings are inverted.
        hoverExcluded: [],

        // Global hover Translation setting
        globalHoverTranslation: false
      };
    },

    computed: {
      showTranslate () {
        return this.text !== '';
      },

      hasHistory () {
        return this.history.length > 0;
      },

      // Return globalHoverTranslation setting or invert it if this site is excluded
      hoverMode () {
        return this.hoverExcluded.indexOf(this.currentHost) >= 0
          ? !this.globalHoverTranslation : this.globalHoverTranslation;
      }
    },

    watch: {
      input (input) {
        if (input === '') {
          this.close();
        } else {
          this.search();
        }
      }
    },

    created () {
      chrome.storage.onChanged.addListener(this.changeHistoryListener);
      chrome.runtime.onMessage.addListener(this.onMessageListener);

      this.loadHistory();

      // Request URL of the current active tab
      Promise.all([ this.loadOptions(), this.loadHoverExcluded() ])
        .then(() => chrome.runtime.sendMessage({ id: BACKGROUND_GET_CURRENT_HOST }));

      setTimeout(this.focus, 150);
      setTimeout(this.focus, 500);
    },

    beforeDestroy () {
      chrome.runtime.onMessage.removeListener(this.onMessageListener);
      chrome.storage.onChanged.removeListener(this.changeHistoryListener);
    },

    methods: {
      translate (text) {
        this.text = text;
      },

      close () {
        this.text = '';
        this.input = '';
      },

      loadHistory () {
        history.getAll().then(items => this.history = items.reverse());
      },

      loadOptions () {
        return options.getAllOptions().then(values => this.globalHoverTranslation = values.hoverTranslation);
      },

      loadHoverExcluded () {
        return hoverExcluded.getAll().then(excluded => this.hoverExcluded = excluded);
      },

      changeHistoryListener (changes, area) {
        if (changes.history && area === 'local') {
          this.loadHistory();
        }
      },

      onMessageListener (message) {
        if (message.id === BROWSER_ACTION_CURRENT_HOST) {
          this.currentHost = message.host;
        }
      },

      focus () {
        document.querySelector('.the-browser-action__search').focus();
      },

      getHistoryWordUrl (word) {
        return api.getWordDictionaryUrl(word);
      },

      clearHistory () {
        history.clear();
      },

      openOptionsPage () {
        chrome.runtime.openOptionsPage();
      },

      toggleHoverMode () {
        if (this.currentHost !== '' && this.currentHost !== null) {
          const index = this.hoverExcluded.indexOf(this.currentHost);

          if (index === -1) {
            this.hoverExcluded.push(this.currentHost);
          } else {
            this.hoverExcluded.splice(index, 1);
          }

          hoverExcluded.setAll(this.hoverExcluded).then(() => {
            chrome.runtime.sendMessage({ id: PROXY_ALL_CONTENT_REFRESH_OPTIONS });
          });
        }
      },

      search: debounce(function () {
        // If there are Russian letters then we translate them from Russian before.
        if (this.input.match(/[а-яА-Я]/) !== null) {
          api.translateSentence(this.input).then(data => this.translate(data.translation));
        } else {
          this.translate(this.input);
        }
      }, 1000)
    }
  };
</script>

<style lang="scss">
  .theme-leo-translate {
    @import "../assets/themes/leo-translate/style.scss";
    @import "../assets/themes/leo-translate/browser-action.scss";
  }

  .theme-blackberry {
    @import "../assets/themes/blackberry/style.scss";
    @import "../assets/themes/blackberry/browser-action.scss";
  }
</style>
