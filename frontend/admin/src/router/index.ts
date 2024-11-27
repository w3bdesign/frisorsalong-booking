import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/bookings",
    name: "Bookings",
    component: () => import("../views/BookingsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    name: "Orders",
    component: () => import("../views/OrdersView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/employees",
    name: "Employees",
    component: () => import("../views/EmployeesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    redirect: "/dashboard",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth) {
    const isAuthenticated = await authStore.checkAuth();
    if (!isAuthenticated && to.name !== "Login") {
      next({ name: "Login" });
      return;
    }
  }

  if (to.name === "Login" && authStore.isAuthenticated) {
    next({ name: "Dashboard" });
    return;
  }

  next();
});

export default router;
