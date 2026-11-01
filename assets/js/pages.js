/* ==========================================================================
   LB MARCAS — Páginas internas (lançamentos e contato)
   ========================================================================== */

(function () {
  function initLancamentos() {
    const grid = document.querySelector('[data-launch-grid]');
    if (grid) {
      const launches = LB.filtered({ onlyNew: true, sort: 'novos' });
      grid.innerHTML = launches.length
        ? launches.map(LBUI.productCard).join('')
        : `<div class="empty-state"><h3>Nenhum lançamento no momento</h3>
             <p>Cadastre novidades no painel administrativo ou volte em breve.</p>
             <a class="btn btn-primary" href="catalogo.html">Ver catálogo</a></div>`;
    }

    LBUI.observeReveals();
  }

  function initContato() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = (data.get('nome') || '').toString().trim();
      const phone = (data.get('telefone') || '').toString().trim();
      const product = (data.get('produto') || '').toString().trim();
      const message = (data.get('mensagem') || '').toString().trim();

      const lines = [`Olá, Lucas! Meu nome é ${name || 'cliente'}. Vim pelo site da LB MARCAS.`];
      if (phone) lines.push(`Meu WhatsApp: ${phone}`);
      if (product) lines.push(`Produto de interesse: ${product}`);
      if (message) lines.push(`Mensagem: ${message}`);

      window.open(LBUI.wa(lines.join('\n')), '_blank', 'noopener');
      form.reset();
    });
  }

  function init() {
    const page = document.body.dataset.page;
    if (page === 'lancamentos') initLancamentos();
    if (page === 'contato') initContato();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
