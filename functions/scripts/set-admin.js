/*
  Dá (ou tira) o papel de administrador de uma conta do Must Guide.

  O admin é uma Custom Claim (`admin: true`) no Firebase Authentication: é ela que libera
  gravar guias no Firestore (firestore.rules) e as rotas pessoais da PSN (/api/trophies/titles e progress).
  Só pode ser gravada com o Admin SDK, fora do app — por isso este script.

  Antes:
    1. Entre no app com a conta Google pelo menos uma vez (a conta precisa existir).
    2. Baixe uma chave de conta de serviço: Console do Firebase → Configurações do projeto →
       Contas de serviço → Gerar nova chave privada. Guarde FORA do projeto (nunca no git).

  Uso (dentro da pasta functions):
    PowerShell:  $env:GOOGLE_APPLICATION_CREDENTIALS="C:\chaves\must-guide-admin.json"
    bash:        export GOOGLE_APPLICATION_CREDENTIALS=~/chaves/must-guide-admin.json

    node scripts/set-admin.js seu@email.com             -> vira admin
    node scripts/set-admin.js seu@email.com --remover   -> deixa de ser admin

  Depois: saia e entre de novo no app (ou recarregue a página) para o token novo valer.
*/
import { readFileSync } from 'node:fs';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];
const remove = process.argv.includes('--remover');
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!email?.includes('@')) {
  console.error('Informe o e-mail da conta Google: node scripts/set-admin.js seu@email.com');
  process.exit(1);
}
if (!keyPath) {
  console.error('Defina GOOGLE_APPLICATION_CREDENTIALS com o caminho da chave da conta de serviço.');
  process.exit(1);
}

// O projeto vem da própria chave (project_id)
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
const auth = getAuth();

try {
  const user = await auth.getUserByEmail(email);
  const claims = { ...(user.customClaims ?? {}) }; // mantém outras claims; só mexe na `admin`
  if (remove) delete claims.admin;
  else claims.admin = true;
  await auth.setCustomUserClaims(user.uid, claims);

  const updated = await auth.getUser(user.uid);
  console.log(`Conta: ${updated.email} (uid ${updated.uid})`);
  console.log(`Claims: ${JSON.stringify(updated.customClaims ?? {})}`);
  console.log(remove ? 'Papel de administrador removido.' : 'Pronto! Saia e entre de novo no app.');
} catch (e) {
  if (e?.code === 'auth/user-not-found') console.error(`Nenhuma conta com ${email}. Entre no app com ela pelo menos uma vez.`);
  else console.error('Falhou:', e?.message ?? e);
  process.exit(1);
}
