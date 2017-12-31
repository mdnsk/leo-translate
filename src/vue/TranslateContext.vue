<template>
  <div
      v-if="context !== ''"
      class="translate__context-container"
  >
    <div class="translate__context-controls">
      <button
          class="button-link"
          @click="toggleTranslatedContext"
      >
        {{ showTranslatedContext ? 'Show origin' : 'Translate context' }}
      </button>
    </div>
    <div class="translate__context-content">
      {{ showTranslatedContext ? translatedContext : context }}
    </div>
  </div>
</template>

<script>
  import api from '../leoApi';

  export default {
    props: {
      context: String
    },

    data () {
      return {
        showTranslatedContext: false,
        translatedContext: '',
      };
    },

    watch: {
      context () {
        this.translatedContext = '';
        this.showTranslatedContext = false;
      }
    },

    created () {
      this.$watch(
          vm => [vm.showTranslatedContext, vm.translatedContext].join(),
          val => this.$emit('resize')
      );
    },

    methods: {
      toggleTranslatedContext () {
        if (! this.showTranslatedContext && this.translatedContext === '') {
          this.translatedContext = 'Loading...';

          api.translateSentence(this.context, 'en', 'ru')
              .then(data => this.translatedContext = data.translation);
        }

        this.showTranslatedContext = !this.showTranslatedContext;
      }
    }
  };
</script>
