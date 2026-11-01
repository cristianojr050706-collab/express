/* ==========================================================================
   LB MARCAS — Camada de dados
   Persistência local (localStorage) sobre o catálogo base em data.js.
   Assim o painel administrativo cria, edita e exclui produtos de verdade.
   ========================================================================== */

const LB = (() => {
  const KEY = 'lb_marcas_catalog_v1';

  const slugify = (text) =>
    text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(SEED_PRODUCTS);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return clone(SEED_PRODUCTS);
      return parsed;
    } catch (error) {
      return clone(SEED_PRODUCTS);
    }
  }

  function persist(products) {
    try {
      localStorage.setItem(KEY, JSON.stringify(products));
    } catch (error) {
      console.warn('Não foi possível salvar o catálogo localmente.', error);
    }
  }

  function all() {
    return load();
  }

  function bySlug(slug) {
    return all().find((product) => slugify(product.name) === slug);
  }

  function byId(id) {
    return all().find((product) => product.id === id);
  }

  function create(product) {
    const products = load();
    const next = { ...product, id: product.id || `lb-${Date.now()}` };
    products.unshift(next);
    persist(products);
    return next;
  }

  function update(id, patch) {
    const products = load().map((product) => (product.id === id ? { ...product, ...patch } : product));
    persist(products);
    return products.find((product) => product.id === id);
  }

  function remove(id) {
    const products = load().filter((product) => product.id !== id);
    persist(products);
    return products;
  }

  function reset() {
    localStorage.removeItem(KEY);
    return clone(SEED_PRODUCTS);
  }

  function replaceAll(products) {
    const list = Array.isArray(products) ? products : [];
    persist(list);
    return list;
  }

  /* ---------- Consultas usadas nas páginas públicas ---------- */

  const isNew = (product) => (product.badges || []).includes('lancamento');

  function finalPrice(product) {
    return product.promoPrice && product.promoPrice < product.price ? product.promoPrice : product.price;
  }

  function discount(product) {
    if (!product.promoPrice || product.promoPrice >= product.price) return 0;
    return Math.round((1 - product.promoPrice / product.price) * 100);
  }

  function filtered(filters = {}) {
    const { category, brand, size, minPrice, maxPrice, onlyNew, search, sort } = filters;
    let list = all();

    if (category && category !== 'lancamentos') {
      list = list.filter((product) => product.category === category);
    }
    if (category === 'lancamentos' || onlyNew) {
      list = list.filter(isNew);
    }
    if (brand) {
      list = list.filter((product) => product.brand === brand);
    }
    if (size) {
      list = list.filter((product) => (product.sizes || []).includes(size));
    }
    if (typeof minPrice === 'number') {
      list = list.filter((product) => finalPrice(product) >= minPrice);
    }
    if (typeof maxPrice === 'number') {
      list = list.filter((product) => finalPrice(product) <= maxPrice);
    }
    if (search) {
      const term = slugify(search);
      list = list.filter((product) =>
        slugify(`${product.name} ${product.brand} ${product.short || ''}`).includes(term)
      );
    }

    const sorters = {
      novos: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      'menor-preco': (a, b) => finalPrice(a) - finalPrice(b),
      'maior-preco': (a, b) => finalPrice(b) - finalPrice(a),
      desconto: (a, b) => discount(b) - discount(a),
    };
    list = list.slice().sort(sorters[sort] || sorters.novos);
    return list;
  }

  function newArrivals(limit = 4) {
    return all()
      .filter(isNew)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  function bestSellers(limit = 4) {
    return all()
      .filter((product) => (product.badges || []).includes('mais-vendido'))
      .slice(0, limit);
  }

  function deals(limit = 4) {
    return all()
      .filter((product) => discount(product) > 0)
      .sort((a, b) => discount(b) - discount(a))
      .slice(0, limit);
  }

  function related(product, limit = 4) {
    return all()
      .filter((item) => item.id !== product.id && item.category === product.category)
      .slice(0, limit);
  }

  function allSizes() {
    const sizes = new Set();
    all().forEach((product) => (product.sizes || []).forEach((size) => sizes.add(size)));
    return Array.from(sizes).sort((a, b) => {
      const order = ['PP', 'P', 'M', 'G', 'GG', 'Único'];
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      if (aIndex !== -1 || bIndex !== -1) return (aIndex + 1 || 99) - (bIndex + 1 || 99);
      return parseInt(a, 10) - parseInt(b, 10);
    });
  }

  function searchCount(term) {
    return filtered({ search: term }).length;
  }

  return {
    slugify,
    all,
    bySlug,
    byId,
    create,
    update,
    remove,
    reset,
    replaceAll,
    isNew,
    finalPrice,
    discount,
    filtered,
    newArrivals,
    bestSellers,
    deals,
    related,
    allSizes,
    searchCount,
  };
})();
