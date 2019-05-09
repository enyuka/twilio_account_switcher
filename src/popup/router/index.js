import Vue from 'vue';
import VueRouter from 'vue-router';

import PageIndex from './pages/Index';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: PageIndex,
    },
  ],
});

export default router;
