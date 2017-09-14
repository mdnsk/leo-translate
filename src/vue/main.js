import Vue from 'vue';
import ContextPopup from './ContextPopup.vue';
import BrowserAction from './BrowserAction.vue';

new Vue({
  el: '#browser-action',
  render: h => h(BrowserAction)
});

new Vue({
  el: '#context-popup',
  render: h => h(ContextPopup)
});
