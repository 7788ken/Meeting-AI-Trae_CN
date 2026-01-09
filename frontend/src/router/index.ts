import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MeetingView from '../views/MeetingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/meeting/:id',
      name: 'meeting',
      component: MeetingView,
      props: true
    }
  ]
})

export default router
