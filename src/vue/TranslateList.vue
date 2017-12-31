<template>
  <div class="translate__list-container">
    <ul class="translate__list">
      <li
          v-for="trans in translationsWithRating" :key="trans.id"
          class="translate__item translate__meaning"
          title="Add this meaning to the dictionary."
          @click="$emit('add-meaning', trans.value)"
      >
        <div
            class="translate__rating"
            :style="{width: trans.rating+'%'}"
        ></div>
        {{ trans.value }}
      </li>
      <li class="translate__item">
        <input
            class="translate__add-meaning"
            type="text"
            placeholder="Type meaning and press Enter to send"
            @keyup.enter="onEnterMeaningListener"
        >
      </li>
    </ul>

    <div
        v-if="isMeaningAdding"
        class="translate__list-overlay"
    >
      <HollowDotsSpinner
          :animation-duration="500"
          :dot-size="23"
          :dots-num="5"
          color="#30e60b"
      />
    </div>
  </div>
</template>

<script>
  import HollowDotsSpinner from 'epic-spinners/src/components/lib/HollowDotsSpinner.vue';

  export default {
    components: {
      HollowDotsSpinner
    },

    props: {
      translations: {
        type: Array,
        required: true
      },
      isMeaningAdding: {
        type: Boolean,
        required: true
      }
    },

    computed: {
      translationsWithRating () {
        let max = 0;
        let min = 0;

        this.translations.forEach(item => {
          if (item.votes > max) {
            max = item.votes;
          }
          if (item.votes < min || min === 0) {
            min = item.votes;
          }
        });

        return this.translations.map(item => {
          item.rating = (max === 0 && min === 0 || min >= max) ? 0 : 100 / (max - min) * (item.votes - min);

          return item;
        });
      }
    },

    methods: {
      onEnterMeaningListener (event) {
        this.$emit('add-meaning', event.target.value);
        event.target.value = '';
      }
    }
  };
</script>
