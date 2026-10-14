import { ref } from 'vue';

const KEY = 'mg-theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');
const stored = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

// Estado compartilhado entre componentes (módulo singleton)
const theme = ref(stored() ?? (media.matches ? 'dark' : 'light'));

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme.value;
    try { localStorage.setItem(KEY, theme.value); } catch { /* modo privado */ }
  }
  return { theme, toggle };
}
