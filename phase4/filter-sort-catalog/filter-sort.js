/* // 1. Constants & Configuration
const SELECTORS = { ... };
const CONFIG = { ... };

// 2. Data Layer (Models/State)
const createDataController = () => { ... };

// 3. Business Logic (Services) 
const createBusinessController = () => { ... };

// 4. UI Layer (Views/Components)
const createUIController = () => { ... };

// 5. Event Coordination (Controllers)
const createEventController = () => { ... };

// 6. Application Bootstrap
const initialize = () => { ... }; */

function initFilterSortTableApp() {
  const PRODUCTS_DATA = [
    {
      id: 1,
      name: 'Wireless Headphones',
      description: 'Noise-cancelling over-ear headphones with 20 hours battery life.',
      category: 'Electronics',
      price: 5999,
      rating: 2.5,
      stock: 8,
      dateAdded: '2025-05-20',
    },
    {
      id: 2,
      name: 'Gaming Mouse',
      description: 'Ergonomic RGB gaming mouse with adjustable DPI.',
      category: 'Accessories',
      price: 1999,
      rating: 3.5,
      stock: 27,
      dateAdded: '2025-05-22',
    },
    {
      id: 3,
      name: 'Smart Water Bottle',
      description: 'Tracks water intake and reminds you to stay hydrated.',
      category: 'Lifestyle',
      price: 2499,
      rating: 4.0,
      stock: 8,
      dateAdded: '2025-06-01',
    },
    {
      id: 4,
      name: 'Bluetooth Speaker',
      description: 'Compact speaker with deep bass and splash-proof design.',
      category: 'Electronics',
      price: 3299,
      rating: 4.3,
      stock: 18,
      dateAdded: '2025-05-18',
    },
    {
      id: 5,
      name: 'Yoga Mat',
      description: 'Eco-friendly, non-slip yoga mat for home workouts.',
      category: 'Fitness',
      price: 1199,
      rating: 1.1,
      stock: 20,
      dateAdded: '2025-06-02',
    },
    {
      id: 6,
      name: 'Portable SSD',
      description: '500GB high-speed portable SSD with USB-C support.',
      category: 'Electronics',
      price: 7599,
      rating: 1.5,
      stock: 10,
      dateAdded: '2025-05-25',
    },
    {
      id: 7,
      name: 'Smart Watch',
      description: 'Fitness tracker with heart-rate monitoring and sleep tracking.',
      category: 'Accessories',
      price: 4999,
      rating: 4.4,
      stock: 15,
      dateAdded: '2025-05-30',
    },
    {
      id: 8,
      name: 'LED Desk Lamp',
      description: 'Dimmable LED lamp with touch controls and USB charging port.',
      category: 'Home',
      price: 1499,
      rating: 4.6,
      stock: 0,
      dateAdded: '2025-05-19',
    },
    {
      id: 9,
      name: 'Electric Kettle',
      description: '1.5L stainless steel electric kettle with auto shut-off.',
      category: 'Home',
      price: 2299,
      rating: 3.9,
      stock: 0,
      dateAdded: '2025-06-03',
    },
    {
      id: 10,
      name: 'Wireless Charger',
      description: 'Fast-charging Qi wireless charger pad for smartphones.',
      category: 'Accessories',
      price: 1799,
      rating: 2.8,
      stock: 30,
      dateAdded: '2025-05-28',
    },
  ];
  const SELECTORS = {
    search: '#search-input',
    categoryFilter: '#category-filter',
    priceMin: '#price-min',
    priceMax: '#price-max',
    ratingFilter: '#rating-filter',
    stockFilter: '#stock-filter',
    clearFilters: '#clear-filters',
    activeFilters: '#active-filters',
    resultsCount: '#results-count',
    tableBody: '#table-body',
    sortElements: '.sortable',
    filtersContainer: '.filter-grid',
  };

  const createDataController = () => {
    const productsMap = new Map(PRODUCTS_DATA.map((product) => [product.id, product]));
    const categoryIndex = new Map();
    const priceIndex = new Map();
    let currentMap = new Map();
    const filtersState = {
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      rating: '',
      stock: '',
    };

    let showingCount = 0;
    PRODUCTS_DATA.forEach((product) => {
      if (!categoryIndex.has(product.category)) {
        categoryIndex.set(product.category, []);
      }
      categoryIndex.get(product.category).push(product);

      if (!priceIndex.has(product.price)) {
        priceIndex.set(product.price, []);
      }
      priceIndex.get(product.price).push(product);
    });
    console.log(productsMap, categoryIndex, priceIndex);

    const getProduct = (id) => productsMap.get(Number(id));
    const getAllProducts = () => productsMap;
    const getCategories = (category) => categoryIndex.get(category) || [];
    const getPriceRange = () => priceIndex;

    return {
      getProduct,
      getAllProducts,

      getCategories,
      getPriceRange,

      productsMap,
      categoryIndex,
      priceIndex,
      showingCount,
      filtersState,
    };
  };
  const createBusinessController = (dataController) => {
    const { productsMap, filtersState } = dataController;
    //sort
    const sortProducts = (key = 'name', order = 'asc', currentMap) => {
      return new Map(
        Array.from((currentMap == null ? productsMap : currentMap).values())
          .sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            const isDate = (val) => /^\d{4}-\d{2}-\d{2}$/.test(val);

            if (typeof aVal === 'string' && !isDate(aVal)) {
              return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else if (isDate(aVal)) {
              return order === 'asc'
                ? new Date(aVal) - new Date(bVal)
                : new Date(bVal) - new Date(aVal);
            } else {
              return order === 'asc' ? aVal - bVal : bVal - aVal;
            }
          })
          .map((product) => [product.id, product])
      );
    };

    //search
    const searchProducts = (searchTerm, currentMap) => {
      const filteredEntries = Array.from(currentMap.entries()).filter(([, product]) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return new Map(filteredEntries);
    };

    //filter by category
    const filterByCategory = (category, currentMap) => {
      console.log(category, currentMap);
      const filteredEntries = Array.from(currentMap.entries()).filter(
        ([, product]) => product.category.toLowerCase() === category
      );
      return new Map(filteredEntries);
    };

    //filter by price Range
    const filterByPriceRange = (min, max, currentMap) => {
      const filteredEntries = Array.from(currentMap.entries()).filter(
        ([, product]) => product.price >= min && product.price <= max
      );
      return new Map(filteredEntries);
    };

    //filter by rating
    const filterByRating = (rating, currentMap) => {
      const filteredEntries = Array.from(currentMap.entries()).filter(
        ([, product]) => product.rating > rating
      );
      return new Map(filteredEntries);
    };

    //filter by stock
    const filterByStock = (stock, currentMap) => {
      const filteredEntries = Array.from(currentMap.entries()).filter(([, product]) => {
        switch (stock) {
          case '':
          case 'in-stock':
            return product.stock > 0;
          case 'low-stock':
            return product.stock < 10;
          case 'out-of-stock':
            return product.stock === 0;
          default:
            return true;
        }
      });
      return new Map(filteredEntries);
    };
    //search UI
    const handleSearch = (searchTerm, mapToSearch) => {
      if (searchTerm === '') {
        updateUI(); // show full list if empty
      } else {
        const filteredMap = searchProducts(searchTerm, mapToSearch);
        return filteredMap;
      }
    };

    //Apply all
    const applyAllFilters = () => {
      let resultMap = new Map(productsMap);

      if (filtersState.search) resultMap = handleSearch(filtersState.search, resultMap);
      if (filtersState.category) resultMap = filterByCategory(filtersState.category, resultMap);
      if (filtersState.minPrice !== null && filtersState.maxPrice !== null)
        resultMap = filterByPriceRange(filtersState.minPrice, filtersState.maxPrice, resultMap);
      if (filtersState.rating) resultMap = filterByRating(filtersState.rating, resultMap);
      if (filtersState.stock) resultMap = filterByStock(filtersState.stock, resultMap);

      return resultMap;
    };

    return {
      sortProducts,
      searchProducts,
      filterByCategory,
      filterByPriceRange,
      filterByRating,
      filterByStock,
      applyAllFilters,
    };
  };

  const createUIController = (dataController, businessController) => {
    const elements = Object.fromEntries(
      Object.entries(SELECTORS).map(([Key, selector]) => [Key, document.querySelector(selector)])
    );
    const { productsMap, filtersState } = dataController;
    const { applyAllFilters } = businessController;
    const totalProducts = productsMap.size;
    const sortByNameMap = businessController.sortProducts();

    //table renderer
    const tableRenderer = (mapToRender = sortByNameMap) => {
      const { tableBody } = elements;
      tableBody.innerHTML = ''; // Clear previous rows
      mapToRender.forEach((product) => {
        const { name, category, price, rating, stock, dateAdded } = product;
        const row = document.createElement('tr');
        row.innerHTML = `<td>${name}</td><td>${category}</td><td>${price}</td><td>${rating}</td><td>${stock}</td><td>${dateAdded}</td>`;
        tableBody.appendChild(row);
      });
    };

    const updateSortIndicators = (key = 'name', order = 'asc') => {
      console.log(key, order);
      const headers = document.querySelectorAll('.sortable');
      headers.forEach((header) => {
        header.classList.remove('sort-asc', 'sort-desc');
        if (header.dataset.sort === key) {
          header.classList.add(order === 'asc' ? 'sort-asc' : 'sort-desc');
        }
      });
    };

    const updateShowingCount = (showingCount) => {
      const { resultsCount } = elements;
      resultsCount.textContent = `Showing ${showingCount} of ${totalProducts} products`;
    };

    //sort Table UI Function
    const handleSort = (e) => {
      const { sortProducts } = businessController;
      const header = e.target;
      const sortKey = header.dataset.sort;
      const isAsc = header.classList.contains('sort-asc');
      const newOrder = isAsc ? 'desc' : 'asc';
      const sortedMap = sortProducts(sortKey, newOrder, currentMap);
      updateUI(sortedMap);
      updateSortIndicators(sortKey, newOrder);
    };

    //FILTER UI
    const filterManager = (target) => {
      if (target === elements.search) {
        filtersState.search = target.value.trim();
      } else if (target === elements.categoryFilter) {
        filtersState.category = target.value;
      } else if (target === elements.priceMin || target === elements.priceMax) {
        filtersState.minPrice = elements.priceMin.value;
        filtersState.maxPrice = elements.priceMax.value;
      } else if (target === elements.ratingFilter) {
        filtersState.rating = target.value;
      } else if (target === elements.stockFilter) {
        filtersState.stock = target.value;
      }
      currentMap = applyAllFilters();
      updateUI(currentMap);
    };

    const setPriceRange = () => {
      const prices = Array.from(productsMap.values()).map((product) => product.price);
      const minValue = Math.min(...prices);
      const maxValue = Math.max(...prices);
      elements.priceMin.placeholder = `Min = 0 `;
      elements.priceMax.placeholder = `Max = ${maxValue} `;
    };

    const clearFilter = () => {
      filtersState.search = '';
      filtersState.category = '';
      filtersState.minPrice = null;
      filtersState.maxPrice = null;
      filtersState.rating = '';
      filtersState.stock = '';

      elements.search.value = '';
      elements.categoryFilter.value = '';
      elements.priceMin.value = '';
      elements.priceMax.value = '';
      elements.ratingFilter.value = '';
      elements.stockFilter.value = '';

      currentMap = new Map(productsMap);
      updateUI(currentMap);
    };

    const updateUI = (mapToRender = sortByNameMap) => {
      currentMap = new Map(mapToRender);
      tableRenderer(currentMap);
      updateSortIndicators();
      updateShowingCount(mapToRender.size);
      setPriceRange();
    };

    return {
      tableRenderer,
      updateSortIndicators,
      updateUI,
      filterManager,
      handleSort,
      clearFilter,
      elements,
    };
  };

  const createEventController = (dataController, uiController, businessController) => {
    const { elements, updateUI, filterManager, handleSort, clearFilter } = uiController;
    const { searchProducts } = businessController;

    //Filter container listener
    const setupEventListeners = () => {
      const sortElements = document.querySelectorAll(SELECTORS.sortElements);
      //sort th listener
      sortElements.forEach((element) => {
        element.addEventListener('click', handleSort);
      });

      //search input listener
      const { filtersContainer } = elements;
      filtersContainer.addEventListener('input', (e) => {
        const target = e.target;
        filterManager(target);
        updateUI(currentMap);
      });

      //clear filter
      const { clearFilters } = elements;
      clearFilters.addEventListener('click', clearFilter);
    };

    return {
      setupEventListeners,
    };
  };
  const initialize = () => {
    const dataController = createDataController();
    const businessController = createBusinessController(dataController);
    const uiController = createUIController(dataController, businessController);
    const eventController = createEventController(dataController, uiController, businessController);
    uiController.updateUI();
    eventController.setupEventListeners();
  };

  return initialize();
}
document.addEventListener('DOMContentLoaded', initFilterSortTableApp);
