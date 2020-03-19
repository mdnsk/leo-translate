<template>
  <div class="translate">
    <TranslateHeader
        :text="text"
        :transcription="transcription"
        :sound-url="soundUrl"
        :show-refresh="inFrame"
        @close="$emit('close')"
        @refresh="$emit('refresh')"
    />
    <div
        v-if="!translations.length && errorMessage === ''"
        class="translate__loading"
    >
      Loading...
    </div>
    <div
      v-if="errorMessage === 'Target language not found' && !isListLoading"
      class="translate__error"
    >
      <strong>Ошибка</strong>
      <p>
        Пожалуйста, авторизуйтесь на сайте
        <a href="https://lingualeo.com" target="_blank">lingualeo.com</a>
      </p>
    </div>
    <div
        v-else-if="errorMessage !== '' && !isListLoading"
        class="translate__error"
    >
      {{ errorMessage }}
    </div>
    <div
        v-else
        class="translate__body"
    >
      <div
          v-if="dictionaryForm"
          class="translate__base-form"
      >
        Dictionary form:
        <a
            class="translate__base-form-link"
            href="javascript:void(0)"
            @click.prevent="translate(wordForms[0].word)"
        >
          {{ dictionaryForm }}
        </a>
      </div>
      <TranslateList
          :translations="translations"
          :is-loading="isMeaningAdding || isListLoading"
          @add-meaning="onAddMeaningListener"
      />
    </div>
    <TranslateContext
        :context="context"
        @resize="$emit('resize')"
    />
  </div>
</template>

<script>
  import api from '../leoApi';
  import history from '../storage/history';
  import options from '../storage/options';
  import TranslateList from './TranslateList.vue';
  import TranslateHeader from './TranslateHeader.vue';
  import TranslateContext from './TranslateContext.vue';
  import {
      PROXY_CONTENT_CLOSE_POPUP,
      BACKGROUND_SHOW_NOTIFICATION,
      PROXY_ALL_CONTENT_REFRESH_OPTIONS
  } from '../messages';

  export default {
    components: {
      TranslateList,
      TranslateHeader,
      TranslateContext
    },

    props: {
      text: String,
      pageUrl: String,
      pageTitle: String,
      context: {
        type: String,
        default: ''
      },

      // is the component inside of iFrame?
      inFrame: {
        type: Boolean,
        default: false
      }
    },

    data () {
      return {
        // Data
        transcription: '',
        translations: [],
        wordForms: [],
        soundUrl: '',
        errorMessage: '',

        // Element states
        isListLoading: true,
        isMeaningAdding: false,

        // Options
        privateMode: true,
      };
    },

    computed: {
      dictionaryForm () {
        if (this.wordForms && this.wordForms.length > 0) {
          const dictionaryForm = this.wordForms[0].word;
          const text = this.text.toLowerCase();

          if (dictionaryForm !== text) {
            return dictionaryForm;
          }
        }

        return '';
      }
    },

    watch: {
      text (text) {
        if (text !== '') {
          this.fetchTranslation();
        }
      },

      isListLoading (isLoading) {
        if (!isLoading) {
          this.$emit('resize');
        }
      }
    },

    created () {
      chrome.runtime.onMessage.addListener(this.onRuntimeMessageListener);

      this.loadOptions();
    },

    beforeDestroy () {
      chrome.runtime.onMessage.removeListener(this.onRuntimeMessageListener);
    },

    methods: {
      addToDictionary (translation) {
        const pageUrl = this.privateMode ? '' : this.pageUrl;
        const pageTitle = this.privateMode ? '' : this.pageTitle;

        return api.addWordToDictionary(this.text, translation, pageUrl, pageTitle, this.context)
          .then(data => {
            let notification = '';

            if (Object.keys(data).length === 0 || data.error_msg === '') {
              notification = `The "${this.text}" word has been added!`;
              history.addWord(this.text, translation, this.soundUrl);
            } else {
              notification = `An error message received: ${data.error_msg}`;
            }

            chrome.runtime.sendMessage({
              id: BACKGROUND_SHOW_NOTIFICATION,
              text: notification
            });

            return data;
          });
      },

      fetchTranslation () {
        this.isListLoading = true;
        api.getTranslations(this.text).then(data => {
          if (data.error_msg === '') {
            this.translations = data.translate;
            this.soundUrl = data.sound_url;
            this.transcription = data.transcription;
            this.wordForms = data.word_forms;
            this.errorMessage = '';
          } else {
            this.translations = [];
            this.soundUrl = '';
            this.transcription = '';
            this.wordForms = [];
            this.errorMessage = data.error_msg;
          }
          this.isListLoading = false;
          this.$emit('resize');
        }).catch(error => {
          this.laoding = false;
          this.$emit('resize');
          console.error(error);
        });
      },

      loadOptions() {
        options.getOption('privateMode').then(value => {
          this.privateMode = value;
        });
      },

      translate (text) {
        this.$emit('translate', text);
      },

      onAddMeaningListener (meaning) {
        const trimmedMeaning = meaning.trim();

        if (trimmedMeaning.length > 0) {
          this.isMeaningAdding = true;

          this.addToDictionary(trimmedMeaning).then(() => {
            this.isMeaningAdding = false;
          });
        }
      },

      onRuntimeMessageListener (message) {
        if (message.id === PROXY_CONTENT_CLOSE_POPUP) {
          this.isMeaningAdding = false;
        }

        if (message.id === PROXY_ALL_CONTENT_REFRESH_OPTIONS) {
          this.loadOptions();
        }
      }
    }
  }
</script>

<style lang="scss">
  .theme-leo-translate {
    @import "../assets/themes/leo-translate/style.scss";
    @import "../assets/themes/leo-translate/popup.scss";
  }

  .theme-blackberry {
    @import "../assets/themes/blackberry/style.scss";
    @import "../assets/themes/blackberry/popup.scss";
  }

  .theme-blueberry {
    @import "../assets/themes/blueberry/style.scss";
    @import "../assets/themes/blueberry/popup.scss";
  }
</style>
