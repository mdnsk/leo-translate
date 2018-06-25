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
  import history from '../history';
  import options from '../options';
  import Translate from './Translate.vue';
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

        // Hover mode (for this site only)
        hoverMode: false,
        currentHost: '',

        // Global hover Translation setting
        globalHoverTranslation: false
      };
    },

    // Sites for which on hover translate settings are inverted.
    hoverExclude: [],

    computed: {
      showTranslate () {
        return this.text !== '';
      },

      hasHistory () {
        return this.history.length > 0;
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

      this.loadOptions();
      this.loadHistory();

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
        options.getAllOptions().then(values => {
          this.globalHoverTranslation = values.hoverTranslation;
          this.$options.hoverExclude = Array.isArray(values.hoverExclude) ? values.hoverExclude : [];

          // Request URL of the current active tab
          chrome.runtime.sendMessage({ id: BACKGROUND_GET_CURRENT_HOST });
        });
      },

      changeHistoryListener (changes, area) {
        if (changes.history && area === 'local') {
          this.loadHistory();
        }
      },

      onMessageListener (message) {
        if (message.id === BROWSER_ACTION_CURRENT_HOST) {

          // Set hoverMode to globalHoverTranslation setting or invert it if this site is excluded
          this.hoverMode = this.$options.hoverExclude.indexOf(message.host) >= 0
            ? !this.globalHoverTranslation
            : this.globalHoverTranslation;

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
        if (this.currentHost !== '') {
          this.hoverMode = !this.hoverMode;

          if (this.hoverMode) {
            this.$options.hoverExclude.push(this.currentHost);
          } else {
            const index = this.$options.hoverExclude.indexOf(this.currentHost);

            if (index !== -1) {
              this.$options.hoverExclude.splice(index, 1);
            }
          }

          options.setAllOptions({ hoverExclude: this.$options.hoverExclude })
            .then(() => {
              this.loadOptions();
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
