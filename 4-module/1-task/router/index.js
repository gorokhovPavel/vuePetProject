import VueRouter from 'vue-router';
import { routes } from './routes';

const router = new VueRouter({
  mode: 'history',
  base: '4-module-1-task',
  routes,
});

export default router;
