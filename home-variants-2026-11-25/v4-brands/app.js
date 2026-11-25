/* TOP Cosmetics — главная, вариант v4 «Витрина брендов».
   Всё содержимое берётся из window.TOP_DATA (../_shared/data.js); поведение корзины — из TCKit (../_shared/kit.js).
   Подписи от себя — только нейтральные заголовки разделов и надписи на кнопках. */
(function () {
  'use strict';

  var D = window.TOP_DATA;
  var K = window.TCKit;
  if (!D || !K) return;

  /* Системное «уменьшить движение» читаем каждый раз: его можно включить, не перезагружая страницу. */
  function reduced() { return K.reduced(); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function slot(name) { return $('[data-slot="' + name + '"]'); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* Типографика: короткие предлоги и союзы не висят в конце строки (неразрывный пробел после них). */
  function nb(s) { return String(s).replace(/(^|[\s(«])([А-Яа-яЁёA-Za-z]{1,2})\s+/g, '$1$2\u00A0'); }
  function tx(s) { return esc(nb(s)); }
  function ic(name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#' + name + '"/></svg>';
  }
  /* «O» логотипа как подставка для товара: синее пятно + белая диагональная капсула + фото поверх. */
  function ostage(img, cls, alt) {
    return '<span class="ostage' + (cls ? ' ' + cls : '') + '">' +
      '<svg class="ostage__o" aria-hidden="true" focusable="false">' +
      '<use class="ostage__blob" href="#o-blob"/><use class="ostage__cap" href="#o-cap"/></svg>' +
      (img ? '<img class="ostage__img" src="' + esc(img) + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async">' : '') +
      '</span>';
  }
  function setInert(el, on) {
    if (!el) return;
    if ('inert' in el) el.inert = on;
    if (on) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden');
  }

  /* Логотипы брендов: перекрашенные копии в assets/brands (в общих файлах они чёрные с прозрачностью 0,2). */
  var LOGO_H = { 'Klapp.svg': 21, 'hydroPeptide.svg': 27, 'bouticle.svg': 19, 'mesopharm.svg': 31, 'YuR.svg': 36 };
  function brandInner(b) {
    if (b.logo) {
      var file = b.logo.split('/').pop();
      return '<img class="bcap__logo" src="assets/brands/' + esc(file) + '" alt="' + esc(b.name) + '" style="--lh:' + (LOGO_H[file] || 22) + 'px" decoding="async">';
    }
    return '<span class="bcap__word">' + esc(b.name) + '</span>';
  }
  function bcap(b, cls, i) {
    return '<li' + (i != null ? ' style="--i:' + i + '"' : '') + '><a class="bcap' + (cls ? ' ' + cls : '') + '" href="#" data-brand="' + esc(b.name) + '">' + brandInner(b) + '</a></li>';
  }

  /* ---------- 1. Преимущества ---------- */
  slot('benefits').innerHTML = D.benefits.map(function (t) {
    return '<li class="bar__it"><span class="tick">' + ic('i-check') + '</span><span>' + esc(t) + '</span></li>';
  }).join('');

  /* ---------- 2. Меню разделов ---------- */
  var navItems = D.nav.filter(function (n) { return n !== 'Каталог' && n !== 'Подбор по задаче'; });
  slot('nav').innerHTML = navItems.map(function (n) {
    return '<li><a class="nav__link' + (n === 'Новинки' ? ' nav__link--accent' : '') + '" href="#">' + esc(n) + '</a></li>';
  }).join('');
  $('span', slot('nav-pick')).textContent = D.nav[D.nav.length - 1];

  /* ---------- 3. Бренды: все 12 капсул сразу, без бегущей строки ----------
     Капсулы въезжают справа лесенкой и останавливаются (одно появление, без бесконечного движения).
     «Все бренды» в конце ряда — только на телефоне, где ряд листается пальцем. */
  slot('brand-count').textContent = D.brands.length;
  slot('brand-row').innerHTML = D.brands.map(function (b, i) { return bcap(b, '', i); }).join('') +
    '<li class="brands__more" style="--i:' + D.brands.length + '"><a class="bcap bcap--all" href="#">Все бренды</a></li>';

  /* ---------- 4. Витрина: заголовок + капсульная карусель ---------- */
  var H = D.hero;
  /* Заголовок, подзаголовок и кнопки — один блок слева, кнопки сразу под подзаголовком. */
  slot('mast').innerHTML =
    '<h1 class="mast__title" id="hero-title">' + esc(H.title) + '</h1>' +
    '<p class="mast__text">' + tx(H.text) + '</p>' +
    '<div class="mast__cta">' +
      '<a class="btn btn--blue btn--lg" href="#tasks">' + esc(H.primary) + '</a>' +
      '<a class="btn btn--line btn--lg" href="#catalog">' + esc(H.secondary) + '</a>' +
    '</div>';

  /* Размеры фото в слайде: полный вид / свёрнутая капсула. */
  var SLIDE_FIT = [
    { ph: 300, mh: 150, tone: 'a' },
    { ph: 330, mh: 180, tone: 'b' },
    { ph: 250, mh: 118, tone: 'c' },
    { ph: 232, mh: 112, tone: 'd' }
  ];
  var F = D.features;
  var acc = slot('acc');
  acc.innerHTML = F.map(function (f, i) {
    var fit = SLIDE_FIT[i] || SLIDE_FIT[0];
    return '<article class="slide slide--' + fit.tone + '" id="slide-' + i + '" aria-roledescription="слайд" aria-label="' + (i + 1) + ' из ' + F.length + ': ' + esc(f.title) + '" style="--ph:' + fit.ph + 'px;--mh:' + fit.mh + 'px">' +
      '<div class="slide__bg" aria-hidden="true"></div>' +
      '<div class="slide__full">' +
        '<div class="slide__copy">' +
          '<span class="chip chip--glass">' + esc(f.label) + '</span>' +
          '<h2 class="slide__title">' + tx(f.title) + '</h2>' +
          '<p class="slide__text">' + tx(f.text) + '</p>' +
          '<a class="btn btn--white slide__cta" href="#">Смотреть <span class="btn__ic">' + ic('i-arrow') + '</span></a>' +
        '</div>' +
        '<div class="slide__win" aria-hidden="true"><span class="slide__cap"></span><span class="slide__shadow"></span></div>' +
        '<img class="slide__img" src="' + esc(f.img) + '" alt="" decoding="async"' + (i ? ' loading="lazy"' : '') + '>' +
      '</div>' +
      '<button class="slide__mini" type="button" aria-controls="slide-' + i + '" aria-expanded="false" aria-label="Показать: ' + esc(f.title) + '">' +
        '<span class="slide__mwin" aria-hidden="true"><span class="slide__mcap"></span><img src="' + esc(f.img) + '" alt="" decoding="async"></span>' +
        '<span class="slide__mtitle">' + tx(f.title) + '</span>' +
      '</button>' +
    '</article>';
  }).join('');
  slot('acc-dots').innerHTML = F.map(function (f, i) {
    return '<button class="acc-dots__b" type="button" data-i="' + i + '" aria-label="Слайд ' + (i + 1) + ' из ' + F.length + ': ' + esc(f.title) + '"><i></i></button>';
  }).join('');

  /* ---------- 5. Быстрые категории ----------
     Девять высоких капсул, как свёрнутые капсулы карусели: синий фон, белая диагональная капсула из «O»
     логотипа и на ней крупный вырезанный товар. У «Новинок» в данных нет фото — берём вырезку Skin Formula
     из задачи «Очищение»: Skin Formula в данных и есть «Новинка» (подборка «Skin Formula в TOP»). */
  var NEW_CUT = (D.tasks.filter(function (t) { return t.name === 'Очищение'; })[0] || {}).cut || null;
  /* Широкие вырезки (тюбик с коробкой, флакон с коробкой, банка) на телефоне, где капсула 3:4, чуть меньше,
     иначе овал срезает их края; узкие флаконы остаются крупными. */
  var QCAT_FIT = { 'p-000.png': 0.84, 'p-005.png': 0.92, 'p-006.png': 0.92 };
  slot('cats').innerHTML = D.quick.map(function (q) {
    var cut = q.cut || (q.name === 'Новинки' ? NEW_CUT : null);
    var fit = cut ? QCAT_FIT[cut.split('/').pop()] : null;
    return '<li><a class="qcat" href="#">' +
      '<span class="qcat__cap" aria-hidden="true"><span class="qcat__win"></span>' +
        (cut ? '<img class="qcat__img" src="' + esc(cut) + '" alt="" width="480" height="480" loading="lazy" decoding="async"' + (fit ? ' style="--qf:' + fit + '"' : '') + '>' : '') +
      '</span>' +
      '<span class="qcat__name">' + tx(q.name) + '</span></a></li>';
  }).join('');

  /* ---------- 6. Товары ---------- */
  var byId = {};
  D.products.forEach(function (p) { byId[p.id] = p; });
  var ALL = [11053, 9150, 10868, 10991, 9172, 10985, 10571, 10997, 11050, 11008]
    .map(function (id) { return byId[id]; }).filter(Boolean);
  var TABS = ['Все', 'Для лица', 'Для волос', 'Для тела', 'Витамины и БАДы'];
  function productsFor(tab) {
    return tab === 'Все' ? ALL : D.products.filter(function (p) { return p.category === tab; });
  }
  function card(p, i) {
    return '<li class="pcard" style="--i:' + i + '">' +
      '<div class="pcard__media">' +
        '<a class="pcard__ph" href="#" tabindex="-1" aria-hidden="true"><img src="' + esc(p.img) + '" alt="' + esc(p.brand + ' — ' + p.name) + '" width="1000" height="1000" loading="lazy" decoding="async"></a>' +
        '<button class="pcard__fav" type="button" aria-pressed="false" aria-label="В избранное: ' + esc(p.name) + '">' + ic('i-heart', 'ic--line') + ic('i-heart-f', 'ic--fill') + '</button>' +
      '</div>' +
      '<p class="pcard__brand">' + esc(p.brand) + '</p>' +
      '<h3 class="pcard__name"><a href="#">' + esc(p.name) + '</a></h3>' +
      '<p class="pcard__size">' + (p.size ? esc(p.size) : '&nbsp;') + '</p>' +
      '<div class="pcard__buy">' +
        '<span class="pcard__price">' + esc(p.price) + '</span>' +
        '<button class="addbtn" type="button" data-add="' + p.id + '" aria-label="В корзину: ' + esc(p.name) + '">' +
          '<span class="addbtn__pill" aria-hidden="true">' +
            '<span class="addbtn__txt addbtn__txt--add">В корзину</span>' +
            '<span class="addbtn__txt addbtn__txt--done">Добавлено</span>' +
          '</span>' +
          '<span class="addbtn__ic">' + ic('i-basket', 'ic--basket') + ic('i-check', 'ic--check') + '</span>' +
        '</button>' +
      '</div>' +
    '</li>';
  }
  var grid = slot('grid');
  var tabsEl = slot('tabs');
  tabsEl.innerHTML = TABS.map(function (t, i) {
    return '<button class="tab" type="button" role="tab" id="tab-' + i + '" aria-controls="grid" aria-selected="' + (i === 0) + '"' + (i ? ' tabindex="-1"' : '') + '>' + esc(t) + '</button>';
  }).join('');
  function renderGrid(tab, animate) {
    grid.innerHTML = productsFor(tab).map(card).join('');
    grid.setAttribute('aria-labelledby', 'tab-' + TABS.indexOf(tab));
    if (animate && !reduced()) {
      grid.classList.remove('is-swap'); void grid.offsetWidth; grid.classList.add('is-swap');
    }
  }
  renderGrid('Все', false);
  function selectTab(btn, focus) {
    var tabs = $$('.tab', tabsEl);
    tabs.forEach(function (b) {
      var on = b === btn;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    if (focus) btn.focus();
    renderGrid(btn.textContent, true);
  }
  tabsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.tab');
    if (b && b.getAttribute('aria-selected') !== 'true') selectTab(b);
  });
  tabsEl.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var tabs = $$('.tab', tabsEl);
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    selectTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
  });

  /* ---------- 8. Двойное промо: стена брендов + крупные товары в «O» и один вход в подбор ---------- */
  var n = D.brands.length;
  var heroCuts = D.hero.products.slice();
  /* Сыворотка HydroPeptide — вырезка из задачи «Возрастные изменения» (тот же Power Serum): в hero/hero-serum.webp
     сбоку от флакона запечена непрозрачная серая тень, на белой капсуле «O» она читалась как серая плита. */
  var serumCut = (D.tasks.filter(function (t) { return t.name === 'Возрастные изменения'; })[0] || {}).cut;
  if (serumCut) heroCuts[1] = serumCut;
  slot('duo').innerHTML =
    '<article class="duo__card duo__card--brands">' +
      '<h2 class="duo__title"><span class="duo__num">' + n + '</span> профессиональных брендов</h2>' +
      '<ul class="duo__wall">' + D.brands.map(function (b) { return bcap(b, 'bcap--wall'); }).join('') + '</ul>' +
      '<a class="btn btn--white btn--lg" href="#">Все бренды</a>' +
    '</article>' +
    '<article class="duo__card duo__card--pick">' +
      '<h2 class="duo__title duo__title--ink">Не знаете, что выбрать?</h2>' +
      '<div class="duo__art" aria-hidden="true">' +
        '<svg class="duo__o" focusable="false"><use class="ostage__blob" href="#o-blob"/><use class="ostage__cap" href="#o-cap"/></svg>' +
        '<img class="duo__p duo__p--1" src="' + esc(heroCuts[0]) + '" alt="" loading="lazy" decoding="async">' +
        '<img class="duo__p duo__p--2" src="' + esc(heroCuts[1]) + '" alt="" loading="lazy" decoding="async">' +
        '<img class="duo__p duo__p--3" src="' + esc(heroCuts[2]) + '" alt="" loading="lazy" decoding="async">' +
      '</div>' +
      '<a class="btn btn--blue btn--lg duo__cta" href="#tasks">' + esc(D.nav[D.nav.length - 1]) + '</a>' +
    '</article>';

  /* Срез ореола у вырезок (SVG-фильтр #alphacut) — только после загрузки картинки:
     в WebKit фильтр на ещё не загруженном <img> рисует прозрачную «дыру» в углу страницы. */
  $$('.slide__img, .slide__mwin img, .duo__p').forEach(function (img) {
    function on() { img.classList.add('is-ld'); }
    if (img.complete && img.naturalWidth) on();
    else img.addEventListener('load', on, { once: true });
  });

  /* ---------- 6. Подбор по задаче (вся плитка — ссылка; название уже подписывает фото, поэтому alt пустой) ---------- */
  slot('tasks').innerHTML = D.tasks.map(function (t) {
    return '<li><a class="task" href="#">' +
      '<span class="task__name">' + tx(t.name) + '</span>' +
      '<span class="task__desc">' + tx(t.desc) + '</span>' +
      ostage(t.cut, 'ostage--task', '') +
      '</a></li>';
  }).join('');

  /* ---------- 9. Подвал ---------- */
  slot('footer').innerHTML =
    '<div class="ftr__in wrap">' +
      '<div class="ftr__top">' +
        '<div class="ftr__about">' +
          '<a class="logo logo--w" href="#" aria-label="TOP Cosmetics — на главную"><svg aria-hidden="true" focusable="false"><use href="#logo"/></svg></a>' +
          '<p class="ftr__tag">' + esc(H.eyebrow) + '</p>' +
          '<ul class="ftr__social">' +
            '<li><a href="#" aria-label="Telegram"><img src="../_shared/icons/tg-ico.svg" alt="" width="36" height="36"></a></li>' +
            '<li><a href="#" aria-label="ВКонтакте"><img src="../_shared/icons/vk-ico.svg" alt="" width="33" height="33"></a></li>' +
          '</ul>' +
        '</div>' +
        '<nav class="ftr__col" aria-labelledby="f-cat"><h2 class="ftr__h" id="f-cat">Каталог</h2><ul>' +
          D.footer.catalog.map(function (t) { return '<li><a href="#">' + esc(t) + '</a></li>'; }).join('') + '</ul></nav>' +
        '<nav class="ftr__col" aria-labelledby="f-buy"><h2 class="ftr__h" id="f-buy">Покупателям</h2><ul>' +
          D.footer.buyers.map(function (t) { return '<li><a href="#">' + esc(t) + '</a></li>'; }).join('') + '</ul></nav>' +
        '<div class="ftr__col ftr__col--brands"><h2 class="ftr__h">Бренды</h2><ul class="ftr__brands">' +
          D.brands.map(function (b) { return '<li><a href="#">' + esc(b.name) + '</a></li>'; }).join('') + '</ul></div>' +
      '</div>' +
      '<div class="ftr__bottom">' +
        '<p class="ftr__copy">© TOP Cosmetics</p>' +
        '<p class="ftr__note">' + tx(D.note) + '</p>' +
      '</div>' +
    '</div>' +
    '<svg class="ftr__o" aria-hidden="true" focusable="false"><use href="#o"/></svg>';

  /* =========================================================
     Поведение
     ========================================================= */

  /* Липкая шапка: тень, когда строка преимуществ ушла вверх. */
  var hdr = $('.hdr');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      hdr.classList.toggle('is-stuck', !es[0].isIntersecting);
    }).observe($('.bar'));
  }

  /* Капсульная карусель: на компьютере — «аккордеон» из капсул (clip-path + transform),
     на телефоне — лента с прокруткой. Под каруселью один пульт: точки с прогрессом и пауза
     (внутри слайдов нет ни точек, ни кнопок — только товар и текст). */
  (function accordion() {
    var slides = $$('.slide', acc);
    var stage = $('.stage');
    var dots = $$('.acc-dots__b');
    var pauseBtn = $('.acc-pause');
    var mq = window.matchMedia('(min-width: 1180px)');
    var active = -1;
    var GAP = 16;
    var paused = {};

    function pillW(W) { return W >= 1240 ? 152 : (W >= 1150 ? 128 : 112); }
    function layout() {
      var desk = mq.matches;
      acc.classList.toggle('acc--desk', desk);
      stage.classList.toggle('is-desk', desk);
      if (!desk) {
        acc.classList.remove('acc--compact');
        slides.forEach(function (s) {
          s.style.transform = ''; s.style.clipPath = ''; s.style.webkitClipPath = ''; s.style.width = '';
          s.classList.remove('is-active');
          setInert($('.slide__full', s), false);
          setInert($('.slide__mini', s), true);
        });
        return;
      }
      var W = acc.clientWidth, Hh = acc.clientHeight, pill = pillW(W), cnt = slides.length;
      var We = W - (cnt - 1) * (pill + GAP);
      var x = 0;
      acc.style.setProperty('--pill', pill + 'px');
      acc.style.setProperty('--we', We + 'px');
      acc.classList.toggle('acc--compact', We < 790);
      slides.forEach(function (s, i) {
        var on = i === active;
        var w = on ? We : pill;
        var clip = 'inset(0px ' + (We - w) + 'px 0px 0px round ' + (on ? Hh / 2 : pill / 2) + 'px)';
        s.style.width = We + 'px';
        s.style.transform = 'translate3d(' + x + 'px,0,0)';
        s.style.clipPath = clip;
        s.style.webkitClipPath = clip;
        s.classList.toggle('is-active', on);
        setInert($('.slide__full', s), !on);
        var mini = $('.slide__mini', s);
        setInert(mini, on);
        mini.setAttribute('aria-expanded', on ? 'true' : 'false');
        x += w + GAP;
      });
      setDot(active);
    }
    var introT;
    function endIntro() { clearTimeout(introT); acc.classList.remove('acc--intro'); }
    function go(i) {
      endIntro();
      active = (i + slides.length) % slides.length;
      layout();
    }
    function setPause(reason, on) {
      if (on) paused[reason] = true; else delete paused[reason];
      stage.classList.toggle('is-paused', Object.keys(paused).length > 0);
    }
    /* Видимая кнопка паузы (WCAG 2.2.2) — одна, в пульте под каруселью. «Пуск» снимает и паузу от наведения/фокуса. */
    function setUserPause(on) {
      if (!on) { delete paused.hover; delete paused.focus; }
      setPause('user', on);
      stage.classList.toggle('is-user-paused', on);
      pauseBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', on ? 'Запустить автопрокрутку' : 'Остановить автопрокрутку');
    }
    pauseBtn.addEventListener('click', function () { setUserPause(!stage.classList.contains('is-user-paused')); });

    acc.addEventListener('click', function (e) {
      var mini = e.target.closest('.slide__mini');
      if (!mini || !mq.matches) return;
      var i = slides.indexOf(mini.closest('.slide'));
      if (i !== active) {
        go(i);
        var cta = $('.slide__cta', slides[i]);
        if (document.activeElement === mini && cta) setTimeout(function () { cta.focus({ preventScroll: true }); }, 60);
      }
    });
    /* Автопрокрутка привязана к полоске прогресса (CSS-анимация): пауза = остановка анимации.
       При «уменьшить движение» длительность анимаций нулевая — без проверки слайды мелькали бы без остановки. */
    stage.addEventListener('animationend', function (e) {
      if (e.animationName === 'accfill' && mq.matches && !reduced() && stage.classList.contains('is-auto')) go(active + 1);
    });
    stage.addEventListener('mouseenter', function () { setPause('hover', true); });
    stage.addEventListener('mouseleave', function () { setPause('hover', false); });
    stage.addEventListener('focusin', function () { setPause('focus', true); });
    stage.addEventListener('focusout', function (e) { if (!stage.contains(e.relatedTarget)) setPause('focus', false); });
    document.addEventListener('visibilitychange', function () { setPause('hidden', document.hidden); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { setPause('offscreen', !es[0].isIntersecting); }, { threshold: 0.35 }).observe(acc);
    }
    stage.classList.toggle('is-auto', !reduced());
    var rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
    function onMotionPref() { stage.classList.toggle('is-auto', !rmq.matches); if (rmq.matches) endIntro(); }
    if (rmq.addEventListener) rmq.addEventListener('change', onMotionPref);
    else if (rmq.addListener) rmq.addListener(onMotionPref);

    /* Точки: на компьютере — активный слайд (заполняющаяся полоска = таймер автопрокрутки),
       на телефоне — следят за прокруткой ленты. */
    function setDot(i) {
      dots.forEach(function (d, j) {
        d.classList.toggle('is-on', j === i);
        if (j === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }
    setDot(0);
    if ('IntersectionObserver' in window) {
      var dio = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting && !mq.matches) setDot(slides.indexOf(en.target));
        });
      }, { root: acc, threshold: 0.6 });
      slides.forEach(function (s) { dio.observe(s); });
    }
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        if (mq.matches) { go(i); return; }
        var s = slides[i];
        acc.scrollTo({ left: s.offsetLeft - acc.offsetLeft - parseFloat(getComputedStyle(acc).paddingLeft || 0), behavior: reduced() ? 'auto' : 'smooth' });
        setDot(i);
      });
    });

    /* Пересчёт без анимации при любом изменении ширины: окно, загрузка стилей и шрифтов
       (в WebKit отложенные скрипты могут выполниться раньше, чем применятся стили). */
    var rt, lastW = 0;
    function relayout() {
      var w = acc.clientWidth;
      if (w === lastW) return;
      lastW = w;
      acc.classList.add('no-anim');
      layout();
      clearTimeout(rt);
      rt = setTimeout(function () { acc.classList.remove('no-anim'); }, 120);
    }
    if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(acc);
    window.addEventListener('resize', relayout);
    window.addEventListener('load', relayout);
    if (mq.addEventListener) mq.addEventListener('change', layout);

    /* Первый кадр: синий «стадион» первой подборки уже раскрыт — без переходов и без ожидания load.
       Затем (CSS-анимации, до 0,6 с) проявляются только окно-капсула и товар, а свёрнутые капсулы
       чуть поднимаются. Ничего не прячется через opacity, поэтому медленная сеть не даёт белого экрана. */
    acc.classList.add('no-anim');
    go(0);
    lastW = acc.clientWidth;
    if (!reduced()) {
      acc.classList.add('acc--intro');
      /* Конец появления — по окончании подъёма последней капсулы (стили в WebKit могут примениться позже скрипта),
         с запасным таймером. */
      acc.addEventListener('animationend', function (e) {
        if (e.animationName === 'pillRise' && e.target === slides[slides.length - 1]) endIntro();
      });
      introT = setTimeout(endIntro, 2500);
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { acc.classList.remove('no-anim'); });
    });
  })();

  /* Корзина: анимация на кнопке, +1, полёт фото к значку корзины. */
  var live = slot('live');
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    var cardEl = btn.closest('.pcard');
    var img = cardEl ? $('.pcard__media img', cardEl) : null;
    var p = byId[btn.getAttribute('data-add')];
    K.cart.add(btn.getAttribute('data-add'));
    K.fly(img, K.visibleTarget());
    btn.classList.remove('is-added');
    void btn.offsetWidth;
    btn.classList.add('is-added');
    if (!reduced()) {
      var plus = document.createElement('span');
      plus.className = 'addbtn__plus';
      plus.setAttribute('aria-hidden', 'true');
      plus.textContent = '+1';
      /* Вне кнопки: у кнопки clip-path, внутри «+1» обрезался бы. */
      btn.parentNode.appendChild(plus);
      setTimeout(function () { plus.remove(); }, 950);
    }
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.classList.remove('is-added'); }, 1800);
    if (live && p) live.textContent = 'Добавлено в корзину: ' + p.name;
  });

  /* «Поиск» в нижней панели телефона ведёт к полю поиска под шапкой и ставит в него курсор. */
  var searchLink = $('[data-search-link]');
  var searchInput = $('#q');
  if (searchLink && searchInput) {
    searchLink.addEventListener('click', function (e) {
      e.preventDefault();
      var y = searchInput.getBoundingClientRect().top + window.pageYOffset - 12;
      window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' });
      searchInput.focus({ preventScroll: true });
    });
  }

  /* Прототип: ссылки-заглушки (href="#") никуда не прыгают — страница не уезжает наверх, к адресу не дописывается «#».
     Логотип («на главную») плавно возвращает к началу страницы. Поиск не перезагружает страницу
     (иначе сбросился бы счётчик корзины). «Каталог» в шапке ведёт к товарам (#catalog), как «Смотреть каталог»
     и вкладка «Каталог» на телефоне: выпадающего меню в прототипе нет. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#"]');
    if (!a) return;
    e.preventDefault();
    if (a.classList.contains('logo')) window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
  });
  var searchForm = $('.search');
  if (searchForm) searchForm.addEventListener('submit', function (e) { e.preventDefault(); });
  var catalogBtn = $('.hdr__catalog');
  var catalogSec = $('#catalog');
  if (catalogBtn && catalogSec) {
    catalogBtn.addEventListener('click', function () {
      catalogSec.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* Избранное на карточке. */
  document.addEventListener('click', function (e) {
    var fav = e.target.closest('.pcard__fav');
    if (!fav) return;
    var on = fav.getAttribute('aria-pressed') !== 'true';
    fav.setAttribute('aria-pressed', on ? 'true' : 'false');
    fav.classList.remove('is-pop'); void fav.offsetWidth;
    if (on && !reduced()) fav.classList.add('is-pop');
  });

  /* Появление при прокрутке. */
  K.reveal('.cats .sec-head, .cats__grid > li, .shop .sec-head, .pcard, .duo__card, .tasks .sec-head, .tasks__grid > li, .ftr__top > *', { stagger: 55 });
})();
