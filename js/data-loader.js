/**
 * DataLoader Class
 * Manages centralized loading of questions, organizations, and configuration
 * from JSON data files
 */
class DataLoader {
  constructor(baseUrl = '/data/') {
    this.baseUrl = baseUrl;
    this.cache = {
      questions: null,
      organizations: null,
      config: null
    };
    this.loading = {
      questions: false,
      organizations: false,
      config: false
    };
  }

  /**
   * Load questions from questions-ch1.json
   * @returns {Promise<Object>} Questions data object
   */
  async loadQuestions() {
    if (this.cache.questions) {
      return this.cache.questions;
    }

    if (this.loading.questions) {
      // Wait for ongoing request
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.cache.questions) {
            clearInterval(checkInterval);
            resolve(this.cache.questions);
          }
        }, 100);
      });
    }

    this.loading.questions = true;
    try {
      const response = await fetch(`${this.baseUrl}questions-ch1.json`);
      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.status}`);
      }
      const data = await response.json();
      this.cache.questions = data;
      return data;
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
    } finally {
      this.loading.questions = false;
    }
  }

  /**
   * Load organizations from organizations.json
   * @returns {Promise<Object>} Organizations data object
   */
  async loadOrganizations() {
    if (this.cache.organizations) {
      return this.cache.organizations;
    }

    if (this.loading.organizations) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.cache.organizations) {
            clearInterval(checkInterval);
            resolve(this.cache.organizations);
          }
        }, 100);
      });
    }

    this.loading.organizations = true;
    try {
      const response = await fetch(`${this.baseUrl}organizations.json`);
      if (!response.ok) {
        throw new Error(`Failed to load organizations: ${response.status}`);
      }
      const data = await response.json();
      this.cache.organizations = data;
      return data;
    } catch (error) {
      console.error('Error loading organizations:', error);
      throw error;
    } finally {
      this.loading.organizations = false;
    }
  }

  /**
   * Load form configuration from form-config.json
   * @returns {Promise<Object>} Configuration data object
   */
  async loadConfig() {
    if (this.cache.config) {
      return this.cache.config;
    }

    if (this.loading.config) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.cache.config) {
            clearInterval(checkInterval);
            resolve(this.cache.config);
          }
        }, 100);
      });
    }

    this.loading.config = true;
    try {
      const response = await fetch(`${this.baseUrl}form-config.json`);
      if (!response.ok) {
        throw new Error(`Failed to load configuration: ${response.status}`);
      }
      const data = await response.json();
      this.cache.config = data;
      return data;
    } catch (error) {
      console.error('Error loading configuration:', error);
      throw error;
    } finally {
      this.loading.config = false;
    }
  }

  /**
   * Load all data at once
   * @returns {Promise<Object>} Object containing all loaded data
   */
  async loadAll() {
    try {
      const [questions, organizations, config] = await Promise.all([
        this.loadQuestions(),
        this.loadOrganizations(),
        this.loadConfig()
      ]);

      return {
        questions,
        organizations,
        config
      };
    } catch (error) {
      console.error('Error loading all data:', error);
      throw error;
    }
  }

  /**
   * Get a specific question by ID
   * @param {string} questionId - ID of the question
   * @returns {Promise<Object|null>} Question object or null
   */
  async getQuestion(questionId) {
    const questions = await this.loadQuestions();
    if (!questions || !questions.questions) {
      return null;
    }

    // Search through all steps and sections
    for (const step of questions.questions) {
      if (step.sections) {
        for (const section of step.sections) {
          if (section.fields) {
            const field = section.fields.find(f => f.id === questionId);
            if (field) {
              return field;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Get all questions from a specific step
   * @param {number} stepNumber - Step number (1-5)
   * @returns {Promise<Array>} Array of field objects
   */
  async getStepFields(stepNumber) {
    const questions = await this.loadQuestions();
    if (!questions || !questions.questions) {
      return [];
    }

    const step = questions.questions.find(s => s.step === stepNumber);
    if (!step || !step.sections) {
      return [];
    }

    const fields = [];
    for (const section of step.sections) {
      if (section.fields) {
        fields.push(...section.fields);
      }
    }

    return fields;
  }

  /**
   * Get a specific organization by ID
   * @param {string} orgId - Organization ID
   * @returns {Promise<Object|null>} Organization object or null
   */
  async getOrganization(orgId) {
    const data = await this.loadOrganizations();
    if (!data || !data.organizations) {
      return null;
    }

    return data.organizations.find(org => org.id === orgId) || null;
  }

  /**
   * Get all organizations
   * @returns {Promise<Array>} Array of organization objects
   */
  async getAllOrganizations() {
    const data = await this.loadOrganizations();
    if (!data || !data.organizations) {
      return [];
    }

    return data.organizations;
  }

  /**
   * Get configuration section
   * @param {string} sectionKey - Key of the configuration section
   * @returns {Promise<Object|null>} Configuration section or null
   */
  async getConfigSection(sectionKey) {
    const config = await this.loadConfig();
    return config[sectionKey] || null;
  }

  /**
   * Clear cached data
   * @param {string} [type] - Type to clear ('questions', 'organizations', 'config', or null for all)
   */
  clearCache(type = null) {
    if (type) {
      this.cache[type] = null;
    } else {
      this.cache = {
        questions: null,
        organizations: null,
        config: null
      };
    }
  }

  /**
   * Check if data is cached
   * @param {string} type - Type to check
   * @returns {boolean}
   */
  isCached(type) {
    return this.cache[type] !== null;
  }

  /**
   * Get cache status
   * @returns {Object} Cache status object
   */
  getCacheStatus() {
    return {
      questions: this.isCached('questions'),
      organizations: this.isCached('organizations'),
      config: this.isCached('config')
    };
  }
}

// Export for use in modules and browsers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
}
