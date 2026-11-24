/* Демонстрация карточек. Разметка карточки — как в шаблоне redesign-grid
   рабочей копии (p-card p-card--v8). Поведение кнопок повторяет классы
   redesign-ui.js и tc-card-qty.js: is-loading → is-filling + is-checking →
   is-added, затем has-qty и счётчик .qty-ctl. Сервер не вызывается. */
(function () {
  'use strict';

  /* ?embed=1 — экран без панели демонстрации (живые телефоны в compare.html). */
  if (/[?&]embed\b/.test(location.search)) document.documentElement.classList.add('lab-embed');

  var VARIANTS = [
    { id: 'v8', tab: 'Сейчас · №8', body: '',
      note: 'Сейчас (вариант №8): карточка в рамке, синяя кнопка «В корзину» на всю ширину под каждой карточкой.' },
    { id: '1', tab: '1 · Витрина', body: 'tc-cv tc-cv1',
      note: 'Без рамки. Синий круг «+» на фото; под курсором открывается в «В корзину». После добавления — галочка, затем белый счётчик в том же углу.' },
    { id: '2', tab: '2 · Цена-кнопка', body: 'tc-cv tc-cv2',
      note: 'Без рамки. Цена и покупка — одна пилюля: нажимается вся. Под курсором заливается синим, цена уступает «В корзину»; после добавления — «В корзине − N +».' },
    { id: '3', tab: '3 · Полка', body: 'tc-cv tc-cv3',
      note: 'Без рамки. На компьютере под курсором снизу фото выезжает белая полка «В корзину»; на телефоне — постоянная контурная кнопка под ценой.' },
    { id: '4', tab: '4 · Журнал', body: 'tc-cv tc-cv4',
      note: 'Без рамки. Фото 4:5, название антиквой Georgia, как заголовки варианта №8; покупка — тонкая ссылка «В корзину» с прорисовкой линии.' },
    { id: '5', tab: '5 · Контраст', body: 'tc-cv tc-cv5',
      note: 'Без рамки. Под ценой пара: контурная кнопка «В корзину» и квадрат «в избранное». Под курсором кнопка заливается чернильным, подпись прокручивается.' }
  ];
  var ALL_BODY = 'tc-cv tc-cv1 tc-cv2 tc-cv3 tc-cv4 tc-cv5';

  var grid = document.querySelector('[data-lab-grid]');
  var tabs = document.querySelector('[data-lab-tabs]');
  var note = document.querySelector('[data-lab-note]');
  var toast = document.querySelector('[data-lab-toast]');

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function card(p, i) {
    var buy = p.unavailable
      ? '<button class="add-btn is-unavailable" type="button" disabled aria-disabled="true" aria-label="Нет в наличии" title="Нет в наличии"><span class="v8-action">Нет в наличии</span></button>'
      : '<button class="add-btn" data-product-id="' + p.id + '" aria-label="В корзину"><span class="v8-action">В корзину</span></button>';
    return '' +
      '<a class="p-card p-card--v8" href="#" style="--i:' + i + '" data-product-id="' + p.id + '" data-product-url="#">' +
        '<div class="card-img">' +
          '<button class="fav-btn" data-product-id="' + p.id + '" aria-label="В избранное"><img src="img/heart.svg" alt=""></button>' +
          '<img src="' + esc(p.img) + '" data-src="' + esc(p.img) + '" data-cut="products/cut/product-' + p.id + '.png" alt="' + esc(p.brand + ' ' + p.name) + '" loading="lazy">' +
          buy +
        '</div>' +
        '<div class="card-bottom">' +
          '<p class="card-brand">' + esc(p.brand) + '</p>' +
          '<p class="card-name">' + esc(p.name) + '</p>' +
          '<div class="card-price">' +
            '<span class="c-price">' + esc(p.price).replace(/ /g, '\u00a0') + '</span>' +
            (p.size ? '<span class="c-per v8-size">' + esc(p.size) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</a>';
  }

  grid.innerHTML = (window.CV_PRODUCTS || []).map(card).join('');

  /* ── Варианты и набор «Журнала» ─────────────────────────────────── */
  /* Для варианта 4 — конструктор: скругление, поле и кнопка. Любое сочетание
     пишется в адрес (#v=4&r=22&s=glass&c=icon-glass) — его можно сохранить. */
  var KIT = {
    r: [['6', '6 px'], ['14', '14'], ['22', '22'], ['32', '32']],
    s: [['gray', 'Серое'], ['light', 'Светлое'], ['white', 'Белое с линией'], ['tint', 'Голубое'],
        ['gradient', 'Градиент'], ['frost', 'Матовое стекло'], ['glass', 'Стекло']],
    c: [['text', 'Текст'], ['icon-line', 'Корзина · контур'], ['icon-solid', 'Корзина · синяя'], ['icon-glass', 'Корзина · стекло']]
  };
  var KIT_NAMES = { r: 'Скругление', s: 'Поле', c: 'Кнопка' };
  var PRESETS = [
    { id: '4.1', name: 'Классика', r: '6', s: 'gray', c: 'text' },
    { id: '4.2', name: 'Мягкий', r: '22', s: 'light', c: 'icon-line' },
    { id: '4.3', name: 'Белый лист', r: '14', s: 'white', c: 'icon-line' },
    { id: '4.4', name: 'Голубая пилюля', r: '32', s: 'tint', c: 'icon-solid' },
    { id: '4.5', name: 'Градиент', r: '22', s: 'gradient', c: 'icon-solid' },
    { id: '4.6', name: 'Матовое стекло', r: '22', s: 'frost', c: 'icon-glass' },
    { id: '4.7', name: 'Стекло', r: '32', s: 'glass', c: 'icon-glass' },
    { id: '4.8', name: 'Стекло и синий', r: '22', s: 'glass', c: 'icon-solid' }
  ];
  var DEFAULT_KIT = { r: '6', s: 'gray', c: 'text' };
  var page = document.querySelector('[data-lab-page]');
  var kitBox = document.querySelector('[data-lab-kit]');
  var lastKit = null;

  function params() {
    var out = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (pair) {
      var kv = pair.split('=');
      if (kv[0]) out[kv[0]] = decodeURIComponent(kv[1] || '');
    });
    return out;
  }
  function has(key, val) { return KIT[key].some(function (o) { return o[0] === val; }); }
  function label(key, val) { var o = KIT[key].find(function (x) { return x[0] === val; }); return o ? o[1] : val; }
  function kitState() {
    var p = params();
    var st = {};
    ['r', 's', 'c'].forEach(function (k) { st[k] = has(k, p[k]) ? p[k] : (lastKit || DEFAULT_KIT)[k]; });
    return st;
  }
  function presetOf(st) {
    return PRESETS.find(function (p) { return p.r === st.r && p.s === st.s && p.c === st.c; });
  }
  function current() {
    var id = params().v || 'v8';
    return VARIANTS.find(function (v) { return v.id === id; }) || VARIANTS[0];
  }
  function setHash(id, st) {
    history.replaceState(null, '', '#v=' + id + (id === '4' ? '&r=' + st.r + '&s=' + st.s + '&c=' + st.c : ''));
  }

  function applyKit(on, st) {
    ['r', 's', 'c'].forEach(function (k) {
      if (on) page.setAttribute('data-j-' + k, st[k]);
      else page.removeAttribute('data-j-' + k);
    });
    /* Настоящему стеклу нужны фото без фона. */
    var cut = on && st.s === 'glass';
    grid.querySelectorAll('.card-img > img').forEach(function (img) {
      var want = cut ? img.dataset.cut : img.dataset.src;
      if (img.getAttribute('src') !== want) img.setAttribute('src', want);
    });
    kitBox.hidden = !on;
    if (!on) return;
    lastKit = st;
    var pre = presetOf(st);
    kitBox.querySelectorAll('[data-k]').forEach(function (b) {
      b.setAttribute('aria-pressed', st[b.dataset.k] === b.dataset.val ? 'true' : 'false');
    });
    kitBox.querySelectorAll('[data-preset]').forEach(function (b) {
      b.setAttribute('aria-pressed', pre && pre.id === b.dataset.preset ? 'true' : 'false');
    });
  }

  function apply(v, replay) {
    document.body.classList.remove.apply(document.body.classList, ALL_BODY.split(' '));
    if (v.body) document.body.classList.add.apply(document.body.classList, v.body.split(' '));
    tabs.querySelectorAll('.lab-tab').forEach(function (b) {
      b.setAttribute('aria-selected', b.dataset.v === v.id ? 'true' : 'false');
    });
    var kitOn = v.id === '4';
    var st = kitState();
    applyKit(kitOn, st);
    if (kitOn) {
      var pre = presetOf(st);
      note.textContent = (pre ? 'Журнал ' + pre.id + ' «' + pre.name + '»: ' : 'Журнал, своё сочетание: ') +
        'скругление ' + st.r + ' px, поле — ' + label('s', st.s).toLowerCase() + ', кнопка — ' + label('c', st.c).toLowerCase() + '.' +
        (st.s === 'glass' ? ' Стеклу нужны фото без фона — в демо они вырезаны локально.' : '');
    } else {
      note.textContent = v.note;
    }
    document.title = (v.id === 'v8' ? 'Сейчас' : 'Вариант ' + v.id) + ' — карточки каталога';
    if (replay && window.TC && TC.cardMotion) TC.cardMotion.replay();
  }

  tabs.innerHTML = VARIANTS.map(function (v) {
    return '<button type="button" class="lab-tab" role="tab" data-v="' + v.id + '">' + v.tab + '</button>';
  }).join('');
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.lab-tab');
    if (!b) return;
    setHash(b.dataset.v, lastKit || DEFAULT_KIT);
    apply(current(), true);
  });

  kitBox.innerHTML = ['r', 's', 'c'].map(function (k) {
    return '<div class="lab-kit__group" role="group" aria-label="' + KIT_NAMES[k] + '"><span>' + KIT_NAMES[k] + '</span>' +
      KIT[k].map(function (o) {
        return '<button type="button" class="lab-chip lab-chip--sm" data-k="' + k + '" data-val="' + o[0] + '" aria-pressed="false">' + o[1] + '</button>';
      }).join('') + '</div>';
  }).join('') +
    '<div class="lab-kit__group" role="group" aria-label="Наборы"><span>Наборы</span>' +
    PRESETS.map(function (p) {
      return '<button type="button" class="lab-chip lab-chip--sm" data-preset="' + p.id + '" aria-pressed="false">' + p.id + ' ' + p.name + '</button>';
    }).join('') + '</div>';
  kitBox.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var st = kitState();
    if (b.dataset.preset) {
      var p = PRESETS.find(function (x) { return x.id === b.dataset.preset; });
      st = { r: p.r, s: p.s, c: p.c };
    } else {
      st[b.dataset.k] = b.dataset.val;
    }
    setHash('4', st);
    apply(current(), false);
  });

  apply(current(), false);
  window.addEventListener('hashchange', function () { apply(current(), true); });

  var revealBtn = document.querySelector('[data-lab-reveal]');
  revealBtn.addEventListener('click', function () {
    var on = !document.documentElement.classList.contains('cv-reveal');
    revealBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (window.TC && TC.cardMotion) TC.cardMotion.setReveal(on);
  });

  document.querySelector('[data-lab-replay]').addEventListener('click', function () {
    if (window.TC && TC.cardMotion) TC.cardMotion.replay();
  });
  var motionBtn = document.querySelector('[data-lab-motion]');
  motionBtn.addEventListener('click', function () {
    var on = document.documentElement.classList.toggle('lab-reduce');
    motionBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (window.TC && TC.cardMotion) TC.cardMotion.setReduced(on);
  });

  /* ── Корзина: те же классы, что на сайте ────────────────────────── */
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var basket = {};

  function badge() {
    var n = Object.keys(basket).reduce(function (s, k) { return s + basket[k]; }, 0);
    document.querySelectorAll('[data-cart-count]').forEach(function (b) {
      b.textContent = n;
      b.hidden = n === 0;
    });
  }

  function layers(btn) {
    if (btn.querySelector('.ab-fill')) return;
    var fill = document.createElement('span');
    fill.className = 'ab-fill';
    var check = document.createElementNS(SVG_NS, 'svg');
    check.setAttribute('class', 'ab-check');
    check.setAttribute('viewBox', '0 0 24 24');
    var path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M5 12.5 10 17.5 19 7.5');
    check.appendChild(path);
    btn.appendChild(fill);
    btn.appendChild(check);
  }

  function stepper(pid) {
    var ctl = document.createElement('div');
    ctl.className = 'qty-ctl';
    ctl.setAttribute('data-qty-ctl', pid);
    ctl.innerHTML =
      '<button type="button" class="qty-ctl__btn" data-qty-step="-1" aria-label="Убрать одну штуку">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9"/></svg></button>' +
      '<span class="qty-ctl__num" data-qty-num>1</span>' +
      '<button type="button" class="qty-ctl__btn" data-qty-step="1" aria-label="Добавить ещё одну штуку">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v9M3.5 8h9"/></svg></button>';
    return ctl;
  }

  function showQty(btn, pid) {
    var home = btn.parentNode;
    var ctl = home.querySelector('[data-qty-ctl="' + pid + '"]');
    if (!ctl) { ctl = stepper(pid); home.appendChild(ctl); }
    ctl.querySelector('[data-qty-num]').textContent = basket[pid];
    ctl.querySelector('[data-qty-step="-1"]').setAttribute('aria-label', basket[pid] > 1 ? 'Убрать одну штуку' : 'Убрать из корзины');
    btn.closest('.p-card').classList.add('has-qty');
    btn.classList.add('is-added');
  }

  function hideQty(btn, pid) {
    var c = btn.closest('.p-card');
    c.classList.remove('has-qty');
    btn.classList.remove('is-added', 'is-filling', 'is-checking');
    var ctl = btn.parentNode.querySelector('[data-qty-ctl="' + pid + '"]');
    if (ctl) ctl.querySelector('[data-qty-num]').textContent = '1';
  }

  document.addEventListener('click', function (e) {
    var t = e.target;

    var btn = t.closest('.add-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      if (btn.disabled || btn.classList.contains('is-loading') || btn.classList.contains('is-added')) return;
      var pid = btn.dataset.productId;
      layers(btn);
      btn.classList.add('is-loading');
      var started = Date.now();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { btn.classList.add('is-filling', 'is-checking'); });
      });
      /* Ответ «сервера» через 380 мс — как быстрый локальный ответ сайта. */
      setTimeout(function () {
        btn.classList.remove('is-loading');
        basket[pid] = (basket[pid] || 0) + 1;
        badge();
        setTimeout(function () {
          btn.classList.remove('is-checking', 'is-filling');
          btn.classList.add('is-added');
          showQty(btn, pid);
        }, Math.max(0, 620 - (Date.now() - started)));
      }, 380);
      return;
    }

    var stepBtn = t.closest('[data-qty-step]');
    if (stepBtn) {
      e.preventDefault();
      e.stopPropagation();
      var ctl = stepBtn.closest('[data-qty-ctl]');
      var id = ctl.getAttribute('data-qty-ctl');
      var add = ctl.parentNode.querySelector('.add-btn[data-product-id="' + id + '"]');
      basket[id] = Math.max(0, (basket[id] || 0) + Number(stepBtn.dataset.qtyStep));
      if (basket[id] === 0) { delete basket[id]; hideQty(add, id); }
      else showQty(add, id);
      badge();
      return;
    }

    var fav = t.closest('.fav-btn');
    if (fav) {
      e.preventDefault();
      e.stopPropagation();
      var on = fav.classList.toggle('is-active');
      fav.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) {
        fav.classList.remove('fav-pop');
        void fav.offsetWidth;
        fav.classList.add('fav-pop');
        setTimeout(function () { fav.classList.remove('fav-pop'); }, 600);
      }
      return;
    }

    var link = t.closest('a[href="#"]');
    if (link) {
      e.preventDefault();
      if (link.classList.contains('p-card')) say('На сайте здесь откроется быстрый просмотр товара.');
    }
  });

  document.querySelector('[data-lab-reset]').addEventListener('click', function () {
    Object.keys(basket).forEach(function (pid) {
      var add = document.querySelector('.add-btn[data-product-id="' + pid + '"]');
      if (add) hideQty(add, pid);
    });
    basket = {};
    badge();
  });

  var toastTimer;
  function say(text) {
    toast.textContent = text;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 1800);
  }
})();
