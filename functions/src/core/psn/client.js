import { httpError } from '../http.js';
import { createPsnAuth } from './auth.js';

const TROPHY_URL = 'https://m.np.playstation.com/api/trophy/v1';
const PROFILE_URL = 'https://us-prof.np.community.playstation.net/userProfile/v1/users';

// GET autenticado na PSN. Nomes e descrições vêm no idioma pedido (com fallback da Sony).
// options.language troca o idioma só naquela chamada (ex.: 'en-US' para os nomes em inglês).
// Erros mantêm o status da PSN que importa para quem chama: 404 (não existe) e 403 (perfil privado).
export function createPsnClient(getSecret, { language = 'pt-BR' } = {}) {
  const auth = createPsnAuth(getSecret);

  async function fetchJson(url, params = {}, options = {}, retry = true) {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null));
    const res = await fetch(`${url}${qs.size ? `?${qs}` : ''}`, {
      headers: {
        Authorization: `Bearer ${await auth.getAccessToken({ force: !retry })}`,
        'Accept-Language': options.language ?? language,
      },
    });

    if (res.status === 401 && retry) return fetchJson(url, params, options, false); // token recusado: renova uma vez
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) throw httpError(404, 'Não encontrado na PSN. Confira o código do jogo.');
    if (res.status === 403) throw httpError(403, 'A PSN não liberou esses dados (perfil privado).');
    if (!res.ok || data.error) throw httpError(502, `PSN: ${data.error?.message || res.status}`);
    return data;
  }

  return {
    get: (path, params, options) => fetchJson(`${TROPHY_URL}${path}`, params, options), // API de troféus
    profile: (onlineId) => fetchJson(`${PROFILE_URL}/${encodeURIComponent(onlineId)}/profile2`, { fields: 'accountId,onlineId,avatarUrls' }),
  };
}
