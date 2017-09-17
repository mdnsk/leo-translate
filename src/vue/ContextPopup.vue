<template>
  <translate
      @close="close"
      @translate="translate"
      @translations-loaded="translationsLoaded"
      :text="text"
      :page-url="pageUrl"
      :page-title="pageTitle" />
</template>

<script>
  import Translate from './Translate.vue';

  export default {
    data () {
      return {
        text: '',
        pageUrl: '',
        pageTitle: ''
      };
    },

    created () {
      chrome.runtime.onMessage.addListener(this.onMessageListener);

      // The component was created after the context-menu-clicked event had been fired,
      // So it needs to request this data again.
      chrome.runtime.sendMessage({ id: 'vue-context-popup-created' })
          .then(response => {
            this.onMessageListener(response);
            parent.postMessage('vue-context-popup-resized', this.pageUrl);
          });
    },

    beforeDestroy () {
      chrome.runtime.onMessage.removeListener(this.onMessageListener);
    },

    methods: {
      close () {
        chrome.runtime.sendMessage({ id: 'vue-translate-close' });
      },

      translate (text) {
        this.text = text;
      },

      translationsLoaded () {
        parent.postMessage('vue-context-popup-resized', this.pageUrl);
      },

      onMessageListener (message) {
        if (message.id === 'context-menu-clicked') {
          this.text = message.text.trim();
          this.pageUrl = message.url;
          this.pageTitle = message.title;
        }
      }
    },

    components: { Translate }
  };
</script>
