<template>
  <translate
      class="the-popup-iframe"
      :text="text"
      :context="context"
      :page-url="url"
      :page-title="title"
      @close="close"
      @translate="translate"
      @resized="onPopupResizedListener"
  />
</template>

<script>
  import options from '../options';
  import Translate from './Translate.vue';
  import {
    PROXY_CONTENT_CLOSE_POPUP,
    PROXY_CONTENT_RESIZE_POPUP,
    PROXY_CONTENT_GET_DATA,
    CONTENT_OPEN_POPUP
  } from '../messages';

  export default {
    components: { Translate },

    data () {
      return {
        // Data
        url: '',
        text: '',
        title: '',
        context: '',

        // Options
        isContextCapturingEnabled: false
      };
    },

    created () {
      window.addEventListener('message', this.onWindowMessageListener);

      options.getOption('context-capturing', false).then(val =>this.isContextCapturingEnabled = true);
    },

    mounted () {
      // The component was mounted after the context-menu-clicked event had been fired,
      // So it needs to request the data again.
      chrome.runtime.sendMessage({ id: PROXY_CONTENT_GET_DATA });
    },

    beforeDestroy () {
      window.removeEventListener('message', this.onWindowMessageListener);
    },

    methods: {
      close () {
        chrome.runtime.sendMessage({ id: PROXY_CONTENT_CLOSE_POPUP });
      },

      translate (text) {
        this.text = text;
      },

      onPopupResizedListener () {
        chrome.runtime.sendMessage({ id: PROXY_CONTENT_RESIZE_POPUP });
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
    }
  };
</script>

<style>
  .the-popup-iframe {
    padding: 3px;
  }
</style>
