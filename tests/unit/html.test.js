import { describe, expect, it } from 'vitest';
import { hasRichContent, htmlToPlain, sanitizeHtml, textToHtml } from '@/utils/html';

// Filtro de segurança do texto do guia: o que o editor gera passa; o resto sai.
describe('sanitizeHtml', () => {
  it('remove scripts, estilos e atributos perigosos', () => {
    const out = sanitizeHtml('<p onclick="x()">Oi<script>alert(1)</script><style>p{}</style></p><iframe src="x"></iframe>');
    expect(out).toBe('<p>Oi</p>');
  });

  it('mantém o chip de troféu e o contador', () => {
    const chip = '<a href="#trofeu-12" data-trophy="12" data-type="gold" class="trophy-ref" contenteditable="false">Nome</a>';
    const count = '<a href="#trofeu-3" data-trophy="3" data-type="bronze" class="trophy-ref trophy-count" contenteditable="false"><b>6/18</b> chefes</a>';
    const out = sanitizeHtml(`<p>${chip} ${count}</p>`);
    expect(out).toContain('data-trophy="12"');
    expect(out).toContain('class="trophy-ref trophy-count"');
  });

  it('link externo abre em outra aba; javascript: vira texto', () => {
    expect(sanitizeHtml('<p><a href="https://x.com">x</a></p>')).toContain('target="_blank"');
    expect(sanitizeHtml('<p><a href="javascript:alert(1)">x</a></p>')).toBe('<p>x</p>');
  });

  it('mantém cartão do troféu, caixa de aviso, spoiler e botão de controle válidos', () => {
    const html =
      '<div class="trophy-card" data-trophy-card="2" data-type="gold" contenteditable="false">Nome</div>' +
      '<div class="callout" data-kind="missable"><p>Cuidado</p></div>' +
      '<p><span class="spoiler">segredo</span> <span class="btn-key" data-key="face-down" contenteditable="false">Cruz</span></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('descarta valores fora da lista (tipo de caixa, botão e classe)', () => {
    const out = sanitizeHtml('<div class="callout" data-kind="xss"><p>a</p></div><p><span class="btn-key" data-key="nope">b</span><span class="evil">c</span></p>');
    expect(out).not.toContain('data-kind');
    expect(out).not.toContain('data-key');
    expect(out).not.toContain('evil');
  });

  it('imagem só dentro do bloco de imagem e com https', () => {
    const ok = '<figure class="guide-img" contenteditable="false"><img src="https://x.com/a.jpg" alt="Mapa" loading="lazy"><figcaption>Mapa</figcaption></figure>';
    expect(sanitizeHtml(ok)).toBe(ok);
    expect(sanitizeHtml('<p>a<img src="https://x.com/a.jpg"></p>')).toBe('<p>a</p>');
    expect(sanitizeHtml('<figure class="guide-img"><img src="http://x.com/a.jpg"></figure>')).not.toContain('src=');
  });

  it('títulos grandes viram os do guia e parágrafos vazios do fim saem', () => {
    expect(sanitizeHtml('<h1>T</h1><p>a</p><p><br></p><p></p>')).toBe('<h3>T</h3><p>a</p>');
  });
});

describe('texto', () => {
  it('textToHtml converte texto simples e deixa HTML como está', () => {
    expect(textToHtml('a\n\nb<c')).toBe('<p>a</p><p>b&lt;c</p>');
    expect(textToHtml('<p>x</p>')).toBe('<p>x</p>');
  });

  it('hasRichContent ignora o vazio do editor', () => {
    expect(hasRichContent('<p><br></p>')).toBe(false);
    expect(hasRichContent('<p>&nbsp;x</p>')).toBe(true);
  });

  it('htmlToPlain tira as tags', () => {
    expect(htmlToPlain('<p>Olá <b>mundo</b> &amp; cia</p>')).toBe('Olá mundo & cia');
  });
});
