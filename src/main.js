import './fonts/ys-display/fonts.css'
import './style.css'

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";
import { initSorting } from "./components/sorting.js";

// API
const api = initData();

// apply-функции
let applyPagination;
let updatePagination;

let applyFiltering;
let updateIndexes;

let applySearching;
let applySorting;

/**
 * Сбор состояния формы
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));
  return { ...state };
}

/**
 * Основной render (сервак)
 */
async function render(action) {
  const state = collectState();
  let query = {};

  // Шаг 3 — фильтрация
  if (applyFiltering) {
    query = applyFiltering(query, state, action);
  }

  // Шаг 4 — поиск
  if (applySearching) {
    query = applySearching(query, state, action);
  }

  // Шаг 5 — сортировка
  if (applySorting) {
    query = applySorting(query, state, action);
  }

  // Шаг 2 — пагинация
  if (applyPagination) {
    query = applyPagination(query, state, action);
  }

  // запрос к серверу
  const { total, items } = await api.getRecords(query);

  // обновление пагинатора после запроса
  if (updatePagination) {
    updatePagination(total, query);
  }

  sampleTable.render(items);
}

const sampleTable = initTable(
  {
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: [],
    after: []
  },
  render
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

/**
 * Асинхронная инициализация компонентов
 */
async function init() {
  const indexes = await api.getIndexes();

  // === ФИЛЬТРАЦИЯ (шаг 3)
  ({ applyFiltering, updateIndexes } =
    initFiltering(sampleTable.filter.elements));

  updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers
  });

  // === ПОИСК (шаг 4)
  // имя должно совпадать с name поля ввода
  applySearching = initSearching('search');

  // === СОРТИРОВКА (шаг 5)
  applySorting = initSorting(sampleTable.columns);

  // === ПАГИНАЦИЯ (шаг 2)
  const paginationRoot =
    sampleTable.container.querySelector('[data-pagination]');

  if (paginationRoot) {
    const pages =
      paginationRoot.querySelector('[data-pagination-pages]');
    const fromRow =
      paginationRoot.querySelector('[data-pagination-from]');
    const toRow =
      paginationRoot.querySelector('[data-pagination-to]');
    const totalRows =
      paginationRoot.querySelector('[data-pagination-total]');

    const createPage = (el, pageNumber, isActive) => {
      el.dataset.page = pageNumber;
      el.textContent = pageNumber;
      el.classList.toggle('active', isActive);
      return el;
    };

    ({ applyPagination, updatePagination } = initPagination(
      { pages, fromRow, toRow, totalRows },
      createPage
    ));
  }

  return indexes;
}

init().then(render);
