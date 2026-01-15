import { sortMap } from '../lib/sort.js';

export function initSorting(columns) {
  if (!Array.isArray(columns)) {
    throw new Error('initSorting(columns): columns must be an array of DOM elements');
  }

  return (query, state, action) => {
    let field = null;
    let order = null;

    if (action && action.name === 'sort') {
      // @todo: #3.1 — запомнить выбранный режим сортировки
      action.dataset.value = sortMap[action.dataset.value];
      field = action.dataset.field;
      order = action.dataset.value;

      // @todo: #3.2 — сбросить сортировки остальных колонок
      columns.forEach((column) => {
        if (column.dataset.field !== field) {
          column.dataset.value = 'none';
        }
      });
    } else {
      // @todo: #3.3 — получить выбранный режим сортировки
      columns.forEach((column) => {
        if (column.dataset.value !== 'none') {
          field = column.dataset.field;
          order = column.dataset.value;
        }
      });
    }

    // сохраним в переменную параметр сортировки в виде field:direction
    const sort = (field && order !== 'none') ? `${field}:${order}` : null;

    // по общему принципу, если есть сортировка, то добавляем, если нет,то не трогаем query
    return sort ? Object.assign({}, query, { sort }) : query;
  };
}
