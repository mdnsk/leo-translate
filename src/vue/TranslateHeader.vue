<template>
  <div class="translate-header">
    <h1 class="translate-header__text">{{ text }}</h1>
    <button
        :class="{ 'translate-header__btn': true, 'translate-header__btn_playing': isPlaying }"
        @click="play"
    >
      Play
    </button>
    <button
        class="translate-header__btn"
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
</template>

<script>
  import options from '../options';

  export default {
    props: {
      text: String,
      soundUrl: String
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
