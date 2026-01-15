import "/src/fonts/ys-display/fonts.css";
import "/src/style.css";

import { initData } from "/src/data.js";
import { processFormData } from "/src/lib/utils.js";

import { initTable } from "/src/components/table.js";
import { initPagination } from "/src/components/pagination.js";
import { initFiltering } from "/src/components/filtering.js";
import { initSearching } from "/src/components/searching.js";
import { initSorting } from "/src/components/sorting.js";

// API
const api = initData();

// apply
let applyPagination;
let updatePagination;

let applyFiltering;
let updateIndexes;

let applySearching;
let applySorting;

/**
 * Сбор состояния формы
 * FormData всегда возвращает строки -> приводим нужные поля к числам
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));

  const rowsPerPage = parseInt(state.rowsPerPage);
  const page = parseInt(state.page ?? 1);
  const total = [parseFloat(state.totalFrom), parseFloat(state.totalTo)];

  return {
    ...state,
    total,
    rowsPerPage,
    page
  };
}

/**
 * Основной render (сервак)
 */
async function render(action) {
  const state = collectState();
  let query = {};

  query = applyFiltering(query, state, action); // Шаг 3 — фильтрация
  query = applySearching(query, state, action); // Шаг 4 — поиск
  query = applySorting(query, state, action);   // Шаг 5 — сортировка
  query = applyPagination(query, state, action); // Шаг 2 — пагинация

  // запрос к серверу
  const { total, items } = await api.getRecords(query);

  // обновление пагинатора после запроса
  updatePagination(total, query);

  sampleTable.render(items);
}

const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"]
  },
  render
);

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

/**
 * Асинхронная инициализация компонентов
 */
async function init() {
  const indexes = await api.getIndexes();

  // === ФИЛЬТРАЦИЯ (шаг 3)
  ({ applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements));

  updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers
  });

  // === ПОИСК (шаг 4)
  // имя берём из реального поля поиска
  applySearching = initSearching(sampleTable.search.elements.search.name);

  // === СОРТИРОВКА (шаг 5)
  // initSorting ожидает массив DOM-кнопок сортировки
  applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
  ]);

  // === ПАГИНАЦИЯ (шаг 2) — по примеру задания (data-name="...")
  ({ applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
      const input = el.querySelector("input");
      const label = el.querySelector("span");

      input.value = page;
      input.checked = isCurrent;
      label.textContent = page;

      return el;
    }
  ));

  return indexes;
}

init().then(render);
