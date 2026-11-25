/* TOP Cosmetics — v3 «Клиника». Весь контент берётся из window.TOP_DATA (../_shared/data.js). */
(function (window, document) {
  'use strict';
  var D = window.TOP_DATA;
  var K = window.TCKit;
  if (!D) return;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ico(id, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>';
  }
  function reduced() { return !!(K && K.reduced && K.reduced()); }
  /* Вырезки героя и плиток несут светлую дымку по полю (альфа до ~15%), на синем она видна прямоугольником.
     Перерисовываем их в canvas с режимом destination-in: альфа возводится в квадрат, дымка исчезает, края чище.
     Без SVG-фильтров (в WebKit они дают артефакты при анимации) и без чтения пикселей (file:// запрещает). */
  /* Подчистка вырезок многоугольником (доли ширины и высоты файла): у флакона HydroPeptide Power Serum справа и снизу
     запечена серая «плита» тени — оставляем только флакон; у баночки KLAPP дно срезано прямоугольником —
     скругляем нижние углы, чтобы белое дно не читалось квадратной подставкой на светлом фоне */
  var KEEP = {
    'hero-serum.webp': [[0, 0], [.626, 0], [.626, .247], [.673, .247], [.673, .722], [.66, .734], [.644, .745],
      [.621, .755], [.597, .761], [0, .761]],
    'p-017.png': [[0, 0], [.573, 0], [.573, .292], [.604, .292], [.604, 1], [0, 1]],
    'hero-mask.webp': [[0, 0], [1, 0], [1, .6923], [.9016, .6923], [.8973, .7111], [.8859, .7248], [.8703, .7298],
      [.1844, .7298], [.1688, .7248], [.1573, .7111], [.1531, .6923], [0, .6923]],
    'tile-mask.webp': [[0, 0], [1, 0], [1, .6645], [.7953, .6645], [.7911, .6805], [.7797, .6922], [.7641, .6965],
      [.0313, .6965], [.0156, .6922], [.0042, .6805], [0, .6645]]
  };
  function keepFor(src) { var m = String(src || '').match(/[^\/]+$/); return m ? KEEP[m[0]] : null; }
  function cleanCutout(img) {
    function swap() {
      if (!img.naturalWidth || !img.parentNode) return;
      var c = document.createElement('canvas');
      var g = c.getContext && c.getContext('2d');
      if (!g) return;
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      try {
        g.drawImage(img, 0, 0);
        g.globalCompositeOperation = 'destination-in';
        g.drawImage(img, 0, 0);
        var keep = keepFor(img.getAttribute('src'));
        if (keep) {
          g.beginPath();
          keep.forEach(function (p, i) { g[i ? 'lineTo' : 'moveTo'](p[0] * c.width, p[1] * c.height); });
          g.closePath();
          g.fillStyle = '#000';
          g.fill();
        }
      } catch (err) { return; }
      c.className = img.className;
      c.setAttribute('aria-hidden', 'true');
      img.parentNode.replaceChild(c, img);
    }
    if (img.complete) swap(); else img.addEventListener('load', swap);
  }
  var finePointer = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  var TASK_LINK = 'Подбор по задаче';

  /* ---------- 1. Преимущества (полоса, подвал, меню) ---------- */
  var check = '<span class="chk" aria-hidden="true">' + ico('i-check') + '</span>';
  var benefitsHTML = D.benefits.map(function (b) { return '<li>' + check + '<span>' + esc(b) + '</span></li>'; }).join('');
  ['#benefits', '#ftr-benefits', '#drawer-benefits'].forEach(function (sel) {
    var el = $(sel); if (el) el.innerHTML = benefitsHTML;
  });

  /* ---------- 2. Навигация ---------- */
  function navHref(n) { return n === TASK_LINK ? '#tasks' : '#'; }
  /* В строке разделов «Подбор по задаче» виден только на планшете (768–900 px, там его нет в шапке) — ставим его сразу
     за «Каталогом», чтобы вход в подбор не прятался за краем ленты (в меню телефона порядок как в данных) */
  var navItems = D.nav.slice(), taskAt = navItems.indexOf(TASK_LINK);
  if (taskAt > 1) { navItems.splice(taskAt, 1); navItems.splice(1, 0, TASK_LINK); }
  $('#nav').innerHTML = navItems.map(function (n, i) {
    var cls = 'nav__link', lead = '';
    if (i === 0) { cls += ' nav__link--cat'; lead = ico('i-menu'); }
    if (n === TASK_LINK) cls += ' nav__link--accent';
    return '<li' + (n === TASK_LINK ? ' class="nav__item--task"' : '') + '><a class="' + cls + '" href="' + navHref(n) + '"' + (n === TASK_LINK ? ' data-scroll-to="tasks"' : '') + '>' +
      lead + '<span>' + esc(n) + '</span></a></li>';
  }).join('');
  $('#drawer-nav').innerHTML = D.nav.map(function (n) {
    return '<li><a href="' + navHref(n) + '"' + (n === TASK_LINK ? ' data-scroll-to="tasks"' : '') + ' data-drawer-link>' +
      '<span>' + esc(n) + '</span></a></li>';
  }).join('');

  /* ---------- 3. Бренды ---------- */
  /* Высоты подобраны по оптическому весу: тонкие HydroPeptide и Mesopharm крупнее, монограмма Yu.R — как прописные */
  var LOGO_H = { 'KLAPP': 16, 'HydroPeptide': 25, 'Bouticle': 16, 'Mesopharm': 30, 'Yu.R': 32 };
  /* Брендам без SVG — набранные словесные знаки со своим характером (разрядка, строчные, засечки, капсула),
     чтобы лента читалась стеной брендов, а не вторым меню. Имя для скринридера — из данных (aria-label). */
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ''); }
  function wordmark(name) {
    var k = slug(name);
    if (k === 'skinformula') return '<span class="wm wm--skinformula">Skin<br>Formula</span>';
    if (k === 'greenmatrix') return '<span class="wm wm--greenmatrix">Green<span>Matrix</span></span>';
    return '<span class="wm wm--' + k + '">' + esc(name) + '</span>';
  }
  $('#brands-count').textContent = D.brands.length;
  $('#brands').innerHTML = D.brands.map(function (b) {
    var inner = b.logo
      ? '<img class="brand__logo" src="' + esc(b.logo) + '" alt="" style="--h:' + (LOGO_H[b.name] || 20) + 'px" decoding="async">'
      : wordmark(b.name);
    return '<li><a class="brand" href="#" data-brand="' + esc(b.name) + '" aria-label="' + esc(b.name) + '">' + inner + '</a></li>';
  }).join('');

  /* Ленты с прокруткой (бренды, преимущества на узких экранах, задачи героя на телефоне):
     край гаснет только с той стороны, где что-то скрыто */
  function edges(sc, onSync) {
    if (!sc) return;
    function sync() {
      var scrolls = getComputedStyle(sc).overflowX !== 'visible';
      var max = scrolls ? sc.scrollWidth - sc.clientWidth : 0;
      sc.classList.toggle('is-more-l', max > 2 && sc.scrollLeft > 2);
      sc.classList.toggle('is-more-r', max > 2 && sc.scrollLeft < max - 2);
      if (onSync) onSync(max > 2 && sc.scrollLeft < max - 2);
    }
    sc.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
    window.addEventListener('load', sync);
    sync();
  }
  edges($('#benefits-viewport'));
  edges($('#nav')); /* строка разделов на узком ноутбуке и планшете листается */

  /* От 1024 px все двенадцать брендов стоят в строке, стрелка ведёт ко всем брендам. Если не помещаются (планшет уже
     1024 px), стрелка сначала листает ленту, а когда всё видно — ведёт ко всем брендам */
  edges($('.brands__bar')); /* на телефоне листается вся капсула-лента: правый конец гаснет, пока есть ещё бренды */
  (function brandStrip() {
    var sc = $('#brands-scroller'), all = $('.brands__all');
    if (!sc || !all) return;
    var moreRight = false;
    edges(sc, function (more) {
      moreRight = more;
      var label = more ? 'Показать ещё бренды' : 'Все бренды';
      all.setAttribute('aria-label', label);
      all.title = label;
    });
    all.addEventListener('click', function (e) {
      if (!moreRight) return;
      e.preventDefault();
      e.stopPropagation();
      sc.scrollBy({ left: Math.round(sc.clientWidth * 0.8), behavior: reduced() ? 'auto' : 'smooth' });
    });
  })();

  /* Белая капсула скользит под брендом (clip-path, без перерасчёта раскладки) */
  (function brandLens() {
    var scroller = $('#brands-scroller'), lens = $('#brands-hl'), list = $('#brands');
    if (!finePointer || !scroller || !lens || !list) return;
    var shown = false;
    function setClip(v) { lens.style.clipPath = v; lens.style.webkitClipPath = v; }
    function moveTo(a) {
      var W = list.scrollWidth;
      lens.style.width = W + 'px';
      var L = a.offsetLeft + list.offsetLeft, R = Math.max(0, W - (L + a.offsetWidth));
      var clip = 'inset(0 ' + R + 'px 0 ' + L + 'px round 999px)';
      if (!shown) {
        lens.style.transition = 'none'; setClip(clip); void lens.offsetWidth; lens.style.transition = '';
      }
      setClip(clip);
      lens.style.opacity = '1';
      shown = true;
    }
    function hide() { lens.style.opacity = '0'; shown = false; }
    list.addEventListener('mouseover', function (e) { var a = e.target.closest('.brand'); if (a) moveTo(a); });
    list.addEventListener('focusin', function (e) { var a = e.target.closest('.brand'); if (a) moveTo(a); });
    scroller.addEventListener('mouseleave', hide);
    list.addEventListener('focusout', function (e) { if (!list.contains(e.relatedTarget)) hide(); });
  })();

  /* ---------- 4. Герой ---------- */
  $('#hero-eyebrow').textContent = D.hero.eyebrow;
  $('#hero-title').textContent = D.hero.title;
  $('#hero-text').textContent = D.hero.text;
  $('#hero-primary').textContent = D.hero.primary;
  $('#hero-secondary').textContent = D.hero.secondary;
  $('#hero-products').insertAdjacentHTML('beforeend', D.hero.products.map(function (src, i) {
    return '<img class="stage__p stage__p--' + (i + 1) + '" src="' + esc(src) + '" alt="" decoding="async">';
  }).join(''));
  $$('#hero-products .stage__p').forEach(cleanCutout);
  /* Плавающие капсулы ведут к задачам: «Увлажнение», «Возрастные изменения», «Защита от солнца» */
  $('#hero-tags').innerHTML = D.tasks.slice(0, 3).map(function (t, i) {
    return '<li><a class="tag" href="#task-' + i + '" data-task="' + i + '">' +
      '<span class="pip" aria-hidden="true"></span><span>' + esc(t.name) + '</span></a></li>';
  }).join('');
  edges($('#hero-tags')); /* на телефоне это лента под кнопками героя */

  /* ---------- 5. Подбор по задаче ---------- */
  $('#tasks-grid').innerHTML = D.tasks.map(function (t, i) {
    return '<li><a class="task" id="task-' + i + '" href="#">' +
      '<h3 class="task__name">' + esc(t.name) + '</h3>' +
      '<p class="task__desc">' + esc(t.desc) + '</p>' +
      '<span class="task__o" aria-hidden="true"><span class="task__ring"></span><span class="task__hole"></span></span>' +
      '<img class="task__img" src="' + esc(t.cut || t.img) + '" alt="" width="480" height="480" decoding="async">' +
      '</a></li>';
  }).join('');
  $$('#tasks-grid .task__img').forEach(function (img) { if (keepFor(img.getAttribute('src'))) cleanCutout(img); });

  /* ---------- 6. Быстрые категории ---------- */
  /* У «Новинок» в данных нет своего фото. Новинка в данных — Skin Formula («Средства для очищения и защиты от солнца»).
     Солнцезащитный тюбик уже стоит в соседней «Защите от солнца», поэтому в «О» — очищающее средство Skin Formula
     из тех же данных (фото задачи «Очищение»): плитка не пустая и не повторяет соседку */
  var cleanse = D.tasks.filter(function (t) { return t.name === 'Очищение'; })[0];
  var NEW_SRC = cleanse ? (cleanse.cut || cleanse.img) : null;
  /* Все девять — в синем «О» логотипа; товар ≈ 80 % высоты рамки. Широкая баночка маски и низкий флакон
     «Роста волос» в своих вырезках занимают меньше места — их чуть увеличиваем (оптическое выравнивание) */
  var CAT_FIT = { 'Маски': 1.2, 'Рост волос': 1.12 };
  $('#cats-grid').innerHTML = D.quick.map(function (q) {
    var isNew = !q.img && !q.cut;
    var src = q.cut || q.img || (isNew ? NEW_SRC : null);
    var fit = CAT_FIT[q.name];
    var media = '<span class="cat__ring"></span><span class="cat__hole"></span>' +
      (src ? '<img class="cat__img" src="' + esc(src) + '" alt="" width="480" height="480"' +
        (fit ? ' style="--fit:' + fit + '"' : '') + ' decoding="async">' : '');
    return '<li><a class="cat' + (isNew ? ' cat--new' : '') + '" href="#">' +
      '<span class="cat__blob" aria-hidden="true">' + media + '</span>' +
      '<span class="cat__name">' + esc(q.name) + '</span></a></li>';
  }).join('');

  /* ---------- 7. Подборки ---------- */
  $('#feats-grid').innerHTML = D.features.map(function (f) {
    return '<li><a class="feat" href="#">' +
      '<span class="feat__label">' + esc(f.label) + '</span>' +
      '<h3 class="feat__title">' + esc(f.title) + '</h3>' +
      '<p class="feat__text">' + esc(f.text) + '</p>' +
      '<span class="feat__capsule" aria-hidden="true"></span>' +
      '<img class="feat__img" src="' + esc(f.img) + '" alt="" decoding="async">' +
      '</a></li>';
  }).join('');
  $$('#feats-grid .feat__img').forEach(cleanCutout);

  /* ---------- 8. Товары ---------- */
  var byId = {};
  D.products.forEach(function (p) { byId[p.id] = p; });
  /* «Все»: смешанный порядок для ритма витрины (только товары из данных) */
  var MIX = [11053, 9150, 9172, 10997, 10868, 11050, 10985, 10991, 10571, 11008];
  var TABS = [{ id: 'all', label: 'Все' }, { id: 'Для лица' }, { id: 'Для волос' }, { id: 'Для тела' }, { id: 'Витамины и БАДы' }];
  function productsFor(tab) {
    if (tab === 'all') return MIX.map(function (id) { return byId[id]; }).filter(Boolean);
    return D.products.filter(function (p) { return p.category === tab; });
  }
  function cardHTML(p, i) {
    return '<li class="card" style="--i:' + i + '">' +
      '<a class="card__media" href="#" tabindex="-1" aria-hidden="true">' +
      '<img class="card__img" src="' + esc(p.img) + '" alt="' + esc(p.name) + '" width="1000" height="1000" decoding="async"></a>' +
      '<button class="card__fav" type="button" aria-pressed="false" aria-label="В избранное: ' + esc(p.name) + '">' +
      ico('i-heart', 'ico--off') + ico('i-heart-fill', 'ico--on') + '</button>' +
      '<p class="card__brand">' + esc(p.brand) + '</p>' +
      '<h3 class="card__name"><a href="#">' + esc(p.name) + '</a></h3>' +
      '<p class="card__size">' + esc(p.size) + '</p>' +
      '<div class="card__row"><p class="card__price">' + esc(p.price) + '</p>' +
      '<button class="add" type="button" data-add="' + p.id + '" aria-label="В корзину: ' + esc(p.name) + '">' +
      ico('i-basket', 'ico--bag') + ico('i-check', 'ico--check') + '</button></div></li>';
  }

  var tabsEl = $('#tabs'), ink = $('#tabs-ink'), grid = $('#prods-grid');
  tabsEl.insertAdjacentHTML('beforeend', TABS.map(function (t, i) {
    return '<button class="tab" type="button" role="tab" id="ptab-' + i + '" aria-controls="prods-grid" aria-selected="' + (i === 0) + '"' +
      ' tabindex="' + (i === 0 ? 0 : -1) + '" data-tab="' + esc(t.id) + '">' + esc(t.label || t.id) + '</button>';
  }).join(''));
  var tabs = $$('.tab', tabsEl);

  function placeInk(btn, instant) {
    if (!ink || !btn) return;
    var W = tabsEl.scrollWidth;
    ink.style.width = W + 'px';
    var L = btn.offsetLeft, R = Math.max(0, W - (L + btn.offsetWidth));
    var clip = 'inset(0 ' + R + 'px 0 ' + L + 'px round 999px)';
    if (instant) ink.style.transition = 'none';
    ink.style.clipPath = clip; ink.style.webkitClipPath = clip;
    if (instant) { void ink.offsetWidth; ink.style.transition = ''; }
  }
  /* Плитка «Смотреть все» закрывает неполный ряд (5/4/3 колонки) и всегда стоит в конце ленты на телефоне */
  function moreHTML(tab, n) {
    var t = tab === 'all' ? 'Каталог' : tab;
    var s5 = (5 - n % 5) % 5, s4 = (4 - n % 4) % 4, s3 = (3 - n % 3) % 3;
    return '<li class="card card--more" data-s5="' + s5 + '" data-s4="' + s4 + '" data-s3="' + s3 + '"' +
      ' style="--s5:' + (s5 || 1) + ';--s4:' + (s4 || 1) + ';--s3:' + (s3 || 1) + ';--i:' + n + '">' +
      '<a class="more-tile" href="#">' +
      '<span class="more-tile__o" aria-hidden="true"></span>' +
      '<span class="more-tile__kicker">В каталоге</span>' +
      '<span class="more-tile__title">' + esc(t) + '</span>' +
      '<span class="more-tile__btn">Смотреть все<span class="arrow-dot" aria-hidden="true">' + ico('i-arrow') + '</span></span>' +
      '</a></li>';
  }
  var swapTimer = null;
  function renderGrid(tab, animate) {
    var list = productsFor(tab);
    var html = list.map(cardHTML).join('') + moreHTML(tab, list.length);
    grid.setAttribute('aria-labelledby', ($$('.tab[aria-selected="true"]', tabsEl)[0] || {}).id || 'prods-title');
    if (!animate || reduced()) { grid.innerHTML = html; grid.scrollLeft = 0; return; }
    clearTimeout(swapTimer);
    grid.classList.add('is-out');
    swapTimer = setTimeout(function () {
      grid.innerHTML = html;
      grid.scrollLeft = 0;
      grid.classList.remove('is-out');
      $$('.card', grid).forEach(function (c) { c.classList.add('is-in'); });
    }, 170);
  }
  function selectTab(btn, focus) {
    if (btn.getAttribute('aria-selected') === 'true') return;
    tabs.forEach(function (t) {
      var on = t === btn;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) btn.focus();
    placeInk(btn, false);
    if (btn.scrollIntoView && tabsEl.scrollWidth > tabsEl.clientWidth) {
      tabsEl.scrollTo({ left: btn.offsetLeft - 16, behavior: reduced() ? 'auto' : 'smooth' });
    }
    renderGrid(btn.getAttribute('data-tab'), true);
  }
  tabsEl.addEventListener('click', function (e) { var b = e.target.closest('.tab'); if (b) selectTab(b, false); });
  tabsEl.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === 'Home') next = tabs[0];
    if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) { e.preventDefault(); selectTab(next, true); }
  });
  renderGrid('all', false);

  /* ---------- Подвал ---------- */
  $('#ftr-catalog').innerHTML = D.footer.catalog.map(function (n) { return '<li><a href="#">' + esc(n) + '</a></li>'; }).join('');
  $('#ftr-buyers').innerHTML = D.footer.buyers.map(function (n) { return '<li><a href="#">' + esc(n) + '</a></li>'; }).join('');
  $('#ftr-note').textContent = D.note;

  /* ---------- Корзина: анимация кнопки, полёт фото, счётчик ---------- */
  var liveEl = $('#live');
  function announce(msg) {
    if (!liveEl) return;
    liveEl.textContent = '';
    setTimeout(function () { liveEl.textContent = msg; }, 40);
  }
  function addToCart(btn) {
    var id = Number(btn.getAttribute('data-add'));
    var card = btn.closest('.card');
    var img = card ? card.querySelector('.card__img') : null;
    var nameEl = card ? card.querySelector('.card__name') : null;
    var name = nameEl ? nameEl.textContent : '';

    btn.classList.remove('is-added');
    void btn.offsetWidth;
    btn.classList.add('is-added');
    if (!reduced()) {
      var plus = document.createElement('span');
      plus.className = 'add__plus';
      plus.setAttribute('aria-hidden', 'true');
      plus.textContent = '+1';
      btn.appendChild(plus);
      setTimeout(function () { if (plus.parentNode) plus.parentNode.removeChild(plus); }, 950);
    }
    clearTimeout(btn._addedTimer);
    btn._addedTimer = setTimeout(function () { btn.classList.remove('is-added'); }, 1700);

    var committed = false;
    function commit() {
      if (committed) return;
      committed = true;
      if (K) K.cart.add(id);
      announce('Добавлено в корзину: ' + name);
    }
    if (K) {
      K.fly(img, K.visibleTarget(), commit);
      setTimeout(commit, 900); /* страховка, если анимация прервана */
    } else {
      commit();
    }
  }
  function toggleFav(btn) {
    var on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    btn.classList.remove('is-pop');
    void btn.offsetWidth;
    if (!reduced()) btn.classList.add('is-pop');
  }

  /* ---------- Прокрутка к задачам и подсветка карточки ---------- */
  function smooth() { return reduced() ? 'auto' : 'smooth'; }
  function flashTask(i) {
    var card = document.getElementById('task-' + i);
    if (!card) return;
    card.scrollIntoView({ behavior: smooth(), block: 'center' });
    setTimeout(function () {
      card.classList.remove('is-flash');
      void card.offsetWidth;
      card.classList.add('is-flash');
      try { card.focus({ preventScroll: true }); } catch (err) { card.focus(); }
    }, reduced() ? 0 : 480);
  }

  /* ---------- Меню (телефон) ---------- */
  var drawer = $('#drawer'), lastOpener = null, drawerTimer = null;
  var openers = $$('[data-drawer-open]');
  function openDrawer(opener) {
    lastOpener = opener || null;
    clearTimeout(drawerTimer);
    drawer.hidden = false;
    openers.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    void drawer.offsetWidth;
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var closeBtn = $('.drawer__head [data-drawer-close]', drawer);
    if (closeBtn) closeBtn.focus();
  }
  function closeDrawer(restore) {
    if (drawer.hidden) return;
    drawer.classList.remove('is-open');
    openers.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    document.body.style.overflow = '';
    drawerTimer = setTimeout(function () { drawer.hidden = true; }, reduced() ? 0 : 240);
    if (restore !== false && lastOpener) lastOpener.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
    if (e.key === 'Tab' && !drawer.hidden) {
      var f = $$('a[href], button:not([disabled])', drawer).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Делегирование кликов ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    var add = t.closest('[data-add]');
    if (add) { e.preventDefault(); addToCart(add); return; }
    var fav = t.closest('.card__fav');
    if (fav) { e.preventDefault(); toggleFav(fav); return; }
    var opener = t.closest('[data-drawer-open]');
    if (opener) { e.preventDefault(); openDrawer(opener); return; }
    if (t.closest('[data-drawer-close]')) { e.preventDefault(); closeDrawer(); return; }
    var tag = t.closest('.tag[data-task]');
    if (tag) { e.preventDefault(); flashTask(tag.getAttribute('data-task')); return; }
    var a = t.closest('a[href]');
    if (!a) return;
    var inDrawer = !!a.closest('#drawer');
    var to = a.getAttribute('data-scroll-to');
    if (to) {
      e.preventDefault();
      if (inDrawer) closeDrawer(false);
      var el = document.getElementById(to);
      if (el) el.scrollIntoView({ behavior: smooth(), block: 'start' });
      return;
    }
    if (a.getAttribute('href') === '#') { e.preventDefault(); if (inDrawer) closeDrawer(false); }
  });

  /* Поиск: прототип, без отправки */
  var form = $('#search'), q = $('#q');
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
  var tabSearch = $('#tab-search');
  if (tabSearch) tabSearch.addEventListener('click', function () {
    try { q.focus({ preventScroll: true }); } catch (err) { q.focus(); }
    window.scrollTo({ top: 0, behavior: smooth() });
  });

  /* ---------- Шапка: тень при прокрутке ---------- */
  var hdr = $('.hdr'), topbar = $('.topbar'), ticking = false;
  function onScroll() {
    ticking = false;
    hdr.classList.toggle('is-stuck', window.scrollY > topbar.offsetHeight + 4);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Герой: лёгкий параллакс витрины за курсором ---------- */
  (function parallax() {
    var hero = $('.hero');
    if (!finePointer || reduced() || !hero) return;
    var layers = $$('.stage__layer', hero);
    var raf = 0, px = 0, py = 0;
    function apply() {
      raf = 0;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute('data-depth')) || 1;
        l.style.translate = (px * 16 * d).toFixed(1) + 'px ' + (py * 10 * d).toFixed(1) + 'px';
      });
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = window.requestAnimationFrame(apply);
    });
    hero.addEventListener('pointerleave', function () { px = 0; py = 0; if (!raf) raf = window.requestAnimationFrame(apply); });
  })();

  /* ---------- Вкладки: положение «чернил» после загрузки шрифтов и при ресайзе ---------- */
  function syncInk() { placeInk($('.tab[aria-selected="true"]', tabsEl), true); }
  syncInk();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncInk);
  var resizeTimer = null;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(syncInk, 120); });

  /* ---------- Появление при прокрутке ---------- */
  /* На телефоне подборки и товары — горизонтальные ленты: проявляем ленту целиком, а не карточки по одной */
  if (K && K.reveal) {
    var wide = !window.matchMedia || window.matchMedia('(min-width: 768px)').matches;
    K.reveal($$('.section .sec-head, .feats .sec-head, .task, .cat, ' + (wide ? '.feat, .prods__grid .card' : '.feats__grid, .prods__grid')), { stagger: 50 });
  }
})(window, document);
