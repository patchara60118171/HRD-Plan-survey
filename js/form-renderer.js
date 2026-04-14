/**
 * FormRenderer Class
 * Handles rendering of form steps, sections, and individual fields
 * Integrates with FormValidator for field validation
 */
class FormRenderer {
  constructor(containerId, dataLoader, config = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with ID "${containerId}" not found`);
    }

    this.dataLoader = dataLoader;
    this.config = config;
    this.currentStep = 1;
    this.formData = {};
    this.fieldElements = {};
    this.validators = {};
    this.sectionErrors = {};
  }

  /**
   * Render a complete step with all sections and fields
   * @param {number} stepNumber - Step number to render
   * @returns {Promise<Element>} Rendered step element
   */
  async render(stepNumber) {
    try {
      const questions = await this.dataLoader.loadQuestions();
      const config = await this.dataLoader.loadConfig();

      if (!questions.questions[stepNumber - 1]) {
        throw new Error(`Step ${stepNumber} not found`);
      }

      const step = questions.questions[stepNumber - 1];
      this.currentStep = stepNumber;

      // Clear container
      this.container.innerHTML = '';

      // Create step container
      const stepElement = document.createElement('div');
      stepElement.className = 'step-container space-y-6';
      stepElement.setAttribute('data-step', stepNumber);

      // Add step header
      const header = this.renderStepHeader(step, stepNumber, config);
      stepElement.appendChild(header);

      // Render all sections
      if (step.sections && Array.isArray(step.sections)) {
        for (const section of step.sections) {
          const sectionElement = await this.renderSection(section, step);
          stepElement.appendChild(sectionElement);
        }
      }

      this.container.appendChild(stepElement);
      return stepElement;
    } catch (error) {
      console.error(`Error rendering step ${stepNumber}:`, error);
      throw error;
    }
  }

  /**
   * Render step header
   * @private
   * @param {Object} step - Step object from questions
   * @param {number} stepNumber - Step number
   * @param {Object} config - Form configuration
   * @returns {Element}
   */
  renderStepHeader(step, stepNumber, config) {
    const header = document.createElement('div');
    header.className = 'step-header pb-6 border-b-2 border-slate-200';

    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-slate-800 mb-2';
    title.textContent = step.title || '';
    header.appendChild(title);

    if (step.description) {
      const desc = document.createElement('p');
      desc.className = 'text-slate-600 text-sm';
      desc.textContent = step.description;
      header.appendChild(desc);
    }

    return header;
  }

  /**
   * Render a section with all its fields
   * @param {Object} section - Section object
   * @param {Object} step - Parent step object
   * @returns {Promise<Element>} Rendered section element
   */
  async renderSection(section, step) {
    const sectionElement = document.createElement('div');
    sectionElement.className = 'section space-y-4 p-4 bg-slate-50 rounded-lg';
    sectionElement.setAttribute('data-section-id', section.id);

    // Section title
    if (section.title) {
      const title = document.createElement('h3');
      title.className = 'text-lg font-semibold text-slate-700 mb-4';
      title.textContent = section.title;
      sectionElement.appendChild(title);
    }

    // Section description
    if (section.description) {
      const desc = document.createElement('p');
      desc.className = 'text-sm text-slate-600 mb-4 italic';
      desc.textContent = section.description;
      sectionElement.appendChild(desc);
    }

    // Render fields
    if (section.fields && Array.isArray(section.fields)) {
      const fieldsContainer = document.createElement('div');
      fieldsContainer.className = 'fields-container space-y-4';

      for (const field of section.fields) {
        const fieldElement = await this.renderField(field, step);
        fieldsContainer.appendChild(fieldElement);
      }

      sectionElement.appendChild(fieldsContainer);
    }

    // Section error container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'section-error text-red-500 text-sm hidden';
    errorContainer.setAttribute('data-section-error', section.id);
    sectionElement.appendChild(errorContainer);

    return sectionElement;
  }

  /**
   * Render an individual field based on its type
   * @param {Object} field - Field object
   * @param {Object} step - Parent step object
   * @returns {Promise<Element>} Rendered field element
   */
  async renderField(field, step) {
    const fieldElement = document.createElement('div');
    fieldElement.className = 'field-wrapper space-y-2';
    fieldElement.setAttribute('data-field-id', field.id);
    fieldElement.setAttribute('data-field-type', field.type);

    // Handle conditional fields
    if (field.condition) {
      fieldElement.style.display = 'none';
      fieldElement.setAttribute('data-condition', JSON.stringify(field.condition));
    }

    let inputElement;

    switch (field.type) {
      case 'text':
        inputElement = this.renderTextField(field);
        break;
      case 'textarea':
        inputElement = this.renderTextareaField(field);
        break;
      case 'number':
        inputElement = this.renderNumberField(field);
        break;
      case 'select':
        inputElement = this.renderSelectField(field);
        break;
      case 'radio':
        inputElement = this.renderRadioField(field);
        break;
      case 'checkbox':
        inputElement = this.renderCheckboxField(field);
        break;
      case 'file-upload':
        inputElement = this.renderFileUploadField(field);
        break;
      case 'number-group':
        inputElement = this.renderNumberGroupField(field);
        break;
      case 'turnover-table':
        inputElement = this.renderTurnoverTableField(field);
        break;
      case 'ranking':
        inputElement = this.renderRankingField(field);
        break;
      default:
        inputElement = this.renderTextField(field);
    }

    fieldElement.appendChild(inputElement);

    // Error message container
    const errorContainer = document.createElement('p');
    errorContainer.className = 'field-error text-red-500 text-xs hidden';
    errorContainer.setAttribute('data-field-error', field.id);
    fieldElement.appendChild(errorContainer);

    // Store reference for later access
    this.fieldElements[field.id] = fieldElement;

    return fieldElement;
  }

  /**
   * Render text input field
   * @private
   * @param {Object} field - Field object
   * @returns {Element}
   */
  renderTextField(field) {
    const wrapper = document.createElement('div');

    // Label
    const label = document.createElement('label');
    label.className = 'block text-sm font-semibold text-slate-700 mb-1.5';
    label.htmlFor = field.id;
    label.textContent = field.label || '';
    if (field.required) {
      const span = document.createElement('span');
      span.className = 'text-red-500 ml-1';
      span.textContent = '*';
      label.appendChild(span);
    }
    wrapper.appendChild(label);

    // Input
    const input = document.createElement('input');
    input.type = 'text';
    input.id = field.id;
    input.name = field.id;
    input.className = 'w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none transition';
    input.placeholder = field.placeholder || '';
    if (field.maxLength) {
      input.maxLength = field.maxLength;
    }
    if (field.value) {
      input.value = field.value;
    }
    wrapper.appendChild(input);

    // Hint
    if (field.hint) {
      const hint = document.createElement('p');
      hint.className = 'text-gray-500 text-xs mt-1.5 italic';
      hint.textContent = field.hint;
      wrapper.appendChild(hint);
    }

    return wrapper;
  }

  /**
   * Render textarea field
   * @private
   * @param {Object} field - Field object
   * @returns {Element}
   */
  renderTextareaField(field) {
    const wrapper = document.createElement('div');

    // Label
    const label = document.createElement('label');
    label.className = 'block text-sm font-semibold text-slate-700 mb-1.5';
    label.htmlFor = field.id;
    label.textContent = field.label || '';
    if (field.required) {
      const span = document.createElement('span');
      span.className = 'text-red-500 ml-1';
      span.textContent = '*';
      label.appendChild(span);
    }
    wrapper.appendChild(label);

    // Textarea
    const textarea = document.createElement('textarea');
    textarea.id = field.id;
    textarea.name = field.id;
    textarea.className = 'w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none transition';
    textarea.placeholder = field.placeholder || '';
    textarea.rows = field.rows || 4;
    if (field.maxLength) {
      textarea.maxLength = field.maxLength;
    }
    if (field.value) {
      textarea.value = field.value;
    }
    wrapper.appendChild(textarea);

    // Hint
    if (field.hint) {
      const hint = document.createElement('p');
      hint.className = 'text-gray-500 text-xs mt-1.5 italic';
      hint.textContent = field.hint;
      wrapper.appendChild(hint);
    }

    return wrapper;
  }

  /**
   * Render number input field
   * @private
   * @param {Object} field - Field object
   * @returns {Element}
   */
  renderNumberField(field) {
    const wrapper = document.createElement('div');

    // Label
    const label = document.createElement('label');
    label.className = 'block text-sm font-semibold text-slate-700 mb-1.5';
    label.htmlFor = field.id;
    label.textContent = field.label || '';
    if (field.required) {
      const span = document.createElement('span');
      span.className = 'text-red-500 ml-1';
      span.textContent = '*';
      label.appendChild(span);
    }
    wrapper.appendChild(label);

    // Input
    const input = document.createElement('input');
    input.type = 'number';
    input.id = field.id;
    input.name = field.id;
    input.className = 'w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none transition';
    input.placeholder = field.placeholder || '';
    if (field.min !== undefined) {
      input.min = field.min;
    }
    if (field.max !== undefined) {
      input.max = field.max;
    }
    if (field.step) {
      input.step = field.step;
    }
    if (field.value !== undefined) {
      input.value = field.value;
    }
    wrapper.appendChild(input);

    // Hint
    if (field.hint) {
      const hint = document.createElement('p');
      hint.className = 'text-gray-500 text-xs mt-1.5 italic';
      hint.textContent = field.hint;
      wrapper.appendChild(hint);
    }

    return wrapper;
  }

  /**
   * Render select/dropdown field
   * @private
   * @param {Object} field - Field object
   * @returns {Element}
   */
  renderSelectField(field) {
    const wrapper = document.createElement('div');

    // Label
    const label = document.createElement('label');
    label.className = 'block text-sm font-semibold text-slate-700 mb-1.5';
    label.htmlFor = field.id;
    label.textContent = field.label || '';
    if (field.required) {
      const span = document.createElement('span');
      span.className = 'text-red-500 ml-1';
      span.textContent = '*';
      label.appendChild(span);
    }
    wrapper.appendChild(label);

    // Select
    const select = document.createElement('select');
    select.id = field.id;
    select.name = field.id;
    select.className = 'w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none transition';
    if (field.multiple) {
      select.multiple = true;
    }

    // Placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = field.placeholder || '-- เลือกตัวเลือก --';
    select.appendChild(placeholderOption);

    // Options
    if (field.options && Array.isArray(field.options)) {
      for (const option of field.options) {
        const optElement = document.createElement('option');
        optElement.value = option.value;
        optElement.textContent = option.label;
        if (option.selected) {
          optElement.selected = true;
        }
        select.appendChild(optElement);
      }
    }

    if (field.value) {
      select.value = field.value;
    }

    wrapper.appendChild(select);

    // Hint
    if (field.hint) {
      const hint = document.createElement('p');
      hint.className = 'text-gray-500 text-xs mt-1.5 italic';
      hint.textContent = field.hint;
      wrapper.appendChild(hint);
    }

    return wrapper;
  }

  /**
   * Render radio button group
   * @private
   * @param {Object} field - Field object
   * @returns {Element}
   */
  renderRadioField(field) {
    const wrapper = document.createElement('div');

    // Label
    const label = document.createElement('label');
    label.className = 'block text-sm font-semibold text-slate-700 mb-3';
    label.textContent = field.label || '';
    if (field.required) {
      const span = document.createElement('span');
      span.className = 'text-red-500 ml-1';
      span.textContent = '*';
      label.appendChild(span);
    }
    wrapper.appendChild(label);

    // Radio options
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'space-y-2';

    if (field.options && Array.isArray(field.options)) {
      for (const option of field.options) {
        const optionWrapper = document.createElement('div');
        optionWrapper.className = 'flex items-center';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = `${field.id}_${option.value}`;
        radio.name = field.id;
        radio.value = option.value;
        radio.className = 'w-4 h-4 text-primary focus:ring-2 focus:ring-primary';
        if (option.selected) {
          radio.checked = true;
        }
        optionWrapper.appendChild(radio);

        const optionLabel = document.createElement('label');
        optionLabel.htmlFor = `${field.id}_${option.value}`;
        optionLabel.className = 'ml-2 text-sm text-slate-700 cursor-pointer';
        optionLabel.textContent = option.label;
        optionWrapper.appendChild(optionLabel);

        optionsContainer.appendChild(optionWrapper);
      }
    }

    wrapper.appendChild(optionsContainer);

    // Hint
    if (field.hint) {
      const hint = document.createElement('p');
      hint.className = 'text-gray-500 text-xs mt-2 italic';
      hint.textContent = field.hint;
      wrapper.appendChild(hint);
    }

    return wrapper;
  }

  /**
   * Render checkbox group
   * @private
   * @param {Object} field - Field object
   * @returns {Element}
   */
  renderCheckboxField(field) {
    const wrapper = document.createElement('div');

    // Label
    const label = document.createElement('label');
    label.className = 'block text-sm font-semibold text-slate-700 mb-3';
    label.textContent = field.label || '';
    if (field.required) {
      const span = document.createElement('span');
      span.className = 'text-red-500 ml-1';
      span.textContent = '*';
      label.appendChild(span);
    }
    wrapper.appendChild(label);

    // Checkbox options
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'space-y-2';

    if (field.options && Array.isArray(field.options)) {
      for (const option of field.options) {
        const optionWrapper = document.createElement('div');
        optionWrapper.className = 'flex items-center';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${field.id}_${option.value}`;
        checkbox.name = field.id;
        checkbox.value = option.value;
        checkbox.className = 'w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary';
        if (option.selected) {
          checkbox.checked = true;
        }
        optionWrapper.appendChild(checkbox);

        const optionLabel = document.createElement('label');
        optionLabel.htmlFor = `${field.id}_${option.value}`;
        optionLabel.className = 'ml-2 text-sm text-slate-700 cursor-pointer';
        optionLabel.textContent = option.label;
        optionWrapper.appendChild(optionLabel);

        optionsContainer.appendChild(optionWrapper);
      }
    }

    wrapper.appendChild(optionsContainer);

    // Hint
    if (field.hint) {
      const hint = document.createElement('p');
      hint.className = 'text-gray-500 text-xs mt-2 italic';
      hint.textContent = field.hint;
      wrapper.appendChild(hint);
    }

    return wrapper;
  }

  /**
   * Render file upload field
   * @private
   * @param {Object} field - Field object
   * @returns {Element}
   */
  renderFileUploadField(field) {
    const wrapper = document.createElement('div');

    // Label
    const label = document.createElement('label');
    label.className = 'block text-sm font-semibold text-slate-700 mb-1.5';
    label.htmlFor = field.id;
    label.textContent = field.label || '';
    if (field.required) {
      const span = document.createElement('span');
      span.className = 'text-red-500 ml-1';
      span.textContent = '*';
      label.appendChild(span);
    }
    wrapper.appendChild(label);

    // File input
    const input = document.createElement('input');
    input.type = 'file';
    input.id = field.id;
    input.name = field.id;
    input.className = 'w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none transition';
    input.accept = field.accept || 'application/pdf';
    if (field.multiple) {
      input.multiple = true;
    }
    wrapper.appendChild(input);

    // File restrictions info
    if (field.fileRestrictions) {
      const restrictionsText = document.createElement('p');
      restrictionsText.className = 'text-gray-500 text-xs mt-1.5';
      restrictionsText.textContent = `ขนาดไฟล์สูงสุด: ${field.fileRestrictions.maxSizeMB}MB | ประเภท: ${field.accept || 'PDF'}`;
      wrapper.appendChild(restrictionsText);
    }

    // Hint
    if (field.hint) {
      const hint = document.createElement('p');
      hint.className = 'text-gray-500 text-xs mt-1.5 italic';
      hint.textContent = field.hint;
      wrapper.appendChild(hint);
    }

    return wrapper;
  }

  /**
   * Render number-group field (grid of related numbers)
   * @private
   * @param {Object} field - Field object
   * @returns {Element}
   */
  renderNumberGroupField(field) {
    const wrapper = document.createElement('div');

    // Label
    const label = document.createElement('label');
    label.className = 'block text-sm font-semibold text-slate-700 mb-3';
    label.textContent = field.label || '';
    if (field.required) {
      const span = document.createElement('span');
      span.className = 'text-red-500 ml-1';
      span.textContent = '*';
      label.appendChild(span);
    }
    wrapper.appendChild(label);

    // Table structure
    const table = document.createElement('table');
    table.className = 'w-full border border-slate-300';
    table.setAttribute('data-field-id', field.id);

    // Header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-slate-100';

    if (field.columns && Array.isArray(field.columns)) {
      // Empty cell for row labels
      const headerCell = document.createElement('th');
      headerCell.className = 'border border-slate-300 px-3 py-2 text-left text-sm font-semibold';
      headerCell.textContent = 'ประเภท';
      headerRow.appendChild(headerCell);

      // Column headers
      for (const col of field.columns) {
        const cell = document.createElement('th');
        cell.className = 'border border-slate-300 px-3 py-2 text-center text-sm font-semibold';
        cell.textContent = col;
        headerRow.appendChild(cell);
      }
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Data rows
    const tbody = document.createElement('tbody');
    if (field.rows && Array.isArray(field.rows)) {
      for (const row of field.rows) {
        const tr = document.createElement('tr');

        // Row label
        const labelCell = document.createElement('td');
        labelCell.className = 'border border-slate-300 px-3 py-2 text-sm font-medium bg-slate-50';
        labelCell.textContent = row;
        tr.appendChild(labelCell);

        // Input cells
        for (let i = 0; i < (field.columns?.length || 0); i++) {
          const cell = document.createElement('td');
          cell.className = 'border border-slate-300 p-2';

          const input = document.createElement('input');
          input.type = 'number';
          input.name = `${field.id}_${row}_${i}`;
          input.className = 'w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary';
          input.min = '0';

          cell.appendChild(input);
          tr.appendChild(cell);
        }

        tbody.appendChild(tr);
      }
    }
    table.appendChild(tbody);
    wrapper.appendChild(table);

    return wrapper;
  }

  /**
   * Render turnover table field
   * @private
   * @param {Object} field - Field object
   * @returns {Element}
   */
  renderTurnoverTableField(field) {
    const wrapper = document.createElement('div');

    // Label
    const label = document.createElement('label');
    label.className = 'block text-sm font-semibold text-slate-700 mb-3';
    label.textContent = field.label || '';
    if (field.required) {
      const span = document.createElement('span');
      span.className = 'text-red-500 ml-1';
      span.textContent = '*';
      label.appendChild(span);
    }
    wrapper.appendChild(label);

    // Table
    const table = document.createElement('table');
    table.className = 'w-full border border-slate-300';
    table.setAttribute('data-field-id', field.id);

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-slate-100';

    const headerLabel = document.createElement('th');
    headerLabel.className = 'border border-slate-300 px-3 py-2 text-left text-sm font-semibold';
    headerLabel.textContent = 'ปี';
    headerRow.appendChild(headerLabel);

    for (let i = 1; i <= 5; i++) {
      const cell = document.createElement('th');
      cell.className = 'border border-slate-300 px-3 py-2 text-center text-sm font-semibold';
      cell.textContent = `ปี ${i}`;
      headerRow.appendChild(cell);
    }

    // Total column header
    const totalHeader = document.createElement('th');
    totalHeader.className = 'border border-slate-300 px-3 py-2 text-center text-sm font-semibold bg-green-100';
    totalHeader.textContent = 'รวม';
    headerRow.appendChild(totalHeader);

    // Turnover rate header
    const rateHeader = document.createElement('th');
    rateHeader.className = 'border border-slate-300 px-3 py-2 text-center text-sm font-semibold bg-blue-100';
    rateHeader.textContent = 'อัตรา (%)';
    headerRow.appendChild(rateHeader);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Data rows
    const tbody = document.createElement('tbody');
    const yearRow = document.createElement('tr');

    const yearLabel = document.createElement('td');
    yearLabel.className = 'border border-slate-300 px-3 py-2 font-medium bg-slate-50';
    yearLabel.textContent = 'จำนวนที่ออก';
    yearRow.appendChild(yearLabel);

    // Year input cells
    for (let i = 1; i <= 5; i++) {
      const cell = document.createElement('td');
      cell.className = 'border border-slate-300 p-2';

      const input = document.createElement('input');
      input.type = 'number';
      input.name = `${field.id}_year${i}`;
      input.className = 'w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary';
      input.min = '0';

      cell.appendChild(input);
      yearRow.appendChild(cell);
    }

    // Total cell
    const totalCell = document.createElement('td');
    totalCell.className = 'border border-slate-300 px-3 py-2 text-center font-medium bg-green-50';
    totalCell.textContent = '0';
    totalCell.setAttribute('data-total-cell', field.id);
    yearRow.appendChild(totalCell);

    // Rate cell
    const rateCell = document.createElement('td');
    rateCell.className = 'border border-slate-300 px-3 py-2 text-center font-medium bg-blue-50';
    rateCell.textContent = '0.00';
    rateCell.setAttribute('data-rate-cell', field.id);
    yearRow.appendChild(rateCell);

    tbody.appendChild(yearRow);
    table.appendChild(tbody);

    wrapper.appendChild(table);

    // Note about calculation
    const note = document.createElement('p');
    note.className = 'text-gray-500 text-xs mt-2 italic';
    note.textContent = 'อัตราการออกจะคำนวณโดยอัตโนมัติ';
    wrapper.appendChild(note);

    return wrapper;
  }

  /**
   * Render ranking field
   * @private
   * @param {Object} field - Field object
   * @returns {Element}
   */
  renderRankingField(field) {
    const wrapper = document.createElement('div');

    // Label
    const label = document.createElement('label');
    label.className = 'block text-sm font-semibold text-slate-700 mb-3';
    label.textContent = field.label || '';
    if (field.required) {
      const span = document.createElement('span');
      span.className = 'text-red-500 ml-1';
      span.textContent = '*';
      label.appendChild(span);
    }
    wrapper.appendChild(label);

    // Instructions
    const instructions = document.createElement('p');
    instructions.className = 'text-sm text-slate-600 mb-3 italic';
    instructions.textContent = `เลือกไม่เกิน ${field.maxSelections || 3} รายการและจัดลำดับ`;
    wrapper.appendChild(instructions);

    // Available options list
    const availableContainer = document.createElement('div');
    availableContainer.className = 'p-3 bg-slate-100 rounded-lg mb-3';
    availableContainer.setAttribute('data-ranking-source', field.id);

    if (field.options && Array.isArray(field.options)) {
      for (const option of field.options) {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'p-2 m-1 bg-white border-2 border-slate-300 rounded cursor-move inline-block hover:bg-blue-50 transition';
        optionDiv.draggable = true;
        optionDiv.setAttribute('data-rank-option', option.value);
        optionDiv.textContent = option.label;
        availableContainer.appendChild(optionDiv);
      }
    }

    wrapper.appendChild(availableContainer);

    // Selected ranking area
    const rankingContainer = document.createElement('div');
    rankingContainer.className = 'p-3 border-2 border-dashed border-slate-400 rounded-lg min-h-32 bg-slate-50';
    rankingContainer.setAttribute('data-ranking-target', field.id);

    const rankingLabel = document.createElement('p');
    rankingLabel.className = 'text-sm font-semibold text-slate-700 mb-2';
    rankingLabel.textContent = 'ลำดับความสำคัญ (ลากมาวางที่นี่):';
    rankingContainer.appendChild(rankingLabel);

    wrapper.appendChild(rankingContainer);

    // Hidden input to store ranking data
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.id = field.id;
    hiddenInput.name = field.id;
    wrapper.appendChild(hiddenInput);

    return wrapper;
  }

  /**
   * Validate a single field
   * @param {string} fieldId - ID of field to validate
   * @returns {boolean} True if valid
   */
  validateField(fieldId) {
    const fieldElement = this.fieldElements[fieldId];
    if (!fieldElement) {
      return false;
    }

    const errorContainer = fieldElement.querySelector(`[data-field-error="${fieldId}"]`);
    const input = fieldElement.querySelector('input, textarea, select');

    if (!input) {
      return true;
    }

    // Basic validation logic
    const value = input.value?.trim();
    const isRequired = input.required || input.parentElement?.textContent.includes('*');

    if (isRequired && !value) {
      if (errorContainer) {
        errorContainer.textContent = 'This field is required';
        errorContainer.classList.remove('hidden');
      }
      return false;
    }

    if (errorContainer) {
      errorContainer.classList.add('hidden');
    }
    return true;
  }

  /**
   * Validate all fields in current step
   * @returns {boolean} True if all valid
   */
  validateAll() {
    let isValid = true;

    for (const fieldId in this.fieldElements) {
      if (!this.validateField(fieldId)) {
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Collect all form data from current step
   * @returns {Object} Form data object
   */
  collectFormData() {
    const data = {};

    const inputs = this.container.querySelectorAll('input, textarea, select');
    for (const input of inputs) {
      if (input.type === 'checkbox') {
        if (!data[input.name]) {
          data[input.name] = [];
        }
        if (input.checked) {
          data[input.name].push(input.value);
        }
      } else if (input.type === 'radio') {
        if (input.checked) {
          data[input.name] = input.value;
        }
      } else if (input.type === 'file') {
        data[input.name] = input.files[0] || null;
      } else if (input.type === 'hidden') {
        // Skip hidden inputs for ranking
        continue;
      } else {
        data[input.name] = input.value;
      }
    }

    return data;
  }

  /**
   * Set form data to pre-fill fields
   * @param {Object} data - Data object to populate
   */
  setFormData(data) {
    for (const [key, value] of Object.entries(data)) {
      const input = this.container.querySelector(`[name="${key}"]`);
      if (!input) continue;

      if (input.type === 'checkbox') {
        if (Array.isArray(value)) {
          input.checked = value.includes(input.value);
        }
      } else if (input.type === 'radio') {
        input.checked = input.value === value;
      } else if (input.type === 'file') {
        // Skip file inputs for security
        continue;
      } else {
        input.value = value || '';
      }
    }
  }

  /**
   * Reset form fields
   */
  resetForm() {
    this.container.querySelectorAll('input, textarea, select').forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
  }

  /**
   * Get current step number
   * @returns {number}
   */
  getCurrentStep() {
    return this.currentStep;
  }
}

// Export for use in modules and browsers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormRenderer;
}
