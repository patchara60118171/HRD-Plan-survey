/**
 * Skeleton Components - Phase 2.1 UX Foundation
 * Dynamic skeleton loading for better perceived performance
 */

class SkeletonManager {
  constructor() {
    this.activeSkeletons = new Map();
  }

  /**
   * Show skeleton for a container element
   * @param {string} containerId - ID of container to show skeleton in
   * @param {string} type - Type of skeleton (dashboard, table, chart, form)
   * @param {Object} options - Additional options
   */
  show(containerId, type = 'default', options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Skeleton container #${containerId} not found`);
      return;
    }

    // Store original content
    this.activeSkeletons.set(containerId, {
      originalContent: container.innerHTML,
      type,
      options
    });

    // Generate skeleton HTML based on type
    const skeletonHTML = this.generateSkeletonHTML(type, options);
    container.innerHTML = skeletonHTML;
    
    // Add skeleton class for styling
    container.classList.add('skeleton-container');
  }

  /**
   * Hide skeleton and restore original content
   * @param {string} containerId - ID of container to hide skeleton
   * @param {Function} callback - Optional callback after content is restored
   */
  hide(containerId, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const skeletonData = this.activeSkeletons.get(containerId);
    if (!skeletonData) return;

    // Remove skeleton class
    container.classList.remove('skeleton-container');

    // Restore original content with fade-in effect
    container.innerHTML = skeletonData.originalContent;
    container.classList.add('skeleton-fade-in');

    // Clean up
    this.activeSkeletons.delete(containerId);

    // Remove fade-in class after animation
    setTimeout(() => {
      container.classList.remove('skeleton-fade-in');
      if (typeof callback === 'function') {
        callback();
      }
    }, 300);
  }

  /**
   * Generate skeleton HTML based on type
   * @param {string} type - Skeleton type
   * @param {Object} options - Additional options
   * @returns {string} - Skeleton HTML
   */
  generateSkeletonHTML(type, options = {}) {
    switch (type) {
      case 'dashboard':
        return this.generateDashboardSkeleton(options);
      case 'table':
        return this.generateTableSkeleton(options);
      case 'chart':
        return this.generateChartSkeleton(options);
      case 'form':
        return this.generateFormSkeleton(options);
      case 'kpi-cards':
        return this.generateKpiCardsSkeleton(options);
      default:
        return this.generateDefaultSkeleton(options);
    }
  }

  /**
   * Generate dashboard skeleton with KPI cards
   */
  generateDashboardSkeleton(options = {}) {
    const { cardCount = 4, showCharts = true } = options;
    
    let html = '<div class="dashboard-skeleton">';
    
    // KPI Cards
    html += '<div class="kpi-cards-skeleton">';
    for (let i = 0; i < cardCount; i++) {
      html += `
        <div class="skeleton-kpi-card">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-kpi-value"></div>
          <div class="skeleton skeleton-kpi-label"></div>
        </div>
      `;
    }
    html += '</div>';

    // Charts
    if (showCharts) {
      html += '<div class="charts-skeleton">';
      html += '<div class="skeleton-chart"></div>';
      html += '<div class="skeleton-chart"></div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Generate table skeleton
   */
  generateTableSkeleton(options = {}) {
    const { rows = 10, columns = 6, showHeader = true } = options;
    
    let html = '<div class="table-skeleton">';
    
    if (showHeader) {
      html += '<div class="table-header-skeleton">';
      for (let i = 0; i < columns; i++) {
        html += '<div class="skeleton skeleton-text medium"></div>';
      }
      html += '</div>';
    }

    html += '<div class="table-body-skeleton">';
    for (let i = 0; i < rows; i++) {
      html += '<div class="skeleton-table-row">';
      for (let j = 0; j < columns; j++) {
        const width = j === 0 ? 'short' : (j === columns - 1 ? 'medium' : 'long');
        html += `<div class="skeleton skeleton-text ${width}"></div>`;
      }
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
    
    return html;
  }

  /**
   * Generate chart skeleton
   */
  generateChartSkeleton(options = {}) {
    const { height = 300, showLegend = true } = options;
    
    let html = '<div class="chart-skeleton">';
    html += `<div class="skeleton-chart" style="height: ${height}px"></div>`;
    
    if (showLegend) {
      html += '<div class="chart-legend-skeleton">';
      for (let i = 0; i < 4; i++) {
        html += `
          <div class="legend-item-skeleton">
            <div class="skeleton skeleton-icon"></div>
            <div class="skeleton skeleton-text short"></div>
          </div>
        `;
      }
      html += '</div>';
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Generate form skeleton
   */
  generateFormSkeleton(options = {}) {
    const { fieldCount = 6, showButtons = true } = options;
    
    let html = '<div class="form-skeleton">';
    
    for (let i = 0; i < fieldCount; i++) {
      html += `
        <div class="skeleton-form-group">
          <div class="skeleton skeleton-label"></div>
          <div class="skeleton skeleton-input"></div>
        </div>
      `;
    }

    if (showButtons) {
      html += '<div class="form-buttons-skeleton">';
      html += '<div class="skeleton skeleton-button"></div>';
      html += '<div class="skeleton skeleton-button"></div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Generate KPI cards skeleton
   */
  generateKpiCardsSkeleton(options = {}) {
    const { count = 4 } = options;
    
    let html = '<div class="kpi-cards-skeleton">';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-kpi-card">
          <div class="skeleton skeleton-text short"></div>
          <div class="skeleton skeleton-kpi-value"></div>
          <div class="skeleton skeleton-progress-bar"></div>
          <div class="skeleton skeleton-text medium"></div>
        </div>
      `;
    }
    html += '</div>';
    
    return html;
  }

  /**
   * Generate default skeleton
   */
  generateDefaultSkeleton(options = {}) {
    const { lines = 5 } = options;
    
    let html = '<div class="default-skeleton">';
    for (let i = 0; i < lines; i++) {
      const width = i === 0 ? 'long' : (i === lines - 1 ? 'short' : 'medium');
      html += `<div class="skeleton skeleton-text ${width}"></div>`;
    }
    html += '</div>';
    
    return html;
  }

  /**
   * Hide all active skeletons
   */
  hideAll() {
    this.activeSkeletons.forEach((_, containerId) => {
      this.hide(containerId);
    });
  }

  /**
   * Check if skeleton is active for container
   * @param {string} containerId - Container ID
   * @returns {boolean}
   */
  isActive(containerId) {
    return this.activeSkeletons.has(containerId);
  }

  /**
   * Get active skeleton count
   * @returns {number}
   */
  getActiveCount() {
    return this.activeSkeletons.size;
  }
}

// Global skeleton manager instance
window.skeletonManager = new SkeletonManager();

// Utility functions for common skeleton patterns
window.showSkeleton = (containerId, type, options) => {
  return window.skeletonManager.show(containerId, type, options);
};

window.hideSkeleton = (containerId, callback) => {
  return window.skeletonManager.hide(containerId, callback);
};

window.hideAllSkeletons = () => {
  return window.skeletonManager.hideAll();
};
