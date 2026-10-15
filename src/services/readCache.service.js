// Guias lidos guardados no navegador para abrir sem internet (PWA). Só a cópia da nuvem que a pessoa leu;
// os rascunhos de quem edita já ficam no navegador (draft.service). Guarda os últimos MAX (o mais antigo sai).
const PREFIX = 'mg:read-cache:';
const INDEX = 'mg:read-cache-index';
const MAX = 30;

const readIndex = () => {
  try {
    return JSON.parse(localStorage.getItem(INDEX) ?? '[]');
  } catch {
    return [];
  }
};

export function cacheGuide(id, guide) {
  try {
    const index = [id, ...readIndex().filter((x) => x !== id)];
    for (const old of index.splice(MAX)) localStorage.removeItem(PREFIX + old);
    localStorage.setItem(PREFIX + id, JSON.stringify(guide));
    localStorage.setItem(INDEX, JSON.stringify(index));
  } catch {
    /* sem espaço / armazenamento bloqueado: segue sem a cópia */
  }
}

export function cachedGuide(id) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + id) ?? 'null');
  } catch {
    return null;
  }
}

export function forgetGuide(id) {
  try {
    localStorage.removeItem(PREFIX + id);
    localStorage.setItem(INDEX, JSON.stringify(readIndex().filter((x) => x !== id)));
  } catch {
    /* sem armazenamento */
  }
}
