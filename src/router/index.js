import { createRouter, createWebHistory } from 'vue-router';
import { APP_NAME } from '@/config/app';

// Páginas carregadas sob demanda (bundle inicial menor)
const routes = [
  { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
  { path: '/guia/novo', name: 'guide-new', component: () => import('@/pages/GuideEditPage.vue'), meta: { title: 'Novo guia' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved ?? { top: 0 },
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${APP_NAME}` : APP_NAME;
});

export default router;
