<template>
  <div class="the-browser-action">
    <input
        class="the-browser-action__search"
        v-model="input"
        placeholder="Type text to translate..."
    >
    <translate
        v-show="showTranslate"
        :text="text"
        page-url=""
        page-title="From LeoTranslator browser extension"
        @close="close"
        @translate="translate"
    />
    <ul v-show="hasHistory && ! showTranslate">
      <li
          v-for="item in history"
          class="the-browser-action__history-item"
      >
        <a :href="getHistoryWordUrl(item)">{{ item }}</a>
      </li>
    </ul>
    <div v-show="! showTranslate">
      <button
          :disabled="! hasHistory"
          @click="clearHistory"
      >
        Clear history
      </button>
      <button @click="openOptionsPage">
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

      setTimeout(() => {
        document.querySelector('.the-browser-action__search').focus();
      }, 150);
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

<style>
  @import "../assets/style.css";

  .the-browser-action {
    min-width: 300px;
    padding: 0;
    margin: 0;
  }

  .the-browser-action__search {
    width: 100%;
    padding: 15px;
    border: none;
  }

  .the-browser-action__history-item {
    display: block;
  }
</style>
