<template>
  <translate @close="close" @translate="translate" :text="text" :page-url="pageUrl" :page-title="pageTitle" />
</template>

<script>
  import Translate from './Translate.vue';
  import { iframeResizerContentWindow } from 'iframe-resizer';

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
      // So it need to request this data again.
      chrome.runtime.sendMessage({ id: 'vue-context-popup-created' })
          .then(response => this.onMessageListener(response));
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
