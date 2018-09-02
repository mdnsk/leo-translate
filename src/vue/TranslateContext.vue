<template>
  <div
      v-if="context !== ''"
      class="translate-context"
  >
    <div class="translate-context__controls">
      <button
          class="button-link"
          @click="toggleTranslatedContext"
      >
        {{ showTranslatedContext ? 'Show origin' : 'Translate context' }}
      </button>
    </div>
    <div class="translate-context__content">
      {{ showTranslatedContext ? translatedContext : context }}
    </div>
  </div>
</template>

<script>
  import api from '../leoApi';
  import options from '../storage/options';

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

        options.getOption('contextAutoTranslate').then(val => val && this.toggleTranslatedContext());
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
