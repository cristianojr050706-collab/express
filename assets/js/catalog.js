/* ==========================================================================
   LB MARCAS — Catálogo com filtros inteligentes
   ========================================================================== */

(function () {
  const params = new URLSearchParams(location.search);
  const grid = document.querySelector('[data-catalog-grid]');
  const filtersEl = document.getElementById('filters');
  const priceRange = document.querySelector('[data-price-range]');
  const priceOutput = document.querySelector('[data-price-output]');

  const state = {
    categoria: params.get('categoria') || '',
    marca: params.get('marca') || '',
    tamanho: params.get('tamanho') || '',
    q: params.get('q') || '',
    ordenar: params.get('ordenar') || 'novos',
    max: Number(params.get('preco')) || 1300,
    apenasNovos: params.get('novos') === '1' || state0CategoryIsNew(),
    apenasOfertas: params.get('ofertas') === '1',
  };

  function state0CategoryIsNew() {
    return (params.get('categoria') || '') === 'lancamentos';
  }

  /* ---------- Opções dos filtros ---------- */

  function buildOptions() {
    const categoryWrap = document.querySelector('[data-filter-categories]');
    if (categoryWrap) {
      categoryWrap.innerHTML = CATEGORIES.map(
        (category) => `
          <label class="filter-option">
            <input type="radio" name="categoria" value="${category.id}" ${state.categoria === category.id ? 'checked' : ''} />
            <span>${category.name}</span>
          </label>`
      ).join('');
    }

    const brandWrap = document.querySelector('[data-filter-brands]');
    if (brandWrap) {
      brandWrap.innerHTML = BRANDS.map(
        (brand) => `
          <label class="filter-option">
            <input type="radio" name="marca" value="${brand.name}" ${state.marca === brand.name ? 'checked' : ''} />
            <span>${brand.name}</span>
          </label>`
      ).join('');
    }

    const sizeWrap = document.querySelector('[data-filter-sizes]');
    if (sizeWrap) {
      sizeWrap.innerHTML = LB.allSizes()
        .map(
          (size) => `
          <label class="filter-option">
            <input type="radio" name="tamanho" value="${size}" ${state.tamanho === size ? 'checked' : ''} />
            <span>${size}</span>
          </label>`
        )
        .join('');
    }

    document.querySelectorAll('[data-quick="categoria"]').forEach((select) => {
      select.innerHTML =
        '<option value="">Categoria</option>' +
        CATEGORIES.map((category) => `<option value="${category.id}">${category.name}</option>`).join('');
      select.value = state.categoria;
    });

    document.querySelectorAll('[data-quick="marca"]').forEach((select) => {
      select.innerHTML =
        '<option value="">Marca</option>' +
        BRANDS.map((brand) => `<option value="${brand.name}">${brand.name}</option>`).join('');
      select.value = state.marca;
    });

    document.querySelectorAll('[data-quick="tamanho"]').forEach((select) => {
      select.innerHTML =
        '<option value="">Tamanho</option>' +
        LB.allSizes().map((size) => `<option value="${size}">${size}</option>`).join('');
      select.value = state.tamanho;
    });

    document.querySelectorAll('[data-quick="ordenar"]').forEach((select) => {
      select.value = state.ordenar;
    });

    document.querySelectorAll('[data-filter-new]').forEach((input) => {
      input.checked = state.apenasNovos;
    });
    document.querySelectorAll('[data-filter-offers]').forEach((input) => {
      input.checked = state.apenasOfertas;
    });

    if (priceRange) {
      priceRange.value = state.max;
      if (priceOutput) priceOutput.textContent = LBUI.brl(state.max);
    }
  }

  /* ---------- Render ---------- */

  function currentList() {
    let list = LB.filtered({
      category: state.categoria,
      brand: state.marca,
      size: state.tamanho,
      maxPrice: state.max < 1300 ? state.max : undefined,
      onlyNew: state.apenasNovos,
      search: state.q,
      sort: state.ordenar,
    });
    if (state.apenasOfertas) {
      list = list.filter((product) => LB.discount(product) > 0);
    }
    return list;
  }

  function syncUrl() {
    const query = new URLSearchParams();
    if (state.categoria) query.set('categoria', state.categoria);
    if (state.marca) query.set('marca', state.marca);
    if (state.tamanho) query.set('tamanho', state.tamanho);
    if (state.q) query.set('q', state.q);
    if (state.ordenar && state.ordenar !== 'novos') query.set('ordenar', state.ordenar);
    if (state.max < 1300) query.set('preco', state.max);
    if (state.apenasNovos) query.set('novos', '1');
    if (state.apenasOfertas) query.set('ofertas', '1');
    const queryString = query.toString();
    history.replaceState(null, '', `catalogo.html${queryString ? `?${queryString}` : ''}`);
  }

  function render() {
    if (!grid) return;
    const list = currentList();

    grid.innerHTML = list.length
      ? list.map(LBUI.productCard).join('')
      : `<div class="empty-state">
           <h3>Nenhum produto encontrado</h3>
           <p>Tente remover alguns filtros ou falar direto com a loja: podemos ter a peça em outro tamanho.</p>
           <a class="btn btn-primary" href="https://wa.me/5522997283714" target="_blank" rel="noopener">Consultar pelo WhatsApp</a>
         </div>`;

    document.querySelectorAll('[data-result-count]').forEach((node) => {
      node.textContent = list.length;
    });
    const toolbarCount = document.querySelector('[data-toolbar-count]');
    if (toolbarCount) {
      toolbarCount.textContent = `${list.length} ${list.length === 1 ? 'produto' : 'produtos'}`;
    }
    const title = document.querySelector('[data-toolbar-title]');
    if (title) {
      const category = CATEGORIES.find((item) => item.id === state.categoria);
      if (state.q) title.textContent = `Resultados para “${state.q}”`;
      else if (category) title.textContent = category.name;
      else if (state.marca) title.textContent = state.marca;
      else title.textContent = 'Todos os produtos';
    }

    syncUrl();
    LBUI.observeReveals();
  }

  /* ---------- Eventos ---------- */

  function bindEvents() {
    document.querySelectorAll('input[name="categoria"]').forEach((input) =>
      input.addEventListener('change', () => {
        state.categoria = input.value;
        state.apenasNovos = input.value === 'lancamentos';
        buildOptions();
        render();
      })
    );

    document.querySelectorAll('input[name="marca"]').forEach((input) =>
      input.addEventListener('change', () => {
        state.marca = input.value;
        buildOptions();
        render();
      })
    );

    document.querySelectorAll('input[name="tamanho"]').forEach((input) =>
      input.addEventListener('change', () => {
        state.tamanho = input.value;
        buildOptions();
        render();
      })
    );

    document.querySelectorAll('[data-quick]').forEach((select) => {
      select.addEventListener('change', () => {
        const key = select.dataset.quick;
        if (key === 'ordenar') state.ordenar = select.value;
        if (key === 'categoria') {
          state.categoria = select.value;
          state.apenasNovos = select.value === 'lancamentos';
        }
        if (key === 'marca') state.marca = select.value;
        if (key === 'tamanho') state.tamanho = select.value;
        buildOptions();
        render();
      });
    });

    document.querySelectorAll('[data-filter-new]').forEach((input) =>
      input.addEventListener('change', () => {
        state.apenasNovos = input.checked;
        buildOptions();
        render();
      })
    );

    document.querySelectorAll('[data-filter-offers]').forEach((input) =>
      input.addEventListener('change', () => {
        state.apenasOfertas = input.checked;
        buildOptions();
        render();
      })
    );

    if (priceRange) {
      priceRange.addEventListener('input', () => {
        state.max = Number(priceRange.value);
        if (priceOutput) priceOutput.textContent = LBUI.brl(state.max);
      });
      priceRange.addEventListener('change', render);
    }

    document.querySelectorAll('[data-clear-filters]').forEach((button) =>
      button.addEventListener('click', () => {
        state.categoria = '';
        state.marca = '';
        state.tamanho = '';
        state.q = '';
        state.ordenar = 'novos';
        state.max = 1300;
        state.apenasNovos = false;
        state.apenasOfertas = false;
        buildOptions();
        render();
      })
    );

    document.querySelectorAll('[data-filter-open]').forEach((button) =>
      button.addEventListener('click', () => filtersEl && filtersEl.classList.add('is-open'))
    );
    document.querySelectorAll('[data-filter-apply]').forEach((button) =>
      button.addEventListener('click', () => filtersEl && filtersEl.classList.remove('is-open'))
    );
  }

  function init() {
    buildOptions();
    bindEvents();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
