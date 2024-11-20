import { createRouter, createWebHistory } from 'vue-router'
import ServiceList from '@/components/ServiceList.vue'
import BookingForm from '@/components/BookingForm.vue'
import PaymentForm from '@/components/PaymentForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'services',
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
  ],
})

export default router
