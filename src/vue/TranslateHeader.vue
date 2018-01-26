<template>
  <div class="translate-header">
    <h1 class="translate-header__text">{{ text }}</h1>
    <button
        class="translate-header__btn translate-header__btn_play"
        @click="play"
    >
      Play
    </button>
    <button
        class="translate-header__btn translate-header__btn_close"
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
  export default {
    props: {
      text: String,
      soundUrl: String
    },

    methods: {
      play () {
        document.getElementById('translatePlayer').play();
      }
    }
  };
</script>
