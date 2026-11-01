/* ==========================================================================
   LB MARCAS — Interface compartilhada
   Header, footer, busca, animações de entrada e templates de produto.
   ========================================================================== */

const LBUI = (() => {
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const brl = (value) => money.format(Number(value) || 0);

  const wa = (message) =>
    `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;

  function productMessage(product, options = {}) {
    const parts = [
      `Olá, Lucas! Vim pelo site da ${STORE.name} e tenho interesse neste produto:`,
      '',
      `• Produto: ${product.name}`,
      `• Marca: ${product.brand}`,
    ];
    if (options.size) parts.push(`• Tamanho: ${options.size}`);
    if (options.color) parts.push(`• Cor: ${options.color}`);
    parts.push('', 'Poderia me informar o valor e confirmar a disponibilidade?');
    return parts.join('\n');
  }

  function generalMessage(source = 'o site') {
    return `Olá, Lucas! Vim pelo site da ${STORE.name} (${source}) e gostaria de mais informações sobre os produtos.`;
  }

  const icons = {
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" stroke-linecap="round"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4c1.44.78 3.06 1.2 4.68 1.2 5.44 0 9.84-4.4 9.84-9.84S17.48 2 12.04 2Zm0 17.9c-1.44 0-2.86-.38-4.1-1.12l-.3-.18-3.04.8.82-2.98-.2-.32a7.98 7.98 0 0 1-1.24-4.26c0-4.44 3.62-8.06 8.06-8.06s8.06 3.62 8.06 8.06-3.62 8.06-8.06 8.06Zm4.42-5.88c-.24-.12-1.44-.72-1.66-.8-.22-.08-.38-.12-.54.12-.16.24-.62.8-.76.96-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.38.1-.5.12-.12.24-.28.36-.44.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.32-.74-1.8-.2-.46-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.68 2.68 4.1 3.66 2.02.82 2.44.66 2.88.62.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke-linecap="round"/></svg>',
  };

  function headerMarkup() {
    return `
      <header class="site-header" id="siteHeader">
        <div class="shell header-inner">
          <a class="brand" href="index.html" aria-label="${STORE.name} — página inicial">
            <span class="brand-mark">LB</span>
            <span class="brand-copy">
              <span class="brand-name">LB <em>MARCAS</em></span>
              <span class="brand-sub">Lucas Santana</span>
            </span>
          </a>

          <nav class="main-nav" aria-label="Navegação principal">
            <a href="index.html" data-nav="index">Início</a>
            <a href="catalogo.html" data-nav="catalogo">Catálogo</a>
            <a href="lancamentos.html" data-nav="lancamentos">Lançamentos</a>
            <a href="index.html#marcas">Marcas</a>
            <a href="contato.html" data-nav="contato">Contato</a>
          </nav>

          <div class="header-actions">
            <button class="icon-btn" type="button" data-search-open aria-label="Pesquisar produtos">
              ${icons.search}
            </button>
            <a class="icon-btn hide-sm" href="${STORE.instagramUrl}" target="_blank" rel="noopener" aria-label="Instagram da loja">
              ${icons.instagram}
            </a>
            <a class="btn btn-primary btn-sm header-cta" href="${wa(generalMessage('cabeçalho'))}" target="_blank" rel="noopener">
              ${icons.whatsapp}<span>Falar no WhatsApp</span>
            </a>
            <button class="burger" type="button" data-menu-toggle aria-label="Abrir menu" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <div class="search-overlay" id="searchOverlay" hidden>
        <div class="search-panel">
          <form class="search-form" role="search" data-search-form>
            <label class="sr-only" for="searchInput">Pesquisar produtos</label>
            <input id="searchInput" type="search" name="q" placeholder="Pesquise por tênis, camiseta, marca…" autocomplete="off" />
            <button class="btn btn-primary btn-sm" type="submit">Buscar</button>
            <button class="icon-btn" type="button" data-search-close aria-label="Fechar busca">${icons.close}</button>
          </form>
          <div class="search-results" data-search-results>
            <p class="search-hint">Sugestões</p>
            <div class="search-chips" data-search-chips></div>
          </div>
        </div>
      </div>

      <div class="drawer" id="drawer" hidden>
        <div class="drawer-head">
          <span class="drawer-title">Menu</span>
          <button class="icon-btn" type="button" data-menu-close aria-label="Fechar menu">${icons.close}</button>
        </div>
        <nav class="drawer-nav" aria-label="Menu mobile">
          <a href="index.html">Início</a>
          <a href="catalogo.html">Catálogo</a>
          <a href="lancamentos.html">Lançamentos</a>
          <a href="index.html#marcas">Marcas</a>
          <a href="contato.html">Contato</a>
          <a href="admin.html">Painel administrativo</a>
        </nav>
        <div class="drawer-foot">
          <a class="btn btn-primary btn-block" href="${wa(generalMessage('menu'))}" target="_blank" rel="noopener">
            ${icons.whatsapp}<span>WhatsApp ${STORE.whatsappLabel}</span>
          </a>
          <a class="btn btn-ghost btn-block" href="${STORE.instagramUrl}" target="_blank" rel="noopener">
            ${icons.instagram}<span>@${STORE.instagram}</span>
          </a>
        </div>
      </div>
      <div class="scrim" id="scrim" hidden></div>
    `;
  }

  function footerMarkup() {
    const categories = CATEGORIES.filter((category) => category.id !== 'lancamentos')
      .map((category) => `<li><a href="catalogo.html?categoria=${category.id}">${category.name}</a></li>`)
      .join('');

    return `
      <footer class="site-footer" id="contato">
        <div class="shell footer-grid">
          <div class="footer-brand">
            <a class="brand" href="index.html">
              <span class="brand-mark">LB</span>
              <span class="brand-copy">
                <span class="brand-name">LB <em>MARCAS</em></span>
                <span class="brand-sub">Lucas Santana</span>
              </span>
            </a>
            <p class="footer-about">
              Moda esportiva e streetwear selecionada peça por peça. Atendimento direto com o responsável,
              do primeiro "oi" até a entrega.
            </p>
            <div class="footer-social">
              <a class="icon-btn" href="${wa(generalMessage('rodapé'))}" target="_blank" rel="noopener" aria-label="WhatsApp">${icons.whatsapp}</a>
              <a class="icon-btn" href="${STORE.instagramUrl}" target="_blank" rel="noopener" aria-label="Instagram">${icons.instagram}</a>
            </div>
          </div>

          <div class="footer-col">
            <h3>Categorias</h3>
            <ul>${categories}</ul>
          </div>

          <div class="footer-col">
            <h3>Atendimento</h3>
            <ul class="footer-contact">
              <li><span>Responsável</span>${STORE.owner}</li>
              <li><span>WhatsApp</span><a href="${wa(generalMessage('rodapé'))}" target="_blank" rel="noopener">${STORE.whatsappLabel}</a></li>
              <li><span>E-mail</span><a href="mailto:${STORE.email}">${STORE.email}</a></li>
              <li><span>Instagram</span><a href="${STORE.instagramUrl}" target="_blank" rel="noopener">@${STORE.instagram}</a></li>
              <li><span>Horário</span>${STORE.hours}</li>
            </ul>
          </div>

          <div class="footer-col">
            <h3>Institucional</h3>
            <ul>
              <li><a href="catalogo.html">Catálogo completo</a></li>
              <li><a href="lancamentos.html">Novidades e lançamentos</a></li>
              <li><a href="politica-de-privacidade.html">Política de privacidade</a></li>
              <li><a href="contato.html">Fale com a loja</a></li>
              <li><a href="admin.html">Painel administrativo</a></li>
            </ul>
          </div>
        </div>

        <div class="shell footer-bottom">
          <p>© <span data-year></span> ${STORE.name} — ${STORE.owner}. Todos os direitos reservados.</p>
          <p class="footer-legal">
            Imagens ilustrativas. LB MARCAS é uma loja multimarcas independente e não representa
            oficialmente as marcas citadas.
          </p>
        </div>
      </footer>

      <a class="wa-float" href="${wa(generalMessage('botão flutuante'))}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
        ${icons.whatsapp}
        <span class="wa-float-label">Fale com Lucas</span>
      </a>
    `;
  }

  function productCard(product) {
    const slug = LB.slugify(product.name);
    const tags = [];
    if (LB.isNew(product)) tags.push('<span class="tag tag-new">Lançamento</span>');

    return `
      <article class="product-card reveal" data-brand="${product.brand}" data-category="${product.category}">
        <a class="card-media" href="produto.html?p=${slug}" aria-label="Ver ${product.name}">
          <img src="${product.images[0]}" alt="${product.name} — ${product.brand}" loading="lazy" />
          <span class="card-tags">${tags.join('')}</span>
          ${LB.isNew(product) ? '<span class="card-hype">Limited edition · Limited edition · Limited edition</span>' : ''}
          <span class="card-cta">Ver produto</span>
        </a>
        <div class="card-body">
          <span class="card-brand">${product.brand}</span>
          <h3 class="card-title"><a href="produto.html?p=${slug}">${product.name}</a></h3>
          <p class="card-consult">Valor e disponibilidade no WhatsApp</p>
          <div class="card-sizes">${(product.sizes || []).slice(0, 6).map((size) => `<span>${size}</span>`).join('')}</div>
          <a class="card-wa" href="${wa(productMessage(product))}" target="_blank" rel="noopener">
            ${icons.whatsapp}<span>Consultar pelo WhatsApp</span>
          </a>
        </div>
      </article>
    `;
  }

  function renderInto(selector, html) {
    document.querySelectorAll(selector).forEach((node) => {
      node.innerHTML = html;
    });
  }

  function initHeader() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Link ativo
    const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
    header.querySelectorAll('[data-nav]').forEach((link) => {
      if (link.dataset.nav === page) link.classList.add('is-active');
    });

    // Drawer mobile
    const drawer = document.getElementById('drawer');
    const scrim = document.getElementById('scrim');
    const setMenu = (open) => {
      if (!drawer || !scrim) return;
      drawer.hidden = !open;
      scrim.hidden = !open;
      document.body.classList.toggle('is-locked', open);
      const toggle = document.querySelector('[data-menu-toggle]');
      if (toggle) toggle.setAttribute('aria-expanded', String(open));
    };
    document.querySelectorAll('[data-menu-toggle]').forEach((button) =>
      button.addEventListener('click', () => setMenu(true))
    );
    document.querySelectorAll('[data-menu-close]').forEach((button) =>
      button.addEventListener('click', () => setMenu(false))
    );
    if (scrim) scrim.addEventListener('click', () => setMenu(false));

    // Busca
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const results = document.querySelector('[data-search-results]');
    const chips = document.querySelector('[data-search-chips]');

    const openSearch = () => {
      if (!overlay) return;
      overlay.hidden = false;
      document.body.classList.add('is-locked');
      setTimeout(() => input && input.focus(), 60);
    };
    const closeSearch = () => {
      if (!overlay) return;
      overlay.hidden = true;
      document.body.classList.remove('is-locked');
    };

    document.querySelectorAll('[data-search-open]').forEach((button) =>
      button.addEventListener('click', openSearch)
    );
    document.querySelectorAll('[data-search-close]').forEach((button) =>
      button.addEventListener('click', closeSearch)
    );

    if (overlay) {
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeSearch();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeSearch();
        setMenu(false);
      }
    });

    if (chips) {
      const suggestions = ['Tênis', 'Camiseta', 'Nike', 'Adidas', 'Moletom', 'Chinelo'];
      chips.innerHTML = suggestions
        .map((term) => `<a class="chip" href="catalogo.html?q=${encodeURIComponent(term)}">${term}</a>`)
        .join('');
    }

    const form = document.querySelector('[data-search-form]');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const term = input.value.trim();
        window.location.href = `catalogo.html${term ? `?q=${encodeURIComponent(term)}` : ''}`;
      });
    }

    if (input && results) {
      input.addEventListener('input', () => {
        const term = input.value.trim();
        if (term.length < 2) {
          results.querySelectorAll('.search-hit').forEach((hit) => hit.remove());
          const hint = results.querySelector('.search-hint');
          if (hint) hint.textContent = 'Sugestões';
          return;
        }
        const matches = LB.filtered({ search: term }).slice(0, 5);
        results.querySelectorAll('.search-hit').forEach((hit) => hit.remove());
        const hint = results.querySelector('.search-hint');
        if (hint) hint.textContent = matches.length ? 'Produtos encontrados' : 'Nenhum produto encontrado para essa busca';
        matches.forEach((product) => {
          const link = document.createElement('a');
          link.className = 'search-hit';
          link.href = `produto.html?p=${LB.slugify(product.name)}`;
          link.innerHTML = `
            <img src="${product.images[0]}" alt="" />
            <span>
              <small>${product.brand}</small>
              <strong>${product.name}</strong>
            </span>`;
          results.appendChild(link);
        });
      });
    }
  }

  let observer;
  function observeReveals() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((node) => node.classList.add('is-in'));
      return;
    }
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal:not(.is-in)').forEach((node) => observer.observe(node));
  }

  function init() {
    renderInto('[data-header]', headerMarkup());
    renderInto('[data-footer]', footerMarkup());
    document.querySelectorAll('[data-year]').forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
    initHeader();
    observeReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { brl, wa, productMessage, generalMessage, productCard, observeReveals, icons, init };
})();
