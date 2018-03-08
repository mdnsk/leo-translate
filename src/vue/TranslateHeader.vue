<template>
  <div class="translate-header">
    <div class="translate-header__controls">
      <button
              v-if="showRefresh"
              class="translate-header__btn translate-header__btn-refresh"
              @click="$emit('refresh')"
      >
        Refresh
      </button>
      <button
          :class="{
            'translate-header__btn': true,
            'translate-header__btn-play': true,
            'translate-header__btn-play_playing': isPlaying
          }"
          @click="play"
      >
        Play
      </button>
      <button
          class="translate-header__btn translate-header__btn-close"
          @click="$emit('close')"
      >
        X
      </button>
      <audio
          id="translatePlayer"
          :src="soundUrl"
          type="audio/mpeg"
          preload="none"
      ></audio>
    </div>
    <div class="translate-header__content">
      <h1 class="translate-header__text">{{ text }}</h1>
      <div v-if="transcription" class="translate-header__transcription">[{{ transcription }}]</div>
    </div>
  </div>
</template>

<script>
  import options from '../options';

  export default {
    props: {
      text: String,
      transcription: String,
      soundUrl: String,
      showRefresh: {
        type: Boolean,
        default: false
      }
    },

    data () {
      return {
        isPlaying: false,
        isAutoPlayEnabled: false
      };
    },

    watch: {
      soundUrl (url) {
        if (url !== '' && this.isAutoPlayEnabled) {
          this.$nextTick(this.play);
        }
      }
    },

    created () {
      options.getOption('audioAutoPlay').then(val => this.isAutoPlayEnabled = val);
    },

    mounted () {
      const player = this.player();

      player.addEventListener('play', this.onPlayerPlay);
      player.addEventListener('ended', this.onPlayerEnded);
    },

    beforeDestroy () {
      const player = this.player();

      player.removeEventListener('ended', this.onPlayerEnded);
      player.removeEventListener('play', this.onPlayerPlay);
    },

    methods: {
      play () {
        this.player().play();
      },

      player () {
        return document.getElementById('translatePlayer');
      },

      onPlayerPlay () {
        this.isPlaying = true;
      },

      onPlayerEnded () {
        this.isPlaying = false;
      }
    }
  };
</script>
