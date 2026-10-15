import { createRouter, createWebHistory } from 'vue-router';
import { APP_NAME } from '@/config/app';

// Páginas carregadas sob demanda (bundle inicial menor)
const GuideEditPage = () => import('@/pages/GuideEditPage.vue');

const routes = [
  { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
  { path: '/biblioteca', name: 'library', component: () => import('@/pages/LibraryPage.vue'), meta: { title: 'Biblioteca' } },
  { path: '/guias', name: 'my-guides', component: () => import('@/pages/MyGuidesPage.vue'), meta: { title: 'Meus guias' } },
  {
    path: '/guia/novo',
    name: 'guide-new',
    component: GuideEditPage,
    meta: { title: 'Novo guia' },
    // Endereço antigo (?jogo=rawg-123) → editor do jogo
    beforeEnter: (to) => (to.query.jogo ? { name: 'guide-edit', params: { id: to.query.jogo }, query: { aba: to.query.aba } } : true),
  },
  { path: '/guia/:id/editar', name: 'guide-edit', component: GuideEditPage, meta: { title: 'Editar guia' } },
  { path: '/jogo/:id', name: 'game', component: () => import('@/pages/GamePage.vue'), meta: { title: 'Jogo', immersive: true } },
  { path: '/guia/:id/trofeu/:trophyId', name: 'trophy-view', component: () => import('@/pages/TrophyPage.vue'), meta: { title: 'Troféu', immersive: true } },
  { path: '/guia/:id', name: 'guide-view', component: () => import('@/pages/GuideViewPage.vue'), meta: { title: 'Guia', immersive: true } }, // celular: sem a barra do topo (imagem até o alto)
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved ?? (to.path === from.path ? false : { top: 0 }), // trocar só a aba (?aba=) não rola
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${APP_NAME}` : APP_NAME;
});

export default router;
