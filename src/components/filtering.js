export function initFiltering(elements) {
  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      const target = elements[elementName];
      if (!target) return;

      // Опционально: защита от дублей (если updateIndexes вызовут повторно)
      // Сохраняем первый option как "placeholder", остальное чистим.
      const first = target.querySelector('option');
      target.replaceChildren(first ? first : document.createElement('option'));

      target.append(
        ...Object.values(indexes[elementName]).map((name) => {
          const optionElem = document.createElement('option');
          optionElem.value = name;
          optionElem.textContent = name;
          return optionElem;
        })
      );
    });
  };

  const applyFiltering = (query, state, action) => {
    // @todo: #4.2 — обработать очистку поля
    if (action && action.name === 'clear') {
      const parent = action.parentElement;
      const control = parent?.querySelector('select, input');
      const field = action.dataset.field;

      if (control) control.value = '';

      // state — результат FormData. Лучше убрать поле, чем оставлять пустую строку.
      if (field && field in state) {
        delete state[field];
      }
    }

    // @todo: #4.5 — отфильтровать данные используя компаратор

    const filter = {};
    Object.keys(elements).forEach((key) => {
      const el = elements[key];
      if (!el) return;

      // ищем поля ввода в фильтре с непустыми данными
      if (['INPUT', 'SELECT'].includes(el.tagName) && el.value) {
        // чтобы сформировать в query вложенный объект фильтра
        filter[`filter[${el.name}]`] = el.value;
      }
    });

    // если в фильтре что-то добавилось, применим к запросу
    return Object.keys(filter).length
      ? Object.assign({}, query, filter)
      : query;
  };

  return {
    updateIndexes,
    applyFiltering,
  };
}
