/**
 * ResponseViewer Class
 * Manages viewing, filtering, and exporting form responses
 */
class ResponseViewer {
  constructor(dataLoader, config = {}) {
    this.dataLoader = dataLoader;
    this.config = config;
    this.responses = [];
    this.filteredResponses = [];
    this.currentPage = 1;
    this.pageSize = config.pageSize || 25;
    this.sortField = 'submittedDate';
    this.sortOrder = 'desc';
  }

  /**
   * Load responses from Supabase
   * @param {Object} supabaseClient - Supabase client instance
   * @returns {Promise<Array>} Array of response objects
   */
  async loadResponses(supabaseClient) {
    try {
      if (!supabaseClient) {
        throw new Error('Supabase client not provided');
      }

      const config = await this.dataLoader.loadConfig();
      const tableName = config.submissionConfiguration?.supabaseTable || 'ch1_responses';

      const { data, error } = await supabaseClient
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      this.responses = data || [];
      this.filteredResponses = [...this.responses];
      return this.responses;
    } catch (error) {
      console.error('Error loading responses:', error);
      throw error;
    }
  }

  /**
   * Get responses with pagination
   * @param {number} [page] - Page number (1-based)
   * @returns {Object} Pagination result {data: Array, total: number, totalPages: number}
   */
  getPaginatedResponses(page = this.currentPage) {
    const total = this.filteredResponses.length;
    const totalPages = Math.ceil(total / this.pageSize);
    const startIdx = (page - 1) * this.pageSize;
    const endIdx = startIdx + this.pageSize;

    const data = this.filteredResponses.slice(startIdx, endIdx);

    return {
      data,
      total,
      totalPages,
      currentPage: page,
      pageSize: this.pageSize
    };
  }

  /**
   * Render responses as HTML table
   * @param {string} containerId - ID of container element
   * @param {Array} [responses] - Optional specific responses to render
   * @returns {Element} Table element
   */
  renderTable(containerId, responses = null) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with ID "${containerId}" not found`);
    }

    const data = responses || this.filteredResponses;
    const paginationResult = this.getPaginatedResponses(this.currentPage);

    // Clear container
    container.innerHTML = '';

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'response-viewer-wrapper';

    // Create table
    const table = document.createElement('table');
    table.className = 'w-full border-collapse';
    table.innerHTML = `
      <thead>
        <tr class="bg-slate-100 border-b-2 border-slate-300">
          <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Organization</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Submitted Date</th>
          <th class="px-4 py-3 text-center text-sm font-semibold text-slate-700">Status</th>
          <th class="px-4 py-3 text-center text-sm font-semibold text-slate-700">Actions</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;

    const tbody = table.querySelector('tbody');

    // Populate rows
    for (const response of paginationResult.data) {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-200 hover:bg-slate-50';

      const idCell = document.createElement('td');
      idCell.className = 'px-4 py-3 text-sm text-slate-700';
      idCell.textContent = response.id || response.response_id || 'N/A';

      const orgCell = document.createElement('td');
      orgCell.className = 'px-4 py-3 text-sm text-slate-700';
      orgCell.textContent = response.org_name || response.organization || 'N/A';

      const dateCell = document.createElement('td');
      dateCell.className = 'px-4 py-3 text-sm text-slate-700';
      const date = new Date(response.submitted_date || response.created_at);
      dateCell.textContent = date.toLocaleDateString('th-TH') || 'N/A';

      const statusCell = document.createElement('td');
      statusCell.className = 'px-4 py-3 text-sm text-center';
      const status = response.status || 'completed';
      const statusBadge = document.createElement('span');
      statusBadge.className = `px-2 py-1 rounded-full text-xs font-semibold ${
        status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`;
      statusBadge.textContent = status;
      statusCell.appendChild(statusBadge);

      const actionsCell = document.createElement('td');
      actionsCell.className = 'px-4 py-3 text-sm text-center';

      const viewBtn = document.createElement('button');
      viewBtn.className = 'px-3 py-1 mr-2 bg-primary text-white rounded text-xs font-semibold hover:bg-opacity-90 transition';
      viewBtn.textContent = 'View';
      viewBtn.setAttribute('data-response-id', response.id || response.response_id);
      viewBtn.addEventListener('click', () => this.onViewResponse(response));

      const editBtn = document.createElement('button');
      editBtn.className = 'px-3 py-1 mr-2 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-opacity-90 transition';
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('data-response-id', response.id || response.response_id);
      editBtn.addEventListener('click', () => this.onEditResponse(response));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-opacity-90 transition';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('data-response-id', response.id || response.response_id);
      deleteBtn.addEventListener('click', () => this.onDeleteResponse(response));

      actionsCell.appendChild(viewBtn);
      actionsCell.appendChild(editBtn);
      actionsCell.appendChild(deleteBtn);

      row.appendChild(idCell);
      row.appendChild(orgCell);
      row.appendChild(dateCell);
      row.appendChild(statusCell);
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    }

    wrapper.appendChild(table);

    // Pagination controls
    if (paginationResult.totalPages > 1) {
      const pagination = document.createElement('div');
      pagination.className = 'mt-4 flex items-center justify-between p-3 bg-slate-50 rounded';

      const info = document.createElement('p');
      info.className = 'text-sm text-slate-700';
      info.textContent = `Page ${paginationResult.currentPage} of ${paginationResult.totalPages} (${paginationResult.total} total)`;

      const controls = document.createElement('div');
      controls.className = 'space-x-2';

      const prevBtn = document.createElement('button');
      prevBtn.className = 'px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm font-semibold hover:bg-slate-400 transition disabled:opacity-50';
      prevBtn.textContent = 'Previous';
      prevBtn.disabled = this.currentPage === 1;
      prevBtn.addEventListener('click', () => {
        this.currentPage = Math.max(1, this.currentPage - 1);
        this.renderTable(containerId, responses);
      });

      const nextBtn = document.createElement('button');
      nextBtn.className = 'px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm font-semibold hover:bg-slate-400 transition disabled:opacity-50';
      nextBtn.textContent = 'Next';
      nextBtn.disabled = this.currentPage >= paginationResult.totalPages;
      nextBtn.addEventListener('click', () => {
        this.currentPage = Math.min(paginationResult.totalPages, this.currentPage + 1);
        this.renderTable(containerId, responses);
      });

      controls.appendChild(prevBtn);
      controls.appendChild(nextBtn);

      pagination.appendChild(info);
      pagination.appendChild(controls);

      wrapper.appendChild(pagination);
    }

    container.appendChild(wrapper);
    return table;
  }

  /**
   * Filter responses by organization
   * @param {string} orgId - Organization ID
   * @returns {Array} Filtered responses
   */
  filterByOrganization(orgId) {
    this.filteredResponses = this.responses.filter(
      r => r.org_id === orgId || r.organization_id === orgId
    );
    this.currentPage = 1;
    return this.filteredResponses;
  }

  /**
   * Filter responses by status
   * @param {string} status - Status value
   * @returns {Array} Filtered responses
   */
  filterByStatus(status) {
    this.filteredResponses = this.responses.filter(
      r => r.status === status
    );
    this.currentPage = 1;
    return this.filteredResponses;
  }

  /**
   * Filter responses by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Filtered responses
   */
  filterByDateRange(startDate, endDate) {
    this.filteredResponses = this.responses.filter(r => {
      const date = new Date(r.submitted_date || r.created_at);
      return date >= startDate && date <= endDate;
    });
    this.currentPage = 1;
    return this.filteredResponses;
  }

  /**
   * Search responses
   * @param {string} query - Search query
   * @returns {Array} Filtered responses
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    this.filteredResponses = this.responses.filter(r => {
      const searchableFields = [
        r.org_name,
        r.organization,
        r.id,
        r.response_id,
        r.status
      ].join(' ').toLowerCase();

      return searchableFields.includes(lowerQuery);
    });
    this.currentPage = 1;
    return this.filteredResponses;
  }

  /**
   * Sort responses
   * @param {string} field - Field to sort by
   * @param {string} [order] - 'asc' or 'desc'
   * @returns {Array} Sorted responses
   */
  sort(field, order = 'asc') {
    this.sortField = field;
    this.sortOrder = order;

    this.filteredResponses.sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    this.currentPage = 1;
    return this.filteredResponses;
  }

  /**
   * Export responses to CSV
   * @returns {string} CSV content
   */
  exportToCSV() {
    if (this.filteredResponses.length === 0) {
      return '';
    }

    const headers = Object.keys(this.filteredResponses[0]);
    const csvHeaders = headers.map(h => `"${h}"`).join(',');

    const csvRows = this.filteredResponses.map(response => {
      return headers.map(header => {
        const value = response[header];
        if (typeof value === 'object') {
          return `"${JSON.stringify(value)}"`;
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  /**
   * Export responses to JSON
   * @returns {string} JSON content
   */
  exportToJSON() {
    return JSON.stringify(this.filteredResponses, null, 2);
  }

  /**
   * Download export file
   * @param {string} format - 'csv' or 'json'
   * @param {string} [filename] - Optional filename
   */
  downloadExport(format = 'csv', filename = null) {
    let content, mimeType, fileExtension;

    if (format === 'csv') {
      content = this.exportToCSV();
      mimeType = 'text/csv';
      fileExtension = 'csv';
      filename = filename || `responses-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      content = this.exportToJSON();
      mimeType = 'application/json';
      fileExtension = 'json';
      filename = filename || `responses-${new Date().toISOString().split('T')[0]}.json`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get response by ID
   * @param {string} responseId - Response ID
   * @returns {Object|null} Response object or null
   */
  getResponseById(responseId) {
    return this.responses.find(r => r.id === responseId || r.response_id === responseId) || null;
  }

  /**
   * Get response statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    return {
      totalResponses: this.responses.length,
      completedResponses: this.responses.filter(r => r.status === 'completed').length,
      pendingResponses: this.responses.filter(r => r.status === 'pending').length,
      averageSubmissionTime: this.calculateAverageSubmissionTime(),
      organizationCount: new Set(this.responses.map(r => r.org_id || r.organization_id)).size
    };
  }

  /**
   * Calculate average submission time (placeholder)
   * @private
   * @returns {number}
   */
  calculateAverageSubmissionTime() {
    if (this.responses.length === 0) return 0;
    const totalTime = this.responses.reduce((sum, r) => {
      return sum + (r.submission_time || 0);
    }, 0);
    return Math.round(totalTime / this.responses.length);
  }

  /**
   * Callback for view response (override in implementation)
   * @param {Object} response
   */
  onViewResponse(response) {
    console.log('View response:', response);
  }

  /**
   * Callback for edit response (override in implementation)
   * @param {Object} response
   */
  onEditResponse(response) {
    console.log('Edit response:', response);
  }

  /**
   * Callback for delete response (override in implementation)
   * @param {Object} response
   */
  onDeleteResponse(response) {
    console.log('Delete response:', response);
  }

  /**
   * Reset filters
   */
  reset() {
    this.filteredResponses = [...this.responses];
    this.currentPage = 1;
  }
}

// Export for use in modules and browsers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponseViewer;
}
