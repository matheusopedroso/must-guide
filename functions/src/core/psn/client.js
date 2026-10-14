import { httpError } from '../http.js';
import { createPsnAuth } from './auth.js';

const TROPHY_URL = 'https://m.np.playstation.com/api/trophy/v1';

// GET autenticado na API de troféus. Nomes e descrições vêm no idioma pedido (com fallback da Sony).
// options.language troca o idioma só naquela chamada (ex.: 'en-US' para os nomes em inglês)
export function createPsnClient(getSecret, { language = 'pt-BR' } = {}) {
  const auth = createPsnAuth(getSecret);

  async function get(path, params = {}, options = {}, retry = true) {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null));
    const res = await fetch(`${TROPHY_URL}${path}${qs.size ? `?${qs}` : ''}`, {
      headers: {
        Authorization: `Bearer ${await auth.getAccessToken({ force: !retry })}`,
        'Accept-Language': options.language ?? language,
      },
    });

    if (res.status === 401 && retry) return get(path, params, options, false); // token recusado: renova uma vez
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) throw httpError(404, 'Não encontrado na PSN. Confira o código do jogo.');
    if (!res.ok || data.error) throw httpError(502, `PSN: ${data.error?.message || res.status}`);
    return data;
  }

  return { get };
}
