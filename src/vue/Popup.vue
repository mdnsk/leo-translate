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
        parent.postMessage({ id: 'vue-translate-close' }, '*');
      },

      translate (text) {
        this.text = text;
      },

      onPopupResizedListener () {
        parent.postMessage({ id: 'vue-popup-resized' }, '*');
      },

      onRuntimeMessageListener (message) {
        // The popup has been called with click in context menu item.
        // So it needs to get the data.
        if (message.id === 'context-menu-clicked') {
          parent.postMessage({ id: 'vue-popup-get-data' }, '*');
        }
      },

      onWindowMessageListener (message) {
        // The data have been received from content script.
        if (message.data.id === 'content-data') {
          this.url = message.data.url;
          this.text = message.data.text;
          this.title = message.data.title;

          if (this.isContextCapturingEnabled) {
            this.context = message.data.context;
          }

          this.onPopupResizedListener();
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
      parent.postMessage({ id: 'vue-popup-get-data' }, '*');
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
