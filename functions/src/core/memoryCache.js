// Cache simples em memória (vive enquanto o processo/instância estiver ativo)
export function createCache({ max = 200, ttlMs = 60 * 60 * 1000 } = {}) {
  const store = new Map();

  return {
    get(key) {
      const hit = store.get(key);
      if (!hit) return undefined;
      if (Date.now() > hit.expires) {
        store.delete(key);
        return undefined;
      }
      return hit.value;
    },
    set(key, value, ttl = ttlMs) {
      if (store.size >= max) store.delete(store.keys().next().value); // remove o mais antigo
      store.set(key, { value, expires: Date.now() + ttl });
      return value;
    },
  };
}
