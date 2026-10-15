import { sectionTabsOf } from '@/config/guideTabs';
import { filledPages, pageName } from './pages';
import { filledSections, sectionLabel } from './sections';
import { extractTrophyRefs } from './trophyRef';

// Onde um troféu aparece no guia: seções (de todas as abas de texto) que o têm na lista "Troféus desta seção"
// ou o citam no texto. Cada item leva à seção na leitura (aba, página e âncora #secao-…).
// → [{ id, tab, page, label, inText, query, hash }]
export function trophyCitations(guide, trophyId) {
  const found = [];
  for (const tab of sectionTabsOf(guide)) {
    const cfg = tab.sections;
    const pages = cfg.paged ? filledPages(guide, cfg.key) : [{ sections: filledSections(guide, cfg.key) }];
    pages.forEach((page, pi) =>
      page.sections.forEach((s, si) => {
        const inText = extractTrophyRefs(s.body).has(trophyId);
        if (!inText && !s.trophies.includes(trophyId)) return;
        found.push({
          id: s.id,
          tab: tab.label,
          page: cfg.paged ? pageName(page, pi) : '',
          label: sectionLabel(s, si, cfg),
          inText,
          query: { aba: tab.id, ...(cfg.paged && pi > 0 && { pagina: String(pi + 1) }) },
          hash: `#secao-${s.id}`,
        });
      }),
    );
  }
  return found;
}
