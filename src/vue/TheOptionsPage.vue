<template>
  <div class="the-options-page">
    <h2>LeoTranslate Settings</h2>

    <form>
      <h3>Context Capturing</h3>
      <div class="browser-style">
        <input
            id="contextCapturing"
            type="checkbox"
            :checked="options.contextCapturing"
            @change="onContextCapturingChanged"
        >
        <label for="contextCapturing">Enable Context Capturing</label>
      </div>
      <div class="dependent-option browser-style">
        <input
            id="contextAutoTranslate"
            type="checkbox"
            v-model="options.contextAutoTranslate"
            :disabled="!options.contextCapturing"
        >
        <label for="contextAutoTranslate">Translate Context Automatically.</label>
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
        <label for="hoverTranslation">Enable on hover translation for all sites.</label>
      </div>
      <div class="dependent-option browser-style">
        <input
          id="hoverAlt"
          type="checkbox"
          v-model="options.hoverAlt"
        >
        <label for="hoverAlt">Only with Alt key.</label>
      </div>
      <div class="dependent-option browser-style">
        <input
          id="hoverCtrl"
          type="checkbox"
          v-model="options.hoverCtrl"
        >
        <label for="hoverCtrl">Only with Ctrl key.</label>
      </div>
      <div class="dependent-option browser-style">
        <input
          id="hoverShift"
          type="checkbox"
          v-model="options.hoverShift"
        >
        <label for="hoverShift">Only with Shift key.</label>
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

      <h3>Network</h3>
      <div class="browser-style">
        <input
            id="privateMode"
            v-model="options.privateMode"
            type="checkbox"
        >
        <label for="privateMode">Enable Private Mode (do not send title and URL to LinguaLeo.com).</label>
      </div>
    </form>
  </div>
</template>

<script>
  import options from '../storage/options';
  import hoverExcluded from '../storage/hoverExcluded';
  import { PROXY_ALL_CONTENT_REFRESH_OPTIONS } from '../messages';

  export default {
    data () {
      return {
        options: {
          contextCapturing:     null,
          doubleClick:          null,
          doubleClickCtrl:      null,
          doubleClickAlt:       null,
          doubleClickMeta:      null,
          hoverTranslation:     null,
          hoverTimeout:         null,
          hoverAlt:             null,
          hoverCtrl:            null,
          hoverShift:           null,
          theme:                null,
          audioAutoPlay:        null,
          contextAutoTranslate: null,
          privateMode:          null
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

      onContextCapturingChanged (e) {
        const values = {
          contextCapturing: e.target.checked
        };

        if (! e.target.checked) {
          values['contextAutoTranslate'] = false;
        }

        this.options = Object.assign({}, this.options, values);
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
        hoverExcluded.clear().then(() => this.options.hoverTranslation = e.target.checked);
      }
    }
  };
</script>

<style scoped>
  select {
    margin-top: 8px;
  }

  .dependent-option {
    padding-left: 10px;
  }
</style>
