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
    <div v-show="! showTranslate" class="the-browser-action__controls">
      <button class="btn" type="button" :disabled="! hasHistory" @click="clearHistory">
        Clear history
      </button>
      <button class="btn" type="button" @click="openOptionsPage">
        Settings
      </button>
    </div>
  </div>
</template>

<script>
  import api from '../leoApi';
  import debounce from 'debounce';
  import history from '../history';
  import Translate from './Translate.vue';

  export default {
    components: { Translate },

    data () {
      return {
        text: '',
        input: '',
        history: []
      };
    },

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

      this.loadHistory();

      setTimeout(this.focus, 150);
      setTimeout(this.focus, 500);
    },

    beforeDestroy () {
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

      changeHistoryListener (changes, area) {
        if (changes.history && area === 'local') {
          this.loadHistory();
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
