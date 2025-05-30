import { createRouter, createWebHistory } from 'vue-router';
import type { Router as _Router, RouteRecordRaw } from 'vue-router';
// import { ACTION } from '../services/stream/StreamConnection';
import AndroidDevice from '../components/android/AndroidDevice.vue';

import StreamH264Converter from '../views/StreamH264Converter.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: AndroidDevice
  },
  {
    path: '/stream/:udid',
    name: 'stream',
    component: StreamH264Converter,
    props: (route) => ({
      udid: route.params.udid,
      ws: route.query.ws as string,
      playerName: route.query.player as string
    })
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
}) as _Router;

export default router;