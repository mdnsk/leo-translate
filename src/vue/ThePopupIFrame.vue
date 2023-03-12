<template>
  <translate
      class="the-popup-iframe"
      :text="text"
      :context="context"
      :page-url="url"
      :in-frame="true"
      @close="close"
      @refresh="refresh"
      @translate="translate"
      @resize="onPopupResizeListener"
  />
</template>

<script>
  import Translate from './Translate.vue';
  import {
    PROXY_CONTENT_GET_DATA,
    PROXY_CONTENT_CLOSE_POPUP,
    PROXY_CONTENT_RESIZE_POPUP,
    PROXY_CONTENT_REFRESH_POPUP
  } from '../messages';

  export default {
    components: { Translate },

    data () {
      return {
        // Data
        url: '',
        text: '',
        context: '',
        frameIndex: -1
      };
    },

    created () {
      window.addEventListener('message', this.onWindowMessageListener);
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

      refresh () {
        chrome.runtime.sendMessage({ id: PROXY_CONTENT_REFRESH_POPUP, frameIndex: this.frameIndex });
      },

      translate (text) {
        this.text = text;
      },

      onPopupResizeListener () {
        this.$nextTick().then(() => {
          chrome.runtime.sendMessage({
            id: PROXY_CONTENT_RESIZE_POPUP,
            height: document.body.scrollHeight
          });
        });
      },

      onWindowMessageListener (message) {
        // The data have been received from content script.
        if (message.data.id === 'content-data') {
          this.url = message.data.url;
          this.text = message.data.text;
          this.context = message.data.context;
          this.frameIndex = message.data.frameIndex;

          this.onPopupResizeListener();
        }
      }
    }
  };
</script>

<style lang="scss">
  .theme-leo-translate {
    .the-popup-iframe {
      padding: 3px;
    }
  }
</style>
