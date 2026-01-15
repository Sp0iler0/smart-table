import { getPages } from '../lib/utils.js';

export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
  // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  // сколько страниц было при последней отрисовке (нужно для action=last)
  let pageCount;

  const applyPagination = (query, state, action) => {
    // ВАЖНО: приводим к числам (на случай если collectState забудут/изменят)
    const limit = Number(state.rowsPerPage) || 10;
    let page = Number(state.page) || 1;

    // @todo: #2.6 — обработать действия
    if (action) {
      switch (action.name) {
        case 'prev':
          page = Math.max(1, page - 1);
          break;
        case 'next':
          // если pageCount ещё неизвестен (до первого updatePagination), не ограничиваем сверху
          page = pageCount ? Math.min(pageCount, page + 1) : (page + 1);
          break;
        case 'first':
          page = 1;
          break;
        case 'last':
          // last корректен только если уже считали pageCount
          page = pageCount || page;
          break;
      }
    }

    // добавим параметры к query, но не изменяем исходный объект
    return Object.assign({}, query, { limit, page });
  };

  const updatePagination = (total, { page, limit }) => {
    const safeLimit = Number(limit) || 10;
    const safePage = Number(page) || 1;

    pageCount = Math.max(1, Math.ceil(total / safeLimit));

    // @todo: #2.4 — получить список видимых страниц и вывести их
    const visiblePages = getPages(safePage, pageCount, 5);
    pages.replaceChildren(
      ...visiblePages.map((pageNumber) => {
        const el = pageTemplate.cloneNode(true);
        return createPage(el, pageNumber, pageNumber === safePage);
      })
    );

    // @todo: #2.5 — обновить статус пагинации
    if (total === 0) {
      fromRow.textContent = 0;
      toRow.textContent = 0;
      totalRows.textContent = 0;
      return;
    }

    fromRow.textContent = (safePage - 1) * safeLimit + 1;
    toRow.textContent = Math.min(safePage * safeLimit, total);
    totalRows.textContent = total;
  };

  return {
    applyPagination,
    updatePagination,
  };
};
