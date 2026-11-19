import { products } from './data.js';
import { firstHeader, firstHome } from './first.js';
import { lastHeader, lastHome } from './last.js';

const concepts = [
  { id: 'cobalt', title: 'Открытия', mode: 'Кампания / полноэкранное фото', note: 'Фотография во весь экран, крупная типографика и спокойные голубые поля.' },
  { id: 'taxi', title: 'POP MARKET', mode: 'Яркий / товар сразу', note: 'Контрастная витрина с товарами уже на первом экране.' },
  { id: 'atelier', title: 'Ателье', mode: 'Тихая роскошь / предмет', note: 'Зелёный шёлк, крупный packshot и музейная подача.' },
  { id: 'index', title: 'Индекс', mode: 'Каталог / строка за строкой', note: 'Плотный поиск и точный товарный указатель.' },
  { id: 'water', title: 'Ритуал', mode: 'Выбор / по задаче', note: 'Покупка начинается с категории и ежедневного сценария.' },
  { id: 'night', title: 'NOCTURNE', mode: 'Ночной / один объект', note: 'Тёмная предметная сцена с красным ориентиром.' },
  { id: 'paper', title: 'Журнал', mode: 'Редакционный / выпуск', note: 'Выпуск с обложкой, содержанием и выбором редакции.' },
  { id: 'studio', title: 'Галерея', mode: 'Коллаж / товарная стена', note: 'Разноформатная фотостена без одинаковых плиток.' },
  { id: 'lab', title: 'Лаборатория', mode: 'Рациональный / сравнение', note: 'Сопоставление реальных брендов, объёмов и категорий.' },
  { id: 'gift', title: 'Подарочная', mode: 'Подарок / выбор отделов', note: 'Красная витрина с нумерованными направлениями.' },
];

const app = document.querySelector('#app');
const ids = new Set(concepts.map(item => item.id));
const categories = [...new Set(products.map(item => item.category).filter(Boolean))];
const brands = [...new Set(products.map(item => item.brand).filter(Boolean))];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const byId = id => products.find(product => String(product.id) === String(id));
let shortlist = new Set();
let compare = new Set();
let compareOpen = false;

function route() {
  const raw = location.hash.replace(/^#/, '') || '/overview';
  const [pathname, query = ''] = raw.split('?');
  const parts = pathname.split('/').filter(Boolean);
  return { look: parts[0] || 'overview', view: parts[1] || 'home', id: parts[2] || '', params: new URLSearchParams(query) };
}

function link(look, view = 'home', params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null));
  return `#/${look}/${view}${query.size ? `?${query}` : ''}`;
}

function context(look) {
  const featuredOrder = {
    cobalt: [10991, 11053, 9172, 9150],
    taxi: [10997, 11053, 9172, 10991, 10540],
    atelier: [11053, 11067, 10991],
    index: [9172, 11067, 10540, 10997],
    water: [9172, 10540, 10571, 11053],
    night: [9172, 11067, 9150],
    paper: [10991, 9172, 11053, 10997],
    studio: [11067, 10991, 10540, 9172, 11050],
    lab: [9150, 11067, 11053, 9172],
    gift: [10991, 9172, 10540, 10997],
  }[look] || [];
  const prioritized = [...featuredOrder.map(byId).filter(Boolean), ...products.filter(product => !featuredOrder.includes(product.id))];
  return {
    products: prioritized,
    categories,
    brands,
    esc,
    byId,
    link: (view = 'home', params = {}) => link(look, view, params),
    item: product => link(look, `product/${encodeURIComponent(product.id)}`),
    picture: (product, className = '') => `<img class="${esc(className)}" src="assets/products/${encodeURIComponent(product.id)}.webp" alt="${esc(product.title)}" loading="lazy">`,
    cut: (id, className = '') => `<img class="${esc(className)}" src="assets/cutouts/${encodeURIComponent(id)}.webp" alt="${esc(byId(id)?.title || '')}" loading="lazy">`,
    nav: () => ({ home: link(look), catalog: link(look, 'catalog'), product: link(look, `product/${products[0].id}`) }),
  };
}

function dock(look = '') {
  return `<div class="showroom-dock"><a href="#/overview" aria-label="Все направления TOP Cosmetics">← Все направления</a><div class="dock-actions"><label class="dock-label" for="look-picker">Направление</label><select id="look-picker" aria-label="Выбрать направление"><option value="" ${look ? '' : 'selected'} disabled>Выбрать витрину</option>${concepts.map((item, index) => `<option value="${item.id}" ${look === item.id ? 'selected' : ''}>${String(index + 1).padStart(2, '0')} / ${esc(item.title)}</option>`).join('')}</select></div><span class="demo-disclaimer">Демонстрация дизайна · цены и остатки не показаны</span></div>`;
}

function overview() {
  return `<main class="overview"><header class="overview-head"><div><p class="overview-kicker">TOP COSMETICS / ART DIRECTION 02</p><h1>Десять разных способов открыть магазин</h1></div><p>Здесь различаются не только цвета. У каждого направления свои композиция, навигация и сценарий покупки.</p></header><div class="overview-grid">${concepts.map((item, index) => `<a class="overview-item overview-${item.id}" href="${link(item.id)}"><figure><img src="previews/${item.id}.jpg" alt="Первый экран концепции «${esc(item.title)}»" loading="lazy"><figcaption>${String(index + 1).padStart(2, '0')} / ${esc(item.mode)}</figcaption></figure><h2>${esc(item.title)}</h2><p>${esc(item.note)}</p></a>`).join('')}</div></main>`;
}

function productCard(product, look) {
  const href = link(look, `product/${product.id}`);
  if (look === 'index') return `<article class="shop-product"><a class="shop-product__media" href="${href}">${context(look).picture(product)}</a><a class="shop-product__text" href="${href}"><strong class="shop-product__brand">${esc(product.brand)}</strong><strong class="shop-product__title">${esc(product.title)}</strong></a><span class="shop-product__volume">${esc(product.volume || '—')}</span><a class="shop-product__arrow" href="${href}" aria-label="Открыть ${esc(product.title)}">↗</a></article>`;
  if (look === 'lab') return `<article class="shop-product"><button class="lab-select" type="button" data-compare="${esc(product.id)}" aria-label="Добавить товар к сравнению" aria-pressed="${compare.has(String(product.id))}">${compare.has(String(product.id)) ? '✓' : '+'}</button><a class="shop-product__media" href="${href}">${context(look).picture(product)}</a><a class="shop-product__text" href="${href}"><strong class="shop-product__title">${esc(product.title)}</strong></a><span class="shop-product__brand">${esc(product.brand)}</span><span class="shop-product__volume">${esc(product.volume || '—')}</span></article>`;
  return `<a class="shop-product" href="${href}"><span class="shop-product__media">${context(look).picture(product)}</span><span class="shop-product__text"><strong class="shop-product__brand">${esc(product.brand)}</strong><strong class="shop-product__title">${esc(product.title)}</strong><span class="shop-product__volume">${esc(product.volume || '')}</span></span></a>`;
}

function comparisonTable(selected) {
  if (selected.length < 2) return '';
  return `<section class="compare-rows" id="compare-results" aria-label="Сравнение товаров">${selected.map(product => `<div><p class="lab-number">${esc(product.brand)}</p><h3>${esc(product.title)}</h3><dl><div><dt>Бренд</dt><dd>${esc(product.brand)}</dd></div><div><dt>Категория</dt><dd>${esc(product.category)}</dd></div><div><dt>Объём</dt><dd>${esc(product.volume || '—')}</dd></div></dl><a href="${link('lab', `product/${product.id}`)}">Открыть товар ↗</a></div>`).join('')}</section>`;
}

function catalog(look, params) {
  const query = params.get('q') || '';
  const category = params.get('category') || '';
  const brand = params.get('brand') || '';
  const brandMode = params.get('mode') === 'brands' || Boolean(brand);
  const q = query.trim().toLocaleLowerCase('ru');
  const rows = products.filter(product => (!category || product.category === category) && (!brand || product.brand === brand) && (!q || `${product.title} ${product.brand}`.toLocaleLowerCase('ru').includes(q))).sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  const slug = `catalog-${look}`;
  const intro = {
    cobalt: ['Открытия / подборка', 'Найти своё'], taxi: ['POP MARKET / ALL ITEMS', 'Выбирай своё'], atelier: ['КОЛЛЕКЦИЯ / TOP COSMETICS', 'Предметы ухода'], index: ['TOP COSMETICS / INDEX 001', 'Индекс средств'], water: ['ШАГ 01 / ВАШ РИТУАЛ', 'Выберите направление'], night: ['NOCTURNE / КАТАЛОГ', 'Вечерний выбор'], paper: ['ВЫПУСК № 01 / КАТАЛОГ', 'На страницах журнала'], studio: ['TOP COSMETICS / ГАЛЕРЕЯ', 'Стена средств'], lab: ['ИССЛЕДОВАНИЕ / КАТАЛОГ', 'Выбрать и сравнить'], gift: ['ПОДАРОЧНЫЙ ВЫБОР / 01', 'Выберите направление'],
  }[look];
  const selected = [...compare].map(byId).filter(Boolean).slice(0, 2);
  const headings = look === 'index'
    ? '<div class="catalog-row-head"><span>ФОТО</span><span>ТОВАР / БРЕНД</span><span>ОБЪЁМ</span><span></span></div>'
    : look === 'lab'
      ? '<div class="catalog-row-head"><span></span><span>ФОТО</span><span>ТОВАР</span><span>БРЕНД</span><span>ОБЪЁМ</span></div>'
      : '';
  const brandLinks = brandMode ? `<ul class="brand-bar"><li><a href="${link(look, 'catalog', { mode: 'brands' })}" ${brand ? '' : 'aria-current="true"'}>Все бренды</a></li>${brands.map(name => `<li><a href="${link(look, 'catalog', { mode: 'brands', brand: name })}" ${brand === name ? 'aria-current="true"' : ''}>${esc(name)}</a></li>`).join('')}</ul>` : '';
  return `<main class="shop-main ${slug}">
    <section class="shop-catalog-intro"><p class="catalog-kicker">${esc(intro[0])}</p><h1>${brandMode ? 'Бренды' : esc(intro[1])}</h1><p>Знакомьтесь с товарами из каталога TOP COSMETICS.</p></section>
    <div class="shop-catalog-content">
      ${look === 'lab' && compareOpen ? comparisonTable(selected) : ''}
      ${brandLinks}
      <ul class="category-bar"><li><a href="${link(look, 'catalog', brandMode ? { mode: 'brands', brand } : {})}" ${category ? '' : 'aria-current="true"'}>Все средства</a></li>${categories.map(name => `<li><a href="${link(look, 'catalog', { category: name, mode: brandMode ? 'brands' : '', brand })}" ${category === name ? 'aria-current="true"' : ''}>${esc(name)}</a></li>`).join('')}</ul>
      <div class="catalog-tools"><strong role="status" aria-live="polite">${rows.length} товаров</strong><form data-search role="search"><input name="q" type="search" value="${esc(query)}" placeholder="Название или бренд" aria-label="Поиск по товарам"><button type="submit" aria-label="Найти">↗</button></form></div>
      ${headings}
      <section class="shop-grid" aria-label="Товары каталога">${rows.length ? rows.map(product => productCard(product, look)).join('') : '<p class="no-products">Ничего не нашлось. Измените запрос или выберите другую категорию.</p>'}</section>
    </div>
    ${look === 'lab' ? `<div class="compare-tray"><span>${compare.size} из 2 товаров для сравнения</span><button type="button" data-open-compare ${compare.size < 2 ? 'disabled' : ''}>Сравнить выбранные ↗</button></div>` : ''}
  </main>`;
}

function productPage(look, id) {
  const product = byId(id);
  if (!product) return `<main class="product-view"><h1>Товар не найден</h1><a href="${link(look, 'catalog')}">В каталог ↗</a></main>`;
  const fav = shortlist.has(String(product.id));
  const facts = `<dl class="product-view__meta"><div><dt>Бренд</dt><dd>${esc(product.brand)}</dd></div><div><dt>Категория</dt><dd>${esc(product.category)}</dd></div><div><dt>Объём</dt><dd>${esc(product.volume || '—')}</dd></div></dl>`;
  const media = (product.id === 11053 && look !== 'night') || product.id === 9172 ? context(look).cut(product.id) : context(look).picture(product);
  const hero = `<section class="product-view product-view--${look}"><div class="product-view__image">${media}</div><div class="product-view__details"><p class="product-view__brand">${esc(product.brand)} / ${esc(product.category)}</p><h1>${esc(product.title)}</h1>${facts}<button class="product-view__action" type="button" data-shortlist="${esc(product.id)}" aria-pressed="${fav}">${fav ? 'Сохранено в подборке ✓' : 'Сохранить в подборку +'}</button><p class="product-view__note">В этой демонстрации цены, остатки и заказ не представлены.</p><a class="product-view__back" href="${link(look, 'catalog', { category: product.category })}">← Вернуться в категорию</a></div></section>`;
  const related = products.filter(item => item.id !== product.id && item.category === product.category).slice(0, 4);
  return `<main class="shop-main product-main product-main--${look}">${hero}<section class="related-products"><div><p class="catalog-kicker">ПРОДОЛЖИТЬ ЗНАКОМСТВО</p><h2>В этой категории</h2></div><div class="shop-grid">${related.map(item => productCard(item, look)).join('')}</div></section></main>`;
}

function footer(look) {
  const name = concepts.find(item => item.id === look)?.title || 'TOP COSMETICS';
  return `<footer class="shop-footer"><strong>TOP COSMETICS / ${esc(name)}</strong><nav><a href="${link(look)}">Главная</a><a href="${link(look, 'catalog')}">Каталог</a><a href="#/overview">Все направления</a></nav></footer>`;
}

function store(look, view, id, params) {
  const c = context(look);
  const header = firstHeader(look, c) || lastHeader(look, c);
  const body = view === 'catalog' ? catalog(look, params) : view === 'product' ? productPage(look, id) : firstHome(look, c) || lastHome(look, c);
  const current = concepts.find(item => item.id === look);
  document.title = `${current.title} — TOP COSMETICS`;
  document.body.dataset.look = look;
  return `${dock(look)}<div class="store" data-look="${look}">${header}${body}${footer(look)}</div>`;
}

function render({ preserveScroll = false, focusMain = false } = {}) {
  const previousScroll = window.scrollY;
  const current = route();
  app.innerHTML = ids.has(current.look) ? store(current.look, ['home', 'catalog', 'product'].includes(current.view) ? current.view : 'home', current.id, current.params) : `${dock()}${overview()}`;
  document.body.dataset.look = ids.has(current.look) ? current.look : 'overview';
  if (!ids.has(current.look)) document.title = 'Десять направлений — TOP COSMETICS';
  window.scrollTo(0, preserveScroll ? previousScroll : 0);
  if (focusMain) {
    const main = app.querySelector('main');
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
  }
}

app.addEventListener('change', event => {
  if (event.target.id === 'look-picker' && event.target.value) location.hash = link(event.target.value);
});

app.addEventListener('submit', event => {
  const form = event.target.closest('[data-search]');
  if (!form) return;
  event.preventDefault();
  const current = route();
  const query = new FormData(form).get('q')?.toString().trim() || '';
  location.hash = link(current.look, 'catalog', { q: query, category: current.params.get('category') || '', brand: current.params.get('brand') || '', mode: current.params.get('mode') || '' });
});

app.addEventListener('click', event => {
  const compareButton = event.target.closest('[data-compare]');
  if (compareButton) {
    const id = compareButton.dataset.compare;
    if (compare.has(id)) compare.delete(id);
    else if (compare.size < 2) compare.add(id);
    else return;
    render({ preserveScroll: true });
    app.querySelector(`[data-compare="${CSS.escape(id)}"]`)?.focus();
  }
  const openCompare = event.target.closest('[data-open-compare]');
  if (openCompare && compare.size === 2) {
    compareOpen = !compareOpen;
    render({ preserveScroll: true });
    if (compareOpen) app.querySelector('#compare-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else app.querySelector('[data-open-compare]')?.focus();
  }
  const favorite = event.target.closest('[data-shortlist]');
  if (favorite) {
    const id = favorite.dataset.shortlist;
    if (shortlist.has(id)) shortlist.delete(id); else shortlist.add(id);
    favorite.setAttribute('aria-pressed', String(shortlist.has(id)));
    favorite.textContent = shortlist.has(id) ? 'Сохранено в подборке ✓' : 'Сохранить в подборку +';
  }
});

window.addEventListener('hashchange', () => render({ focusMain: true }));
render();
