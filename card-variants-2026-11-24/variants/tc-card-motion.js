/* ДВИЖЕНИЕ КАРТОЧЕК (предложение к варианту №8). Работает с любым из пяти
   вариантов и с текущим №8; добавление в корзину по-прежнему делает
   redesign-ui.js — этот файл ничего не отправляет и ничего не отменяет.

   1. Полёт в корзину. После УСПЕШНОГО добавления фото товара летит по дуге
      к значку корзины (шапка на компьютере, таб-бар на телефоне), значок
      отвечает коротким толчком, цифра в нём сменяется. Успех узнаём по факту:
      сайт обновил счётчик корзины или поставил кнопке is-added. Нет ответа
      сервера — нет и полёта.
   2. Появление плиток — по желанию: только если на <html> есть класс
      cv-reveal (советуем ленты главной, а не каталог, который листают
      постоянно). Плитки проявляются и поднимаются на 10 px при входе в экран,
      с шагом 35 мс, один раз. Скрывает их сам скрипт: без него всё видно.
   3. Системное «уменьшить движение» выключает полёт и появление; толчок
      значка заменяется сменой цифры без сдвига. */
(function (window, document) {
  'use strict';

  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var forced = root.classList.contains('cv-reduced');
  var CARD = '.cat-grid .p-card, .prod-track .p-card';
  var EASE = 'cubic-bezier(.16, 1, .3, 1)';

  function reduced() { return forced || !!(media && media.matches); }

  /* ── Появление (по классу cv-reveal) ──────────────────────────────── */
  var seen = 'IntersectionObserver' in window
    ? new IntersectionObserver(onSeen, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 })
    : null;

  function onSeen(entries) {
    var batch = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
    batch.sort(function (a, b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return (ra.top - rb.top) || (ra.left - rb.left);
    });
    batch.forEach(function (el, n) {
      el.style.setProperty('--cv-delay', Math.min(n, 8) * 35 + 'ms');
      el.classList.add('cv-in');
      seen.unobserve(el);
    });
  }

  function arm(el) {
    if (el.__cvArmed) return;
    el.__cvArmed = true;
    if (!seen || reduced() || !root.classList.contains('cv-reveal')) return;
    el.classList.remove('cv-in');
    el.classList.add('cv-arm');
    seen.observe(el);
  }

  function scan(scope) {
    if (!scope.querySelectorAll) return;
    if (scope.matches && scope.matches(CARD)) arm(scope);
    scope.querySelectorAll(CARD).forEach(arm);
  }

  function replay() {
    document.querySelectorAll(CARD).forEach(function (el) {
      if (seen) seen.unobserve(el);
      el.classList.remove('cv-arm', 'cv-in');
      el.__cvArmed = false;
    });
    void root.offsetWidth;
    scan(document);
  }

  /* ── Полёт в корзину ──────────────────────────────────────────────── */
  var pending = null;

  function visibleBasket() {
    var list = document.querySelectorAll('[data-basket]');
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      if (r.width && r.height && getComputedStyle(list[i]).visibility !== 'hidden') return list[i];
    }
    return null;
  }

  function bump(target) {
    if (!target) return;
    target.classList.remove('cv-bump');
    void target.offsetWidth;
    target.classList.add('cv-bump');
    window.setTimeout(function () { target.classList.remove('cv-bump'); }, 600);
  }

  function fly(img, target) {
    var a = img.getBoundingClientRect();
    var b = target.getBoundingClientRect();
    if (!a.width || !Element.prototype.animate) { bump(target); return; }

    var size = Math.round(Math.min(a.width, a.height) * 0.5);
    var startX = a.left + a.width / 2 - size / 2;
    var startY = a.top + a.height / 2 - size / 2;
    /* Корзина могла уехать за край вместе с шапкой — летим к краю экрана. */
    var endX = Math.min(Math.max(b.left + b.width / 2, 16), window.innerWidth - 16) - size / 2;
    var endY = Math.min(Math.max(b.top + b.height / 2, 16), window.innerHeight - 16) - size / 2;

    /* Две оси с разными кривыми дают дугу без перелёта: по горизонтали —
       плавный выход, по вертикали — разгон. */
    var x = document.createElement('div');
    var y = document.createElement('div');
    var s = document.createElement('div');
    x.className = 'cv-ghost';
    y.className = 'cv-ghost__y';
    s.className = 'cv-ghost__img';
    s.style.backgroundImage = 'url("' + (img.currentSrc || img.src).replace(/"/g, '\\"') + '")';
    x.style.cssText = 'left:' + startX + 'px;top:' + startY + 'px;width:' + size + 'px;height:' + size + 'px';
    y.appendChild(s);
    x.appendChild(y);
    document.body.appendChild(x);

    /* Корзина выше (шапка) — фото сначала поднимается и уже потом скользит
       к значку, не проходя над соседними товарами. Ниже (таб-бар) — падает
       с разгоном. */
    var up = endY < startY;
    var duration = 640;
    x.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(' + (endX - startX) + 'px)' }],
      { duration: duration, easing: up ? 'cubic-bezier(.5, 0, .3, 1)' : EASE, fill: 'forwards' }
    );
    y.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (endY - startY) + 'px)' }],
      { duration: duration, easing: up ? EASE : 'cubic-bezier(.55, 0, .75, .4)', fill: 'forwards' }
    );
    /* Фото держит размер большую часть пути и сжимается у самого значка. */
    var run = s.animate(
      [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.18)', opacity: 0.4 }],
      { duration: duration, easing: 'cubic-bezier(.6, 0, .8, .3)', fill: 'forwards' }
    );
    run.onfinish = function () { x.remove(); bump(target); };
  }

  function launch() {
    var p = pending;
    pending = null;
    if (!p || Date.now() - p.at > 6000) return;
    var target = visibleBasket();
    if (!target) return;
    if (reduced() || !p.img) { bump(target); return; }
    fly(p.img, target);
  }

  /* Запоминаем нажатие заранее (фаза перехвата — раньше redesign-ui.js),
     а летим, когда сайт подтвердит добавление. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.add-btn');
    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
    if (btn.classList.contains('is-loading') || btn.classList.contains('is-added')) return;
    var card = btn.closest('.p-card');
    pending = { btn: btn, img: card && card.querySelector('.card-img > img'), at: Date.now() };
  }, true);

  function watch() {
    if (!('MutationObserver' in window)) return;
    /* Счётчик корзины сменился — добавление прошло. */
    var badges = new MutationObserver(function () { if (pending) launch(); });
    document.querySelectorAll('[data-cart-count]').forEach(function (b) {
      badges.observe(b, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    });
    /* Запасной сигнал: кнопка получила is-added (число в бейдже могло не измениться). */
    new MutationObserver(function (records) {
      records.forEach(function (r) {
        if (pending && r.target === pending.btn && r.target.classList.contains('is-added')) launch();
      });
    }).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
  }

  /* ── Запуск ───────────────────────────────────────────────────────── */
  function start() {
    root.classList.add('cv-motion');
    scan(document);
    watch();
    if ('MutationObserver' in window) {
      new MutationObserver(function (records) {
        records.forEach(function (r) { r.addedNodes.forEach(function (n) { if (n.nodeType === 1) scan(n); }); });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.TC = window.TC || {};
  window.TC.cardMotion = {
    replay: replay,
    /* Переключатели демонстрации. */
    setReduced: function (on) {
      forced = !!on;
      root.classList.toggle('cv-reduced', forced);
      if (forced) document.querySelectorAll('.cv-arm').forEach(function (el) { el.classList.add('cv-in'); });
    },
    setReveal: function (on) {
      root.classList.toggle('cv-reveal', !!on);
      replay();
    }
  };
})(window, document);
