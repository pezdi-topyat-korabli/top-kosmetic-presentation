/* Общий набор поведения для пяти вариантов главной.
   TCKit.cart    — демо-корзина: счётчик во всех [data-cart-count], событие tck:cart.
   TCKit.fly     — фото товара летит по дуге к значку корзины ([data-cart-target]).
   TCKit.bump    — короткий толчок элемента (значок корзины).
   TCKit.reveal  — появление при прокрутке (класс tck-in), один раз; без JS всё видно.
   TCKit.reduced — системное «уменьшить движение».
   Подключать: <script src="../_shared/kit.js" defer></script> и <link rel="stylesheet" href="../_shared/kit.css">. */
(function (window, document) {
  'use strict';
  var root = document.documentElement;
  root.classList.add('tck-js');
  var media = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(media && media.matches); }
  var EASE = 'cubic-bezier(.16, 1, .3, 1)';

  var count = 0;
  var cart = {
    get count() { return count; },
    add: function (id, qty) {
      count += qty || 1;
      document.querySelectorAll('[data-cart-count]').forEach(function (b) {
        b.textContent = count;
        b.hidden = count === 0;
      });
      document.dispatchEvent(new CustomEvent('tck:cart', { detail: { id: id, count: count } }));
      return count;
    }
  };

  function visibleTarget(sel) {
    var list = document.querySelectorAll(sel || '[data-cart-target]');
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      if (r.width && r.height && getComputedStyle(list[i]).visibility !== 'hidden') return list[i];
    }
    return null;
  }

  function bump(el) {
    if (!el || reduced()) return;
    el.classList.remove('tck-bump');
    void el.offsetWidth;
    el.classList.add('tck-bump');
    setTimeout(function () { el.classList.remove('tck-bump'); }, 600);
  }

  /* Дуга: если цель выше — сначала подъём, потом скольжение; ниже — падение. */
  function fly(img, target, done) {
    target = target || visibleTarget();
    if (!img || !target || reduced() || !Element.prototype.animate) { bump(target); if (done) done(); return; }
    var a = img.getBoundingClientRect(), b = target.getBoundingClientRect();
    var size = Math.round(Math.min(a.width, a.height) * 0.5) || 80;
    var sx = a.left + a.width / 2 - size / 2, sy = a.top + a.height / 2 - size / 2;
    var ex = Math.min(Math.max(b.left + b.width / 2, 16), innerWidth - 16) - size / 2;
    var ey = Math.min(Math.max(b.top + b.height / 2, 16), innerHeight - 16) - size / 2;
    var up = ey < sy;
    var x = document.createElement('div'), y = document.createElement('div'), s = document.createElement('div');
    x.className = 'tck-ghost'; y.className = 'tck-ghost__y'; s.className = 'tck-ghost__img';
    s.style.backgroundImage = 'url("' + (img.currentSrc || img.src).replace(/"/g, '\\"') + '")';
    x.style.cssText = 'left:' + sx + 'px;top:' + sy + 'px;width:' + size + 'px;height:' + size + 'px';
    y.appendChild(s); x.appendChild(y); document.body.appendChild(x);
    var d = 640;
    x.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + (ex - sx) + 'px)' }],
      { duration: d, easing: up ? 'cubic-bezier(.5,0,.3,1)' : EASE, fill: 'forwards' });
    y.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + (ey - sy) + 'px)' }],
      { duration: d, easing: up ? EASE : 'cubic-bezier(.55,0,.75,.4)', fill: 'forwards' });
    s.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.18)', opacity: 0.4 }],
      { duration: d, easing: 'cubic-bezier(.6,0,.8,.3)', fill: 'forwards' }).onfinish = function () {
        x.remove(); bump(target); if (done) done();
      };
  }

  function reveal(nodes, opts) {
    opts = opts || {};
    var list = typeof nodes === 'string' ? document.querySelectorAll(nodes) : nodes;
    if (!list || !('IntersectionObserver' in window) || reduced()) return;
    var step = opts.stagger == null ? 45 : opts.stagger;
    var io = new IntersectionObserver(function (entries) {
      var shown = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      shown.forEach(function (el, n) {
        el.style.setProperty('--tck-delay', Math.min(n, 8) * step + 'ms');
        el.classList.add('tck-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(list, function (el) { el.classList.add('tck-reveal'); io.observe(el); });
  }

  window.TCKit = { cart: cart, fly: fly, bump: bump, reveal: reveal, reduced: reduced, visibleTarget: visibleTarget, ease: EASE };
})(window, document);
