import { sortMap } from "../lib/sort.js"; // sortCollection больше не нужен

export function initSorting(columns) {
  return (query, state, action) => {
    let field = null;
    let order = null;

    if (action && action.name === "sort") {
      // запоминаем выбранный режим сортировки
      action.dataset.value = sortMap[action.dataset.value];
      field = action.dataset.field;
      order = action.dataset.value;

      // сбрасываем сортировки остальных колонок
      columns.forEach((column) => {
        if (column.dataset.field !== field) {
          column.dataset.value = "none";
        }
      });
    } else {
      // восстанавливаем текущее состояние сортировки
      columns.forEach((column) => {
        if (column.dataset.value !== "none") {
          field = column.dataset.field;
          order = column.dataset.value;
        }
      });
    }

    // параметр сортировки для сервера: field:direction
    const sort =
      field && order !== "none"
        ? `${field}:${order}`
        : null;

    return sort
      ? Object.assign({}, query, { sort })
      : query;
  };
}
