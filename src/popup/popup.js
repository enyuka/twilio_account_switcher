import Vue from 'vue';
import App from './App';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import router from './router';

global.browser = require('webextension-polyfill');
Vue.use(BootstrapVue);

/* eslint-disable no-new */
new Vue({
  el: '#app',

  router,
  render: (h) => h(App),
});
