export const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('@/pages/dashboard.vue'),
      },
      {
        path: 'categories-skill',
        component: () => import('@/pages/categories-skill/index.vue'),
      },
      {
        path: 'skills',
        component: () => import('@/pages/skills/index.vue'),
      },
      {
        path: 'friends',
        component: () => import('@/pages/friends/index.vue'),
      },
      {
        path: 'curriculum-vitae',
        component: () => import('@/pages/curriculum-vitae/index.vue'),
      },
      {
        path: 'app-settings',
        component: () => import('@/pages/app-settings/index.vue'),
      },
      
      // {
      //   path: 'campaigns',
      //   component: () => import('@/pages/campaign/index.vue'),
      //   children: [
      //     {
      //       path: ':campaignId/papers',
      //       name: 'campaign-papers',
      //       component: () => import('@/pages/campaign/papers/index.vue'),
      //     },
      //   ],
      // },
      // {
      //   path: 'campaigns/:campaignId/papers',
      //   name: 'campaign-papers',
      //   component: () => import('@/pages/papers/index.vue'),
      // },
      


      
      {
        path: 'typography',
        component: () => import('@/pages/typography.vue'),
      },
      {
        path: 'icons',
        component: () => import('@/pages/icons.vue'),
      },
      {
        path: 'cards',
        component: () => import('@/pages/cards.vue'),
      },
      {
        path: 'tables',
        component: () => import('@/pages/tables.vue'),
      },
      {
        path: 'form-layouts',
        component: () => import('@/pages/form-layouts.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/blank.vue'),
    children: [
      {
        path: 'login',
        component: () => import('@/pages/auth/login.vue'),
      },
      {
        path: 'forgot-password',
        component: () => import('@/pages/auth/forgot-password.vue'),
      },
      {
        path: 'register',
        component: () => import('@/pages/auth/register.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        component: () => import('@/pages/[...error].vue'),
      },
    ],
  },
]
