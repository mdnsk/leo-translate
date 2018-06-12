<template>
  <div class="the-options-page">
    <h2>LeoTranslate Settings</h2>

    <form>
      <h3>Context Capturing</h3>
      <label>
        <input
            name="context-capturing"
            v-model="options.contextCapturing"
            type="checkbox"
        >
        Enable Context Capturing (This is an experimental feature)
      </label>

      <h3>Double Click Translation</h3>
      <label>
        <input
            name="double-click"
            v-model="options.doubleClick"
            type="checkbox"
        >
        Double click to translate
      </label>
      <label class="dependent-option">
        <input
            name="double-click-ctrl"
            v-model="options.doubleClickCtrl"
            type="checkbox"
            :disabled="!options.doubleClick"
        >
        Only with Ctrl key.
      </label>
      <label class="dependent-option">
        <input
            name="double-click-alt"
            v-model="options.doubleClickAlt"
            type="checkbox"
            :disabled="!options.doubleClick"
        >
        Only with Alt key.
      </label>
      <label class="dependent-option">
        <input
            name="double-click-meta"
            v-model="options.doubleClickMeta"
            type="checkbox"
            :disabled="!options.doubleClick"
        >
        Only with Cmd (OSX) or Windows key.
      </label>

      <h3>Appearance</h3>
      <label>
        Theme
        <select name="theme" v-model="options.theme">
          <option value="leo-translate">LeoTranslate</option>
          <option value="blackberry">Blackberry</option>
        </select>
      </label>

      <h3>Audio</h3>
      <label>
        <input
                name="audio-auto-play"
                v-model="options.audioAutoPlay"
                type="checkbox"
        >
        Play audio automatically.
      </label>
    </form>
  </div>
</template>

<script>
  import options from '../options';

  export default {
    data () {
      return {
        options: {
          contextCapturing: null,
          doubleClick:      null,
          doubleClickCtrl:  null,
          doubleClickAlt:   null,
          doubleClickMeta:  null,
          theme:            null,
          audioAutoPlay:    null
        },
      };
    },

    watch: {
      options: {
        handler () {
          this.saveOptions();
        },
        deep: true
      },

      // Set dependent options to false
      'options.doubleClick': function (val) {
        if (! val) {
          this.options.doubleClickAlt  = false;
          this.options.doubleClickCtrl = false;
          this.options.doubleClickMeta = false;
        }
      }
    },

    created () {
      this.loadOptions();
    },

    methods: {
      saveOptions () {
        options.setAllOptions(this.options);
      },

      loadOptions () {
        options.getAllOptions().then(options => this.options = options);
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
