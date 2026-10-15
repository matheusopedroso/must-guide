// Simula services/firebase/auth nos testes: login = localStorage "mock-user"; admin, a menos que "mock-admin" = "0"
let cb = null;
let user = null;
const fake = { uid: 'u1', displayName: 'Matheus Pedroso', email: 'matheus@example.com', photoURL: null };
const claims = () => ({ admin: localStorage.getItem('mock-admin') !== '0' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export async function watchUser(fn) {
  cb = fn;
  await wait(200);
  user = localStorage.getItem('mock-user') ? fake : null;
  fn(user, user ? claims() : null);
  return () => {};
}
export async function signInWithGoogle() {
  await wait(300);
  if (localStorage.getItem('mock-login-fail')) throw new Error('O login com Google não está ativado no Firebase (Authentication → Método de login).');
  localStorage.setItem('mock-user', '1');
  user = fake;
  cb?.(user, claims());
}
export async function signOut() {
  localStorage.removeItem('mock-user');
  user = null;
  cb?.(null, null);
}
export async function getIdToken() { return user ? 'tok' : null; }
export async function refreshClaims() {}
