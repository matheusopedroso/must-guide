// Link absoluto de uma rota do app e cópia para a área de transferência
export const absoluteUrl = (router, to) => new URL(router.resolve(to).href, location.origin).href;

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false; // sem permissão / http
  }
}
