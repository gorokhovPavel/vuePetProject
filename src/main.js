import Vue    from 'vue'
import App    from './App.vue'

import Vuex   from 'vuex'
import store  from 'store/mainStore'
import router from 'route/routeWays'

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import 'material-design-icons/iconfont/material-icons.css'

import lang from 'vuejs-localization';
lang.requireAll(require.context('./language', true, /\.js$/));

import promisePol from 'promise-polyfill'
import 'babel-polyfill'

import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

import 'Content/styles/optionStyle.scss'

Vue.use( lang );
Vue.use( VueMaterial, Vuex, promisePol );

new Vue({

  el: '#app',
  router,
  store,
  PulseLoader,
  render: h => h(App)
})