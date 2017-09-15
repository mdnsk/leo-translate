<template>
  <div class="browser-action">
    <input class="browser-action__search" v-model="input" placeholder="Type text to translate...">
    <translate v-show="showTranslate" @close="close" @translate="translate" :text="text" page-url="" page-title="From LeoTranslator browser extension" />
    <ul v-show="showHistory">
      <li v-for="item in history" style="display: block"><a :href="getHistoryWordUrl(item)">{{ item }}</a></li>
    </ul>
    <button v-show="showHistory" @click="clearHistory">Clear history</button>
  </div>
</template>

<script>
  import api from '../leoApi';
  import history from './history';
  import { debounce } from 'lodash';
  import Translate from './Translate.vue';

  // Debounced search function
  let debSch;

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

      showHistory () {
        return ! this.showTranslate && this.history.length > 0;
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
      }
    },

    watch: {
      input (text) {
        if (text === '') {
          this.close();
        } else {
          if (debSch === undefined) {
            debSch = debounce(() => this.translate(this.input), 1000);
          }
          debSch();
        }
      }
    },

    components: { Translate }
  };
</script>

<style>
  @import "style.css";

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
</style>
