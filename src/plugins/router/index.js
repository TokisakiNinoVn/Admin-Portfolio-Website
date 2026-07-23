import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  const publicPaths = ['/login', '/register', '/forgot-password']
  const isPublic = publicPaths.includes(to.path)

  if (!isLoggedIn && !isPublic) {
    console.log('User not authenticated, redirecting to login');
    return next('/login')
  }

  next()
})

export default function (app) {
  app.use(router)
}

export { router }

