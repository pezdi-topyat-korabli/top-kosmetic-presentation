const concepts = [
  ['semyon','gallery','Gallery','Белая галерея','Фотография и спокойная сетка дают продуктам пространство.'],
  ['semyon','formula','Formula','Формула','Свойства средств помогают разобраться и сделать выбор.'],
  ['semyon','tactile','Tactile','Тактильность','Тёплые фактуры создают ощущение заботы и близости.'],
  ['semyon','noir','Noir','Тихий люкс','Премиальная сдержанность и выразительные контрасты.'],
  ['semyon','electric','Electric','Цвет и энергия','Цветовая навигация делает знакомство с каталогом живым.'],
  ['semyon','journal','Journal','Beauty Journal','Редакционная подача объединяет средства и вдохновение.'],
  ['semyon','garden','Garden','Сад ухода','Мягкие органические формы создают спокойное настроение.'],
  ['semyon','precise','Precise','Точный выбор','Плотные фильтры помогают ориентироваться в ассортименте.'],
  ['semyon','signature','Signature','Фирменный синий','Фирменная палитра TOP, акцент на карточках товаров и плавное движение.'],
  ['artem','a1-brand-shelf','A1','Бренд-полка','Путь от бренда через линейку к конкретному средству.'],
  ['artem','a2-pro-desk','A2','Кабинет','Сценарий повторных закупок для специалистов: артикул и количество.'],
  ['artem','a3-care-steps','A3','Шаги ухода','Каталог организован вокруг шести последовательных шагов ухода.'],
  ['artem','a4-feed','A4','Лента','Крупные мобильные карточки и нижняя панель навигации.'],
  ['artem','a5-try-first','A5','Сначала пробник','Знакомство со средством начинается с пробника и ведёт к полному объёму.'],
  ['artem','a6-catalog-map','A6','Карта каталога','Дерево разделов в колонках показывает структуру ассортимента.'],
  ['artem','a7-showroom','A7','Шоурум','Локальный магазин в Севастополе и сценарий получения заказа.']
].map(([author,id,code,title,description], index) => ({author,id,code,title,description,number:String(index+1).padStart(2,'0')}));
const authorName = item => item.author === 'semyon' ? 'Семён' : 'Артём';
const preview = (item, size) => item.author === 'semyon' ? `./prototypes/semyon/previews/${item.id}-${size}.png` : `./prototypes/artem/previews/${item.id}-${size}.webp`;
const prototype = item => item.author === 'semyon' ? `./prototypes/semyon/#/${item.id}/${item.id === 'signature' ? 'catalog' : 'home'}` : `./prototypes/artem/${item.id}.html#home`;
const selected = new Set();
const cards = document.querySelector('#cards');
const detailDialog = document.querySelector('#detail-dialog');
const compareDialog = document.querySelector('#compare-dialog');
const cardMarkup = item => `<article class="card" data-author="${item.author}" data-id="${item.id}"><button class="card-visual" type="button" data-detail="${item.id}" aria-label="Рассмотреть ${item.title}"><img class="desktop-preview" src="${preview(item,'1440')}" alt="${item.title}: вид на компьютере" loading="lazy"><span class="mobile-frame"><img src="${preview(item,'390')}" alt="" loading="lazy"></span><span class="visual-open" aria-hidden="true">↗</span></button><div class="card-meta"><span>${item.number} / ${authorName(item)}</span><span>${item.code}</span></div><div class="card-heading"><h3>${item.title}</h3><button type="button" class="select-button" data-select="${item.id}" aria-pressed="false" aria-label="Добавить ${item.title} к сравнению">＋</button></div><p>${item.description}</p><button class="detail-link" type="button" data-detail="${item.id}">Подробнее <span>↗</span></button></article>`;
cards.innerHTML = concepts.map(cardMarkup).join('');
function updateSelection() {
  document.querySelectorAll('[data-select]').forEach(button => {
    const active = selected.has(button.dataset.select);
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? '✓' : '＋';
    const item = concepts.find(entry => entry.id === button.dataset.select);
    button.setAttribute('aria-label', `${active ? 'Убрать из сравнения' : 'Добавить к сравнению'}: ${item.title}`);
  });
  document.querySelector('#compare-bar').hidden = selected.size === 0;
  document.querySelector('#compare-count').textContent = `Выбрано ${selected.size} из 2`;
  document.querySelector('#open-compare').disabled = selected.size !== 2;
}
function showDetail(item) {
  document.querySelector('#detail-content').innerHTML = `<p class="eyebrow">${item.number} / ${authorName(item)} / ${item.code}</p><h2 id="detail-title">${item.title}</h2><p class="detail-description">${item.description}</p><div class="detail-previews"><figure><img src="${preview(item,'1440')}" alt="${item.title}: вид на компьютере"><figcaption>Компьютер</figcaption></figure><figure class="detail-mobile"><img src="${preview(item,'390')}" alt="${item.title}: вид на телефоне"><figcaption>Телефон</figcaption></figure></div><div class="detail-actions"><a class="dark-button" href="${prototype(item)}" target="_blank" rel="noopener noreferrer">Открыть прототип ↗</a><span>Концепция для обсуждения</span></div>`;
  detailDialog.showModal();
}
cards.addEventListener('click', event => {
  const detail = event.target.closest('[data-detail]');
  if (detail) { showDetail(concepts.find(item => item.id === detail.dataset.detail)); return; }
  const select = event.target.closest('[data-select]');
  if (!select) return;
  const id = select.dataset.select;
  if (selected.has(id)) selected.delete(id);
  else if (selected.size < 2) selected.add(id);
  else { document.querySelector('#compare-count').textContent = 'Сначала уберите один вариант'; return; }
  updateSelection();
});
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(filter => { filter.classList.toggle('active', filter === button); filter.setAttribute('aria-pressed', String(filter === button)); });
  document.querySelectorAll('.card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.author !== button.dataset.filter; });
}));
document.querySelector('#clear-compare').addEventListener('click', () => { selected.clear(); updateSelection(); });
document.querySelector('#open-compare').addEventListener('click', () => {
  const items = concepts.filter(item => selected.has(item.id));
  if (items.length !== 2) return;
  document.querySelector('#compare-content').innerHTML = items.map(item => `<article><p class="eyebrow">${item.number} / ${authorName(item)} / ${item.code}</p><h3>${item.title}</h3><p>${item.description}</p><div class="compare-images"><figure><img src="${preview(item,'1440')}" alt="${item.title}: компьютер"><figcaption>Компьютер</figcaption></figure><figure><img src="${preview(item,'390')}" alt="${item.title}: телефон"><figcaption>Телефон</figcaption></figure></div><a href="${prototype(item)}" target="_blank" rel="noopener noreferrer">Открыть прототип ↗</a></article>`).join('');
  compareDialog.showModal();
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
});
