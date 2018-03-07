<template>
  <div class="translate">
    <TranslateHeader
        :text="text"
        :sound-url="soundUrl"
        @close="$emit('close')"
    />
    <div
        v-if="isListLoading"
        class="translate__loading"
    >
      Loading...
    </div>
    <div
        v-else-if="errorMessage !== ''"
        class="translate__error"
    >
      {{ errorMessage }}
    </div>
    <div
        v-else
        class="translate__body"
    >
      <div class="translate__meta">
        <div
            v-if="transcription"
            class="translate__transcription"
        >
          [{{ transcription }}]
        </div>
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
      </div>
      <TranslateList
          :translations="translations"
          :is-meaning-adding="isMeaningAdding"
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
  import history from '../history';
  import TranslateList from './TranslateList.vue';
  import TranslateHeader from './TranslateHeader.vue';
  import TranslateContext from './TranslateContext.vue';
  import {
      PROXY_CONTENT_CLOSE_POPUP,
      BACKGROUND_SHOW_NOTIFICATION
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
        isMeaningAdding: false
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

      isListLoading () {
        this.$emit('resize');
      }
    },

    created () {
      chrome.runtime.onMessage.addListener(this.onRuntimeMessageListener);
    },

    beforeDestroy () {
      chrome.runtime.onMessage.removeListener(this.onRuntimeMessageListener);
    },

    methods: {
      addToDictionary (translation) {
        return api.addWordToDictionary(this.text, translation, this.pageUrl, this.pageTitle, this.context)
          .then(data => {
            let notification = '';

            if (data.error_msg === '') {
              notification = 'The "'+this.text+'" word has been added!';
              history.addWord(this.text, translation, this.soundUrl);
            } else {
              notification = 'An error message received: '+data.error_msg;
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
      }
    }
  }
</script>

<style lang="scss">
  .theme-leo-translate {
    @import "../assets/themes/leo-translate/style.scss";
    @import "../assets/themes/leo-translate/popup.scss";
  }
</style>
