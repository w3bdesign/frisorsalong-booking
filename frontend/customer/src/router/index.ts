import { createRouter, createWebHistory } from 'vue-router'
import ServiceList from '@/components/ServiceList.vue'
import BookingForm from '@/components/BookingForm.vue'
import PaymentForm from '@/components/PaymentForm.vue'
import TVDisplayView from '@/views/TVDisplayView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ServiceList,
    },
    {
      path: '/booking',
      name: 'booking',
      component: BookingForm,
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentForm,
    },
    {
      path: '/tv-display',
      name: 'tv-display',
      component: TVDisplayView,
    },
  ],
})

export default router
