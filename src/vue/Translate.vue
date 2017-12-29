<template>
  <div class="translate">
    <div class="translate__header">
      <h1 class="translate__text">{{ text }}</h1>
      <button class="translate__btn translate__btn-play" @click="play">Play</button>
      <button class="translate__btn translate__btn-close" @click="close">X</button>
    </div>
    <div v-if="loading" class="translate__loading">
      Loading...
    </div>
    <div v-else-if="errorMessage !== ''" class="translate__error">
      {{ errorMessage }}
    </div>
    <div v-else class="translate__body">
      <div class="translate__meta">
        <div v-if="transcription" class="translate__transcription">[{{ transcription }}]</div>
        <div v-if="dictionaryForm" class="translate__base-form">
          Dictionary form:
          <a class="translate__base-form-link"
             href="javascript:void(0)"
             @click.prevent="translate(wordForms[0].word)">
            {{ dictionaryForm }}
          </a>
        </div>
      </div>
      <ul class="translate__list">
        <li class="translate__item"
            v-for="trans in translations"
            @click.prevent="addToDictionary(trans.value)"
            title="Add this meaning to the dictionary.">
          <div class="translate__rating" :style="{width: trans.rating+'%'}"></div>
          {{ trans.value }}
        </li>
      </ul>
    </div>
    <div v-if="context !== ''" class="translate__context-container">
      <div class="translate__context-controls">
        <button @click="toggleTranslatedContext" class="button-link">
          {{ showTranslatedContext ? 'Show origin' : 'Translate context' }}
        </button>
      </div>
      <div v-show="context !== '' || translatedContext !== ''" class="translate__context-content">
        {{ showTranslatedContext ? translatedContext : context }}
      </div>
    </div>
    <audio id="translatePlayer" type="audio/mpeg" :src="soundUrl" preload="none"></audio>
  </div>
</template>

<script>
  import api from '../leoApi';
  import history from '../history';
  import options from '../options';
  import { BACKGROUND_SHOW_NOTIFICATION } from '../messages';

  export default {
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
        translatedContext: '',

        // Element states
        loading: true,
        showTranslatedContext: false
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

    methods: {
      addToDictionary (translation) {
        api.addWordToDictionary(this.text, translation, this.pageUrl, this.pageTitle, this.context).then(data => {
          if (data.error_msg === '') {
            chrome.runtime.sendMessage({
              id: BACKGROUND_SHOW_NOTIFICATION,
              text: 'The "' + this.text + '" word has been added!'
            });

            history.addWord(this.text);
          }
        });
      },

      fetchTranslation () {
        this.loading = true;
        api.getTranslations(this.text).then(data => {
          if (data.error_msg === '') {
            this.translations = this.calcRating(data.translate);
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
          this.loading = false;
          this.$emit('resized');
        }).catch(error => {
          this.laoding = false;
          this.$emit('resized');
          console.error(error);
        });
      },

      calcRating (translations) {
        let max = 0;
        let min = 0;

        translations.forEach(item => {
            if (item.votes > max) {
              max = item.votes;
            }
            if (item.votes < min || min === 0) {
              min = item.votes;
            }
          });

        return translations.map(item => {
            if (max === 0 && min === 0 || min >= max) {
              item.rating = 0;
            } else {
              item.rating = 100 / (max - min) * (item.votes - min);
            }

            return item;
          });
      },

      play () {
        document.getElementById('translatePlayer').play();
      },

      close () {
        this.$emit('close');
      },

      translate (text) {
        this.$emit('translate', text);
      },

      toggleTranslatedContext () {
        if (! this.showTranslatedContext) {
          if (this.translatedContext === '') {
            this.translatedContext = 'Loading...';
            api.translateSentence(this.context, 'en', 'ru').then(data => this.translatedContext = data.translation);
          }
          if (! this.showContext) {
            this.showContext = true;
          }
        }

        this.showTranslatedContext = !this.showTranslatedContext;
      }
    },

    watch: {
      text (text) {
        if (text !== '') {
          this.fetchTranslation();
        }
      },

      loading () {
        this.$emit('resized');
      },

      showTranslatedContext () {
        this.$emit('resized');
      },

      // Clear the translated context if the context has been updated
      context () {
        this.translatedContext = '';
        this.showTranslatedContext = false;
      },

      translatedContext () {
        this.$emit('resized');
      }
    }
  }
</script>

<style>
  @import "../assets/style.css";

  .translate {
    background-color: #fff;
    border: #d7d7db 1px solid;
  }

  .translate__header {
    display: flex;
    justify-content: flex-end;
  }

  .translate__meta {
    display: flex;
  }

  .translate__text {
    margin: 3px auto 3px 0;
    word-break: break-all;
  }

  .translate__transcription {
    margin-right: 5px;
    word-wrap: break-word;
  }

  .translate__base-form-link {
    text-decoration: none;
    display: inline-block;
    border-bottom: 1px dotted;
  }

  .translate__list, .translate__loading, .translate__error {
    padding: 10px 0;
    margin: 0;
  }

  .translate__item {
    display: block;
    margin: 0;
    padding: 2px 5px;
    border-top: 1px solid #fff;
    border-bottom: 1px solid #fff;
    position: relative;
    cursor: pointer;
    word-wrap: break-word;
  }

  .translate__rating {
    width: 0;
    height: 2px;
    position: absolute;
    top: -1px;
    left: 0;
    background-color: #30e60b;
  }

  .translate__list:hover .translate__rating {
    display: none;
  }

  .translate__btn {
    border: solid 1px #fff;
    background-color: #fff;
    outline-color: #fff;
  }

  .translate__item:hover, .translate__btn:hover {
    background-color: #ededf0;
    border-color: #b1b1b3;
  }

  .translate__context-controls {
    border-top: 1px solid #ccc;
    text-align: center;
  }

  .translate__context-content {
    margin-top: 3px;
  }

</style>
