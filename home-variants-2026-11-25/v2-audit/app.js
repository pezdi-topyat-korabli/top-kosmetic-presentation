/* v2-audit «Аудит+» — главная собирается из window.TOP_DATA (../_shared/data.js).
   Поведение корзины, полёта фото, «толчка» значка и появления при прокрутке — из ../_shared/kit.js (TCKit). */
(function () {
  'use strict';
  var D = window.TOP_DATA;
  var K = window.TCKit;
  var doc = document;
  if (!D) return;

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function slot(name) { return $('[data-slot="' + name + '"]'); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ''); }
  function reduced() { return K ? K.reduced() : !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }

  /* Типографика: короткие предлоги и союзы не остаются в конце строки, названия брендов не рвутся. */
  var NB = ' ';
  var spaced = D.brands.map(function (b) { return b.name; }).filter(function (n) { return n.indexOf(' ') > -1; });
  function ty(s) {
    var out = esc(s);
    spaced.forEach(function (n) { out = out.split(esc(n)).join(esc(n).replace(/ /g, NB)); });
    var re = /(^|[\s«( ])([А-Яа-яЁё]{1,2}) /g;
    return out.replace(re, '$1$2' + NB).replace(re, '$1$2' + NB);
  }
  function icon(id, cls) { return '<svg class="' + (cls || 'ico') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  /* Рамки непрозрачных пикселей вырезок [ширина, высота, x, y, w, h] (замерено по альфа-каналу):
     у исходников разные поля, поэтому товары встают на общую «полку» и выглядят одного размера. */
  var BOX = {
    'p-000': [480, 480, 71, 48, 337, 385], 'p-001': [480, 480, 152, 47, 176, 385], 'p-002': [480, 480, 149, 48, 182, 383],
    'p-003': [480, 480, 94, 139, 291, 202], 'p-004': [480, 480, 184, 47, 111, 385], 'p-005': [480, 480, 103, 95, 273, 290],
    'p-006': [480, 480, 107, 47, 265, 387], 'p-007': [480, 480, 140, 47, 200, 387], 'p-016': [480, 480, 118, 46, 245, 385],
    'p-017': [480, 480, 173, 49, 133, 362], 'p-018': [480, 480, 157, 47, 166, 385], 'p-019': [480, 480, 149, 48, 182, 383],
    'p-020': [480, 480, 170, 48, 141, 384], 'p-021': [480, 480, 152, 47, 176, 385],
    /* У плиток в файле есть мягкая тень под товаром — рамка взята по плотным пикселям (альфа > 60 %),
       чтобы низ товара стоял ровно на «подставке», а тень ложилась на неё */
    'tile-skin': [600, 640, 129, 80, 414, 479], 'tile-blue': [304, 640, 109, 68, 142, 508],
    'tile-blond': [640, 616, 125, 71, 474, 460], 'tile-mask': [640, 626, 0, 83, 508, 353],
    '11008': [1000, 1000, 244, 129, 512, 742], '10994': [1000, 1000, 285, 99, 428, 804], '10997': [1000, 1000, 216, 129, 568, 742]
  };
  /* Вписать вырезку в рамку с известным соотношением сторон a = H/W:
     kw, kh — предельные ширина/высота товара (доли W и H), base — где стоит низ товара (доля H сверху).
     Результат — width/left в % ширины и bottom в % высоты рамки. */
  function fit(src, o) {
    var b = BOX[String(src).split('/').pop().replace(/\.(png|webp)$/, '')];
    if (!b) return '';
    var s = Math.min(o.kw / b[4], (o.kh * o.a) / b[5]);
    var w = b[0] * s, left = 0.5 + (o.dx || 0) - (b[2] + b[4] / 2) * s;
    var bottom = (1 - o.base) - ((b[1] - b[3] - b[5]) * s) / o.a;
    return 'width:' + (w * 100).toFixed(2) + '%;left:' + (left * 100).toFixed(2) + '%;bottom:' + (bottom * 100).toFixed(2) + '%';
  }
  /* Вес: PNG-вырезки из _shared (40–460 КБ) подменяются копиями WebP по размеру показа (assets/img, 4–19 КБ),
     пропорции те же, поэтому рамки BOX подходят без пересчёта. Всё ниже первого экрана грузится лениво. */
  var OPT = /(?:cut-v8\/(p-0(?:0[0-7]|1[6-9]|2[01]))|cut-snap\/(11008|11050|11053))\.png$/;
  function opt(src) {
    var m = OPT.exec(String(src));
    return m ? 'assets/img/' + (m[1] || m[2]) + '.webp' : src;
  }
  function fitImg(src, o, cls, lazy) {
    var key = String(src).split('/').pop().replace(/\.(png|webp)$/, '');
    return '<img class="fit fit--' + esc(key) + ' ' + (cls || '') + '" src="' + esc(opt(src)) + '" alt=""' +
      (lazy ? ' loading="lazy"' : '') + ' decoding="async" style="' + fit(src, o) + '">';
  }

  /* 1. Преимущества: одна спокойная строка (на планшете и телефоне — неподвижная сетка 2×2) */
  function benefit(b) {
    return '<span class="tick" aria-hidden="true">' + icon('i-check') + '</span><span>' + ty(b) + '</span>';
  }
  slot('benefits').innerHTML = D.benefits.map(function (b) { return '<li class="benefit" data-benefit>' + benefit(b) + '</li>'; }).join('');

  /* 2. Навигация: «Каталог» — синяя капсула, «Подбор по задаче» — капсула справа.
     Ссылки на разделы с товарами переключают вкладку в блоке «В каталоге». */
  var cats = [];
  D.products.forEach(function (p) { if (cats.indexOf(p.category) < 0) cats.push(p.category); });
  var nav = D.nav.slice();
  var navFirst = nav.shift(), navLast = nav.pop();
  slot('nav').innerHTML =
    '<a class="nav__catalog" href="#catalog">' + icon('i-burger') + '<span>' + esc(navFirst) + '</span></a>' +
    '<ul class="nav__links">' + nav.map(function (n) {
      var i = cats.indexOf(n);
      var href = i > -1 ? '#catalog' : n === 'Бренды' ? '#brands' : n === 'Новинки' ? '#cats' : '#';
      return '<li><a class="nav__link" href="' + href + '"' + (i > -1 ? ' data-cat="' + i + '"' : '') + '>' + ty(n) + '</a></li>';
    }).join('') + '</ul>' +
    '<a class="nav__task" href="#tasks"><span class="capsule-ico" aria-hidden="true"></span>' + esc(navLast) + '</a>';

  /* 3. Бренды: логотипы, где они есть (перекраска фильтром), остальные — набранные словесные знаки */
  slot('brand-count').textContent = D.brands.length;
  slot('brands').innerHTML = D.brands.map(function (b) {
    var k = slug(b.name);
    var inner = b.logo
      ? '<span class="brand__logo brand__logo--' + k + '"><img class="brand__img brand__img--w" src="' + esc(b.logo) + '" alt="" decoding="async">' +
        '<img class="brand__img brand__img--b" src="' + esc(b.logo) + '" alt="" decoding="async"></span>'
      : k === 'skinformula'
        ? '<span class="wm wm--skinformula">Skin<br>Formula</span>'
        : '<span class="wm wm--' + k + '">' + esc(b.name) + '</span>';
    return '<li><a class="brand" href="#" data-brand="' + esc(b.name) + '" aria-label="' + esc(b.name) + '">' + inner + '</a></li>';
  }).join('');

  /* 4. Первый экран */
  var H = D.hero;
  var words = H.title.split(' ');
  var last = words.pop();
  /* Сцена — сама «О» логотипа: синее тело и белая диагональная прорезь-капсула (пути из _shared/logo/logo-footer.svg,
     разведены на два слоя, чтобы прорезь была белой и «открывалась» отдельно). В прорези — пара KLAPP CELL PRO из каталога
     данных, та же, что на понравившемся концепте аудита: сыворотка лежит вдоль прорези, банка крема стоит у её нижнего края.
     Обе — ещё и первые карточки ленты «Для лица»: это сами товары из списка. Положение — в % рамки «О» (146 × 139). */
  var O_BODY = 'M153.475 8.93882C166.048 1.13599 187.777 -0.249239 197.07 0.0334723C244.491 0.0334788 255.971 23.2157 258.294 28.5872C260.618 33.9587 267.997 46.8222 264.307 81.5957C260.618 116.369 242.442 123.861 227.819 128.384C213.196 132.908 194.337 135.169 167.961 128.384C141.585 121.599 135.435 106.192 131.472 89.7943C127.509 73.397 127.646 52.1936 131.472 40.1784C135.299 28.1632 137.759 18.6924 153.475 8.93882Z';
  var O_CUT = 'M190.648 12.5714C175.065 4.23094 163.929 3.77884 149.809 13.1281C133.974 23.6116 127.689 48.3987 145.652 70.6886C164.024 93.4859 198.88 125.476 224.15 125.8C249.42 126.124 260.323 102.133 259.171 90.0019C258.019 77.8708 257.662 67.0339 226.119 38.1528C219.833 32.2993 206.908 21.2744 190.648 12.5714Z';
  var HERO = [
    { id: 11050, cls: 'serum', w: 77.75, l: 1, t: -2.4 },
    { id: 11053, cls: 'jar', w: 57.5, l: 38.75, t: 36.7 }
  ];
  function heroImg(h) {
    return '<img class="hero__p hero__p--' + h.cls + '" src="assets/img/' + h.id + '.webp" alt="" decoding="async" ' +
      'style="width:' + h.w + '%;left:' + h.l + '%;top:' + h.t + '%">';
  }
  slot('hero-main').innerHTML =
    '<div class="hero__copy">' +
      '<p class="eyebrow"><span class="capsule-ico" aria-hidden="true"></span>' + esc(H.eyebrow) + '</p>' +
      '<h1 class="hero__title" id="hero-h"><span class="hero__line">' + esc(words.join(' ')) + '</span> ' +
        '<span class="hero__line">' + esc(last) + '</span></h1>' +
      '<p class="hero__text">' + ty(H.text) + '</p>' +
      '<div class="hero__cta">' +
        '<a class="btn btn--blue" href="#tasks">' + esc(H.primary) + '</a>' +
        '<a class="btn btn--ghost" href="#catalog">' + esc(H.secondary) + '</a>' +
      '</div>' +
    '</div>' +
    '<div class="hero__stage" aria-hidden="true">' +
      '<svg class="hero__o" viewBox="124 -3 146 139" focusable="false"><path class="hero__o-body" d="' + O_BODY + '"/>' +
        '<path class="hero__o-cut" d="' + O_CUT + '"/></svg>' +
      HERO.map(heroImg).join('') +
    '</div>';

  var F = D.features[0];
  var samples = D.quick.filter(function (q) { return q.name === 'Пробники'; })[0];
  var ft = F.title.split(' ');
  slot('hero-side').innerHTML =
    '<a class="feature" href="#" aria-label="' + esc(F.label + ': ' + F.title) + '">' +
      '<span class="feature__patt" aria-hidden="true"></span>' +
      '<span class="feature__media" aria-hidden="true"><span class="feature__plate"></span>' +
        fitImg(F.img, { a: 1, kw: 0.74, kh: 0.76, base: 0.8 }) + '</span>' +
      '<span class="feature__body">' +
        '<span class="chip chip--white">' + esc(F.label) + '</span>' +
        '<span class="feature__title">' + esc(ft.slice(0, 2).join(' ')) + ' <br>' + esc(ft.slice(2).join(' ')) + '</span>' +
        '<span class="feature__text">' + ty(F.text) + '</span>' +
        '<span class="btn btn--white btn--sm">Смотреть</span>' +
        '<span class="feature__go" aria-hidden="true">' + icon('i-next') + '</span>' +
      '</span>' +
    '</a>' +
    (samples ?
    '<a class="samples" href="#">' +
      '<span class="samples__media" aria-hidden="true">' + fitImg(samples.cut, { a: 1, kw: 0.62, kh: 1.06, base: 0.9 }) + '</span>' +
      '<span class="samples__title">' + esc(samples.name) + '</span>' +
      '<span class="samples__go" aria-hidden="true">' + icon('i-arrow') + '</span>' +
    '</a>' : '');

  /* 5. Подбор по задаче: название + описание + товар в каждом чипе */
  slot('tasks').innerHTML = D.tasks.map(function (t) {
    return '<li class="tasks__item"><a class="task" href="#">' +
      '<span class="task__media" aria-hidden="true"><span class="task__disc"></span>' +
        fitImg(t.cut, { a: 1, kw: 0.84, kh: 1.14, base: 0.9 }, '', true) + '</span>' +
      '<span class="task__text"><span class="task__name">' + ty(t.name) + '</span><span class="task__desc">' + ty(t.desc) + '</span></span>' +
    '</a></li>';
  }).join('');

  /* 6. Быстрые категории: высокие капсулы с товаром в каждой. У «Новинок» своего фото в данных нет; новинка по данным —
     Skin Formula («Skin Formula в TOP: средства для очищения и защиты от солнца»), поэтому в капсуле — вырезка очищающего
     средства Skin Formula из задачи «Очищение» (так же сделано в v1, v4 и v5; в v3 — фото плитки «Новинка»). */
  var CAT = { a: 184 / 132, kw: 0.74, kh: 0.6, base: 0.84 };
  var NEW_CUT = (D.tasks.filter(function (t) { return t.name === 'Очищение'; })[0] || {}).cut || null;
  slot('cats').innerHTML = D.quick.map(function (q) {
    var cut = q.cut || NEW_CUT;
    var media = cut
      ? fitImg(cut, CAT, '', true)
      : '<span class="cat__o"><svg viewBox="0 0 146 139" aria-hidden="true"><use href="#o"/></svg></span>';
    return '<li class="cats__item"><a class="cat' + (q.cut ? '' : ' cat--new') + '" href="#">' +
      '<span class="cat__frame" aria-hidden="true">' + media + '</span>' +
      '<span class="cat__name">' + ty(q.name) + '</span></a></li>';
  }).join('');

  /* 7. В каталоге: вкладки по реальным категориям товаров, фото раздела в капсуле и лента карточек */
  var PHOTO = {
    'Для лица': '../_shared/banners/face.webp',
    'Для волос': '../_shared/banners/hair.webp',
    'Для тела': '../_shared/banners/body.webp'
  };
  var VIT = { a: 1.32, kw: 0.58, kh: 0.46, base: 0.62 };

  slot('tabs').innerHTML = cats.map(function (c, i) {
    return '<button class="tab" type="button" role="tab" id="tab-' + i + '" aria-controls="rail" aria-selected="' + (i === 0) +
      '" tabindex="' + (i === 0 ? 0 : -1) + '" data-i="' + i + '">' + ty(c) + '</button>';
  }).join('') + '<span class="tabs__hl" aria-hidden="true"></span>';

  var photo = slot('shop-photo');
  photo.innerHTML = cats.map(function (c, i) {
    var inner = PHOTO[c]
      ? '<img src="' + PHOTO[c] + '" alt="" loading="lazy" decoding="async">'
      : '<span class="shop__patt"></span>' + (function () {
        var vit = D.products.filter(function (p) { return p.category === c; });
        var hero = vit.filter(function (p) { return p.id === 11008; })[0] || vit[0];
        return hero ? fitImg(hero.cut, VIT, 'shop__vit', true) : '';
      })();
    return '<span class="shop__layer' + (PHOTO[c] ? '' : ' shop__layer--brand') + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '" aria-hidden="true">' + inner + '</span>';
  }).join('') +
    '<span class="shop__cap"><span class="shop__name" data-shop-name>' + ty(cats[0]) + '</span>' +
    '<span class="shop__go" aria-hidden="true">' + icon('i-arrow') + '</span></span>';
  photo.setAttribute('aria-label', cats[0] + ': смотреть все');

  /* Карточки — фото товара в WebP на родной подложке #F2F2F2 (17–38 КБ вместо PNG-вырезок 200–470 КБ): подложка фото
     совпадает с фоном карточки, поэтому шва нет. Лента ниже первого экрана — фото грузятся лениво. */
  function card(p) {
    var src = p.img || p.cut;
    return '<li class="rail__item"><article class="card">' +
      '<div class="card__media">' +
        '<img class="card__img card__img--plate" src="' + esc(src) + '" alt="' + esc(p.name) + '" width="1000" height="1000" loading="lazy" decoding="async">' +
        '<button class="card__fav" type="button" aria-pressed="false" aria-label="В избранное: ' + esc(p.name) + '">' +
          icon('i-heart', 'ico i-off') + icon('i-heart-f', 'ico i-on') + '</button>' +
      '</div>' +
      '<p class="card__brand">' + esc(p.brand) + '</p>' +
      '<h3 class="card__name"><a href="#">' + ty(p.name) + '</a></h3>' +
      '<p class="card__size">' + (p.size ? esc(p.size) : '&nbsp;') + '</p>' +
      '<div class="card__buy">' +
        '<span class="card__price">' + esc(p.price) + '</span>' +
        '<button class="add" type="button" data-add="' + p.id + '" aria-label="В корзину: ' + esc(p.name) + '">' +
          icon('i-basket', 'add__basket') + icon('i-check', 'add__check') + '</button>' +
      '</div>' +
    '</article></li>';
  }

  var rail = $('#rail');
  var track = slot('rail');
  var tabsEl = slot('tabs');
  var hl = $('.tabs__hl');
  var current = 0;

  /* Синяя капсула под активной вкладкой: слой во всю ширину ряда, видимая часть задаётся clip-path
     (анимируется только clip-path — без перерасчёта ширины). Первая установка — без перехода. */
  function moveHl() {
    var t = tabsEl.querySelector('[aria-selected="true"]');
    if (!t || !hl) return;
    var W = tabsEl.scrollWidth;
    hl.style.width = W + 'px';
    hl.style.clipPath = 'inset(0 ' + Math.max(0, W - t.offsetLeft - t.offsetWidth) + 'px 0 ' + t.offsetLeft + 'px round 999px)';
    if (!hl.classList.contains('is-live')) requestAnimationFrame(function () { hl.classList.add('is-live'); });
  }
  function renderRail(i, animate) {
    var list = D.products.filter(function (p) { return p.category === cats[i]; });
    /* Последняя карточка ленты — переход ко всему разделу; в коротких разделах занимает свободные места */
    var span = list.length < 4 ? 4 - list.length : 1;
    track.innerHTML = list.map(card).join('') +
      '<li class="rail__item rail__item--more" style="--span:' + span + '"><a class="more-card" href="#">' +
        '<span class="more-card__go" aria-hidden="true">' + icon('i-next') + '</span>' +
        '<span class="more-card__t">Смотреть все</span>' +
        '<span class="more-card__c">' + ty(cats[i]) + '</span></a></li>';
    rail.scrollLeft = 0;
    if (animate && !reduced()) {
      $$('.rail__item', track).forEach(function (li, n) {
        li.style.setProperty('--d', (n * 45) + 'ms');
        li.classList.add('is-enter');
      });
    }
    updateArrows();
  }
  function selectTab(i, focus) {
    if (i === current && !focus) return;
    current = i;
    $$('.tab', tabsEl).forEach(function (t, n) {
      t.setAttribute('aria-selected', String(n === i));
      t.tabIndex = n === i ? 0 : -1;
    });
    rail.setAttribute('aria-labelledby', 'tab-' + i);
    var t = $('#tab-' + i);
    if (focus && t) t.focus();
    if (t && t.scrollIntoView && tabsEl.scrollWidth > tabsEl.clientWidth) {
      tabsEl.scrollTo({ left: t.offsetLeft - 16, behavior: reduced() ? 'auto' : 'smooth' });
    }
    moveHl();
    $$('.shop__layer', photo).forEach(function (l) { l.classList.toggle('is-on', +l.getAttribute('data-i') === i); });
    var nm = photo.querySelector('[data-shop-name]');
    if (nm) nm.innerHTML = ty(cats[i]);
    photo.setAttribute('aria-label', cats[i] + ': смотреть все');
    renderRail(i, true);
  }
  tabsEl.addEventListener('click', function (e) {
    var t = e.target.closest('.tab');
    if (t) selectTab(+t.getAttribute('data-i'));
  });
  tabsEl.addEventListener('keydown', function (e) {
    var k = e.key, n = cats.length;
    var to = k === 'ArrowRight' ? (current + 1) % n : k === 'ArrowLeft' ? (current + n - 1) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
    if (to > -1) { e.preventDefault(); selectTab(to, true); }
  });

  /* Стрелки ленты */
  var prev = $('[data-rail="-1"]'), next = $('[data-rail="1"]');
  function updateArrows() {
    if (!prev || !next) return;
    var max = rail.scrollWidth - rail.clientWidth - 2;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max;
  }
  [prev, next].forEach(function (b) {
    if (!b) return;
    b.addEventListener('click', function () {
      var item = $('.rail__item', track);
      var step = item ? item.getBoundingClientRect().width + 16 : rail.clientWidth;
      rail.scrollBy({ left: +b.getAttribute('data-rail') * step * 2, behavior: reduced() ? 'auto' : 'smooth' });
    });
  });
  rail.addEventListener('scroll', function () { window.requestAnimationFrame(updateArrows); }, { passive: true });
  renderRail(0, false);

  /* Ссылки «Для лица / Для волос …» в навигации ведут к ленте и включают нужную вкладку */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cat]');
    if (a) selectTab(+a.getAttribute('data-cat'));
  });

  /* 8. Подборки — остальные плитки из данных */
  var PICK = { a: 1, kw: 0.78, kh: 0.78, base: 0.84 };
  slot('picks').innerHTML = D.features.slice(1).map(function (f, i) {
    return '<li class="picks__item"><a class="pick pick--' + i + '" href="#">' +
      '<span class="pick__media" aria-hidden="true"><span class="pick__plate"></span>' + fitImg(f.img, PICK, '', true) + '</span>' +
      '<span class="pick__body">' +
        '<span class="chip' + (i ? ' chip--white' : '') + '">' + esc(f.label) + '</span>' +
        '<span class="pick__title">' + ty(f.title) + '</span>' +
        '<span class="pick__text">' + ty(f.text) + '</span>' +
        '<span class="pick__more">Смотреть</span>' +
      '</span>' +
    '</a></li>';
  }).join('');

  /* 9. Подвал */
  function links(list) {
    return '<ul>' + list.map(function (l) { return '<li><a href="#">' + ty(l) + '</a></li>'; }).join('') + '</ul>';
  }
  slot('footer').innerHTML =
    '<div class="footer__brand">' +
      '<a class="footer__logo" href="#" aria-label="TOP Cosmetics — на главную"><svg viewBox="0 0 398 133" aria-hidden="true"><use href="#logo"/></svg></a>' +
      '<p class="footer__tag">' + esc(H.eyebrow) + '</p>' +
      '<div class="footer__social">' +
        '<a href="#" aria-label="Telegram">' + icon('i-tg') + '</a>' +
        '<a href="#" aria-label="ВКонтакте">' + icon('i-vk') + '</a>' +
      '</div>' +
    '</div>' +
    '<nav class="footer__col" aria-label="Каталог"><h2 class="footer__h">Каталог</h2>' + links(D.footer.catalog) + '</nav>' +
    '<nav class="footer__col" aria-label="Покупателям"><h2 class="footer__h">Покупателям</h2>' + links(D.footer.buyers) + '</nav>' +
    '<div class="footer__col footer__checks"><h2 class="footer__h">Преимущества</h2><ul>' +
      D.benefits.map(function (b) { return '<li><span class="tick" aria-hidden="true">' + icon('i-check') + '</span><span>' + ty(b) + '</span></li>'; }).join('') +
    '</ul></div>' +
    '<p class="footer__note">' + ty(D.note) + '</p>';

  /* В корзину: кнопка «наливается» и ставит галочку, «+1», фото летит к корзине, счётчики обновляются.
     Летит чистая вырезка товара (assets/img/fly/<id>.webp, 240 px, 2–5 КБ; у Yu.R — фото с убранной подложкой: вырезка
     в _shared оказалась коллажем), а не фото на серой подложке — та давала серый квадрат в светлом круге. Вырезка
     подгружается при наведении или касании кнопки; полёт начинается от фото карточки. */
  var flyCache = {};
  function flyCut(id) {
    if (!flyCache[id]) { flyCache[id] = new Image(); flyCache[id].src = 'assets/img/fly/' + id + '.webp'; }
    return flyCache[id].src;
  }
  doc.addEventListener('pointerover', function (e) {
    var b = e.target.closest && e.target.closest('[data-add]');
    if (b) flyCut(b.getAttribute('data-add'));
  });
  function flyFrom(photo, id) {
    if (!photo) return null;
    var r = photo.getBoundingClientRect();
    var g = doc.createElement('img');
    g.alt = '';
    g.src = flyCut(id);
    g.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height +
      'px;opacity:0;pointer-events:none';
    doc.body.appendChild(g);
    return g;
  }
  var live = $('#live');
  doc.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      var cardEl = add.closest('.card');
      var img = cardEl && cardEl.querySelector('.card__img');
      var name = img ? img.getAttribute('alt') : '';
      if (K) {
        K.cart.add(add.getAttribute('data-add'));
        /* Невидимая копия-вырезка на месте фото карточки: TCKit.fly берёт у неё рамку и адрес картинки, затем она убирается */
        var ghost = flyFrom(img, add.getAttribute('data-add'));
        K.fly(ghost || img, K.visibleTarget());
        if (ghost) ghost.remove();
      }
      add.classList.remove('is-added');
      void add.offsetWidth;
      add.classList.add('is-added');
      if (!reduced()) {
        var plus = doc.createElement('span');
        plus.className = 'plus1';
        plus.setAttribute('aria-hidden', 'true');
        plus.textContent = '+1';
        add.parentNode.appendChild(plus);
        setTimeout(function () { plus.remove(); }, 750);
      }
      clearTimeout(add._t);
      add._t = setTimeout(function () { add.classList.remove('is-added'); }, 1800);
      if (live) live.textContent = 'Добавлено в корзину: ' + name;
      return;
    }
    var fav = e.target.closest('.card__fav');
    if (fav) {
      e.preventDefault();
      var on = fav.getAttribute('aria-pressed') !== 'true';
      fav.setAttribute('aria-pressed', String(on));
      fav.classList.remove('is-pop');
      void fav.offsetWidth;
      if (on) fav.classList.add('is-pop');
      return;
    }
    var a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  function plural(n) {
    var m10 = n % 10, m100 = n % 100;
    return m10 === 1 && m100 !== 11 ? 'товар' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'товара' : 'товаров';
  }
  doc.addEventListener('tck:cart', function (e) {
    var n = e.detail.count;
    $$('[data-cart-target]').forEach(function (t) { t.setAttribute('aria-label', 'Корзина: ' + n + ' ' + plural(n)); });
    $$('[data-cart-count]').forEach(function (b) {
      b.classList.remove('is-pop');
      void b.offsetWidth;
      b.classList.add('is-pop');
    });
  });
  /* Плавная прокрутка к якорям — только по клику и без «уменьшить движение» (программная прокрутка остаётся мгновенной).
     Отступ — нижний край липкой шапки в прилипшем положении плюс зазор: 80 + 16 = 96 px на компьютере;
     на телефоне строка логотипа уезжает (top: −56 px), остаётся поиск: 108 − 56 + 12 ≈ 64 px */
  function stuckBottom() {
    var hd = $('.header');
    return hd ? hd.offsetHeight + (parseFloat(getComputedStyle(hd).top) || 0) : 0;
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    var target = doc.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    var y = target.getBoundingClientRect().top + window.pageYOffset - stuckBottom() - (window.innerWidth > 720 ? 16 : 12);
    window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' });
    if (target.tabIndex < 0 && !/^(A|BUTTON|INPUT)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
  var form = $('.search');
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });

  /* Липкая шапка: мягкая тень, когда строка преимуществ уехала */
  var header = $('.header');
  var benefitsBar = $('.benefits');
  /* На телефоне шапка прилипает позже — после того как уедет строка логотипа (56 px), поэтому корень расширен вверх */
  if ('IntersectionObserver' in window && header && benefitsBar) {
    var phone = window.innerWidth <= 720;
    new IntersectionObserver(function (en) { header.classList.toggle('is-stuck', !en[0].isIntersecting); },
      { rootMargin: (phone ? 56 : 0) + 'px 0px 0px 0px' }).observe(benefitsBar);
  }

  /* «Поиск» в нижней панели: поле поиска на телефоне всегда наверху экрана (липкая шапка) — ставим в него курсор */
  var searchInput = $('.search__input');
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('[data-search-focus]');
    if (!b || !searchInput) return;
    e.preventDefault();
    if (searchInput.getBoundingClientRect().bottom < 0) window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    searchInput.focus();
  });

  /* Лёгкий параллакс товаров первого экрана за курсором (только мышь, без «уменьшить движение») */
  var stage = $('.hero__stage');
  var heroMain = $('.hero__main');
  if (stage && heroMain && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var raf = 0, px = 0, py = 0;
    heroMain.addEventListener('pointermove', function (e) {
      if (reduced()) return;
      var r = heroMain.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        stage.style.setProperty('--px', px.toFixed(3));
        stage.style.setProperty('--py', py.toFixed(3));
      });
    });
    heroMain.addEventListener('pointerleave', function () {
      stage.style.setProperty('--px', 0);
      stage.style.setProperty('--py', 0);
    });
  }

  /* Пересчёт капсулы вкладок после загрузки шрифтов и при изменении ширины */
  var bar = $('.brands__bar'), scroller = $('.brands__scroller');
  function brandsFit() {
    if (bar && scroller) bar.classList.toggle('is-overflow', scroller.scrollWidth > scroller.clientWidth + 2);
  }
  /* Если страницу открыли широкой и сузили до телефона (обзор переключает «компьютер/телефон» без перезагрузки),
     ещё не появившиеся капсулы категорий оказались бы в горизонтальной ленте за краем — показываем их сразу */
  function catsShow() {
    if (window.innerWidth <= 720) $$('.cats__item.tck-reveal:not(.tck-in)').forEach(function (el) { el.classList.add('tck-in'); });
  }
  function relayout() { moveHl(); updateArrows(); brandsFit(); catsShow(); }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(relayout);
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  moveHl();

  /* Появление при прокрутке (kit): то, что видно сразу, не прячем */
  function below(list) {
    var fold = window.innerHeight || doc.documentElement.clientHeight;
    return list.filter(function (el) { return el.getBoundingClientRect().top > fold - 24; });
  }
  if (K) {
    /* Блок с фото-капсулой каталога не «взводим»: композитный слой над скруглённой обрезкой WebKit рисует серым квадратом.
       На телефоне быстрые категории — лента, листаемая пальцем: капсулы за правым краем не пересекают экран и оставались
       прозрачными до свайпа (пустые капсулы, потом «прыжок» подписей). Там капсулы видны сразу; появляется только
       заголовок секции (ленту целиком тоже не «взводим»: сдвиг самой прокручиваемой ленты WebKit рисует с чёрным квадратом). */
    var catsUnit = window.innerWidth <= 720 ? '' : ', .cats__item';
    K.reveal(below($$('.sec-head, .tasks__item' + catsUnit + ', .picks__item')), { stagger: 55 });
    K.reveal(below($$('.footer__grid > *')), { stagger: 60 });
  }

})();
