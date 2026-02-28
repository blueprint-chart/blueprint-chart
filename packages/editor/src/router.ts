import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/Home/HomePage.vue'
import WizardShell from '@/components/Wizard/WizardShell.vue'
import { useChartSession } from '@/composables/useChartSession'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/new',
      component: WizardShell,
      beforeEnter: () => {
        const { prepareNew } = useChartSession()
        prepareNew()
      },
    },
    {
      path: '/edit/:id',
      component: WizardShell,
      beforeEnter: (to) => {
        const { loadChart, startAutoSave } = useChartSession()
        const found = loadChart(to.params.id as string)
        if (!found) {
          return '/'
        }
        startAutoSave()
      },
    },
  ],
})

export default router
