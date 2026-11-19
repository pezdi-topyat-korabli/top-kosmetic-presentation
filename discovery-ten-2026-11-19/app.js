import { products } from './data.js';

const concepts = [
  ['discoveries', 'Открытия 2.0', 'Пастельная витрина и новые находки'],
  ['edition', 'Большой выпуск', 'Каталог как редакционный журнал'],
  ['atlas', 'Атлас категорий', 'Навигация через карту направлений'],
  ['boutiques', 'Бутики брендов', 'Знакомство с марками и их продуктами'],
  ['desk', 'Профессиональный стол', 'Поиск и компактный рабочий каталог'],
  ['ritual', 'Маршрут выбора', 'Пошаговое знакомство с категориями'],
  ['feed', 'Лента открытий', 'Чередование историй и продуктов'],
  ['object', 'Предмет', 'Один продукт в центре внимания'],
  ['spread', 'Разворот', 'Две стороны одной витрины'],
  ['mosaic', 'Мозаика', 'Разноформатная сетка открытий'],
];
const app = document.querySelector('#app');
const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const link = (slug, page = 'home') => `#/${slug}/${page}`;
const productLink = (slug, product) => link(slug, `product/${encodeURIComponent(product.id)}`);
const image = (p, cls = '') => `<img class="${cls}" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`;
const card = (p, slug) => `<article class="product-card"><a href="${productLink(slug, p)}"><div class="product-image">${image(p)}</div><div class="product-meta"><span>${esc(p.brand)}</span><h3 class="product-name">${esc(p.title)}</h3>${p.volume ? `<span>${esc(p.volume)}</span>` : ''}</div></a></article>`;
const cards = (items, slug) => `<div class="product-grid">${items.map(p => card(p, slug)).join('')}</div>`;
const title = (eyebrow, heading, copy = '') => `<div class="section-heading"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(heading)}</h2>${copy ? `<p>${esc(copy)}</p>` : ''}</div>`;
const categoryTiles = slug => `<div class="category-grid">${categories.map((c, i) => `<a class="category-tile" href="${link(slug, 'catalog')}" data-category-link="${esc(c)}"><span>0${i + 1}</span><h3>${esc(c)}</h3><span aria-hidden="true">↗</span></a>`).join('')}</div>`;
const hero = (slug, eyebrow, heading, copy, p = products[0], headingTag = 'h1') => `<section class="hero"><div class="hero-copy"><span class="eyebrow">${esc(eyebrow)}</span><${headingTag}>${esc(heading)}</${headingTag}><p>${esc(copy)}</p><a class="button" href="${link(slug, 'catalog')}">Открыть каталог <span aria-hidden="true">↗</span></a></div><div class="hero-media">${image(p)}<span class="hero-caption">${esc(p.brand)} / ${esc(p.volume || p.category)}</span></div></section>`;
const story = (heading, copy) => `<section class="story-band"><span class="eyebrow">TOP COSMETICS / О НАС</span><h2>${esc(heading)}</h2><p>${esc(copy)}</p></section>`;
const journal = slug => `<section class="journal-section">${title('ЖУРНАЛ', 'Идеи для знакомства')}<div class="journal-grid"><a href="${link(slug, 'catalog')}"><span>01 / КАТАЛОГ</span><h3>Исследовать категории</h3><p>Найдите подходящий раздел каталога.</p><span aria-hidden="true">↗</span></a><a href="${link(slug, 'catalog')}"><span>02 / БРЕНДЫ</span><h3>Открыть марки</h3><p>Посмотрите продукты разных брендов.</p><span aria-hidden="true">↗</span></a><a href="${productLink(slug, products[0])}"><span>03 / ДЕТАЛИ</span><h3>Рассмотреть продукт</h3><p>Перейдите на страницу товара.</p><span aria-hidden="true">↗</span></a></div></section>`;
const section = (heading, items, slug, eyebrow = 'ПОДБОРКА') => `<section class="product-section">${title(eyebrow, heading)}${cards(items, slug)}<a class="text-link" href="${link(slug, 'catalog')}">Весь каталог ↗</a></section>`;
const categorySection = slug => `<section class="categories-section">${title('КАТЕГОРИИ', 'Выберите направление')}${categoryTiles(slug)}</section>`;
const brandSection = slug => `<section class="brand-section">${title('БРЕНДЫ', 'Знакомство по именам')}<div class="brand-list">${brands.slice(0, 8).map((b, i) => `<a href="${link(slug, 'catalog')}" data-brand-link="${esc(b)}"><span>0${i + 1}</span> ${esc(b)} <span aria-hidden="true">↗</span></a>`).join('')}</div></section>`;

function home(slug) {
  const p = products;
  switch (slug) {
    case 'discoveries': return `<section class="discoveries-hero" aria-label="Открытия"><article class="discoveries-promo discoveries-promo-primary"><div class="discoveries-promo-copy"><span class="eyebrow">ПРОСТРАНСТВО ОТКРЫТИЙ</span><h1>Красота начинается с любопытства</h1><p>Знакомьтесь с продуктами и находите свои направления ухода.</p><a class="button" href="${link(slug, 'catalog')}">Открыть каталог ↗</a></div><div class="discoveries-promo-media"><img src="assets/hero/product-11053.png" alt="${esc(p[0].title)}" loading="lazy"></div></article><article class="discoveries-promo discoveries-promo-secondary"><div class="discoveries-promo-copy"><span class="eyebrow">В ФОКУСЕ / ${esc(p[7].brand)}</span><h2>Открыть продукт</h2><p>${esc(p[7].title)}</p><a class="button" href="${productLink(slug, p[7])}">Подробнее ↗</a></div><div class="discoveries-promo-media"><img src="assets/hero/product-9172.png" alt="${esc(p[7].title)}" loading="lazy"></div></article></section>${section('Открытия для вас', p.slice(0, 6), slug, 'В ФОКУСЕ')}${categorySection(slug)}${story('Больше, чем каталог', 'Пространство для знакомства с брендами, продуктами и категориями.')}${journal(slug)}`;
    case 'edition': return `<div class="edition-masthead"><span>TOP COSMETICS / ВЫПУСК 01</span><span>КАТАЛОГ КАК ЖУРНАЛ</span></div>${hero(slug, 'ГЛАВНАЯ ИСТОРИЯ / 01', 'Большой выпуск о красоте', 'Продукты, имена и направления — в одном редакционном пространстве.', p[3])}<div class="edition-columns">${story('Содержание выпуска', 'Начните с категории, бренда или продукта — у каждого свой способ знакомства.')}${categorySection(slug)}</div>${section('На страницах выпуска', p.slice(3, 7), slug)}${journal(slug)}`;
    case 'atlas': return `<section class="atlas-intro"><span class="eyebrow">УКАЗАТЕЛЬ / 01—${String(categories.length).padStart(2, '0')}</span><h1>Атлас категорий</h1><p>Выберите направление и продолжите знакомство с каталогом.</p>${categoryTiles(slug)}</section>${section('Объекты на карте', p.slice(5, 11), slug)}${brandSection(slug)}${story('Своя точка входа', 'От категории к бренду, от бренда к конкретному продукту.')}`;
    case 'boutiques': return `<section class="boutiques-intro"><span class="eyebrow">TOP COSMETICS / БРЕНДЫ</span><h1>Бутики брендов</h1><p>Исследуйте каталог через имена его участников.</p></section>${brandSection(slug)}<section class="boutique-feature"><div>${title('БУТИК / 01', p[0].brand, 'Знакомство с продуктами бренда')}<a class="button" href="${link(slug, 'catalog')}" data-brand-link="${esc(p[0].brand)}">Смотреть бренд ↗</a></div>${cards(p.filter(x => x.brand === p[0].brand).slice(0, 3), slug)}</section>${categorySection(slug)}${journal(slug)}`;
    case 'desk': return `<section class="desk-intro"><span class="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО / TOP COSMETICS</span><h1>Профессиональный стол</h1><p>Поиск по названию или бренду и быстрый доступ к категориям.</p><form class="desk-search" data-search-form><label for="desk-query">Поиск по каталогу</label><div><input id="desk-query" name="query" type="search" placeholder="Название или бренд"><button type="submit">Найти ↗</button></div></form></section>${categorySection(slug)}${section('Каталог на столе', p.slice(0, 8), slug, 'ПРОДУКТЫ')}${brandSection(slug)}`;
    case 'ritual': return `<section class="ritual-intro"><span class="eyebrow">ШАГ 01 / ВЫБОР НАПРАВЛЕНИЯ</span><h1>Маршрут выбора</h1><p>Начните с того, что хотите посмотреть. Дальше можно уточнить бренд и выбрать продукт.</p>${categoryTiles(slug)}</section><section class="ritual-steps"><div><span>01</span><h2>Направление</h2><p>Выберите категорию.</p></div><div><span>02</span><h2>Бренд</h2><p>Уточните выбор в каталоге.</p></div><div><span>03</span><h2>Продукт</h2><p>Откройте страницу товара.</p></div></section>${section('Начать знакомство', p.slice(0, 4), slug)}${story('Ваш маршрут', 'Исследуйте каталог в удобном порядке и возвращайтесь к категориям в любой момент.')}`;
    case 'feed': return `<section class="feed-intro"><span class="eyebrow">ЛЕНТА / TOP COSMETICS</span><h1>Лента открытий</h1><p>Листайте истории и переходите к продуктам.</p></section>${hero(slug, 'ИСТОРИЯ 01 / ПРОДУКТ', 'Внимание к деталям', 'Откройте страницу продукта и рассмотрите его ближе.', p[1], 'h2')}${section('В продолжение темы', p.slice(1, 5), slug)}${story('ИСТОРИЯ 02 / КАТЕГОРИИ', 'Каталог начинается с выбора направления.')}${categorySection(slug)}${journal(slug)}`;
    case 'object': return `<section class="object-feature"><div class="object-label"><span>ОБЪЕКТ 01 / ${esc(p[0].brand)}</span><span>${esc(p[0].category)}</span></div><div class="object-image">${image(p[0])}</div><div class="object-copy"><h1>${esc(p[0].title)}</h1><p>${esc(p[0].brand)}${p[0].volume ? ` / ${esc(p[0].volume)}` : ''}</p><a class="button" href="${productLink(slug, p[0])}">Рассмотреть объект ↗</a></div></section>${section('Другие объекты', p.slice(1, 5), slug)}${categorySection(slug)}${story('Предмет внимания', 'Знакомство с каталогом начинается с одного продукта.')}`;
    case 'spread': return `<section class="spread-hero"><div class="spread-left"><span class="eyebrow">СТОРОНА A / КАТЕГОРИИ</span><h1>Две стороны открытия</h1><p>Начните с направления или конкретного продукта.</p><a class="button" href="${link(slug, 'catalog')}">К категориям ↗</a></div><div class="spread-right"><span class="eyebrow">СТОРОНА B / ПРОДУКТ</span>${image(p[2])}<a href="${productLink(slug, p[2])}">${esc(p[2].brand)} — ${esc(p[2].title)} ↗</a></div></section><div class="spread-content">${categorySection(slug)}${brandSection(slug)}</div>${section('Продолжить знакомство', p.slice(4, 8), slug)}`;
    case 'mosaic': return `<section class="mosaic-intro"><span class="eyebrow">TOP COSMETICS / КОЛЛЕКЦИЯ</span><h1>Мозаика открытий</h1><p>Разные продукты и направления складываются в общую картину.</p></section><section class="mosaic-grid"><a class="mosaic-tile mosaic-feature" href="${productLink(slug, p[0])}">${image(p[0])}<div><span>ПРОДУКТ / 01</span><h2>${esc(p[0].title)}</h2><span>Смотреть ↗</span></div></a><div class="mosaic-tile mosaic-categories"><h2>Направления</h2>${categoryTiles(slug)}</div><div class="mosaic-tile mosaic-story"><span>О НАС</span><h2>Каталог для знакомства</h2><p>Выбирайте свой путь к продуктам и брендам.</p></div><a class="mosaic-tile mosaic-small" href="${productLink(slug, p[7])}">${image(p[7])}<h2>${esc(p[7].brand)}</h2><span>Открыть ↗</span></a></section>${section('Ещё в каталоге', p.slice(4, 8), slug)}`;
    default: return '';
  }
}

let filters = { query: '', category: '', brand: '', sort: 'name' };
let selected = new Set();
const option = (value, label, current) => `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(label)}</option>`;
function catalog(slug) {
  return `<section class="catalog-intro"><span class="eyebrow">КАТАЛОГ / TOP COSMETICS</span><h1>Каталог</h1><p>Выберите категорию или найдите продукт по названию и бренду.</p></section><div class="catalog-layout"><aside class="catalog-filters"><h2>Фильтры</h2><label for="catalog-query">Поиск</label><input id="catalog-query" type="search" value="${esc(filters.query)}" placeholder="Название или бренд"><label for="catalog-category">Категория</label><select id="catalog-category">${option('', 'Все категории', filters.category)}${categories.map(c => option(c, c, filters.category)).join('')}</select><label for="catalog-brand">Бренд</label><select id="catalog-brand">${option('', 'Все бренды', filters.brand)}${brands.map(b => option(b, b, filters.brand)).join('')}</select><button type="button" data-reset>Сбросить фильтры</button></aside><section class="catalog-results" aria-labelledby="results-heading"><div class="catalog-toolbar"><h2 id="results-heading">Продукты <span id="result-count" role="status" aria-live="polite"></span></h2><label for="catalog-sort">Сортировка</label><select id="catalog-sort">${option('name', 'По названию', filters.sort)}${option('brand', 'По бренду', filters.sort)}</select></div><div id="catalog-list"></div></section></div>`;
}
function updateResults(slug) {
  const query = filters.query.trim().toLocaleLowerCase('ru');
  const result = products.filter(p => (!query || `${p.title} ${p.brand}`.toLocaleLowerCase('ru').includes(query)) && (!filters.category || p.category === filters.category) && (!filters.brand || p.brand === filters.brand));
  result.sort((a, b) => (filters.sort === 'brand' ? a.brand.localeCompare(b.brand, 'ru') || a.title.localeCompare(b.title, 'ru') : a.title.localeCompare(b.title, 'ru')));
  document.querySelector('#result-count').textContent = result.length ? `Найдено ${result.length} товаров` : 'Ничего не найдено';
  document.querySelector('#catalog-list').innerHTML = result.length ? cards(result, slug) : '<div class="empty-state"><h3>Ничего не найдено</h3><p>Попробуйте изменить запрос или сбросить фильтры.</p><button type="button" data-reset>Сбросить фильтры</button></div>';
}
function productPage(slug, id) {
  const p = products.find(item => String(item.id) === String(id));
  if (!p) return `<section class="page-not-found"><h1>Товар не найден</h1><p>Выберите продукт из каталога.</p><a href="${link(slug, 'catalog')}">Перейти в каталог ↗</a></section>`;
  const related = products.filter(item => item.id !== p.id && (item.category === p.category || item.brand === p.brand)).slice(0, 4);
  return `<nav class="breadcrumbs" aria-label="Навигационная цепочка"><a href="${link(slug)}">Главная</a> / <a href="${link(slug, 'catalog')}">Каталог</a> / <span>${esc(p.title)}</span></nav><article class="product-page"><div class="product-media">${image(p)}</div><div class="product-details"><span class="eyebrow">${esc(p.brand)} / ${esc(p.category)}</span><h1>${esc(p.title)}</h1><dl><div><dt>Бренд</dt><dd>${esc(p.brand)}</dd></div><div><dt>Категория</dt><dd>${esc(p.category)}</dd></div>${p.volume ? `<div><dt>Объём</dt><dd>${esc(p.volume)}</dd></div>` : ''}</dl><button class="button" type="button" data-select="${esc(p.id)}" aria-pressed="${selected.has(String(p.id))}">${selected.has(String(p.id)) ? 'Добавлено в подборку ✓' : 'Добавить в подборку +'}</button><p class="selection-note">Подборка сохраняется только во время просмотра демо.</p></div></article>${related.length ? section('Продолжить знакомство', related, slug, 'ПОХОЖИЕ ПРОДУКТЫ') : ''}`;
}
function bar(slug, page, id) {
  const index = Math.max(0, concepts.findIndex(c => c[0] === slug));
  const active = slug && concepts.some(c => c[0] === slug);
  const targetPage = active ? (page === 'product' && id ? `product/${encodeURIComponent(id)}` : page) : 'home';
  const prev = concepts[(index + concepts.length - 1) % concepts.length];
  const next = concepts[(index + 1) % concepts.length];
  return `<div class="showroom-bar"><div class="showroom-title"><a href="#/overview">← Обзор концепций</a><span>ДЕМО / 10 КОНЦЕПЦИЙ</span></div><div class="showroom-controls"><a href="${link(prev[0], targetPage)}" aria-label="Предыдущая концепция: ${esc(prev[1])}">←</a><label for="concept-select">Концепция</label><select id="concept-select">${active ? '' : '<option value="" selected disabled>Выберите концепцию</option>'}${concepts.map(([key, name], i) => option(key, `${String(i + 1).padStart(2, '0')} / ${name}`, active ? slug : '')).join('')}</select><a href="${link(next[0], targetPage)}" aria-label="Следующая концепция: ${esc(next[1])}">→</a></div>${active ? `<nav class="showroom-tabs" aria-label="Страницы концепции"><a href="${link(slug)}" ${page === 'home' ? 'aria-current="page"' : ''}>Главная</a><a href="${link(slug, 'catalog')}" ${page === 'catalog' ? 'aria-current="page"' : ''}>Каталог</a><a href="${productLink(slug, products[0])}" ${page === 'product' ? 'aria-current="page"' : ''}>Товар</a></nav>` : ''}<p class="demo-notice">Демонстрация дизайна: цены, наличие и оформление заказа не представлены.</p></div>`;
}
function overview() {
  return `<main class="overview"><div class="overview-intro"><span class="eyebrow">TOP COSMETICS / DESIGN SHOWROOM</span><h1>Десять взглядов на каталог</h1><p>Выберите концепцию и изучите три страницы: главную, каталог и карточку товара.</p></div><div class="overview-grid">${concepts.map(([slug, name, description], i) => `<a class="overview-card overview-${slug}" href="${link(slug)}"><img class="overview-thumb" src="previews/${esc(slug)}.jpg" alt="Превью концепции ${esc(name)}" loading="lazy"><span>${String(i + 1).padStart(2, '0')} / 10</span><div class="overview-card-copy"><h2>${esc(name)}</h2><p>${esc(description)}</p></div><span aria-hidden="true">↗</span></a>`).join('')}</div></main>`;
}
function site(slug, page, id) {
  const body = page === 'catalog' ? catalog(slug) : page === 'product' ? productPage(slug, id) : home(slug);
  return `<div class="site"><div class="service-strip"><span>TOP COSMETICS / КАТАЛОГ</span><span>ПРОСТРАНСТВО ОТКРЫТИЙ</span></div><header class="site-header"><a class="brand-mark" href="${link(slug)}" aria-label="TOP COSMETICS — главная">TOP<span> COSMETICS</span></a><nav class="site-nav" aria-label="Основная навигация"><a href="${link(slug)}">Главная</a><a href="${link(slug, 'catalog')}">Каталог</a><a href="${link(slug, 'catalog')}" data-brand-link="">Бренды</a></nav><a class="header-action" href="${link(slug, 'catalog')}">Поиск ↗</a></header><main class="page">${body}</main><footer class="site-footer"><a class="brand-mark" href="${link(slug)}">TOP<span> COSMETICS</span></a><p>Пространство для знакомства с продуктами и брендами.</p><nav aria-label="Навигация в подвале"><a href="${link(slug)}">Главная</a><a href="${link(slug, 'catalog')}">Каталог</a><a href="#/overview">Все концепции</a></nav><span>Демонстрационная версия</span></footer></div>`;
}
function render({ focusMain = false } = {}) {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const slug = parts[0];
  const isConcept = concepts.some(c => c[0] === slug);
  const page = ['home', 'catalog', 'product'].includes(parts[1]) ? parts[1] : 'home';
  document.body.dataset.concept = isConcept ? slug : 'overview';
  app.innerHTML = bar(isConcept ? slug : null, page, parts[2]) + (isConcept ? site(slug, page, parts[2]) : overview());
  if (isConcept && page === 'catalog') updateResults(slug);
  document.title = isConcept ? `${concepts.find(c => c[0] === slug)[1]} — TOP COSMETICS` : 'Витрина концепций — TOP COSMETICS';
  window.scrollTo(0, 0);
  if (focusMain) {
    const main = app.querySelector('main');
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
  }
}
app.addEventListener('change', event => {
  const target = event.target;
  if (target.id === 'concept-select') {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const currentPage = ['home', 'catalog', 'product'].includes(parts[1]) ? parts[1] : 'home';
    const targetPage = currentPage === 'product' && parts[2] ? `product/${encodeURIComponent(parts[2])}` : currentPage;
    location.hash = link(target.value, targetPage);
  }
  if (target.id === 'catalog-category') filters.category = target.value;
  if (target.id === 'catalog-brand') filters.brand = target.value;
  if (target.id === 'catalog-sort') filters.sort = target.value;
  if (['catalog-category', 'catalog-brand', 'catalog-sort'].includes(target.id)) updateResults(document.body.dataset.concept);
});
app.addEventListener('input', event => {
  if (event.target.id === 'catalog-query') { filters.query = event.target.value; updateResults(document.body.dataset.concept); }
});
app.addEventListener('submit', event => {
  if (!event.target.matches('[data-search-form]')) return;
  event.preventDefault();
  filters = { query: new FormData(event.target).get('query').toString(), category: '', brand: '', sort: 'name' };
  location.hash = link(document.body.dataset.concept, 'catalog');
});
app.addEventListener('click', event => {
  const category = event.target.closest('[data-category-link]');
  const brand = event.target.closest('[data-brand-link]');
  if (category || brand) {
    filters = { query: '', category: category?.dataset.categoryLink || '', brand: brand?.dataset.brandLink || '', sort: 'name' };
    if (location.hash === link(document.body.dataset.concept, 'catalog')) { event.preventDefault(); render(); document.querySelector('#catalog-query').focus(); }
  }
  const reset = event.target.closest('[data-reset]');
  if (reset) { filters = { query: '', category: '', brand: '', sort: 'name' }; render(); document.querySelector('#catalog-query').focus(); }
  const select = event.target.closest('[data-select]');
  if (select) {
    const id = select.dataset.select;
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    select.setAttribute('aria-pressed', String(selected.has(id)));
    select.textContent = selected.has(id) ? 'Добавлено в подборку ✓' : 'Добавить в подборку +';
  }
});
window.addEventListener('hashchange', () => render({ focusMain: true }));
render();
