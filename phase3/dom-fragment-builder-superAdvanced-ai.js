/**
 * Advanced DOM Fragment Builder - Reference Implementation
 * Demonstrates modern JavaScript patterns and optimization techniques
 */

class DOMFragmentBuilder {
  constructor() {
    this.state = this.createInitialState();
    this.elements = this.cacheElements();
    this.metrics = new PerformanceTracker();
    this.validators = new InputValidators();

    this.init();
  }

  /**
   * Immutable state management
   */
  createInitialState() {
    return Object.freeze({
      currentTest: null,
      isRunning: false,
      results: new Map(),
      config: {
        defaultCount: 100,
        maxCount: 5000,
        animationFrame: true,
      },
    });
  }

  /**
   * Cache DOM elements once for performance
   */
  cacheElements() {
    const cache = new Map();

    // Batch element queries
    const selectors = {
      controls: '.method-buttons',
      countInput: '.input-group #element-count',
      typeSelect: '#element-type-select',
      outputs: ['#direct-output', '#fragment-output'],
      metrics: ['#direct-time', '#fragment-time', '#performance-gain'],
      clearControls: '.clear-controls',
    };

    for (const [key, selector] of Object.entries(selectors)) {
      if (Array.isArray(selector)) {
        cache.set(
          key,
          selector.map((s) => document.querySelector(s))
        );
      } else {
        cache.set(key, document.querySelector(selector));
      }
    }
    console.log(cache);
    return cache;
  }

  /**
   * Modern event delegation with method binding
   */
  init() {
    // Bind methods to preserve context
    this.handleControlClick = this.handleControlClick.bind(this);
    this.handleClearClick = this.handleClearClick.bind(this);

    // Use modern event delegation
    this.elements.get('controls')?.addEventListener('click', this.handleControlClick);
    this.elements.get('clearControls')?.addEventListener('click', this.handleClearClick);

    // Initialize UI state
    this.updateUI();

    console.log('🚀 Advanced DOM Fragment Builder initialized');
  }

  /**
   * Async event handler with error boundaries
   */
  async handleControlClick(event) {
    const { target } = event;
    if (target.tagName !== 'BUTTON') return;

    try {
      this.updateState({ isRunning: true });

      const config = this.getTestConfig();
      const action = this.getActionFromId(target.id);
      console.log(config, action);
      await this.executeAction(action, config);
    } catch (error) {
      this.handleError('Control click failed', error);
    } finally {
      this.updateState({ isRunning: false });
    }
  }

  /**
   * Configuration object pattern
   */
  getTestConfig() {
    const inputValue = this.elements.get('countInput')?.value;

    const count = parseInt(inputValue || this.state.config.defaultCount);

    const type = this.elements.get('typeSelect')?.value || 'list';
    const result = this.validators.validateConfig({ count, type });

    return result;
  }

  /**
   * Strategy pattern for actions
   */
  getActionFromId(id) {
    const strategies = {
      'generate-direct': () => this.runSingleTest('direct'),
      'generate-fragment': () => this.runSingleTest('fragment'),
      'generate-both': () => this.runComparisonTest(),
    };

    return (
      strategies[id] ||
      (() => {
        throw new Error(`Unknown action: ${id}`);
      })
    );
  }

  /**
   * Async test execution with RAF optimization
   */
  async executeAction(action, config) {
    this.updateState({ currentTest: config });

    if (this.state.config.animationFrame) {
      // Use requestAnimationFrame for better timing accuracy
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    return action();
  }

  /**
   * Performance measurement with higher precision
   */
  async runSingleTest(method) {
    const config = this.state.currentTest;
    const startMark = `${method}-start`;
    const endMark = `${method}-end`;

    // Use Performance API for precise measurements
    performance.mark(startMark);

    try {
      await this.generateElements(config.count, config.type, method);

      performance.mark(endMark);
      performance.measure(`${method}-duration`, startMark, endMark);

      const measure = performance.getEntriesByName(`${method}-duration`)[0];
      this.recordResult(method, measure.duration, config);
    } finally {
      // Cleanup performance entries
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(`${method}-duration`);
    }
  }

  /**
   * Parallel test execution for comparison
   */
  async runComparisonTest() {
    const results = await Promise.allSettled([
      this.runSingleTest('direct'),
      this.runSingleTest('fragment'),
    ]);

    console.log(results);
    // Handle any failures gracefully
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      console.warn('Some tests failed:', failures);
    }

    this.calculatePerformanceGain();
  }

  /**
   * Functional approach to element generation
   */
  async generateElements(count, type, method) {
    const container = this.getContainer(method);
    const generator = this.getElementGenerator(type);

    // Clear container efficiently
    this.clearContainer(container);

    // Use composition for different methods
    const elements = this.createElementBatch(count, generator);

    if (method === 'fragment') {
      this.appendViaFragment(container, elements);
    } else {
      this.appendDirectly(container, elements);
    }

    this.updateEmptyMessage(container);
  }

  /**
   * Higher-order function for element creation
   */
  createElementBatch(count, generator) {
    return Array.from({ length: count }, (_, index) => generator(index + 1));
  }

  /**
   * Factory pattern for element generators
   */
  getElementGenerator(type) {
    const generators = {
      list: this.createSimpleElement.bind(this),
      cards: this.createCardElement.bind(this),
      complex: this.createComplexElement.bind(this),
    };

    return generators[type] || generators.list;
  }

  /**
   * Pure functions for element creation
   */
  createSimpleElement(index) {
    return this.createElement('li', {
      className: 'list-item',
      textContent: `List Item ${index}`,
    });
  }

  createCardElement(index) {
    const card = this.createElement('div', { className: 'user-card' });

    const avatar = this.createElement('div', {
      className: 'user-avatar',
      textContent: '👤',
    });

    const info = this.createElement('div', { className: 'user-info' });

    const name = this.createElement('div', {
      className: 'user-name',
      textContent: `User ${index}`,
    });

    const email = this.createElement('div', {
      className: 'user-email',
      textContent: `user${index}@example.com`,
    });

    // Functional composition
    this.appendChildren(info, [name, email]);
    this.appendChildren(card, [avatar, info]);

    return card;
  }

  createComplexElement(index) {
    const item = this.createElement('div', { className: 'complex-item' });

    const header = this.createElement('div', { className: 'complex-header' });

    const title = this.createElement('h3', {
      className: 'complex-title',
      textContent: `Complex Item ${index}`,
    });

    const badge = this.createElement('span', {
      className: 'complex-badge',
      textContent: index % 2 === 0 ? 'Even' : 'Odd',
    });

    const content = this.createElement('div', {
      className: 'complex-content',
      textContent: `Detailed content for item ${index} with additional metadata and descriptions.`,
    });

    this.appendChildren(header, [title, badge]);
    this.appendChildren(item, [header, content]);

    return item;
  }

  /**
   * Utility function for consistent element creation
   */
  createElement(tag, props = {}) {
    const element = document.createElement(tag);

    Object.assign(element, props);

    return element;
  }

  /**
   * Functional helper for appending children
   */
  appendChildren(parent, children) {
    children.forEach((child) => parent.appendChild(child));
  }

  /**
   * Optimized fragment insertion
   */
  appendViaFragment(container, elements) {
    const fragment = document.createDocumentFragment();

    // Batch append to fragment
    elements.forEach((element) => fragment.appendChild(element));

    // Single DOM operation
    container.appendChild(fragment);
  }

  /**
   * Direct insertion with potential batching
   */
  appendDirectly(container, elements) {
    // Modern browsers may batch these automatically
    elements.forEach((element) => container.appendChild(element));
  }

  /**
   * Immutable state updates
   */
  updateState(updates) {
    this.state = Object.freeze({
      ...this.state,
      ...updates,
      //results: new Map(this.state.results), // Deep copy Map
    });
    console.log(this.state.results.has('direct-list'));
  }

  /**
   * Record and store performance results
   */
  recordResult(method, duration, config) {
    const result = {
      method,
      duration,
      config: { ...config },
      timestamp: Date.now(),
    };

    const newResults = new Map(this.state.results);
    newResults.set(`${method}-${config.type}`, result);

    console.log(newResults);
    this.updateState({ results: newResults });
    this.updateMetricsDisplay(method, duration);
  }

  /**
   * Calculate and display performance gain
   */
  calculatePerformanceGain() {
    const { type } = this.state.currentTest;
    const directResult = this.state.results.get(`direct-${type}`);
    const fragmentResult = this.state.results.get(`fragment-${type}`);

    console.log(directResult, fragmentResult);
    if (directResult && fragmentResult) {
      const gain = directResult.duration - fragmentResult.duration;
      const percentage = ((gain / directResult.duration) * 100).toFixed(1);

      this.updatePerformanceDisplay(Math.abs(gain), percentage, gain > 0);
    }
  }

  /**
   * UI update methods with error handling
   */
  updateMetricsDisplay(method, duration) {
    try {
      const metrics = this.elements.get('metrics');
      const index = method === 'direct' ? 0 : 1;

      if (metrics[index]) {
        metrics[index].textContent = `${duration.toFixed(3)} ms`;
      }
    } catch (error) {
      this.handleError('Metrics display update failed', error);
    }
  }

  updatePerformanceDisplay(gain, percentage, fragmentFaster) {
    try {
      const metrics = this.elements.get('metrics');
      const gainElement = metrics[2];
      if (gainElement) {
        const sign = fragmentFaster ? '+' : '-';
        gainElement.textContent = `${sign}${gain.toFixed(1)}ms (${percentage}%)`;
        gainElement.style.color = fragmentFaster ? '#4caf50' : '#f44336';
      }
    } catch (error) {
      this.handleError('Performance display update failed', error);
    }
  }

  /**
   * Container management
   */
  getContainer(method) {
    const outputs = this.elements.get('outputs');
    return method === 'direct' ? outputs[0] : outputs[1];
  }

  clearContainer(container) {
    // Use textContent for better performance than innerHTML
    container.textContent = '';
  }

  updateEmptyMessage(container) {
    const hasContent = container.children.length > 0;
    // Implementation would check for empty message and toggle visibility
  }

  /**
   * Clear controls handler
   */
  handleClearClick(event) {
    const { target } = event;
    if (target.tagName !== 'BUTTON') return;

    const clearActions = {
      'clear-direct': () => this.clearContainer(this.getContainer('direct')),
      'clear-fragment': () => this.clearContainer(this.getContainer('fragment')),
      'clear-both': () => {
        this.clearContainer(this.getContainer('direct'));
        this.clearContainer(this.getContainer('fragment'));
        this.resetMetrics();
      },
    };

    const action = clearActions[target.id];
    if (action) {
      action();
      this.updateUI();
    }
  }

  /**
   * Reset metrics display
   */
  resetMetrics() {
    const metrics = this.elements.get('metrics');
    metrics.forEach((metric) => {
      metric.textContent = '-';
      metric.style.color = '';
    });

    this.updateState({ results: new Map() });
  }

  /**
   * Update UI state
   */
  updateUI() {
    const outputs = this.elements.get('outputs');
    outputs.forEach((container) => this.updateEmptyMessage(container));
  }

  /**
   * Centralized error handling
   */
  handleError(message, error) {
    console.error(`${message}:`, error);

    // Could implement user notification here
    // this.showUserNotification('An error occurred', 'error');
  }

  /**
   * Cleanup method for memory management
   */
  destroy() {
    // Remove event listeners
    this.elements.get('controls')?.removeEventListener('click', this.handleControlClick);
    this.elements.get('clearControls')?.removeEventListener('click', this.handleClearClick);

    // Clear state
    this.state = null;
    this.elements.clear();

    console.log('🧹 DOM Fragment Builder destroyed');
  }
}

/**
 * Performance tracking utility class
 */
class PerformanceTracker {
  constructor() {
    this.measurements = new Map();
  }

  startMeasurement(key) {
    console.log('PerformanceTracker called');
    this.measurements.set(key, performance.now());
  }

  endMeasurement(key) {
    const start = this.measurements.get(key);
    if (start) {
      const duration = performance.now() - start;
      this.measurements.delete(key);
      return duration;
    }
    return null;
  }

  clear() {
    this.measurements.clear();
  }
}

/**
 * Input validation utility class
 */
class InputValidators {
  validateConfig({ count, type }) {
    const validatedCount = this.validateCount(count);
    const validatedType = this.validateType(type);

    return { count: validatedCount, type: validatedType };
  }

  validateCount(count) {
    const num = parseInt(count);

    if (isNaN(num) || num < 1) {
      throw new Error('Count must be a positive number');
    }

    if (num > 5000) {
      console.warn('Large element count may cause performance issues');
      return Math.min(num, 5000);
    }

    return num;
  }

  validateType(type) {
    const validTypes = ['list', 'cards', 'complex'];

    if (!validTypes.includes(type)) {
      console.warn(`Invalid type "${type}", defaulting to "list"`);
      return 'list';
    }

    return type;
  }
}

/**
 * Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Store instance globally for debugging/cleanup
  window.fragmentBuilder = new DOMFragmentBuilder();
});

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
  if (window.fragmentBuilder) {
    window.fragmentBuilder.destroy();
  }
});
