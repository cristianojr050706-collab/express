/* ==========================================================================
   LB MARCAS — Página inicial
   ========================================================================== */

(function () {
  function renderProducts(selector, products) {
    const container = document.querySelector(selector);
    if (!container) return;
    container.innerHTML = products.map(LBUI.productCard).join('');
  }

  function renderCategories() {
    const container = document.querySelector('[data-categories]');
    if (!container) return;
    container.innerHTML = CATEGORIES.map(
      (category) => `
        <a class="category-card reveal" href="catalogo.html?categoria=${category.id}">
          <img src="${category.image}" alt="${category.name}" loading="lazy" />
          <div class="category-body">
            <small>${category.blurb}</small>
            <h3>${category.name}</h3>
          </div>
        </a>`
    ).join('');
  }

  function renderBrands() {
    const container = document.querySelector('[data-brands]');
    if (!container) return;
    container.innerHTML = BRANDS.map(
      (brand) => `
        <a class="brand-card reveal" href="catalogo.html?marca=${encodeURIComponent(brand.name)}">
          <img src="${brand.image}" alt="Produto da marca ${brand.name}" loading="lazy" />
          <div class="brand-card-body">
            <h3>${brand.name}</h3>
            <p>${brand.note}</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>`
    ).join('');
  }

  function initMagneticBadge() {
    const visual = document.querySelector('[data-hero-visual]');
    const badge = document.querySelector('[data-magnetic]');
    if (!visual || !badge || window.matchMedia('(hover: none)').matches) return;

    visual.addEventListener('pointermove', (event) => {
      const rect = visual.getBoundingClientRect();
      badge.style.left = `${event.clientX - rect.left}px`;
      badge.style.top = `${event.clientY - rect.top}px`;
    });
  }

  function initQuickContact() {
    const form = document.querySelector('[data-quick-contact]');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = (data.get('nome') || '').toString().trim();
      const product = (data.get('produto') || '').toString().trim();
      const message = (data.get('mensagem') || '').toString().trim();

      const lines = [
        `Olá, Lucas! Meu nome é ${name || 'cliente'}.`,
        product ? `Tenho interesse no produto: ${product}.` : 'Vim pelo site da LB MARCAS.',
      ];
      if (message) lines.push(`Mensagem: ${message}`);
      window.open(LBUI.wa(lines.join('\n')), '_blank', 'noopener');
      form.reset();
    });
  }

  function init() {
    renderProducts('[data-new-arrivals]', LB.newArrivals(4));
    renderProducts('[data-best-sellers]', LB.bestSellers(4));
    renderCategories();
    renderBrands();

    const total = LB.all().length;
    document.querySelectorAll('[data-metric-products]').forEach((node) => {
      node.textContent = total;
    });

    initMagneticBadge();
    initQuickContact();
    LBUI.observeReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
