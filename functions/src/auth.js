import { HttpsError } from 'firebase-functions/v2/https';
import { ADMIN_EMAIL } from './config.js';

export function assertAdmin(auth) {
  const token = auth?.token;
  const allowed =
    token?.email_verified === true &&
    token.email?.toLowerCase() === ADMIN_EMAIL.value().toLowerCase();
  if (!allowed) throw new HttpsError('permission-denied', 'Acesso restrito.');
}
