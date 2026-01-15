import { getPages } from "../lib/utils.js";

export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
  // шаблон кнопки страницы + очистка контейнера
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  // сколько страниц было при последней отрисовке (нужно для action=last)
  let pageCount;

  /**
   * Формируем параметры пагинации ДО запроса
   * Возвращаем новый query (исходный не мутируем)
   */
  const applyPagination = (query, state, action) => {
    const limit = Number(state.rowsPerPage) || 10;
    let page = Number(state.page) || 1;

    // обработка действий (бывший @todo #2.6)
    if (action) {
      switch (action.name) {
        case "prev":
          page = Math.max(1, page - 1);
          break;
        case "next":
          // если pageCount уже известен из прошлой отрисовки — ограничиваем
          page = pageCount ? Math.min(pageCount, page + 1) : page + 1;
          break;
        case "first":
          page = 1;
          break;
        case "last":
          // last работает корректно только если мы уже рисовали пагинатор и знаем pageCount
          page = pageCount || page;
          break;
      }
    }

    return Object.assign({}, query, {
      limit,
      page
    });
  };

  /**
   * Перерисовываем пагинатор после запроса (когда известен total)
   */
  const updatePagination = (total, { page, limit }) => {
    const safeLimit = Number(limit) || 10;
    const safePage = Number(page) || 1;

    pageCount = Math.max(1, Math.ceil(total / safeLimit));

    // список видимых страниц (бывший @todo #2.4)
    const visiblePages = getPages(safePage, pageCount, 5);
    pages.replaceChildren(
      ...visiblePages.map((pageNumber) => {
        const el = pageTemplate.cloneNode(true);
        return createPage(el, pageNumber, pageNumber === safePage);
      })
    );

    // статус пагинации (бывший @todo #2.5)
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
    updatePagination
  };
};
