import { createRouter, createWebHistory } from 'vue-router'
import TerritoryMapView from '../views/TerritoryMapView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'territory-map',
      component: TerritoryMapView,
    },
  ],
})

export default router
