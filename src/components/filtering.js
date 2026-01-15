export function initFiltering(elements) {
  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      if (!elements[elementName]) return;

      elements[elementName].append(
        ...Object.values(indexes[elementName]).map((name) => {
          const el = document.createElement("option");
          el.textContent = name;
          el.value = name;
          return el;
        })
      );
    });
  };

  const applyFiltering = (query, state, action) => {
    // обработка очистки поля (как раньше, но без фильтрации массива)
    if (action && action.name === "clear") {
      const parent = action.parentElement;
      const input = parent?.querySelector("select, input");
      const field = action.dataset.field;

      if (input) input.value = "";
      if (field && field in state) {
        delete state[field];
      }
    }

    // формируем filter параметры
    const filter = {};

    Object.keys(elements).forEach((key) => {
      const el = elements[key];
      if (!el) return;

      if (["INPUT", "SELECT"].includes(el.tagName) && el.value) {
        filter[`filter[${el.name}]`] = el.value;
      }
    });

    return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
  };

  return {
    updateIndexes,
    applyFiltering
  };
}
