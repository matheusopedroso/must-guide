import { editedAt } from './guideDraft';
import { guideIdOf } from './guideIds';

// Backup dos guias: um arquivo .json com os guias completos (o mesmo formato do rascunho/Firestore).
// { format: 'must-guide-backup', version, exportedAt, count, guides: [...] }
const FORMAT = 'must-guide-backup';
const VERSION = 1;
const GUIDE_ID = /^[a-z]+-\d+(~[\w-]+)?$/; // "rawg-123", "igdb-456~001"

export const makeBackup = (guides) => ({ format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), count: guides.length, guides });

export const backupFileName = (date = new Date()) => `must-guide-backup-${date.toISOString().slice(0, 10)}.json`;

// Lê o arquivo: só aceita backup do Must Guide e só os guias com id e jogo válidos
export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('O arquivo não é um JSON válido.');
  }
  if (data?.format !== FORMAT || !Array.isArray(data.guides)) throw new Error('Este arquivo não é um backup do Must Guide.');
  const guides = data.guides.filter((g) => g && GUIDE_ID.test(guideIdOf(g)) && typeof g.gameId === 'string' && g.game?.title);
  return { exportedAt: data.exportedAt ?? null, guides, skipped: data.guides.length - guides.length };
}

// O que acontece com cada guia do arquivo, comparando com os atuais (Map id → guia):
// new (não existe) · newer (o do arquivo é mais novo) · same (igual) · older (o atual é mais novo)
export function planImport(guides, current) {
  return guides.map((g) => {
    const id = guideIdOf(g);
    const cur = current.get(id);
    const status = !cur ? 'new' : editedAt(g) > editedAt(cur) ? 'newer' : editedAt(g) === editedAt(cur) ? 'same' : 'older';
    return { id, guide: g, status, title: g.dlc ? `${g.dlc.name || 'DLC'} (DLC de ${g.game.title})` : g.game.title };
  });
}

// Baixa um objeto como arquivo .json
export function downloadJson(data, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
