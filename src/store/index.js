import Vue from "vue";
import Vuex from "vuex";

import {
  state as stateMap,
  getters as gettersMap,
  mutations as mutationsMap,
  actions as actionsMap
} from "./MapStore";

import {
  state as stateAuth,
  getters as gettersAuth,
  mutations as mutationsAuth,
  actions as actionsAuth
} from "./AuthStore";

Vue.use(Vuex);
window.state =
  process.env.NODE_ENV === "development" ? { stateMap, stateAuth } : null;

const store = new Vuex.Store({
  strict: false, //process.env.NODE_ENV !== 'production',
  modules: {
    MapStore: {
      state: stateMap,
      getters: gettersMap,
      mutations: mutationsMap,
      actions: actionsMap
    },
    AuthStore: {
      state: stateAuth,
      getters: gettersAuth,
      mutations: mutationsAuth,
      actions: actionsAuth
    }
  }
});

export { store };
