<template>
  <div class="translate__header">
    <h1 class="translate__text">{{ text }}</h1>
    <button
        class="translate__btn translate__btn-play"
        @click="play"
    >
      Play
    </button>
    <button
        class="translate__btn translate__btn-close"
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
