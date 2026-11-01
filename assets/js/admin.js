/* ==========================================================================
   LB MARCAS — Painel administrativo (CRUD de produtos e estoque)
   Persistência: localStorage do navegador.
   ========================================================================== */

(function () {
  const SESSION_KEY = 'lb_marcas_admin_session';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const loginView = $('[data-login-view]');
  const adminView = $('[data-admin-view]');
  const modal = $('[data-modal]');
  const form = $('[data-product-form]');
  const rowsEl = $('[data-admin-rows]');

  let editingId = null;
  let searchTerm = '';
  let categoryFilter = '';

  /* ---------- Utilidades ---------- */

  function toast(message) {
    let node = $('.admin-toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'admin-toast';
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add('is-visible');
    clearTimeout(node._timer);
    node._timer = setTimeout(() => node.classList.remove('is-visible'), 2600);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- Sessão ---------- */

  function isLogged() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  function showPanel() {
    if (loginView) loginView.hidden = true;
    if (adminView) adminView.hidden = false;
  }

  function showLogin() {
    if (loginView) loginView.hidden = false;
    if (adminView) adminView.hidden = true;
  }

  function initLogin() {
    const owner = $('[data-admin-owner]');
    if (owner) owner.textContent = `${STORE.owner} · ${STORE.name}`;

    const loginForm = $('[data-login-form]');
    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const password = new FormData(loginForm).get('senha').toString();
        const error = $('[data-login-error]');
        if (password === STORE.adminPassword) {
          sessionStorage.setItem(SESSION_KEY, '1');
          if (error) error.hidden = true;
          showPanel();
          renderAll();
        } else if (error) {
          error.hidden = false;
        }
      });
    }

    $$('[data-logout]').forEach((button) =>
      button.addEventListener('click', () => {
        sessionStorage.removeItem(SESSION_KEY);
        showLogin();
      })
    );
  }

  /* ---------- Estatísticas ---------- */

  function renderStats() {
    const products = LB.all();
    const stock = products.reduce((total, product) => total + (Number(product.stock) || 0), 0);
    const bestSellers = products.filter((product) => (product.badges || []).includes('mais-vendido')).length;
    const launches = products.filter((product) => LB.isNew(product)).length;

    const setText = (selector, value) => {
      const node = $(selector);
      if (node) node.textContent = value;
    };

    setText('[data-stat-products]', products.length);
    setText('[data-stat-stock]', stock);
    setText('[data-stat-best]', bestSellers);
    setText('[data-stat-new]', launches);

    const maxStock = Math.max(1, ...products.map((product) => Number(product.stock) || 0));
    const stockBar = $('[data-stat-stock-bar]');
    if (stockBar) stockBar.style.width = `${Math.min(100, Math.round((stock / (maxStock * products.length || 1)) * 100))}%`;

    const bestBar = $('[data-stat-best-bar]');
    if (bestBar) bestBar.style.width = `${Math.round((bestSellers / (products.length || 1)) * 100)}%`;

    const newBar = $('[data-stat-new-bar]');
    if (newBar) newBar.style.width = `${Math.round((launches / (products.length || 1)) * 100)}%`;
  }

  /* ---------- Tabela ---------- */

  function renderTable() {
    if (!rowsEl) return;
    let products = LB.all();

    if (categoryFilter) products = products.filter((product) => product.category === categoryFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      products = products.filter((product) =>
        `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(term)
      );
    }

    if (!products.length) {
      rowsEl.innerHTML = `<tr><td colspan="6"><p class="admin-empty">Nenhum produto encontrado.</p></td></tr>`;
      return;
    }

    rowsEl.innerHTML = products
      .map((product) => {
        const category = CATEGORIES.find((item) => item.id === product.category);
        const tags = [];
        if (LB.isNew(product)) tags.push('<span class="admin-tag admin-tag--new">Lançamento</span>');
        if ((product.badges || []).includes('mais-vendido')) tags.push('<span class="admin-tag admin-tag--best">Mais vendido</span>');

        return `
          <tr>
            <td>
              <div class="admin-product-cell">
                <img src="${product.images[0] || ''}" alt="" loading="lazy" />
                <div>
                  <strong>${escapeHtml(product.name)}</strong>
                  <small>${product.id}</small>
                </div>
              </div>
            </td>
            <td>${escapeHtml(product.brand)}</td>
            <td>${category ? category.name : escapeHtml(product.category)}</td>
            <td class="${(product.stock || 0) <= 5 ? 'stock-low' : ''}">${product.stock || 0} un.</td>
            <td><div class="admin-tags">${tags.join('') || '<span class="admin-tag">—</span>'}</div></td>
            <td>
              <div class="admin-row-actions">
                <a class="admin-icon-btn" href="produto.html?p=${LB.slugify(product.name)}" target="_blank" rel="noopener" title="Ver no site">↗</a>
                <button class="admin-icon-btn" type="button" data-edit="${product.id}" title="Editar">✎</button>
                <button class="admin-icon-btn admin-icon-btn--danger" type="button" data-delete="${product.id}" title="Excluir">🗑</button>
              </div>
            </td>
          </tr>`;
      })
      .join('');

    rowsEl.querySelectorAll('[data-edit]').forEach((button) =>
      button.addEventListener('click', () => openModal(button.dataset.edit))
    );
    rowsEl.querySelectorAll('[data-delete]').forEach((button) =>
      button.addEventListener('click', () => {
        const product = LB.byId(button.dataset.delete);
        if (!product) return;
        if (window.confirm(`Excluir definitivamente "${product.name}"?`)) {
          LB.remove(product.id);
          toast('Produto excluído');
          renderAll();
        }
      })
    );
  }

  /* ---------- Modal / formulário ---------- */

  function openModal(id) {
    if (!modal || !form) return;
    editingId = id || null;
    form.reset();

    const title = $('[data-modal-title]');
    const product = id ? LB.byId(id) : null;

    if (title) title.textContent = product ? 'Editar produto' : 'Novo produto';

    if (product) {
      form.id.value = product.id;
      form.name.value = product.name;
      form.brand.value = product.brand;
      form.category.value = product.category;
      form.stock.value = product.stock;
      form.short.value = product.short || '';
      form.images.value = (product.images || []).join('\n');
      form.description.value = product.description || '';
      form.material.value = product.material || '';
      form.sizes.value = (product.sizes || []).join(', ');
      form.colors.value = (product.colors || []).map((color) => `${color.name}:${color.hex}`).join(', ');
      form.benefits.value = (product.benefits || []).join('\n');
      form.badgeNew.checked = LB.isNew(product);
      form.badgeBest.checked = (product.badges || []).includes('mais-vendido');
    }

    modal.hidden = false;
    document.body.classList.add('is-locked');
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    editingId = null;
  }

  function parseColors(value) {
    return value
      .split(',')
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [name, hex] = chunk.split(':');
        return { name: (name || '').trim(), hex: (hex || '#111111').trim() };
      });
  }

  function saveProduct(event) {
    event.preventDefault();
    const data = new FormData(form);

    const images = data
      .get('images')
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean);

    const badges = [];
    if (data.get('badgeNew')) badges.push('lancamento');
    if (data.get('badgeBest')) badges.push('mais-vendido');

    const payload = {
      name: data.get('name').trim(),
      brand: data.get('brand').trim(),
      category: data.get('category'),
      stock: Number(data.get('stock')),
      short: data.get('short').trim(),
      description: data.get('description').trim(),
      material: data.get('material').trim(),
      sizes: data
        .get('sizes')
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean),
      colors: parseColors(data.get('colors')),
      benefits: data
        .get('benefits')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      images: images.length
        ? images
        : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'],
      badges,
    };

    if (editingId) {
      LB.update(editingId, payload);
      toast('Produto atualizado');
    } else {
      LB.create({ ...payload, createdAt: new Date().toISOString().slice(0, 10) });
      toast('Produto cadastrado');
    }

    closeModal();
    renderAll();
  }

  /* ---------- Import / export ---------- */

  function exportJson() {
    const blob = new Blob([JSON.stringify(LB.all(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lb-marcas-catalogo.json';
    link.click();
    URL.revokeObjectURL(url);
    toast('Catálogo exportado');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result.toString());
        if (!Array.isArray(parsed)) throw new Error('Formato inválido');
        LB.replaceAll(parsed);
        toast(`${parsed.length} produtos importados`);
        renderAll();
      } catch (error) {
        toast('Arquivo inválido. Use o JSON exportado pelo painel.');
      }
    };
    reader.readAsText(file);
  }

  /* ---------- Inicialização ---------- */

  function fillSelects() {
    const options = CATEGORIES.filter((category) => category.id !== 'lancamentos')
      .map((category) => `<option value="${category.id}">${category.name}</option>`)
      .join('');

    $$('[data-category-select]').forEach((select) => {
      select.innerHTML = options;
    });

    const filter = $('[data-admin-filter]');
    if (filter) filter.innerHTML = `<option value="">Todas as categorias</option>${options}`;

    const datalist = $('#brandList');
    if (datalist) {
      datalist.innerHTML = BRANDS.map((brand) => `<option value="${brand.name}"></option>`).join('');
    }
  }

  function renderAll() {
    renderStats();
    renderTable();
  }

  function bindToolbar() {
    const search = $('[data-admin-search]');
    if (search) {
      search.addEventListener('input', () => {
        searchTerm = search.value.trim();
        renderTable();
      });
    }

    const filter = $('[data-admin-filter]');
    if (filter) {
      filter.addEventListener('change', () => {
        categoryFilter = filter.value;
        renderTable();
      });
    }

    $$('[data-new-product]').forEach((button) =>
      button.addEventListener('click', () => openModal(null))
    );
    $$('[data-modal-close]').forEach((button) =>
      button.addEventListener('click', closeModal)
    );
    if (modal) {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
      });
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal && !modal.hidden) closeModal();
    });

    if (form) form.addEventListener('submit', saveProduct);

    const exportButton = $('[data-export]');
    if (exportButton) exportButton.addEventListener('click', exportJson);

    const importInput = $('[data-import]');
    if (importInput) {
      importInput.addEventListener('change', () => {
        if (importInput.files && importInput.files[0]) importJson(importInput.files[0]);
        importInput.value = '';
      });
    }

    const resetButton = $('[data-reset]');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (window.confirm('Restaurar o catálogo original de demonstração? Suas alterações locais serão perdidas.')) {
          LB.reset();
          toast('Catálogo restaurado');
          renderAll();
        }
      });
    }
  }

  function init() {
    fillSelects();
    initLogin();
    bindToolbar();

    if (isLogged()) {
      showPanel();
      renderAll();
    } else {
      showLogin();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
