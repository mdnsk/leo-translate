<template>
  <translate
      class="popup"
      @close="close"
      @translate="translate"
      @resized="onPopupResizedListener"
      :text="text"
      :context="context"
      :page-url="pageUrl"
      :page-title="pageTitle" />
</template>

<script>
  import options from '../options';
  import Translate from './Translate.vue';

  export default {
    data () {
      return {
        // Data
        text: '',
        context: '',
        pageUrl: '',
        pageTitle: '',

        // Options
        isContextCapturingEnabled: false
      };
    },

    methods: {
      close () {
        chrome.runtime.sendMessage({ id: 'vue-translate-close' });
      },

      translate (text) {
        this.text = text;
      },

      onPopupResizedListener () {
        parent.postMessage({ id: 'vue-popup-resized' }, this.pageUrl);
      },

      onRuntimeMessageListener (message) {
        // The popup has been called with click in context menu item.
        if (message.id === 'context-menu-clicked') {
          this.text = message.text.trim();
          this.pageUrl = message.url;
          this.pageTitle = message.title;

          // Request context from the content script.
          if (this.isContextCapturingEnabled) {
            parent.postMessage({ id: 'vue-popup-get-context' }, this.pageUrl);
          }
        }
      },

      onWindowMessageListener (message) {
        // The context has been received from content script.
        if (message.data.id === 'content-context' && this.isContextCapturingEnabled) {
          this.context = message.data.context;
        }
      }
    },

    components: { Translate },

    created () {
      chrome.runtime.onMessage.addListener(this.onRuntimeMessageListener);
      window.addEventListener('message', this.onWindowMessageListener);

      options.getOption('context-capturing', false).then(val => {
        this.isContextCapturingEnabled = true
      });
    },

    mounted () {
      // The component was mounted after the context-menu-clicked event had been fired,
      // So it needs to request the data again.
      chrome.runtime.sendMessage({ id: 'vue-popup-created' })
          .then(response => {
            this.onRuntimeMessageListener(response);
            parent.postMessage('vue-popup-resized', this.pageUrl);
          });
    },

    beforeDestroy () {
      chrome.runtime.onMessage.removeListener(this.onRuntimeMessageListener);
      window.removeEventListener('message', this.onWindowMessageListener);
    },
  };
</script>

<style>
  .popup {
    padding: 3px;
  }
</style>
