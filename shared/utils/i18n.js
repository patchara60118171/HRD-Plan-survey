// ========================================
// Internationalization (i18n) System
// ========================================

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('wellbeing_survey_lang') || 'th';
        this.translations = {};
        this.fallbackLang = 'th';
    }

    async init() {
        try {
            // Load translations for current language
            await this.loadLanguage(this.currentLang);
            
            // Set HTML lang attribute
            document.documentElement.lang = this.currentLang;
            
            // Apply translations to DOM
            this.translateDOM();
            
            console.log(`i18n initialized with language: ${this.currentLang}`);
        } catch (error) {
            console.error('Failed to initialize i18n:', error);
            // Fallback to Thai
            this.currentLang = 'th';
            await this.loadLanguage(this.currentLang);
        }
    }

    async loadLanguage(lang) {
        if (!this.translations[lang]) {
            try {
                const response = await fetch(`js/locales/${lang}.json`);
                if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
                this.translations[lang] = await response.json();
            } catch (error) {
                console.error(`Failed to load language ${lang}:`, error);
                // Try fallback language
                if (lang !== this.fallbackLang) {
                    await this.loadLanguage(this.fallbackLang);
                    this.currentLang = this.fallbackLang;
                }
                return;
            }
        }
    }

    async setLanguage(lang) {
        if (lang === this.currentLang) return;
        
        await this.loadLanguage(lang);
        this.currentLang = lang;
        localStorage.setItem('wellbeing_survey_lang', lang);
        document.documentElement.lang = lang;
        
        // Re-translate the entire page
        this.translateDOM();
        
        // Update language switcher
        this.updateLanguageSwitcher();
        
        // Re-render current view if app is available
        if (window.app && window.app.currentView) {
            switch (window.app.currentView) {
                case 'welcome':
                    window.app.renderWelcome();
                    break;
                case 'survey':
                    window.app.renderSurvey();
                    break;
                case 'results':
                    window.app.renderResults();
                    break;
                case 'history':
                    window.app.viewHistory();
                    break;
            }
        }
        
        // Show success message
        if (window.showToast) {
            const langName = this.t('language.name');
            window.showToast(this.t('language.changed', { lang: langName }), 'success');
        }
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                // Try fallback language
                let fallback = this.translations[this.fallbackLang];
                for (const fk of keys) {
                    if (fallback && fallback[fk]) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key if not found
                    }
                }
                translation = fallback;
                break;
            }
        }
        
        if (typeof translation === 'string') {
            // Replace parameters
            return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
                return params[param] || match;
            });
        }
        
        return translation || key;
    }

    translateDOM() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'submit' || element.type === 'button') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });

        // Translate elements with data-i18n-attr attribute
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attrConfig = element.getAttribute('data-i18n-attr');
            const [attr, key] = attrConfig.split(':');
            element.setAttribute(attr, this.t(key));
        });
    }

    updateLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        if (switcher) {
            switcher.innerHTML = this.renderLanguageSwitcher();
        }
    }

    renderLanguageSwitcher() {
        const languages = [
            { code: 'th', name: 'ไทย', flag: '🇹🇭' },
            { code: 'en', name: 'English', flag: '🇺🇸' }
        ];

        return `
            <div class="language-switcher">
                <button class="language-btn" onclick="i18n.toggleLanguageMenu()">
                    ${languages.find(lang => lang.code === this.currentLang)?.flag || '🌐'} 
                    ${languages.find(lang => lang.code === this.currentLang)?.name || 'Language'}
                    <span class="arrow">▼</span>
                </button>
                <div class="language-menu" id="language-menu" style="display: none;">
                    ${languages.map(lang => `
                        <button class="language-option ${lang.code === this.currentLang ? 'active' : ''}" 
                                onclick="i18n.setLanguage('${lang.code}')">
                            <span class="flag">${lang.flag}</span>
                            <span class="name">${lang.name}</span>
                            ${lang.code === this.currentLang ? '<span class="check">✓</span>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    toggleLanguageMenu() {
        const menu = document.getElementById('language-menu');
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// Global i18n instance
const i18n = new I18n();

// Close language menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.language-switcher')) {
        const menu = document.getElementById('language-menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }
});
