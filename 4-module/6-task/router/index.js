import Vue from 'vue';
import VueRouter from 'vue-router';
import PageWithQuery from '../views/PageWithQuery';

Vue.use(VueRouter);

export const router = new VueRouter({
  mode: 'history',
  base: '/4-module-6-task',
  routes: [
    {
      path: '/',
      component: PageWithQuery,
    },
  ],
});
