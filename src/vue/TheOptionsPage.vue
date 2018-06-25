<template>
  <div class="the-options-page">
    <h2>LeoTranslate Settings</h2>

    <form>
      <h3>Context Capturing</h3>
      <div class="browser-style">
        <input
            id="contextCapturing"
            v-model="options.contextCapturing"
            type="checkbox"
        >
        <label for="contextCapturing">Enable Context Capturing</label>
      </div>

      <h3>Double Click Translation</h3>
      <div class="browser-style">
        <input
            id="doubleClick"
            type="checkbox"
            :checked="options.doubleClick"
            @change="onDoubleClickChanged"
        >
        <label for="doubleClick">Double click to translate</label>
      </div>
      <div class="dependent-option browser-style">
        <input
            id="doubleClickCtrl"
            v-model="options.doubleClickCtrl"
            type="checkbox"
            :disabled="!options.doubleClick"
        >
        <label for="doubleClickCtrl">Only with Ctrl key.</label>
      </div>
      <div class="dependent-option browser-style">
        <input
            id="doubleClickAlt"
            v-model="options.doubleClickAlt"
            type="checkbox"
            :disabled="!options.doubleClick"
        >
        <label for="doubleClickAlt">Only with Alt key.</label>
      </div>
      <div class="dependent-option browser-style">
        <input
            id="doubleClickMeta"
            v-model="options.doubleClickMeta"
            type="checkbox"
            :disabled="!options.doubleClick"
        >
        <label for="doubleClickMeta">Only with Cmd (OSX) or Windows key.</label>
      </div>

      <h3>Mouse Hover Translation</h3>
      <div class="browser-style">
        <input
          id="hoverTranslation"
          type="checkbox"
          :checked="options.hoverTranslation"
          @change="onHoverTranslationChanged"
        >
        <label for="hoverTranslation">Enable on hover translation for all sites</label>
      </div>
      <label>
        Timeout (ms)<br>
        <select class="browser-style" v-model="options.hoverTimeout">
          <option v-for="num in timeouts" :value="num">{{ num }}</option>
        </select>
      </label>

      <h3>Appearance</h3>
      <label>
        Theme<br>
        <select class="browser-style" v-model="options.theme">
          <option value="leo-translate">LeoTranslate</option>
          <option value="blackberry">Blackberry</option>
        </select>
      </label>

      <h3>Audio</h3>
      <div class="browser-style">
        <input
            id="audioAutoPlay"
            v-model="options.audioAutoPlay"
            type="checkbox"
        >
        <label for="audioAutoPlay">Play audio automatically.</label>
      </div>
    </form>
  </div>
</template>

<script>
  import options from '../options';
  import { PROXY_ALL_CONTENT_REFRESH_OPTIONS } from '../messages';

  export default {
    data () {
      return {
        options: {
          contextCapturing: null,
          doubleClick:      null,
          doubleClickCtrl:  null,
          doubleClickAlt:   null,
          doubleClickMeta:  null,
          hoverTranslation: null,
          hoverTimeout:     null,
          hoverExclude:     [],
          theme:            null,
          audioAutoPlay:    null
        },
      };
    },

    computed: {
      timeouts () {
        return [ ...Array(50).keys() ].map(num => (num + 1) * 100);
      }
    },

    watch: {
      options: {
        handler () {
          this.saveOptions();
        },
        deep: true
      }
    },

    created () {
      this.loadOptions();
    },

    methods: {
      // Save settings and notify all content scripts that settings have been changed.
      saveOptions () {
        options.setAllOptions(this.options).then(function () {
          chrome.runtime.sendMessage({ id: PROXY_ALL_CONTENT_REFRESH_OPTIONS });
        });
      },

      loadOptions () {
        options.getAllOptions().then(options => this.options = options);
      },

      // Set dependent options to false
      onDoubleClickChanged (e) {
        const values = {
          doubleClick: e.target.checked
        };

        // Set dependent options to false
        if (! e.target.checked) {
          values['doubleClickAlt'] = false;
          values['doubleClickCtrl'] = false;
          values['doubleClickMeta'] = false;
        }

        this.options = Object.assign({}, this.options, values);
      },

      // Clear excluded sites list if hoverTranslation was changed
      onHoverTranslationChanged (e) {
        this.options = Object.assign({}, this.options, {
          hoverTranslation: e.target.checked,
          hoverExclude: []
        });
      }
    }
  };
</script>

<style>
  label {
    display: block;
  }

  .dependent-option {
    padding-left: 10px;
  }
</style>
