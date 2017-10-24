<template>
  <div class="browser-action">
    <input class="browser-action__search" v-model="input" placeholder="Type text to translate...">
    <translate v-show="showTranslate" @close="close" @translate="translate" :text="text" page-url="" page-title="From LeoTranslator browser extension" />
    <ul v-show="hasHistory && ! showTranslate">
      <li v-for="item in history" class="browser-action__history-item"><a :href="getHistoryWordUrl(item)">{{ item }}</a></li>
    </ul>
    <div v-show="! showTranslate" class="browser-action__controls">
      <button @click="clearHistory" :disabled="! hasHistory" class="browser-action__btn">Clear history</button>
      <button @click="openOptionsPage" class="browser-action__btn">Settings</button>
    </div>
  </div>
</template>

<script>
  import api from '../leoApi';
  import debounce from 'debounce';
  import history from '../history';
  import Translate from './Translate.vue';

  export default {
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

    created () {
      chrome.storage.onChanged.addListener(this.changeHistoryListener);
      this.loadHistory();

      setTimeout(() => {
        document.querySelector('.browser-action__search').focus();
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
        this.translate(this.input);
      }, 1000)
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

    components: { Translate }
  };
</script>

<style>
  @import "../assets/style.css";

  .browser-action {
    min-width: 300px;
    padding: 0;
    margin: 0;
  }

  .browser-action__search {
    width: 100%;
    padding: 15px;
    border: none;
  }

  .browser-action__history-item {
    display: block;
  }
</style>
