import Vue  from 'vue';
import Vuex from 'vuex';

import stateMap     from './mapStore/stateMap';
import gettersMap   from './mapStore/gettersMap';
import mutationsMap from './mapStore/mutationsMap';
import actionsMap   from './mapStore/actionsMap';

import stateAuth     from './authStore/stateAuth';
import gettersAuth   from './authStore/gettersAuth';
import mutationsAuth from './authStore/mutationsAuth';
import actionsAuth   from './authStore/actionsAuth';

Vue.use(Vuex)

export default new Vuex.Store({

  strict : false,  //process.env.NODE_ENV !== 'production',

  modules : {

    mapStore : {

      state     : stateMap,
      getters   : gettersMap,
      mutations : mutationsMap,
      actions   : actionsMap
    },

    authStore : {

      state     : stateAuth,
      getters   : gettersAuth,
      mutations : mutationsAuth,
      actions   : actionsAuth
    }
  }
})