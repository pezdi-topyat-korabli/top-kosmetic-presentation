/* TOP Cosmetics · главная · v5-flow «Синий поток».
   Весь контент — из window.TOP_DATA (_shared/data.js); поведение корзины — TCKit (_shared/kit.js). */
(function () {
  'use strict';

  var D = window.TOP_DATA;
  var K = window.TCKit;
  var doc = document;
  var root = doc.documentElement;
  if (!D || !K) { root.classList.add('is-in'); return; }

  var EASE = 'cubic-bezier(.16, 1, .3, 1)';

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(id, cls) { return '<svg class="' + (cls || '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function reduced() { return K.reduced(); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function plural(n, one, few, many) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return one;
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
    return many;
  }
  var phone = window.matchMedia('(max-width: 767px)');
  var live = $('#live');
  function say(msg) { if (live) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 30); } }

  /* ---------- Преимущества: галочки сверху (на телефоне — сетка 2×2, все четыре видны) ---------- */
  var benefitHTML = function (tag) {
    return D.benefits.map(function (b) {
      return '<' + tag + ' class="benefit">' + icon('i-seal') + '<span>' + esc(b) + '</span></' + tag + '>';
    }).join('');
  };
  $('#benefits').innerHTML = benefitHTML('li');

  /* ---------- Шапка ---------- */
  var nav = D.nav.slice();
  $('#hdrCatalog span').textContent = nav[0];
  $('#hdrPick span').textContent = nav[nav.length - 1];
  $('#nav').innerHTML = nav.slice(1, -1).map(function (n, i) {
    return '<li class="nav__item' + (i >= 4 ? ' nav__item--extra' : '') + '"><a class="nav__link" href="#">' + esc(n) + '</a></li>';
  }).join('');

  /* ---------- Бренды: все 12 белых капсул неподвижным рядом (уже 1280 px — ряд листается) ---------- */
  $('#brandsNum').textContent = D.brands.length;
  $('#brandsWord').textContent = plural(D.brands.length, 'бренд', 'бренда', 'брендов');
  function brandItem(b, i) {
    var inner = b.logo
      ? '<img class="bcap__logo bcap__logo--' + slug(b.name) + '" src="' + esc(b.logo) + '" alt="' + esc(b.name) + '" decoding="async">'
      : '<span class="bcap__word bcap__word--' + slug(b.name) + '">' + esc(b.name) + '</span>';
    return '<li class="brands__item" style="--i:' + i + '"><a class="bcap" href="#" data-brand="' + esc(b.name) + '">' + inner + '</a></li>';
  }
  /* «Все бренды» капсулой в конце ряда — там, где ряд листается (ссылка справа тогда скрыта). */
  $('#brandsList').innerHTML = D.brands.map(brandItem).join('') +
    '<li class="brands__item brands__more" style="--i:' + D.brands.length + '"><a class="bcap bcap--all" href="#">Все бренды</a></li>';
  /* Листаемые ряды (бренды уже 1280 px, задачи на телефоне): затухание у края — только пока там есть ещё капсулы. */
  var rails = [];
  function edgeFade(el) {
    var max = el.scrollWidth - el.clientWidth;
    el.classList.toggle('has-more', max > 2 && el.scrollLeft < max - 2);
    el.classList.toggle('has-less', max > 2 && el.scrollLeft > 2);
  }
  function addRail(el) {
    if (!el) return;
    rails.push(el);
    el.addEventListener('scroll', function () { edgeFade(el); }, { passive: true });
  }
  function railsEdge() { rails.forEach(edgeFade); }
  addRail($('#brandsScroller'));

  /* ---------- Первый экран: заголовок с капсулой вокруг последнего слова ---------- */
  $('#heroEyebrow').textContent = D.hero.eyebrow;
  $('#heroLead').textContent = D.hero.text;
  var words = D.hero.title.split(/\s+/);
  var last = words.pop();
  /* Порядок появления: заголовок → поиск → задачи с белым индикатором → сцена (задержки в index.html и style.css). */
  $('#heroTitle').innerHTML = words.map(function (w, i) {
    return '<span class="w" style="--d:' + (220 + i * 70) + 'ms">' + esc(w) + '</span>';
  }).join(' ') + ' <span class="w w--cap" style="--d:' + (220 + words.length * 70) + 'ms">' + esc(last) + '<i class="capline" aria-hidden="true"></i></span>';

  /* ---------- Вписывание вырезок в одну рамку ---------- */
  /* Видимые границы товара на файле (доли ширины и высоты: x0, y0, x1, y1), замерены по альфа-каналу.
     У p-017 правый край — по обрезке студийной тени (style.css), у tile-blond — по обрезке ореола.
     По ним любая вырезка встаёт в одну рамку --W × --H: товар стоит на её «полу» по центру, высокие флаконы
     занимают всю высоту, широкие банки ограничены шириной. Масштаб больше не прыгает между задачами. */
  var FIT = {
    'p-000': [0.1521, 0.1021, 0.8458, 0.9000],
    'p-003': [0.2000, 0.2938, 0.8000, 0.7063],
    'p-016': [0.2500, 0.0979, 0.7521, 0.8958],
    'p-017': [0.3646, 0.1042, 0.6021, 0.8521],
    'p-018': [0.3292, 0.0979, 0.6708, 0.9000],
    'p-019': [0.3125, 0.1000, 0.6875, 0.8979],
    'p-020': [0.3563, 0.1000, 0.6458, 0.9000],
    'p-021': [0.3167, 0.0979, 0.6833, 0.9000],
    'tile-blond': [0.1953, 0.1169, 0.9359, 0.8604],
    /* быстрые категории (p-002 — тот же файл, что p-019) */
    'p-001': [0.3167, 0.0979, 0.6833, 0.9000],
    'p-002': [0.3125, 0.1000, 0.6875, 0.8979],
    'p-004': [0.3854, 0.0979, 0.6125, 0.9000],
    'p-005': [0.2167, 0.2000, 0.7813, 0.8000],
    'p-006': [0.2229, 0.0979, 0.7750, 0.9042],
    'p-007': [0.2938, 0.0979, 0.7063, 0.9042]
  };
  var FIT_AR = { 'tile-blond': 640 / 616 };
  function fitKey(src) { return String(src || '').replace(/^.*\//, '').replace(/\.\w+$/, ''); }
  function fitStyle(src) {
    var k = fitKey(src), b = FIT[k];
    if (!b) return '';
    var ar = FIT_AR[k] || 1, bw = b[2] - b[0], bh = b[3] - b[1];
    return '--x0:' + b[0] + ';--y0:' + b[1] + ';--bh:' + bh.toFixed(4) + ';--ar:' + ar.toFixed(4) + ';--pa:' + (bw / bh * ar).toFixed(4);
  }
  /* Капсулы быстрых категорий тянутся по сетке, поэтому рамка задана в долях ширины капсулы (132 × 180):
     все товары стоят на одном «полу» (1,04 ширины от верха, 76 % высоты), флаконы — одной видимой высоты
     0,84; широкие банки и коробки уменьшаются, пока все четыре угла товара не окажутся внутри капсулы
     с полем 0,08 ширины (углы не касаются скругления). */
  var CAP_H = 180 / 132, CAP_FLOOR = 1.04, CAP_PH = 0.84, CAP_M = 0.08;
  function capHalf(y) {
    var c = y < 0.5 ? 0.5 - y : (y > CAP_H - 0.5 ? y - (CAP_H - 0.5) : 0);
    return c >= 0.5 ? 0 : Math.sqrt(0.25 - c * c);
  }
  function catFitStyle(src) {
    var b = FIT[fitKey(src)];
    if (!b) return '';
    var bw = b[2] - b[0], bh = b[3] - b[1], pa = bw / bh;
    var ph = CAP_PH;
    while (ph > 0.3 && (ph * pa / 2 > capHalf(CAP_FLOOR) - CAP_M || ph * pa / 2 > capHalf(CAP_FLOOR - ph) - CAP_M)) ph -= 0.005;
    var s = ph / bh;
    return '--s:' + s.toFixed(4) + ';--l:' + (0.5 - (b[0] + bw / 2) * s).toFixed(4) + ';--t:' + (CAP_FLOOR - b[3] * s).toFixed(4);
  }

  /* ---------- Подбор по задаче + сцена ---------- */
  var tasks = D.tasks;
  var tasksEl = $('#tasks');
  var tList = $('#tasksList');
  var ind = $('.tasks__ind', tList);
  var tWrap = $('.tasks__wrap', tasksEl);
  addRail(tWrap);
  /* У «Новинок» фото в данных нет. Новинка по данным — Skin Formula («Skin Formula в TOP: средства для
     очищения и защиты от солнца»), поэтому капсула берёт вырезку очищающего средства Skin Formula из задачи
     «Очищение» (p-020). Плитка «Новинка» (tile-skin) повторила бы соседнюю «Защиту от солнца» (p-000). */
  var newImg = (tasks.filter(function (t) { return t.name === 'Очищение'; })[0] || {}).cut || null;

  tasks.forEach(function (t, i) {
    var li = doc.createElement('li');
    li.className = 'tasks__item enter';
    li.style.setProperty('--d', (680 + i * 50) + 'ms');
    li.innerHTML =
      '<button class="task" type="button" aria-pressed="false" aria-controls="stage" data-i="' + i + '">' +
        '<span class="task__ph"><img src="' + esc(t.cut) + '" alt="" width="100" height="100" decoding="async"></span>' +
        '<span class="task__tx"><span class="task__name">' + esc(t.name) + '</span>' +
        '<span class="task__desc">' + esc(t.desc) + '</span></span>' +
      '</button>';
    tList.appendChild(li);
  });
  var tItems = $$('.tasks__item', tList);
  var tBtns = $$('.task', tList);

  var stage = $('#stage');
  var media = $('#stageMedia');
  var swap = $('#stageSwap');
  var note = $('#stageNote');
  var fill = $('.stage__fill', stage);
  var cur = -1;

  /* Предзагрузка вырезок, чтобы смена шла без пауз. */
  tasks.forEach(function (t) { var im = new Image(); im.src = t.cut; });

  function placeInd(animate) {
    var li = tItems[cur];
    if (!li) return;
    ind.style.width = li.offsetWidth + 'px';
    ind.style.height = li.offsetHeight + 'px';
    if (!animate) ind.classList.add('no-anim');
    ind.style.transform = 'translate(' + li.offsetLeft + 'px, ' + li.offsetTop + 'px)';
    if (!animate) { void ind.offsetWidth; ind.classList.remove('no-anim'); }
  }

  function renderStage(i, animate) {
    var t = tasks[i];
    var motion = animate && !reduced() && !!Element.prototype.animate;

    var img = doc.createElement('img');
    img.className = 'stage__img fit';
    img.setAttribute('style', fitStyle(t.cut));
    img.src = t.cut;
    img.alt = 'Средство для задачи «' + t.name + '»';
    img.width = 480; img.height = 480;
    img.decoding = 'async';
    var oldImgs = $$('.stage__img', media);
    media.appendChild(img);

    var block = doc.createElement('div');
    block.className = 'stage__txt';
    block.innerHTML = '<h3 class="stage__title">' + esc(t.name) + '</h3><p class="stage__desc">' + esc(t.desc) + '</p>';
    var oldTxt = $$('.stage__txt', swap);
    swap.appendChild(block);

    if (!motion) {
      oldImgs.forEach(function (n) { n.remove(); });
      oldTxt.forEach(function (n) { n.remove(); });
      return;
    }
    oldImgs.forEach(function (n) {
      n.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-22px) scale(.95)' }],
        { duration: 260, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }).onfinish = function () { n.remove(); };
    });
    img.animate([{ opacity: 0, transform: 'translateY(46px) scale(.92)' }, { opacity: 1, transform: 'none' }],
      { duration: 600, delay: 120, easing: EASE, fill: 'backwards' });
    oldTxt.forEach(function (n) {
      n.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }],
        { duration: 200, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }).onfinish = function () { n.remove(); };
    });
    block.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
      { duration: 480, delay: 140, easing: EASE, fill: 'backwards' });
    /* Капсула «наливается» заново: голубая половина поднимается со дна. */
    fill.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(50%)' }],
      { duration: 700, easing: EASE });
  }

  /* Сцена меняется только по выбору посетителя: автосмены и бегущего кольца больше нет. */
  function select(i, opts) {
    opts = opts || {};
    if (i === cur) return;
    cur = i;
    tBtns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    placeInd(!!opts.animate && !reduced());
    renderStage(i, !!opts.animate);
    if (opts.user) note.setAttribute('aria-live', 'polite');
  }

  note.setAttribute('aria-live', 'off');
  select(0, { animate: false });

  /* Телефон: задачи — лента капсул прямо над сценой. Выбранная капсула доезжает к началу ленты (следующая
     выглядывает справа), а если сцена ниже края экрана (над таб-баром), страница мягко подтягивает её,
     не уводя ленту за верх. Запас в конце ленты (--tail) даёт доехать до начала и последней капсуле. */
  function railTail() {
    if (!tWrap) return;
    tList.style.removeProperty('--tail');
    if (!phone.matches) return;
    var lastLi = tItems[tItems.length - 1];
    var pad = parseFloat(getComputedStyle(tWrap).scrollPaddingLeft) || 0;
    var need = lastLi.offsetLeft - pad - (tWrap.scrollWidth - tWrap.clientWidth);
    if (need > 0) tList.style.setProperty('--tail', Math.ceil(need) + 'px');
  }

  /* Телефон: первый экран умещается над таб-баром при реальной высоте окна браузера (Safari на iPhone
     даёт около 390×664, а не 390×844). Если сцена с подписью и кнопкой не помещается, верх первого экрана
     становится плотнее (.is-short), а сцена ниже вместе с капсулой и товаром (--sh, --sk): кнопка
     кончается в 10 px над таб-баром. Если не хватает и этого (очень низкое окно), сцена остаётся полной и
     целиком уходит под край: подпись и кнопка тогда не разрезаны таб-баром. Высота окна берётся в svh —
     она не меняется, когда браузер прячет панели при прокрутке, поэтому сцена не прыгает. */
  var tabbarEl = $('.tabbar');
  var svhProbe = doc.createElement('div');
  svhProbe.setAttribute('aria-hidden', 'true');
  svhProbe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
  doc.body.appendChild(svhProbe);
  var STAGE_FULL = 300, STAGE_MIN = 150, BAR_GAP = 10;
  function stageRoom() {
    var top = stage.getBoundingClientRect().top + window.scrollY;
    var noteBottom = parseFloat(getComputedStyle(note).bottom) || 0;
    return (svhProbe.offsetHeight || window.innerHeight) - tabbarEl.offsetHeight - BAR_GAP - top + noteBottom;
  }
  function fitStage() {
    root.classList.remove('is-short');
    stage.style.removeProperty('--sh');
    stage.style.removeProperty('--sk');
    if (!phone.matches || !tabbarEl || stageRoom() >= STAGE_FULL) return;
    root.classList.add('is-short');
    var h = Math.floor(stageRoom());
    if (h >= STAGE_FULL || h < STAGE_MIN) return;
    stage.style.setProperty('--sh', h + 'px');
    stage.style.setProperty('--sk', (h / STAGE_FULL).toFixed(4));
  }
  fitStage();
  railTail();
  placeInd(false);

  function railTo(i) {
    if (!tWrap || tWrap.scrollWidth <= tWrap.clientWidth + 1) return;
    var wr = tWrap.getBoundingClientRect(), lr = tItems[i].getBoundingClientRect();
    var pad = parseFloat(getComputedStyle(tWrap).scrollPaddingLeft) || 0;
    var left = tWrap.scrollLeft + (lr.left - wr.left) - pad;
    tWrap.scrollTo({ left: Math.max(0, left), behavior: reduced() ? 'auto' : 'smooth' });
  }
  function stageIntoView() {
    if (!phone.matches) return;
    var bar = $('.tabbar');
    var limit = window.innerHeight - (bar ? bar.getBoundingClientRect().height : 0) - BAR_GAP;
    var over = $('.stage__cta', stage).getBoundingClientRect().bottom - limit;
    var room = tasksEl.getBoundingClientRect().top - 12;
    if (over > 1 && room > 0) window.scrollBy({ top: Math.min(over, room), behavior: reduced() ? 'auto' : 'smooth' });
  }

  tList.addEventListener('click', function (e) {
    var b = e.target.closest('.task');
    if (!b) return;
    var i = +b.getAttribute('data-i');
    railTo(i);
    if (i !== cur) select(i, { animate: true, user: true });
    stageIntoView();
  });

  /* Параллакс сцены за курсором: капсула и товар чуть расходятся по глубине. */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var scene = $('.stage__scene', stage);
  var heroEl = $('.hero');
  var pxRaf = 0, pxX = 0, pxY = 0;
  function setParallax(x, y) {
    scene.style.setProperty('--px', x.toFixed(1) + 'px');
    scene.style.setProperty('--py', y.toFixed(1) + 'px');
  }
  heroEl.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || !finePointer.matches || reduced()) return;
    pxX = (e.clientX / window.innerWidth - 0.5) * 26;
    pxY = (e.clientY / window.innerHeight - 0.5) * 20;
    if (!pxRaf) pxRaf = requestAnimationFrame(function () { pxRaf = 0; setParallax(pxX, pxY); });
  });
  heroEl.addEventListener('pointerleave', function () { setParallax(0, 0); });

  /* ---------- Поиск с подсказками из данных: капсула первого экрана и компактная капсула в липкой шапке ---------- */
  var taskNames = tasks.map(function (t) { return t.name; });
  /* Названия брендов кириллицей: посетитель наберёт «клапп», а не «KLAPP». Только для поиска, на экран не выводятся. */
  var RU = {
    'KLAPP': 'клапп клап', 'HydroPeptide': 'гидропептид хайдропептид', 'Bouticle': 'бутикл бутикле',
    'Mesopharm': 'мезофарм', 'MESODERM': 'мезодерм', 'Mesoderm': 'мезодерм', 'Lisap': 'лисап лизап',
    'SHOR': 'шор', 'BNS': 'бнс', 'GreenMatrix': 'гринматрикс грин матрикс', 'Yu.R': 'юр ю.р',
    'Skin Formula': 'скин формула', 'Ekseption': 'эксепшн эксепшен'
  };
  var index = [];
  tasks.forEach(function (t, i) { index.push({ g: 'Задачи', label: t.name, sub: t.desc, img: t.cut, task: i }); });
  D.brands.forEach(function (b) { index.push({ g: 'Бренды', label: b.name, sub: 'Бренд', brand: true, key: RU[b.name] || '' }); });
  D.quick.forEach(function (c) {
    if (taskNames.indexOf(c.name) > -1) return;
    index.push({ g: 'Категории', label: c.name, sub: 'Быстрая категория', img: c.cut || newImg });
  });
  D.products.forEach(function (p) {
    index.push({ g: 'Товары', label: p.name, sub: p.brand + (p.size ? ' · ' + p.size : ''), img: p.cut && p.id !== 9172 ? p.cut : p.img, price: p.price, key: p.brand + ' ' + (RU[p.brand] || '') });
  });
  var LIMIT = { 'Задачи': 3, 'Бренды': 3, 'Категории': 2, 'Товары': 4 };
  var ORDER = ['Задачи', 'Бренды', 'Категории', 'Товары'];

  function norm(s) { return String(s).toLowerCase().replace(/ё/g, 'е'); }
  function mark(text, query) {
    var t = String(text), i = norm(t).indexOf(norm(query));
    if (!query || i < 0) return esc(t);
    return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + query.length)) + '</mark>' + esc(t.slice(i + query.length));
  }
  function search(query) {
    var tokens = norm(query).split(/\s+/).filter(Boolean);
    var groups = {};
    index.forEach(function (it) {
      var hay = norm(it.label + ' ' + (it.sub || '') + ' ' + (it.key || ''));
      if (!tokens.every(function (tk) { return hay.indexOf(tk) > -1; })) return;
      (groups[it.g] = groups[it.g] || []).push(it);
    });
    return groups;
  }
  function scrollToEl(el, soft) {
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - (soft ? 120 : 24);
    window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' });
  }
  function useResult(it) {
    if (!it) { scrollToEl($('#catalog')); return; }
    if (it.task != null) {
      select(it.task, { animate: true, user: true });
      railTo(it.task);
      scrollToEl($('#tasks'), true);
      return;
    }
    scrollToEl($('#catalog'));
  }
  /* Одна логика на обе капсулы поиска: подсказки, стрелки, Esc, очистка, «Найти». */
  function makeSearch(form) {
    var q = $('.search__input', form);
    var clr = $('.search__clear', form);
    var sug = $('.suggest', form);
    var results = [];
    function close() { sug.hidden = true; }
    function render() {
      var query = q.value.trim();
      clr.hidden = !q.value;
      if (!query) { close(); return; }
      var groups = search(query);
      results = [];
      var html = '';
      ORDER.forEach(function (g) {
        var list = (groups[g] || []).slice(0, LIMIT[g]);
        if (!list.length) return;
        html += '<div class="suggest__grp"><p class="suggest__h">' + g + '</p><ul>' + list.map(function (it) {
          results.push(it);
          var ph = it.brand ? '<span class="sg__ph sg__ph--brand"></span>'
            : '<span class="sg__ph"><img src="' + esc(it.img) + '" alt="" loading="lazy"></span>';
          return '<li><a class="sg" href="' + (it.task != null ? '#tasks' : '#catalog') + '" data-r="' + (results.length - 1) + '">' + ph +
            '<span class="sg__t"><b>' + mark(it.label, query) + '</b><small>' + esc(it.sub || '') + '</small></span>' +
            (it.price ? '<span class="sg__price">' + esc(it.price) + '</span>' : '') + '</a></li>';
        }).join('') + '</ul></div>';
      });
      sug.innerHTML = html || '<p class="suggest__empty">Ничего не нашлось. Попробуйте название бренда или задачу.</p>';
      sug.hidden = false;
    }
    function use(it) { close(); useResult(it); }
    /* Esc из списка возвращает фокус в поле и не открывает подсказки заново. */
    var quietFocus = false;
    q.addEventListener('input', render);
    q.addEventListener('focus', function () {
      if (quietFocus) { quietFocus = false; return; }
      if (q.value.trim()) render();
    });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); }
      if (e.key === 'ArrowDown' && !sug.hidden) { var f = $('.sg', sug); if (f) { e.preventDefault(); f.focus(); } }
    });
    sug.addEventListener('keydown', function (e) {
      var links = $$('.sg', sug), i = links.indexOf(doc.activeElement);
      if (e.key === 'ArrowDown' && i > -1) { e.preventDefault(); (links[i + 1] || links[0]).focus(); }
      if (e.key === 'ArrowUp' && i > -1) { e.preventDefault(); if (i === 0) q.focus(); else links[i - 1].focus(); }
      if (e.key === 'Escape') { close(); quietFocus = true; q.focus(); }
    });
    sug.addEventListener('click', function (e) {
      var a = e.target.closest('.sg');
      if (!a) return;
      e.preventDefault();
      use(results[+a.getAttribute('data-r')]);
    });
    clr.addEventListener('click', function () { q.value = ''; render(); q.focus(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!q.value.trim()) { q.focus(); return; }
      render();
      use(results[0]);
    });
    doc.addEventListener('pointerdown', function (e) { if (!sug.hidden && !form.contains(e.target)) close(); });
    return { form: form, q: q, close: close };
  }
  var heroSearch = makeSearch($('#search'));
  var hdrSearch = makeSearch($('#hsearch'));
  var form = heroSearch.form;
  var q = heroSearch.q;

  /* Подсказка в поле не обрезается: если «Бренд, средство или задача» не помещается в ширину поля
     (телефон уже 386 px, компактный поиск в шапке на 768–1199), берётся вариант короче. */
  var PH = ['Бренд, средство или задача', 'Бренд, средство, задача', 'Бренд или задача', 'Поиск'];
  var phCtx = doc.createElement('canvas').getContext('2d');
  function fitPlaceholder(input) {
    var w = input.clientWidth;
    if (!w || !phCtx) return;
    var cs = getComputedStyle(input);
    phCtx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    var pick = PH[PH.length - 1];
    for (var i = 0; i < PH.length; i++) { if (phCtx.measureText(PH[i]).width <= w - 2) { pick = PH[i]; break; } }
    if (input.placeholder !== pick) input.placeholder = pick;
  }
  function fitPlaceholders() { fitPlaceholder(q); fitPlaceholder(hdrSearch.q); }
  fitPlaceholders();

  var tabSearch = $('#tabSearch');
  if (tabSearch) {
    tabSearch.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToEl(form, true);
      setTimeout(function () { q.focus({ preventScroll: true }); }, reduced() ? 0 : 450);
    });
  }

  /* ---------- Быстрые категории: капсулы на волне, подписи в одну линию ---------- */
  var n = D.quick.length;
  $('#catsList').innerHTML = D.quick.map(function (c, i) {
    var wave = Math.round(Math.sin((i / (n - 1)) * Math.PI * 2) * 18);
    var src = c.cut || (c.name === 'Новинки' ? newImg : null);
    var fit = src ? catFitStyle(src) : '';
    var cap = src
      ? '<span class="cat__cap"><img' + (fit ? ' class="cfit" style="' + fit + '"' : '') + ' src="' + esc(src) + '" alt="" width="240" height="240" loading="lazy" decoding="async"></span>'
      : '<span class="cat__cap cat__cap--new"><svg viewBox="0 0 146 139" aria-hidden="true"><use href="#o-glyph" width="146" height="139"/></svg></span>';
    return '<li class="cats__item" style="--i:' + i + ';--wave-d:' + wave + 'px"><a class="cat" href="#catalog">' + cap +
      '<span class="cat__name">' + esc(c.name) + '</span></a></li>';
  }).join('');

  /* ---------- Товары: табы с капсулой-индикатором и сетка ---------- */
  var cats = [];
  D.products.forEach(function (p) { if (cats.indexOf(p.category) < 0) cats.push(p.category); });
  var TABS = ['Все'].concat(cats);
  function mixed() {
    var byCat = cats.map(function (c) { return D.products.filter(function (p) { return p.category === c; }); });
    var out = [], k = 0;
    while (out.length < 10 && k < 16) {
      byCat.forEach(function (list) { if (list[k] && out.length < 10) out.push(list[k]); });
      k++;
    }
    return out;
  }
  function listFor(tab) { return tab === 'Все' ? mixed() : D.products.filter(function (p) { return p.category === tab; }).slice(0, 10); }

  function card(p) {
    var alt = p.brand + ', ' + p.name;
    return '<li class="grid__item"><article class="card">' +
      '<a class="card__ph" href="#" tabindex="-1" aria-hidden="true"><img src="' + esc(p.img) + '" alt="' + esc(alt) + '" width="1000" height="1000" loading="lazy" decoding="async"></a>' +
      '<div class="card__top"><p class="card__brand">' + esc(p.brand) + '</p>' +
        '<button class="fav" type="button" aria-pressed="false" aria-label="В избранное: ' + esc(p.name) + '">' + icon('i-heart') + '</button></div>' +
      '<h3 class="card__name"><a href="#"><span>' + esc(p.name) + '</span></a></h3>' +
      '<p class="card__size">' + (p.size ? esc(p.size) : '&nbsp;') + '</p>' +
      '<div class="card__buy"><p class="card__price">' + esc(p.price) + '</p>' +
        '<button class="add" type="button" data-add="' + p.id + '" aria-label="В корзину: ' + esc(p.name) + '">' +
          icon('i-basket', 'ic-basket') + icon('i-check', 'ic-check') + '</button></div>' +
      '</article></li>';
  }

  $('#shopMore span').textContent = D.hero.secondary;
  var grid = $('#grid');
  var tabsBox = $('#tabs');
  var tabsList = $('#tabsList');
  var hl = $('#tabsHl');
  var tabsIn = doc.createElement('div');
  tabsIn.className = 'tabs__in';
  tabsBox.insertBefore(tabsIn, tabsList);
  tabsIn.appendChild(tabsList);
  tabsIn.appendChild(hl);
  tabsList.innerHTML = TABS.map(function (t, i) {
    return '<button class="tab" type="button" aria-pressed="' + (i === 0) + '" data-t="' + i + '">' + esc(t) + '</button>';
  }).join('');
  hl.innerHTML = TABS.map(function (t) { return '<span class="tab">' + esc(t) + '</span>'; }).join('');
  var tabBtns = $$('.tab', tabsList);
  var curTab = 0;

  function placeHl(animate) {
    var b = tabBtns[curTab];
    var hr = hl.getBoundingClientRect(), br = b.getBoundingClientRect();
    if (!hr.width) return;
    var l = Math.max(0, br.left - hr.left), r = Math.max(0, hr.right - br.right);
    var v = 'inset(0 ' + r.toFixed(1) + 'px 0 ' + l.toFixed(1) + 'px round 999px)';
    if (!animate) hl.classList.add('no-anim');
    hl.style.webkitClipPath = v;
    hl.style.clipPath = v;
    if (!animate) { void hl.offsetWidth; hl.classList.remove('no-anim'); }
  }

  /* Плитка «Смотреть все» в конце раздела: занимает пустые колонки последнего ряда, чтобы короткий
     раздел («Для тела» — два товара) не выглядел сломанным. На телефоне — последняя капсула ленты. */
  function moreTile(tab) {
    return '<li class="grid__item grid__item--more"><a class="grid__more" href="#catalog">' +
      '<span class="grid__more-t">' + esc(tab) + '</span><span class="grid__more-l">Смотреть все</span></a></li>';
  }
  function fitMore() {
    var more = $('.grid__item--more', grid);
    if (!more) return;
    var ph = $('.card__ph', grid);
    if (ph) grid.style.setProperty('--ph-h', ph.offsetHeight + 'px');
    var cs = getComputedStyle(grid);
    if (cs.display !== 'grid') { more.hidden = false; more.style.gridColumn = ''; return; }
    var cols = cs.gridTemplateColumns.split(' ').filter(Boolean).length;
    var shown = $$('.grid__item', grid).filter(function (el) {
      return el !== more && getComputedStyle(el).display !== 'none';
    }).length;
    var rest = cols - (shown % cols);
    more.hidden = rest === cols;
    more.style.gridColumn = 'span ' + rest;
  }
  function renderGrid(tab, animate) {
    var html = listFor(tab).map(card).join('') + (tab === 'Все' ? '' : moreTile(tab));
    if (!animate || reduced() || !Element.prototype.animate) {
      grid.innerHTML = html;
      fitMore();
      return;
    }
    grid.classList.add('is-swapping');
    setTimeout(function () {
      grid.innerHTML = html;
      grid.scrollLeft = 0;
      fitMore();
      grid.classList.remove('is-swapping');
      $$('.grid__item', grid).forEach(function (el, k) {
        el.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
          { duration: 500, delay: Math.min(k, 9) * 40, easing: EASE, fill: 'backwards' });
      });
    }, 200);
  }

  tabsList.addEventListener('click', function (e) {
    var b = e.target.closest('.tab');
    if (!b) return;
    var i = +b.getAttribute('data-t');
    if (i === curTab) return;
    curTab = i;
    tabBtns.forEach(function (x, k) { x.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    placeHl(!reduced());
    renderGrid(TABS[i], true);
  });
  renderGrid(TABS[0], false);

  /* ---------- Подборки ---------- */
  /* У плиток tile-skin, tile-blue и tile-mask мягкая тёмная тень на прозрачном фоне (сделаны для синих
     плиток): в белом круге она читалась как сероватая квадратная подложка. Берём чистые вырезки тех же
     товаров из cut-v8: Skin Formula — тот же тюбик с коробкой (p-000), KLAPP Hyaluronic Mask — та же банка
     (p-003); для HydroPeptide — сыворотка бренда из задачи «Возрастные изменения» (p-017). У банки Bouticle
     (tile-blond) чистой вырезки нет: ореол срезан обрезкой по контуру банки (style.css). Все четыре товара
     вписаны в одну рамку и стоят на одном «полу». */
  var PICK_CUT = {
    'tile-skin': '../_shared/cut-v8/p-000.png',
    'tile-blue': '../_shared/cut-v8/p-017.png',
    'tile-mask': '../_shared/cut-v8/p-003.png'
  };
  $('#picks').innerHTML = D.features.map(function (f, i) {
    var src = PICK_CUT[fitKey(f.img)] || f.img;
    return '<li class="pick pick--' + (i + 1) + '"><a class="pick__in" href="#catalog">' +
      '<span class="pick__txt"><span class="pick__label">' + esc(f.label) + '</span>' +
      '<h3 class="pick__title">' + esc(f.title) + '</h3>' +
      '<span class="pick__text">' + esc(f.text) + '</span>' +
      '<span class="pick__cta">Смотреть</span></span>' +
      '<span class="pick__ph"><span class="pick__fit"><img class="fit" src="' + esc(src) + '" style="' + fitStyle(src) + '" alt="" loading="lazy" decoding="async"></span></span></a></li>';
  }).join('');

  /* ---------- Подвал ---------- */
  $('#ftrTag').textContent = D.hero.eyebrow;
  $('#ftrChecks').innerHTML = benefitHTML('li');
  function links(list) { return list.map(function (x) { return '<li><a href="#">' + esc(x) + '</a></li>'; }).join(''); }
  $('#ftrCatalog').innerHTML = links(D.footer.catalog);
  $('#ftrBuyers').innerHTML = links(D.footer.buyers);
  $('#ftrTasks').innerHTML = links(taskNames);
  $('#ftrNote').textContent = D.note;

  /* ---------- Корзина: анимация «добавлено», +1, полёт фото к значку ---------- */
  doc.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    var id = btn.getAttribute('data-add');
    var cardEl = btn.closest('.card');
    var img = cardEl ? $('.card__ph img', cardEl) : null;
    var count = K.cart.add(id);
    K.fly(img, K.visibleTarget());
    btn.classList.remove('is-added');
    void btn.offsetWidth;
    btn.classList.add('is-added');
    if (!reduced()) {
      var plus = doc.createElement('span');
      plus.className = 'plus';
      plus.setAttribute('aria-hidden', 'true');
      plus.textContent = '+1';
      btn.appendChild(plus);
      setTimeout(function () { plus.remove(); }, 950);
    }
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.classList.remove('is-added'); }, 1700);
    var name = cardEl ? $('.card__name', cardEl).textContent : '';
    say('Добавлено в корзину: ' + name + '. Товаров в корзине: ' + count + '.');
  });

  /* Избранное */
  doc.addEventListener('click', function (e) {
    var f = e.target.closest('.fav');
    if (!f) return;
    var on = f.getAttribute('aria-pressed') !== 'true';
    f.setAttribute('aria-pressed', on ? 'true' : 'false');
    $('use', f).setAttribute('href', on ? '#i-heart-f' : '#i-heart');
    f.classList.remove('is-pop');
    void f.offsetWidth;
    if (on) f.classList.add('is-pop');
  });

  /* Заглушки ссылок прототипа не прыгают наверх. */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* ---------- Синее поле: высота до светлого листа товаров и «тихая зона» узора ---------- */
  /* Узор «О»-капсул скрыт маской за заголовком, поиском и задачами: --calm-x — правый край левой колонки
     (узор виден только справа, вокруг сцены), --calm-end — откуда узор снова виден во всю ширину
     (десктоп: низ первого экрана; телефон: верх сцены). */
  var flow = $('#flow');
  var shop = $('.shop');
  var heroCopy = $('.hero__copy');
  function syncFlow() {
    var sy = window.scrollY;
    var top = shop.getBoundingClientRect().top + sy;
    flow.style.setProperty('--flow-h', Math.ceil(top + 150) + 'px');
    var oneCol = getComputedStyle($('.hero__grid')).gridTemplateColumns.split(' ').length < 2;
    var calmX = oneCol ? window.innerWidth + 400 : Math.round(heroCopy.getBoundingClientRect().right + 24);
    var calmEnd = oneCol ? stage.getBoundingClientRect().top + sy - 40 : $('.hero').getBoundingClientRect().bottom + sy - 10;
    flow.style.setProperty('--calm-x', calmX + 'px');
    flow.style.setProperty('--calm-end', Math.round(calmEnd) + 'px');
  }
  var raf = 0;
  function relayout() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () { fitStage(); railTail(); syncFlow(); placeInd(false); placeHl(false); fitMore(); railsEdge(); fitPlaceholders(); });
  }
  syncFlow();
  railsEdge();
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(relayout);
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(doc.querySelector('main'));

  /* Шапка прилипает при прокрутке: синяя подложка появляется, когда полоса преимуществ ушла. */
  var hdr = $('.hdr');
  var hForm = hdrSearch.form;
  var navEl = $('.nav');
  /* Когда капсула поиска первого экрана уходит под шапку, на месте меню появляется компактный поиск.
     Пока в нём фокус, он не исчезает; меню возвращается, когда большой поиск снова виден. */
  var heroSearchGone = false;
  function syncHdrSearch() {
    var on = heroSearchGone && !phone.matches;
    if (!on && hForm.contains(doc.activeElement)) return;
    if (hdr.classList.contains('has-search') === on) return;
    hdr.classList.toggle('has-search', on);
    if (on) { hForm.removeAttribute('inert'); navEl.setAttribute('inert', ''); fitPlaceholder(hdrSearch.q); }
    else { hForm.setAttribute('inert', ''); navEl.removeAttribute('inert'); hdrSearch.close(); }
  }
  hForm.addEventListener('focusout', function () { setTimeout(syncHdrSearch, 0); });
  if (phone.addEventListener) phone.addEventListener('change', syncHdrSearch);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      hdr.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe($('.benefits'));
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      heroSearchGone = !e.isIntersecting && e.boundingClientRect.top < 80;
      syncHdrSearch();
    }, { rootMargin: '-74px 0px 0px 0px' }).observe(form);
  }

  /* ---------- Появление ---------- */
  requestAnimationFrame(function () {
    placeHl(false);
    root.classList.add('is-in');
  });
  K.reveal($$('.cats__item, .grid__item, .pick, .shop__head, .picks .sec-head, .ftr__cols > *'), { stagger: 55 });
})();
