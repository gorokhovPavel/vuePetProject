import Vue from 'vue';
import VueRouter from 'vue-router';
import PageA from '../views/PageA';
import PageB from '../views/PageB';
import NotFoundPage from '../views/NotFoundPage';

Vue.use(VueRouter);

export const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
     {
      path: '*',
      redirect: '/unknown'
    },
    {
      path: '/page-b',
      component: PageB,
    },
     {
      path: '/page-a',
      component: PageA,
    },
     {
      path: '/page-unknown',
      component: NotFoundPage,
    },
  ],
});
