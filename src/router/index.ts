import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Hypotheses from '@/views/Hypotheses.vue'
import HealthLog from '@/views/HealthLog.vue'
import Appointments from '@/views/Appointments.vue'

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
      redirect: '/',
    },
    {
      path: '/hypotheses',
      name: 'hypotheses',
      component: Hypotheses,
    },
    {
      path: '/journal',
      name: 'journal',
      component: HealthLog,
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: Appointments,
    },
  ],
})

export default router
