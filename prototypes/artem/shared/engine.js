// Общая логика прототипов: маршруты через #, поиск, фильтры, демо-корзина.
// Внешний вид каждого варианта — в его HTML и CSS. Заказ здесь не оформляется.
(function () {
  'use strict'
  const data = window.TC_DATA
  if (!data) throw new Error('shared/data.js должен быть подключён до engine.js')
  const products = data.products
  const byId = new Map(products.map((p) => [p.id, p]))

  // ---------- форматирование ----------
  const nf = new Intl.NumberFormat('ru-RU')
  const money = (n) => (n == null ? 'цена уточняется' : nf.format(n) + '\u00a0₽')
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const plural = (n, one, few, many) => {
    const a = Math.abs(n) % 100, b = a % 10
    return a > 10 && a < 20 ? many : b > 1 && b < 5 ? few : b === 1 ? one : many
  }
  const countLabel = (n) => `${n}\u00a0${plural(n, 'товар', 'товара', 'товаров')}`
  const PRICE_NOTE = 'Цена — снимок сайта 15.11.2026, актуальность не подтверждена'
  const STOCK_NOTE = 'Наличие уточняется'

  // ---------- пути к ресурсам ----------
  const base = (document.currentScript && document.currentScript.src.replace(/shared\/engine\.js.*$/, '')) || ''
  const img = (p, i = 0) => (p.images && p.images[i] ? `${base}img/${p.images[i]}.webp` : null)

  // ---------- поиск и фильтры ----------
  const norm = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е').replace(/[«»"“”„'’]/g, '').replace(/\s+/g, ' ').trim()
  const haystack = new Map(products.map((p) => [p.id, norm([p.name, p.sourceName, p.brand, p.line, p.kind, p.article, p.section, p.root].join(' '))]))
  function search(list, q) {
    const words = norm(q).split(' ').filter(Boolean)
    if (!words.length) return list
    return list.filter((p) => words.every((w) => haystack.get(p.id).includes(w)))
  }
  const SORTS = {
    popular: { label: 'Как на сайте', fn: null },
    'price-asc': { label: 'Сначала дешевле', fn: (a, b) => (a.price ?? 1e9) - (b.price ?? 1e9) },
    'price-desc': { label: 'Сначала дороже', fn: (a, b) => (b.price ?? -1) - (a.price ?? -1) },
    name: { label: 'По названию', fn: (a, b) => a.name.localeCompare(b.name, 'ru') },
  }
  // params: { q, root, section, brand (строка или массив), step, kind: 'sample'|'set', sort }
  function filter(params = {}) {
    let list = products.slice()
    const brands = [].concat(params.brand || []).filter(Boolean)
    if (params.root) list = list.filter((p) => String(p.rootId) === String(params.root))
    if (params.section) list = list.filter((p) => String(p.sectionId) === String(params.section))
    if (brands.length) list = list.filter((p) => brands.includes(p.brand))
    if (params.step) list = list.filter((p) => p.step === params.step)
    if (params.kind === 'sample') list = list.filter((p) => /пробник/i.test(p.kind))
    if (params.kind === 'set') list = list.filter((p) => /набор/i.test(p.kind))
    if (params.max) list = list.filter((p) => p.price != null && p.price <= Number(params.max))
    list = search(list, params.q)
    const s = SORTS[params.sort]
    if (s && s.fn) list.sort(s.fn)
    return list
  }
  // Сколько товаров даст каждый вариант фильтра при остальных выбранных условиях.
  function facets(params = {}) {
    const without = (key) => { const p = { ...params }; delete p[key]; return filter(p) }
    const count = (list, key) => list.reduce((m, p) => { const k = p[key]; if (k != null) m.set(k, (m.get(k) || 0) + 1); return m }, new Map())
    return { brand: count(without('brand'), 'brand'), root: count(without('root'), 'rootId'), section: count(without('section'), 'sectionId'), step: count(without('step'), 'step') }
  }
  const brands = [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'en'))
  const tree = data.meta.tree
  const rootName = (id) => (tree.find((r) => String(r.id) === String(id)) || {}).name
  const sectionName = (id) => { for (const r of tree) for (const c of r.children) if (String(c.id) === String(id)) return c.name }
  const stepName = (id) => (data.meta.steps.find((s) => s[0] === id) || [])[1]

  // ---------- маршруты ----------
  // #home, #catalog?root=182&brand=KLAPP&q=крем, #product/11053
  function parse() {
    const h = (location.hash === '#main' ? '' : decodeURIComponent(location.hash.replace(/^#\/?/, ''))) || 'home'
    const [path, query = ''] = h.split('?')
    const [page, id] = path.split('/')
    const params = {}
    new URLSearchParams(query).forEach((v, k) => { params[k] = k in params ? [].concat(params[k], v) : v })
    return { page: page || 'home', id: id ? Number(id) : null, params }
  }
  function href(page, params = {}, id) {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) for (const x of [].concat(v)) if (x !== '' && x != null) q.append(k, x)
    const s = q.toString()
    return `#${page}${id != null ? '/' + id : ''}${s ? '?' + s : ''}`
  }
  const go = (page, params, id) => { location.hash = href(page, params, id) }
  const listeners = []
  function onRoute(fn) { listeners.push(fn); run() }
  let lastPage = null
  function run() {
    const r = parse()
    for (const fn of listeners) fn(r)
    // Новая страница — к началу и фокус на главный заголовок, чтобы экранный диктор не терялся.
    const key = r.page + '/' + (r.id ?? '')
    if (key !== lastPage) {
      lastPage = key
      window.scrollTo(0, 0)
      const h1 = document.querySelector('main h1')
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }) }
    }
  }
  window.addEventListener('hashchange', () => { if (location.hash !== '#main') run() })
  // Ссылка «К содержанию» (#main) — не маршрут: переводим фокус на заголовок, адрес не меняем.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href="#main"]')
    if (!a) return
    e.preventDefault()
    const t = document.querySelector('main h1') || document.querySelector('main')
    if (t) { t.setAttribute('tabindex', '-1'); t.focus() }
  })

  // ---------- демо-корзина ----------
  const KEY = 'tc-artem-cart'
  let cart = []
  try { cart = JSON.parse(sessionStorage.getItem(KEY) || '[]').filter((x) => byId.has(x.id)) } catch (e) { cart = [] }
  const cartListeners = []
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(cart)) } catch (e) {} ; cartListeners.forEach((fn) => fn(cartState())) }
  function cartState() {
    const items = cart.map((x) => ({ ...x, product: byId.get(x.id) }))
    return { items, count: items.reduce((s, x) => s + x.qty, 0), total: items.reduce((s, x) => s + (x.product.price || 0) * x.qty, 0) }
  }
  const cartApi = {
    add(id, qty = 1) { const x = cart.find((c) => c.id === id); if (x) x.qty = Math.min(99, x.qty + qty); else cart.push({ id, qty }); save(); toast('Добавлено в демо-корзину. Заказ в прототипе не оформляется.') },
    set(id, qty) { cart = qty > 0 ? cart.map((c) => (c.id === id ? { ...c, qty: Math.min(99, qty) } : c)) : cart.filter((c) => c.id !== id); save() },
    remove(id) { cart = cart.filter((c) => c.id !== id); save() },
    clear() { cart = []; save() },
    state: cartState,
    on(fn) { cartListeners.push(fn); fn(cartState()) },
  }

  // ---------- общие элементы ----------
  let toastEl = null, toastTimer = null
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement('div')
      toastEl.className = 'tc-toast'
      toastEl.setAttribute('role', 'status')
      toastEl.setAttribute('aria-live', 'polite')
      document.body.appendChild(toastEl)
    }
    toastEl.textContent = text
    toastEl.classList.add('is-on')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 3200)
  }
  function ribbon(conceptName) {
    const el = document.createElement('div')
    el.className = 'tc-ribbon'
    el.innerHTML = `<span><b>Прототип ${esc(conceptName)}</b> · данные — снимок top-cosmetics.shop от 15.11.2026 · цены и наличие не подтверждены · заказ не оформляется</span><a href="${base}index.html">Все варианты</a>`
    document.body.prepend(el)
  }
  // Подсветка найденного текста в названии.
  function mark(text, q) {
    const t = esc(text)
    const words = norm(q).split(' ').filter((w) => w.length > 1)
    if (!words.length) return t
    const re = new RegExp('(' + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/е/g, '[её]')).join('|') + ')', 'gi')
    return t.replace(re, '<mark>$1</mark>')
  }
  // Кнопка «Показать ещё» и т.п. не нужны: в снимке 32 товара. Число в каталоге сайта — для контекста.
  const catalogTotal = data.meta.catalogTotal

  window.TC = {
    data, products, byId, brands, tree, rootName, sectionName, stepName,
    money, esc, plural, countLabel, PRICE_NOTE, STOCK_NOTE, catalogTotal,
    img, search, filter, facets, SORTS, norm, mark,
    parse, href, go, onRoute,
    cart: cartApi, toast, ribbon,
    store: data.meta.store, delivery: data.meta.delivery, steps: data.meta.steps,
  }
})()
