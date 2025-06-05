function initFilterSortTableApp() {
  // Enhanced data with more realistic variety
  const PRODUCTS_DATA = [
    {
      id: 1,
      name: 'Wireless Headphones',
      description: 'Noise-cancelling over-ear headphones with 20 hours battery life.',
      category: 'electronics',
      price: 5999,
      rating: 4.5,
      stock: 8,
      dateAdded: '2025-05-20',
    },
    {
      id: 2,
      name: 'Gaming Mouse',
      description: 'Ergonomic RGB gaming mouse with adjustable DPI.',
      category: 'electronics',
      price: 1999,
      rating: 3.5,
      stock: 27,
      dateAdded: '2025-05-22',
    },
    {
      id: 3,
      name: 'Smart Water Bottle',
      description: 'Tracks water intake and reminds you to stay hydrated.',
      category: 'home',
      price: 2499,
      rating: 4.0,
      stock: 8,
      dateAdded: '2025-06-01',
    },
    {
      id: 4,
      name: 'Bluetooth Speaker',
      description: 'Compact speaker with deep bass and splash-proof design.',
      category: 'electronics',
      price: 3299,
      rating: 4.3,
      stock: 18,
      dateAdded: '2025-05-18',
    },
    {
      id: 5,
      name: 'Yoga Mat',
      description: 'Eco-friendly, non-slip yoga mat for home workouts.',
      category: 'sports',
      price: 1199,
      rating: 4.1,
      stock: 20,
      dateAdded: '2025-06-02',
    },
    {
      id: 6,
      name: 'Portable SSD',
      description: '500GB high-speed portable SSD with USB-C support.',
      category: 'electronics',
      price: 7599,
      rating: 4.5,
      stock: 10,
      dateAdded: '2025-05-25',
    },
    {
      id: 7,
      name: 'Smart Watch',
      description: 'Fitness tracker with heart-rate monitoring and sleep tracking.',
      category: 'electronics',
      price: 4999,
      rating: 4.4,
      stock: 15,
      dateAdded: '2025-05-30',
    },
    {
      id: 8,
      name: 'LED Desk Lamp',
      description: 'Dimmable LED lamp with touch controls and USB charging port.',
      category: 'home',
      price: 1499,
      rating: 4.6,
      stock: 0,
      dateAdded: '2025-05-19',
    },
    {
      id: 9,
      name: 'Electric Kettle',
      description: '1.5L stainless steel electric kettle with auto shut-off.',
      category: 'home',
      price: 2299,
      rating: 3.9,
      stock: 0,
      dateAdded: '2025-06-03',
    },
    {
      id: 10,
      name: 'Wireless Charger',
      description: 'Fast-charging Qi wireless charger pad for smartphones.',
      category: 'electronics',
      price: 1799,
      rating: 2.8,
      stock: 30,
      dateAdded: '2025-05-28',
    },
    {
      id: 11,
      name: 'Running Shoes',
      description: 'Lightweight running shoes with responsive cushioning.',
      category: 'sports',
      price: 8999,
      rating: 4.2,
      stock: 12,
      dateAdded: '2025-05-15',
    },
    {
      id: 12,
      name: 'Coffee Mug',
      description: 'Insulated ceramic mug that keeps drinks hot for hours.',
      category: 'home',
      price: 899,
      rating: 3.8,
      stock: 5,
      dateAdded: '2025-06-04',
    },
  ];

  // Enhanced selectors with error handling helpers
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
    table: '#products-table',
    metricsContainer: '.metrics-section',
  };

  // Configuration constants
  const CONFIG = {
    DEBOUNCE_DELAY: 300,
    MAX_PRICE: 999999,
    LOW_STOCK_THRESHOLD: 10,
    PERFORMANCE_TRACKING: true,
  };

  const createDataController = () => {
    const productsMap = new Map(PRODUCTS_DATA.map((product) => [product.id, product]));
    const categoryIndex = new Map();
    let currentFilteredMap = new Map(productsMap);
    let currentSortState = { key: 'name', order: 'asc' };

    // Enhanced filters state with validation
    const filtersState = {
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      rating: null,
      stock: '',
    };

    // Performance tracking
    const performanceMetrics = {
      lastFilterTime: 0,
      lastSortTime: 0,
      lastRenderTime: 0,
    };

    // Build category index on initialization
    const buildCategoryIndex = () => {
      try {
        PRODUCTS_DATA.forEach((product) => {
          const category = product.category.toLowerCase();
          if (!categoryIndex.has(category)) {
            categoryIndex.set(category, []);
          }
          categoryIndex.get(category).push(product);
        });
      } catch (error) {
        console.error('Error building category index:', error);
      }
    };

    // Validation helpers
    const validatePrice = (price) => {
      const num = parseFloat(price);
      return !isNaN(num) && num >= 0 && num <= CONFIG.MAX_PRICE;
    };

    const validateRating = (rating) => {
      const num = parseFloat(rating);
      return !isNaN(num) && num >= 1 && num <= 5;
    };

    // Initialize data structures
    buildCategoryIndex();

    // Enhanced getters with error handling
    const getProduct = (id) => {
      try {
        return productsMap.get(Number(id));
      } catch (error) {
        console.error('Error getting product:', error);
        return null;
      }
    };

    const getAllProducts = () => productsMap;
    const getCurrentFilteredMap = () => currentFilteredMap;
    const setCurrentFilteredMap = (newMap) => {
      currentFilteredMap = new Map(newMap);
    };

    const getCategories = () => Array.from(categoryIndex.keys()).sort();
    const getPriceRange = () => {
      try {
        const prices = Array.from(productsMap.values()).map((p) => p.price);
        return {
          min: Math.min(...prices),
          max: Math.max(...prices),
        };
      } catch (error) {
        console.error('Error calculating price range:', error);
        return { min: 0, max: CONFIG.MAX_PRICE };
      }
    };

    return {
      getProduct,
      getAllProducts,
      getCurrentFilteredMap,
      setCurrentFilteredMap,
      getCategories,
      getPriceRange,
      productsMap,
      categoryIndex,
      filtersState,
      currentSortState,
      performanceMetrics,
      validatePrice,
      validateRating,
    };
  };

  const createBusinessController = (dataController) => {
    const {
      productsMap,
      filtersState,
      currentSortState,
      performanceMetrics,
      validatePrice,
      validateRating,
      setCurrentFilteredMap,
    } = dataController;

    // Enhanced sort with error handling and performance tracking
    const sortProducts = (key = 'name', order = 'asc', mapToSort = null) => {
      const startTime = performance.now();

      try {
        const sourceMap = mapToSort || dataController.getCurrentFilteredMap();

        const sortedArray = Array.from(sourceMap.values()).sort((a, b) => {
          const aVal = a[key];
          const bVal = b[key];

          // Handle null/undefined values
          if (aVal == null && bVal == null) return 0;
          if (aVal == null) return order === 'asc' ? 1 : -1;
          if (bVal == null) return order === 'asc' ? -1 : 1;

          const isDate = (val) => /^\d{4}-\d{2}-\d{2}$/.test(val);

          if (typeof aVal === 'string' && !isDate(aVal)) {
            const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
            return order === 'asc' ? comparison : -comparison;
          } else if (isDate(aVal)) {
            const dateA = new Date(aVal);
            const dateB = new Date(bVal);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
          } else {
            return order === 'asc' ? aVal - bVal : bVal - aVal;
          }
        });

        const sortedMap = new Map(sortedArray.map((product) => [product.id, product]));

        // Update sort state
        currentSortState.key = key;
        currentSortState.order = order;

        const endTime = performance.now();
        performanceMetrics.lastSortTime = Math.round(endTime - startTime);

        return sortedMap;
      } catch (error) {
        console.error('Error sorting products:', error);
        return mapToSort || dataController.getCurrentFilteredMap();
      }
    };

    // Enhanced search with better text matching
    const searchProducts = (searchTerm, sourceMap) => {
      try {
        if (!searchTerm || searchTerm.trim() === '') {
          return new Map(sourceMap);
        }

        const term = searchTerm.toLowerCase().trim();
        const filteredEntries = Array.from(sourceMap.entries()).filter(([, product]) => {
          return (
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
          );
        });

        return new Map(filteredEntries);
      } catch (error) {
        console.error('Error searching products:', error);
        return sourceMap;
      }
    };

    // Enhanced category filter with case handling
    const filterByCategory = (category, sourceMap) => {
      try {
        if (!category || category.trim() === '') {
          return new Map(sourceMap);
        }

        const filteredEntries = Array.from(sourceMap.entries()).filter(
          ([, product]) => product.category.toLowerCase() === category.toLowerCase()
        );
        return new Map(filteredEntries);
      } catch (error) {
        console.error('Error filtering by category:', error);
        return sourceMap;
      }
    };

    // Enhanced price filter with validation
    const filterByPriceRange = (min, max, sourceMap) => {
      try {
        const minPrice = min !== null && min !== '' ? parseFloat(min) : 0;
        const maxPrice = max !== null && max !== '' ? parseFloat(max) : CONFIG.MAX_PRICE;

        // Validate price inputs
        if (!validatePrice(minPrice) || !validatePrice(maxPrice)) {
          console.warn('Invalid price range provided');
          return sourceMap;
        }

        if (minPrice > maxPrice) {
          console.warn('Minimum price cannot be greater than maximum price');
          return sourceMap;
        }

        const filteredEntries = Array.from(sourceMap.entries()).filter(
          ([, product]) => product.price >= minPrice && product.price <= maxPrice
        );
        return new Map(filteredEntries);
      } catch (error) {
        console.error('Error filtering by price range:', error);
        return sourceMap;
      }
    };

    // Enhanced rating filter with validation
    const filterByRating = (rating, sourceMap) => {
      try {
        if (!rating || rating === '') {
          return new Map(sourceMap);
        }

        const minRating = parseFloat(rating);
        if (!validateRating(minRating)) {
          console.warn('Invalid rating provided');
          return sourceMap;
        }

        const filteredEntries = Array.from(sourceMap.entries()).filter(
          ([, product]) => product.rating >= minRating
        );
        return new Map(filteredEntries);
      } catch (error) {
        console.error('Error filtering by rating:', error);
        return sourceMap;
      }
    };

    // Enhanced stock filter with clearer logic
    const filterByStock = (stockStatus, sourceMap) => {
      try {
        if (!stockStatus || stockStatus === '') {
          return new Map(sourceMap);
        }

        const filteredEntries = Array.from(sourceMap.entries()).filter(([, product]) => {
          switch (stockStatus) {
            case 'in-stock':
              return product.stock > CONFIG.LOW_STOCK_THRESHOLD;
            case 'low-stock':
              return product.stock > 0 && product.stock <= CONFIG.LOW_STOCK_THRESHOLD;
            case 'out-of-stock':
              return product.stock === 0;
            default:
              return true;
          }
        });
        return new Map(filteredEntries);
      } catch (error) {
        console.error('Error filtering by stock:', error);
        return sourceMap;
      }
    };

    // Enhanced filter application with performance tracking
    const applyAllFilters = () => {
      const startTime = performance.now();

      try {
        let resultMap = new Map(productsMap);

        // Apply filters in order of selectivity (most restrictive first)
        if (filtersState.category) {
          resultMap = filterByCategory(filtersState.category, resultMap);
        }

        if (filtersState.stock) {
          resultMap = filterByStock(filtersState.stock, resultMap);
        }

        if (filtersState.rating) {
          resultMap = filterByRating(filtersState.rating, resultMap);
        }

        if (filtersState.minPrice !== null || filtersState.maxPrice !== null) {
          resultMap = filterByPriceRange(filtersState.minPrice, filtersState.maxPrice, resultMap);
        }

        if (filtersState.search) {
          resultMap = searchProducts(filtersState.search, resultMap);
        }

        // Update the current filtered map
        setCurrentFilteredMap(resultMap);

        const endTime = performance.now();
        performanceMetrics.lastFilterTime = Math.round(endTime - startTime);

        return resultMap;
      } catch (error) {
        console.error('Error applying filters:', error);
        return new Map(productsMap);
      }
    };

    // Helper to get active filters for display
    const getActiveFiltersText = () => {
      const activeFilters = [];

      if (filtersState.search) activeFilters.push(`Search: "${filtersState.search}"`);
      if (filtersState.category) activeFilters.push(`Category: ${filtersState.category}`);
      if (filtersState.minPrice || filtersState.maxPrice) {
        const min = filtersState.minPrice || '0';
        const max = filtersState.maxPrice || '∞';
        activeFilters.push(`Price: ₹${min} - ₹${max}`);
      }
      if (filtersState.rating) activeFilters.push(`Rating: ${filtersState.rating}+ stars`);
      if (filtersState.stock) activeFilters.push(`Stock: ${filtersState.stock.replace('-', ' ')}`);

      return activeFilters.length > 0 ? `Active filters: ${activeFilters.join(', ')}` : '';
    };

    return {
      sortProducts,
      searchProducts,
      filterByCategory,
      filterByPriceRange,
      filterByRating,
      filterByStock,
      applyAllFilters,
      getActiveFiltersText,
    };
  };

  const createUIController = (dataController, businessController) => {
    // Enhanced element selection with error checking
    const elements = {};
    Object.entries(SELECTORS).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (!element) {
        console.warn(`Element not found for selector: ${selector}`);
      }
      elements[key] = element;
    });

    const {
      productsMap,
      filtersState,
      currentSortState,
      performanceMetrics,
      getPriceRange,
      getCategories,
    } = dataController;
    const { applyAllFilters, getActiveFiltersText } = businessController;

    // Enhanced table rendering with error handling and performance tracking
    const tableRenderer = (mapToRender) => {
      const startTime = performance.now();

      try {
        const { tableBody } = elements;
        if (!tableBody) {
          console.error('Table body element not found');
          return;
        }

        // Clear previous content
        tableBody.innerHTML = '';

        // Handle empty results
        if (mapToRender.size === 0) {
          const emptyRow = document.createElement('tr');
          emptyRow.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 2rem; color: #666; font-style: italic;">
              No products found matching your criteria. Try adjusting your filters.
            </td>
          `;
          tableBody.appendChild(emptyRow);
          return;
        }

        // Create document fragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();

        mapToRender.forEach((product) => {
          const { name, category, price, rating, stock, dateAdded } = product;

          const row = document.createElement('tr');

          // Enhanced stock status with visual indicators
          const stockStatus =
            stock === 0
              ? 'out-of-stock'
              : stock <= CONFIG.LOW_STOCK_THRESHOLD
              ? 'low-stock'
              : 'in-stock';
          const stockText =
            stock === 0
              ? 'Out of Stock'
              : stock <= CONFIG.LOW_STOCK_THRESHOLD
              ? `Low Stock (${stock})`
              : `In Stock (${stock})`;

          // Enhanced rating display with stars
          const ratingStars =
            '★'.repeat(Math.floor(rating)) +
            (rating % 1 !== 0 ? '☆' : '') +
            '☆'.repeat(5 - Math.ceil(rating));

          row.innerHTML = `
            <td>${name}</td>
            <td style="text-transform: capitalize;">${category}</td>
            <td class="price">₹${price.toLocaleString()}</td>
            <td>
              <span class="rating-stars">${ratingStars}</span>
              <span style="margin-left: 0.5rem; color: #666;">(${rating})</span>
            </td>
            <td>
              <span class="stock-status stock-${stockStatus}">${stockText}</span>
            </td>
            <td>${new Date(dateAdded).toLocaleDateString()}</td>
          `;

          fragment.appendChild(row);
        });

        tableBody.appendChild(fragment);

        const endTime = performance.now();
        performanceMetrics.lastRenderTime = Math.round(endTime - startTime);

        // Update performance metrics display
        updatePerformanceMetrics();
      } catch (error) {
        console.error('Error rendering table:', error);
        if (elements.tableBody) {
          elements.tableBody.innerHTML =
            '<tr><td colspan="6" style="text-align: center; color: red;">Error loading products</td></tr>';
        }
      }
    };

    // Enhanced sort indicators with better visual feedback
    const updateSortIndicators = (key = currentSortState.key, order = currentSortState.order) => {
      try {
        const headers = document.querySelectorAll('.sortable');
        headers.forEach((header) => {
          header.classList.remove('sort-asc', 'sort-desc');
          if (header.dataset.sort === key) {
            header.classList.add(order === 'asc' ? 'sort-asc' : 'sort-desc');
          }
        });
      } catch (error) {
        console.error('Error updating sort indicators:', error);
      }
    };

    // Enhanced results counter with active filters display
    const updateResultsInfo = (filteredCount) => {
      try {
        const totalProducts = productsMap.size;

        if (elements.resultsCount) {
          elements.resultsCount.textContent = `Showing ${filteredCount} of ${totalProducts} products`;
        }

        if (elements.activeFilters) {
          elements.activeFilters.textContent = getActiveFiltersText();
        }
      } catch (error) {
        console.error('Error updating results info:', error);
      }
    };

    // Performance metrics display
    const updatePerformanceMetrics = () => {
      if (!CONFIG.PERFORMANCE_TRACKING) return;

      try {
        const filterTimeEl = document.getElementById('filter-time');
        const sortTimeEl = document.getElementById('sort-time');
        const renderTimeEl = document.getElementById('render-time');

        if (filterTimeEl) filterTimeEl.textContent = `${performanceMetrics.lastFilterTime}ms`;
        if (sortTimeEl) sortTimeEl.textContent = `${performanceMetrics.lastSortTime}ms`;
        if (renderTimeEl) renderTimeEl.textContent = `${performanceMetrics.lastRenderTime}ms`;
      } catch (error) {
        console.error('Error updating performance metrics:', error);
      }
    };

    // Initialize category dropdown options
    const initializeCategoryOptions = () => {
      try {
        const { categoryFilter } = elements;
        if (!categoryFilter) return;

        const categories = getCategories();
        categories.forEach((category) => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
          categoryFilter.appendChild(option);
        });
      } catch (error) {
        console.error('Error initializing category options:', error);
      }
    };

    // Enhanced sort handler with debouncing and error handling
    const handleSort = (e) => {
      try {
        const header = e.target.closest('.sortable');
        if (!header) return;

        const sortKey = header.dataset.sort;
        const isCurrentKey = currentSortState.key === sortKey;
        const newOrder = isCurrentKey && currentSortState.order === 'asc' ? 'desc' : 'asc';

        const currentMap = dataController.getCurrentFilteredMap();
        const sortedMap = businessController.sortProducts(sortKey, newOrder, currentMap);

        updateUI(sortedMap);
        updateSortIndicators(sortKey, newOrder);
      } catch (error) {
        console.error('Error handling sort:', error);
      }
    };

    // Enhanced filter manager with input validation
    const filterManager = (target) => {
      try {
        if (!target) return;

        // Clear any previous validation errors
        target.classList.remove('error');

        if (target === elements.search) {
          filtersState.search = target.value.trim();
        } else if (target === elements.categoryFilter) {
          filtersState.category = target.value;
        } else if (target === elements.priceMin || target === elements.priceMax) {
          const minVal = elements.priceMin?.value?.trim();
          const maxVal = elements.priceMax?.value?.trim();

          // Validate price inputs
          if (minVal && !dataController.validatePrice(minVal)) {
            elements.priceMin.classList.add('error');
            return;
          }
          if (maxVal && !dataController.validatePrice(maxVal)) {
            elements.priceMax.classList.add('error');
            return;
          }

          filtersState.minPrice = minVal || null;
          filtersState.maxPrice = maxVal || null;
        } else if (target === elements.ratingFilter) {
          filtersState.rating = target.value;
        } else if (target === elements.stockFilter) {
          filtersState.stock = target.value;
        }

        const filteredMap = applyAllFilters();
        updateUI(filteredMap);
      } catch (error) {
        console.error('Error in filter manager:', error);
      }
    };

    // Enhanced price range initialization
    const initializePriceRange = () => {
      try {
        const { min, max } = getPriceRange();
        if (elements.priceMin) {
          elements.priceMin.placeholder = `Min: ₹${min.toLocaleString()}`;
          elements.priceMin.min = min;
          elements.priceMin.max = max;
        }
        if (elements.priceMax) {
          elements.priceMax.placeholder = `Max: ₹${max.toLocaleString()}`;
          elements.priceMax.min = min;
          elements.priceMax.max = max;
        }
      } catch (error) {
        console.error('Error initializing price range:', error);
      }
    };

    // Enhanced clear filters with confirmation and animation
    const clearFilters = () => {
      try {
        // Reset filter state
        Object.keys(filtersState).forEach((key) => {
          filtersState[key] = key.includes('Price') ? null : '';
        });

        // Reset UI elements
        if (elements.search) elements.search.value = '';
        if (elements.categoryFilter) elements.categoryFilter.value = '';
        if (elements.priceMin) elements.priceMin.value = '';
        if (elements.priceMax) elements.priceMax.value = '';
        if (elements.ratingFilter) elements.ratingFilter.value = '';
        if (elements.stockFilter) elements.stockFilter.value = '';

        // Clear any error states
        Object.values(elements).forEach((el) => {
          if (el && el.classList) el.classList.remove('error');
        });

        // Reset to full product list
        dataController.setCurrentFilteredMap(new Map(productsMap));
        const sortedMap = businessController.sortProducts();
        updateUI(sortedMap);

        console.log('Filters cleared successfully');
      } catch (error) {
        console.error('Error clearing filters:', error);
      }
    };

    // Main UI update coordinator
    const updateUI = (mapToRender = null) => {
      try {
        const renderMap = mapToRender || dataController.getCurrentFilteredMap();
        tableRenderer(renderMap);
        updateSortIndicators();
        updateResultsInfo(renderMap.size);
      } catch (error) {
        console.error('Error updating UI:', error);
      }
    };

    // Initialize UI components
    const initializeUI = () => {
      try {
        initializeCategoryOptions();
        initializePriceRange();

        // Initial render with sorted data
        const initialMap = businessController.sortProducts();
        dataController.setCurrentFilteredMap(initialMap);
        updateUI(initialMap);

        console.log('UI initialized successfully');
      } catch (error) {
        console.error('Error initializing UI:', error);
      }
    };

    return {
      tableRenderer,
      updateSortIndicators,
      updateUI,
      filterManager,
      handleSort,
      clearFilters,
      initializeUI,
      elements,
    };
  };

  const createEventController = (dataController, uiController, businessController) => {
    const { elements, filterManager, handleSort, clearFilters } = uiController;

    // Debounce helper for performance optimization
    const debounce = (func, delay) => {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    };

    // Enhanced event listener setup with error handling
    const setupEventListeners = () => {
      try {
        // Sort functionality with error handling
        const sortElements = document.querySelectorAll(SELECTORS.sortElements);
        sortElements.forEach((element) => {
          element.addEventListener('click', handleSort);
        });

        // Debounced filter handling for better performance
        const debouncedFilterManager = debounce((target) => {
          filterManager(target);
        }, CONFIG.DEBOUNCE_DELAY);

        // Filter container event delegation
        if (elements.filtersContainer) {
          elements.filtersContainer.addEventListener('input', (e) => {
            const target = e.target;

            // Immediate feedback for search, debounced for others
            if (target === elements.search) {
              filterManager(target);
            } else {
              debouncedFilterManager(target);
            }
          });

          // Handle dropdown changes immediately
          elements.filtersContainer.addEventListener('change', (e) => {
            filterManager(e.target);
          });
        }

        // Clear filters button
        if (elements.clearFilters) {
          elements.clearFilters.addEventListener('click', clearFilters);
        }

        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
          // Escape key clears filters
          if (e.key === 'Escape') {
            clearFilters();
          }

          // Ctrl/Cmd + F focuses search
          if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            if (elements.search) {
              elements.search.focus();
            }
          }
        });

        console.log('Event listeners set up successfully');
      } catch (error) {
        console.error('Error setting up event listeners:', error);
      }
    };

    return {
      setupEventListeners,
    };
  };

  // Enhanced application initialization with error handling
  const initialize = () => {
    try {
      console.log('Initializing Filter/Sort Table Application...');

      const dataController = createDataController();
      const businessController = createBusinessController(dataController);
      const uiController = createUIController(dataController, businessController);
      const eventController = createEventController(
        dataController,
        uiController,
        businessController
      );

      // Initialize in proper order
      uiController.initializeUI();
      eventController.setupEventListeners();

      console.log('Application initialized successfully!');

      // Return controllers for debugging purposes
      return {
        dataController,
        businessController,
        uiController,
        eventController,
      };
    } catch (error) {
      console.error('Critical error during application initialization:', error);

      // Fallback error display
      const container = document.querySelector('.container-style');
      if (container) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #721c24; background: #f8d7da; border-radius: 8px; border: 1px solid #f5c6cb;">
            <h3>Application Failed to Load</h3>
            <p>There was an error initializing the application. Please refresh the page and try again.</p>
            <details style="margin-top: 1rem;">
              <summary>Technical Details</summary>
              <pre style="text-align: left; margin-top: 0.5rem; font-size: 12px;">${error.message}</pre>
            </details>
          </div>
        `;
      }
    }
  };

  return initialize();
}

// Enhanced DOMContentLoaded with error handling
document.addEventListener('DOMContentLoaded', () => {
  try {
    initFilterSortTableApp();
  } catch (error) {
    console.error('Failed to start application:', error);
  }
});
