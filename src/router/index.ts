import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Timeline from '@/views/Timeline.vue'
import Hypotheses from '@/views/Hypotheses.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: Timeline,
    },
    {
      path: '/hypotheses',
      name: 'hypotheses',
      component: Hypotheses,
    },
  ],
})

export default router
