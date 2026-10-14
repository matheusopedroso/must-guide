// Pilha compartilhada pelos modais (mesmo padrão do Must Watch):
// - Esc e o "voltar" do celular fecham só o de cima;
// - a rolagem da página fica travada enquanto houver algum aberto.
const stack = []; // [{ id, close }]
let seq = 0;
let listening = false;

const top = () => stack[stack.length - 1];
const onKey = (e) => e.key === 'Escape' && top()?.close();

function lockBody(on) {
  document.body.style.overflow = on ? 'hidden' : '';
  document[on ? 'addEventListener' : 'removeEventListener']('keydown', onKey);
}

// "Voltar" com modal aberto fecha o modal em vez de sair da página.
// O popstate marca a navegação; o guarda do roteador a cancela (a URL é reposta) e fecha o de cima.
// Navegação por link (router.push) não passa pelo popstate e segue normal.
let backInstalled = false;
function installBackClose(router) {
  if (backInstalled || !router) return;
  backInstalled = true;
  let fromBack = false;
  let timer = null;
  window.addEventListener('popstate', () => {
    fromBack = true;
    clearTimeout(timer);
    timer = setTimeout(() => (fromBack = false), 400);
  });
  router.beforeEach(() => {
    const back = fromBack;
    fromBack = false;
    if (!back || !stack.length) return true;
    top().close();
    return false;
  });
}

export function useModalStack(close, router) {
  const id = ++seq;
  installBackClose(router);

  function push() {
    if (stack.some((m) => m.id === id)) return;
    stack.push({ id, close });
    if (!listening) lockBody((listening = true));
  }

  function pop() {
    const i = stack.findIndex((m) => m.id === id);
    if (i < 0) return;
    stack.splice(i, 1);
    if (!stack.length) lockBody((listening = false));
  }

  return { push, pop, isTop: () => top()?.id === id };
}
