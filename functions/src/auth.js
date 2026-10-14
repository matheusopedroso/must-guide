import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { httpError } from './core/http.js';

// Rotas privadas: exige o token do Firebase (Authorization: Bearer …) de uma conta com a claim `admin`.
// A claim é gravada pelo script functions/scripts/set-admin.js.
export async function requireAdmin(headers) {
  const token = /^Bearer (.+)$/.exec(headers.authorization ?? '')?.[1];
  if (!token) throw httpError(401, 'Entre com a conta de administrador.');

  if (!getApps().length) initializeApp();
  const decoded = await getAuth()
    .verifyIdToken(token)
    .catch(() => null);
  if (!decoded) throw httpError(401, 'Sessão expirada. Entre de novo.');
  if (decoded.admin !== true) throw httpError(403, 'Esta conta não tem permissão.');
}
