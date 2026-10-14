import { httpError } from '../http.js';

// Fluxo do app oficial da PlayStation (o mesmo da biblioteca psn-api):
// NPSSO → código de acesso → access token (~1h) + refresh token (~2 meses)
const AUTH_URL = 'https://ca.account.sony.com/api/authz/v3/oauth';
const CLIENT_ID = '09515159-7237-4370-9b40-3806e67c0891';
const BASIC_AUTH = 'Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=';
const REDIRECT_URI = 'com.scee.psxandroid.scecompcall://redirect';
const SCOPE = 'psn:mobile.v2.core psn:clientapp';

const NPSSO_HELP = 'Gere um novo em https://ca.account.sony.com/api/v1/ssocookie (logado na PlayStation) e atualize o PSN_NPSSO.';

export function createPsnAuth(getSecret) {
  // Tokens em memória: renovados só quando vencem (uma instância quente não refaz login)
  let session = null; // { accessToken, accessExpires, refreshToken, refreshExpires }

  async function requestTokens(params) {
    const res = await fetch(`${AUTH_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: BASIC_AUTH },
      body: new URLSearchParams({ token_format: 'jwt', ...params }),
    });
    const raw = await res.json().catch(() => ({}));
    if (!res.ok || !raw.access_token) throw httpError(401, `Falha ao autenticar na PSN. ${NPSSO_HELP}`);

    const now = Date.now();
    session = {
      accessToken: raw.access_token,
      accessExpires: now + (raw.expires_in - 60) * 1000,
      refreshToken: raw.refresh_token,
      refreshExpires: now + (raw.refresh_token_expires_in - 60) * 1000,
    };
    return session.accessToken;
  }

  async function loginWithNpsso() {
    const npsso = getSecret('PSN_NPSSO');
    if (!npsso) throw httpError(503, 'PSN não configurada: defina PSN_NPSSO.');

    const qs = new URLSearchParams({
      access_type: 'offline',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPE,
    });
    // Responde com redirecionamento; o código vem no header Location
    const res = await fetch(`${AUTH_URL}/authorize?${qs}`, {
      headers: { Cookie: `npsso=${npsso}` },
      redirect: 'manual',
    });
    const location = res.headers.get('location') ?? '';
    const code = new URLSearchParams(location.split('redirect/')[1] ?? '').get('code');
    if (!code) throw httpError(401, `NPSSO inválido ou expirado. ${NPSSO_HELP}`);

    return requestTokens({ code, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' });
  }

  async function renew() {
    if (session && Date.now() < session.refreshExpires) {
      try {
        return await requestTokens({ refresh_token: session.refreshToken, grant_type: 'refresh_token', scope: SCOPE });
      } catch {
        session = null; // refresh recusado: tenta o NPSSO de novo
      }
    }
    return loginWithNpsso();
  }

  // Chamadas simultâneas compartilham a mesma renovação (um login só)
  let pending = null;

  return {
    getAccessToken({ force = false } = {}) {
      if (!force && session && Date.now() < session.accessExpires) return Promise.resolve(session.accessToken);
      pending ??= renew().finally(() => (pending = null));
      return pending;
    },
  };
}
