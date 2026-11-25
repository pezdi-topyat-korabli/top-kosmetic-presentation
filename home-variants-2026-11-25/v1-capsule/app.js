/* v1-capsule «Капсула»: весь контент — из window.TOP_DATA (_shared/data.js), корзина и полёт — TCKit (_shared/kit.js). */
(function (window, document) {
  'use strict';
  var D = window.TOP_DATA;
  var K = window.TCKit;
  if (!D) return;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ico(id, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>';
  }
  /* Типографика: короткие предлоги и союзы не остаются в конце строки (сам текст данных не меняется). */
  function typo(s) { return esc(s).replace(/(^|[\s(«])([А-Яа-яЁё]{1,2}) /g, '$1$2 '); }
  function slot(name) { return $('[data-list="' + name + '"]'); }
  function text(name) { return $('[data-text="' + name + '"]'); }
  /* Облегчённые копии тех же фото (WebP ≈ 2× размера на экране) — в assets/img этой папки; исходники в _shared
     не меняются. Карточки: 560×560 вместо 1000×1000; вырезки: 360×360 WebP вместо PNG 480×480. */
  function lite(src) {
    var m;
    if (!src) return src;
    if ((m = /\/products\/(\d+)\.webp$/.exec(src))) return 'assets/img/p/' + m[1] + '.webp';
    if ((m = /\/cut-v8\/(p-\d+)\.png$/.exec(src))) return 'assets/img/cut/' + m[1] + '.webp';
    if ((m = /\/tiles\/(tile-[a-z]+)\.webp$/.exec(src))) return 'assets/img/tile/' + m[1] + '.webp';
    return src;
  }
  function reduced() { return K ? K.reduced() : false; }
  var finePointer = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  var check = '<span class="check" aria-hidden="true">' + ico('i-check') + '</span>';

  /* ---------- 1. Преимущества: одна неподвижная строка (≤ 1160 px и на телефоне — сетка 2×2) ---------- */
  slot('benefits').innerHTML = D.benefits.map(function (b, i) {
    return '<li class="benefits__item" style="--i:' + i + '">' + check + '<span>' + typo(b) + '</span></li>';
  }).join('');

  /* ---------- 2. Меню в строке шапки: «Каталог» — синяя капсула, рядом разделы «Для лица … Новинки».
     «Бренды» — это ряд капсул прямо под шапкой (ярлык «Бренды 12» и «Все бренды»), поэтому в строке его нет:
     так поиск остаётся не уже 270 px. «Подбор по задаче» — капсулы задач в первом экране и секция под ним. ---------- */
  slot('nav').innerHTML = D.nav.filter(function (n) { return n !== 'Каталог' && n !== 'Подбор по задаче' && n !== 'Бренды'; }).map(function (n) {
    var href = n === 'Новинки' ? '#categories' : '#catalog';
    var opt = n === 'Новинки' ? ' menu__item--n' : n === 'Для тела' ? ' menu__item--t' : '';
    return '<li class="menu__item' + opt + '"><a class="menu__link" href="' + href + '" data-nav="' + esc(n) + '">' + esc(n) + '</a></li>';
  }).join('');

  /* ---------- 3. Бренды: логотипы, где они есть; остальные — набранные словесные знаки ---------- */
  /* Высота логотипа в капсуле в модулях --u (CSS; 10px на 1440): 1.9 → 19px. У каждого файла свои поля и пропорции. */
  var LOGO_H = { 'KLAPP': 1.9, 'HydroPeptide': 2.6, 'Bouticle': 1.8, 'Mesopharm': 3.2, 'Yu.R': 3.6 };
  var WORDMARK = {
    'Lisap': 'wm-lisap', 'MESODERM': 'wm-mesoderm', 'Skin Formula': 'wm-skin', 'SHOR': 'wm-shor',
    'Ekseption': 'wm-eks', 'GreenMatrix': 'wm-green', 'BNS': 'wm-bns'
  };
  $('[data-brand-count]').textContent = D.brands.length;
  slot('brands').innerHTML = D.brands.map(function (b, i) {
    var h = LOGO_H[b.name] || 1.8;
    var inner = b.logo
      ? '<img class="brand__logo" src="' + esc(b.logo) + '" alt="' + esc(b.name) + '" style="--h:' + h + '">' +
        '<img class="brand__logo brand__logo--w" src="' + esc(b.logo) + '" alt="" aria-hidden="true" style="--h:' + h + '">'
      : '<span class="wm ' + (WORDMARK[b.name] || '') + '">' + esc(b.name) + '</span>';
    return '<li style="--i:' + (i + 1) + '"><a class="brand" href="#" data-brand="' + esc(b.name) + '">' + inner + '</a></li>';
  }).join('');

  /* ---------- 4. Первый экран ---------- */
  var H = D.hero;
  text('eyebrow').textContent = H.eyebrow;
  var words = H.title.split(' ');
  var last = words.pop();
  text('title').innerHTML = '<span class="hero__line">' + esc(words.join(' ')) + '</span> <span class="pill-word">' + esc(last) + '</span>';
  text('text').innerHTML = typo(H.text);
  text('primary').textContent = H.primary;
  text('secondary').textContent = H.secondary;
  $$('[data-hero]').forEach(function (img) { img.src = H.products[+img.getAttribute('data-hero')]; });
  /* Три первые задачи из данных — капсулы под кнопками; нажатие ведёт к «Подбору по задаче» и подсвечивает задачу */
  slot('hero-tasks').innerHTML = D.tasks.slice(0, 3).map(function (t, i) {
    return '<li style="--i:' + i + '"><a class="chip" href="#task-' + i + '" data-task-jump="' + i + '">' +
      '<span class="chip__orb" aria-hidden="true"><span class="chip__ph"><img src="' + esc(lite(t.cut)) + '" alt="" width="360" height="360"></span></span>' +
      '<span class="chip__name">' + esc(t.name) + '</span></a></li>';
  }).join('');
  var F0 = D.features[0];
  $('[data-ticket]').innerHTML =
    '<span class="ticket__img"><img src="' + esc(lite(F0.img)) + '" alt="" width="417" height="480"></span>' +
    '<span class="ticket__txt"><span class="ticket__label">' + esc(F0.label) + '</span><span class="ticket__title">' + esc(F0.title) + '</span></span>' +
    '<span class="ticket__go">' + ico('i-arrow-ur') + '</span>';

  /* ---------- 5. Быстрые категории ---------- */
  /* У «Новинок» в данных нет фото: берём вырезанное фото Skin Formula из задачи «Очищение»
     (в данных Skin Formula — «Новинка»: «Средства для очищения и защиты от солнца»). Капсула — такая же, как у всех. */
  var NEW_CUT = D.tasks[4] && D.tasks[4].cut;
  slot('quick').innerHTML = D.quick.map(function (q) {
    var cut = q.cut || NEW_CUT;
    return '<li><a class="cat" href="#catalog"><span class="cat__pill">' +
      (cut ? '<img class="cat__img" src="' + esc(lite(cut)) + '" alt="" width="360" height="360" loading="lazy" decoding="async">' : '') + '</span>' +
      '<span class="cat__name">' + typo(q.name) + '</span></a></li>';
  }).join('');

  /* ---------- 6. Подбор по задаче ---------- */
  slot('tasks').innerHTML = D.tasks.map(function (t, i) {
    return '<li id="task-' + i + '" style="--i:' + i + '"><a class="task" href="#catalog">' +
      '<span class="task__bg" aria-hidden="true"></span>' +
      '<span class="task__orb" aria-hidden="true"><span class="task__ring"></span>' +
      '<span class="task__ph"><img src="' + esc(lite(t.cut)) + '" alt="" width="360" height="360" decoding="async"></span></span>' +
      '<span class="task__body"><span class="task__name">' + typo(t.name) + '</span><span class="task__desc">' + typo(t.desc) + '</span></span>' +
      '<span class="task__go" aria-hidden="true">' + ico('i-arrow') + '</span></a></li>';
  }).join('');

  /* ---------- 7. Товары: вкладка «Все» (смесь брендов) + разделы из данных, сетка 5×2 ---------- */
  var cats = [];
  D.products.forEach(function (p) { if (cats.indexOf(p.category) < 0) cats.push(p.category); });
  /* «Все» — по одному средству каждого бренда по кругу в порядке данных: KLAPP, SHOR, Mesopharm, Mesoderm, Yu.R,
     Bouticle, GreenMatrix, BNS, затем второй круг. 9 средств + «Смотреть все» = ровно 5×2 на десктопе. */
  var groups = [], gIndex = {};
  D.products.forEach(function (p) {
    if (!(p.brand in gIndex)) { gIndex[p.brand] = groups.length; groups.push([]); }
    groups[gIndex[p.brand]].push(p);
  });
  var mix = [];
  for (var round = 0; mix.length < D.products.length; round++) {
    groups.forEach(function (g) { if (g[round]) mix.push(g[round]); });
  }
  var MAX = 9;
  var TABS = [{ name: 'Все', items: mix.slice(0, MAX), more: 'Весь каталог' }].concat(cats.map(function (c) {
    return { name: c, items: D.products.filter(function (p) { return p.category === c; }).slice(0, MAX), more: c };
  }));
  var tabsEl = $('[data-tabs]');
  var ink = $('.tabs__ink', tabsEl);
  tabsEl.insertAdjacentHTML('beforeend', TABS.map(function (t, i) {
    return '<button class="tab" type="button" role="tab" id="tab-' + i + '" aria-controls="grid-panel" aria-selected="' + (i === 0) +
      '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(t.name) + '</button>';
  }).join(''));
  var tabs = $$('.tab', tabsEl);

  var track = slot('products');
  var panel = $('#grid-panel');
  function card(p) {
    var label = p.brand + ' — ' + p.name;
    return '<li class="card">' +
      '<div class="card__media"><img class="card__img" src="' + esc(lite(p.img)) + '" alt="' + esc(label) + '" width="560" height="560" loading="lazy" decoding="async">' +
      '<button class="fav" type="button" aria-pressed="false" aria-label="В избранное: ' + esc(p.name) + '">' + ico('i-heart', 'fav__off') + ico('i-heart-fill', 'fav__on') + '</button></div>' +
      '<p class="card__brand">' + esc(p.brand) + '</p>' +
      '<h3 class="card__name"><a href="#">' + esc(p.name) + '</a></h3>' +
      '<p class="card__size">' + esc(p.size || '') + '</p>' +
      '<div class="card__buy"><span class="card__price">' + esc(p.price) + '</span>' +
      '<button class="add" type="button" data-add="' + p.id + '" aria-label="В корзину: ' + esc(p.name) + '">' +
      ico('i-basket', 'add__basket') + ico('i-check', 'add__ok') + '<span class="add__plus" aria-hidden="true">+1</span></button></div>' +
      '</li>';
  }
  /* «Смотреть все» занимает остаток последнего ряда (5 колонок на десктопе, 4 и 3 на средних ширинах),
     поэтому сетка любой вкладки закрыта ровными рядами. На телефоне — капсула во всю ширину под сеткой. */
  function moreCard(t) {
    var n = t.items.length;
    function rest(cols) { var r = n % cols; return r ? cols - r : cols; }
    var s5 = rest(5), s4 = rest(4), s3 = rest(3);
    return '<li class="card card--more" data-s5="' + s5 + '" data-s4="' + s4 + '" data-s3="' + s3 + '" style="--s5:' + s5 + ';--s4:' + s4 + ';--s3:' + s3 + '"><a class="more" href="#catalog">' +
      '<span class="more__t">Смотреть все</span><span class="more__c">' + esc(t.more) + '</span></a></li>';
  }
  function renderGrid(i, animate) {
    var t = TABS[i];
    track.innerHTML = t.items.map(card).join('') + moreCard(t);
    if (animate && !reduced()) {
      $$('.card', track).forEach(function (el, n) {
        el.style.animationDelay = Math.min(n, 9) * 40 + 'ms';
        el.classList.add('card--in');
      });
    }
  }
  function moveInk(tab) {
    if (!tab) return;
    var w = tabsEl.offsetWidth;
    var l = tab.offsetLeft;
    var r = w - (tab.offsetLeft + tab.offsetWidth);
    ink.style.clipPath = 'inset(5px ' + r + 'px 5px ' + l + 'px round 999px)';
  }
  function selectTab(i, focus) {
    tabs.forEach(function (t, n) {
      var on = n === i;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tabs[i].id);
    moveInk(tabs[i]);
    if (focus) tabs[i].focus();
    renderGrid(i, true);
    var scroller = $('[data-tabs-scroll]');
    if (scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollTo({ left: Math.max(0, tabs[i].offsetLeft - 16), behavior: reduced() ? 'auto' : 'smooth' });
    }
  }
  tabsEl.addEventListener('click', function (e) {
    var t = e.target.closest('.tab');
    if (t && t.getAttribute('aria-selected') !== 'true') selectTab(tabs.indexOf(t));
  });
  tabsEl.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
    if (n === null) return;
    e.preventDefault();
    selectTab((n + tabs.length) % tabs.length, true);
  });
  panel.setAttribute('aria-labelledby', tabs[0].id);
  renderGrid(0, false);
  moveInk(tabs[0]);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInk($('.tab[aria-selected="true"]', tabsEl)); });
  window.addEventListener('resize', function () { moveInk($('.tab[aria-selected="true"]', tabsEl)); });

  /* ---------- 8. Подборки: одна полка, четыре средства целиком на общей линии основания ---------- */
  /* Ярлык — простые малые прописные (без капсулы); средство — обрезанная по контуру вырезка, стоит на линии. */
  slot('features').innerHTML = D.features.map(function (f, i) {
    return '<li class="shelf__item shelf__item--' + (i + 1) + '"><a class="shelf__link" href="#catalog">' +
      '<span class="shelf__label">' + esc(f.label) + '</span>' +
      '<span class="shelf__title">' + typo(f.title) + '</span>' +
      '<span class="shelf__text">' + typo(f.text) + '</span>' +
      '<span class="shelf__pic" aria-hidden="true"><span class="shelf__slice"></span><span class="shelf__shadow"></span>' +
      '<img class="shelf__img" src="' + esc(lite(f.img)) + '" alt="" loading="lazy" decoding="async"></span></a></li>';
  }).join('');

  /* ---------- 9. Подвал ---------- */
  /* typo(): «самовывоз в Севастополе» не рвётся после «в» ни в преимуществах подвала, ни в ссылках */
  slot('footer-benefits').innerHTML = D.benefits.map(function (b) { return '<li>' + check + '<span>' + typo(b) + '</span></li>'; }).join('');
  function links(arr) { return arr.map(function (t) { return '<li><a href="#">' + typo(t) + '</a></li>'; }).join(''); }
  slot('footer-catalog').innerHTML = links(D.footer.catalog);
  slot('footer-buyers').innerHTML = links(D.footer.buyers);
  slot('footer-brands').innerHTML = links(D.brands.map(function (b) { return b.name; }));
  text('note').textContent = D.note;

  /* ---------- Корзина: кнопка меняет корзину на галочку, «+1», фото летит к значку корзины ---------- */
  var live = $('[data-live]');
  var pickTimer = 0;
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]');
    if (btn) {
      var id = Number(btn.getAttribute('data-add'));
      var cardEl = btn.closest('.card');
      var img = cardEl ? $('.card__img', cardEl) : null;
      var count = K ? K.cart.add(id) : 0;
      if (K) K.fly(img, K.visibleTarget());
      btn.classList.remove('is-added');
      void btn.offsetWidth;
      btn.classList.add('is-added');
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { btn.classList.remove('is-added'); }, 1800);
      var p = D.products.filter(function (x) { return x.id === id; })[0];
      if (live) live.textContent = 'Добавлено в корзину: ' + (p ? p.name : '') + '. Товаров в корзине: ' + count + '.';
      return;
    }
    var fav = e.target.closest('.fav');
    if (fav) {
      fav.setAttribute('aria-pressed', fav.getAttribute('aria-pressed') !== 'true');
      return;
    }
    /* Капсула задачи в первом экране: прокрутка к «Подбору по задаче», выбранная задача заливается синим */
    var jump = e.target.closest('[data-task-jump]');
    if (jump) {
      e.preventDefault();
      var n = +jump.getAttribute('data-task-jump');
      var item = $('#task-' + n);
      var sec = $('#tasks');
      if (sec) sec.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      if (item) {
        $$('.task.is-picked').forEach(function (t) { t.classList.remove('is-picked'); });
        var link = $('.task', item);
        clearTimeout(pickTimer);
        pickTimer = setTimeout(function () {
          link.classList.add('is-picked');
          link.focus({ preventScroll: true });
          pickTimer = setTimeout(function () { link.classList.remove('is-picked'); }, 2200);
        }, reduced() ? 0 : 420);
      }
      return;
    }
    /* Разделы в шапке: «Для лица», «Для волос»… открывают нужную вкладку «В каталоге» */
    var navLink = e.target.closest('[data-nav]');
    if (navLink) {
      var ti = TABS.map(function (t) { return t.name; }).indexOf(navLink.getAttribute('data-nav'));
      if (ti > 0 && tabs[ti].getAttribute('aria-selected') !== 'true') selectTab(ti);
    }
    if (e.target.closest('[data-focus-search]')) {
      window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
      var input = $('.search__input');
      if (input) input.focus({ preventScroll: true });
      return;
    }
    /* Прототип: пустые ссылки никуда не прыгают */
    var a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  /* «Каталог» в шапке ведёт к быстрым категориям (в прототипе нет выпадающего меню) */
  var catBtn = $('.catalog-btn');
  if (catBtn) catBtn.addEventListener('click', function () {
    var target = $('#categories');
    if (target) target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
  });
  var search = $('[data-search]');
  if (search) search.addEventListener('submit', function (e) { e.preventDefault(); });

  /* ---------- Шапка: тень при прокрутке ---------- */
  var header = $('.header');
  var stuck = false;
  function onScroll() {
    var s = window.scrollY > 40;
    if (s !== stuck) { stuck = s; header.classList.toggle('is-stuck', s); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Первый экран: средства чуть смещаются за курсором (только мышь, без «уменьшить движение») ---------- */
  var art = $('[data-art]');
  if (art && finePointer && !reduced()) {
    var raf = 0, mx = 0, my = 0;
    art.addEventListener('pointermove', function (e) {
      var r = art.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        art.style.setProperty('--mx', mx.toFixed(3));
        art.style.setProperty('--my', my.toFixed(3));
      });
    });
    art.addEventListener('pointerleave', function () {
      art.style.setProperty('--mx', 0);
      art.style.setProperty('--my', 0);
    });
  }

  /* ---------- Появление секций при прокрутке ---------- */
  /* Прячется только то, что после загрузки (стили применены) целиком ниже окна. TCKit.reveal не замечает нижние
     8 % окна, поэтому заголовок «Подбор по задаче» и первый ряд задач у края первого экрана (1440×900, 1366×768…)
     не скрываются: видны сразу, а средства в их кругах поднимаются CSS-анимацией ph-rise (style.css). */
  if (K) {
    var setupReveal = function () {
      var fold = window.innerHeight;
      K.reveal($$('.section__head, .shop__head, [data-list="quick"] > li, [data-list="tasks"] > li, .grid, [data-list="features"] > li, .footer__inner > *')
        .filter(function (el) { return el.getBoundingClientRect().top >= fold; }));
    };
    if (document.readyState === 'complete') setupReveal();
    else window.addEventListener('load', setupReveal);
  }
})(window, document);
