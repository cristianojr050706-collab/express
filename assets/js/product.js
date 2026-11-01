/* ==========================================================================
   LB MARCAS — Página de detalhe do produto (PDP)
   ========================================================================== */

(function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('p') || '';
  const product = LB.bySlug(slug);

  const $ = (selector) => document.querySelector(selector);

  function notFound() {
    const grid = $('#pdpGrid');
    if (!grid) return;
    grid.outerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>Produto não encontrado</h3>
        <p>Esse item pode ter saído do catálogo. Veja as peças disponíveis ou fale com a loja.</p>
        <a class="btn btn-primary" href="catalogo.html">Voltar ao catálogo</a>
      </div>`;
  }

  function renderGallery() {
    const main = $('[data-gallery-main]');
    const thumbsWrap = $('[data-gallery-thumbs]');
    if (!main || !thumbsWrap) return;

    main.src = product.images[0];
    main.alt = `${product.name} — ${product.brand}`;

    thumbsWrap.innerHTML = product.images
      .map(
        (image, index) => `
        <button type="button" class="${index === 0 ? 'is-active' : ''}" data-thumb="${index}" aria-label="Foto ${index + 1} de ${product.name}">
          <img src="${image}" alt="" />
        </button>`
      )
      .join('');

    thumbsWrap.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.thumb);
        main.src = product.images[index];
        thumbsWrap.querySelectorAll('button').forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
      });
    });
  }

  function selectedOption(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  }

  function updateWhatsApp() {
    const size = selectedOption('tamanho');
    const color = selectedOption('cor');
    const message = LBUI.productMessage(product, { size, color });

    const main = $('[data-wa-main]');
    if (main) main.href = LBUI.wa(message);

    const availability = $('[data-wa-availability]');
    if (availability) {
      availability.href = LBUI.wa(
        `Olá, Lucas! Gostaria de confirmar a disponibilidade do produto ${product.name}` +
          `${size ? ` no tamanho ${size}` : ''}${color ? ` na cor ${color}` : ''}. Ainda tem em estoque?`
      );
    }
  }

  function renderOptions() {
    const sizesWrap = $('[data-sizes]');
    if (sizesWrap) {
      sizesWrap.innerHTML = (product.sizes || [])
        .map(
          (size) => `
          <label class="size-option">
            <input type="radio" name="tamanho" value="${size}" />
            <span>${size}</span>
          </label>`
        )
        .join('');
      sizesWrap.querySelectorAll('input').forEach((input) =>
        input.addEventListener('change', updateWhatsApp)
      );
    }

    const colorsWrap = $('[data-colors]');
    if (colorsWrap) {
      colorsWrap.innerHTML = (product.colors || [])
        .map(
          (color) => `
          <label class="color-option">
            <input type="radio" name="cor" value="${color.name}" />
            <span><i style="background:${color.hex}"></i>${color.name}</span>
          </label>`
        )
        .join('');
      colorsWrap.querySelectorAll('input').forEach((input) =>
        input.addEventListener('change', updateWhatsApp)
      );
    }
  }

  function renderInfo() {
    document.title = `${product.name} — ${product.brand} | LB MARCAS`;

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', `${product.name} da ${product.brand} na LB MARCAS. ${product.short}`);
    }

    const crumb = $('[data-crumb]');
    if (crumb) crumb.textContent = product.name;

    const setText = (selector, value) => {
      const node = $(selector);
      if (node) node.textContent = value;
    };

    setText('[data-product-brand]', product.brand);
    setText('[data-product-title]', product.name);
    setText('[data-product-short]', product.short || '');
    setText('[data-product-description]', product.description);
    setText('[data-product-material]', product.material);

    const benefits = $('[data-product-benefits]');
    if (benefits) {
      benefits.innerHTML = (product.benefits || []).map((item) => `<li>${item}</li>`).join('');
    }

    const sizeList = $('[data-product-sizes]');
    if (sizeList) {
      sizeList.innerHTML = `
        <li>Tamanhos disponíveis: ${(product.sizes || []).join(' · ')}</li>
        <li>Cores: ${(product.colors || []).map((color) => color.name).join(' · ')}</li>
        <li>Estoque atual: ${product.stock} unidades</li>
        <li>Referência: ${product.id.toUpperCase()}</li>`;
    }

    const guide = $('[data-size-guide]');
    if (guide) {
      guide.addEventListener('click', (event) => {
        event.preventDefault();
        const details = sizeList ? sizeList.closest('details') : null;
        if (details) {
          details.open = true;
          details.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  function renderRelated() {
    const section = $('[data-related-section]');
    const wrap = $('[data-related]');
    if (!section || !wrap) return;
    const related = LB.related(product, 4);
    if (!related.length) return;
    wrap.innerHTML = related.map(LBUI.productCard).join('');
    section.hidden = false;
    LBUI.observeReveals();
  }

  function renderStructuredData() {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      brand: { '@type': 'Brand', name: product.brand },
      description: product.short,
      image: product.images,
      material: product.material,
    });
    document.head.appendChild(script);
  }

  function init() {
    if (!product) {
      notFound();
      return;
    }
    renderInfo();
    renderGallery();
    renderOptions();
    renderRelated();
    updateWhatsApp();
    renderStructuredData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
