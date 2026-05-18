import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

import HomePage from '../views/HomePage.vue';
import SOSPage from '../views/SOSPage.vue';
import LoginPage from '../views/LoginPage.vue';
import ProfilePage from '../views/ProfilePage.vue';
import IntegrationsPage from '../views/IntegrationsPage.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/home', name: 'Home', component: HomePage },
  { path: '/profile', name: 'Profile', component: ProfilePage },
  { path: '/integrations', name: 'Integrations', component: IntegrationsPage },
  { path: '/sos', name: 'SOS', component: SOSPage }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router