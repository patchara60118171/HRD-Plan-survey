// ========================================
// Lazy Loading Module
// ========================================

const LazyLoader = {
    loadedModules: new Set(),
    loadingPromises: new Map(),

    /**
     * Load JavaScript module dynamically
     */
    async loadScript(src) {
        if (this.loadedModules.has(src)) {
            return Promise.resolve();
        }

        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => {
                this.loadedModules.add(src);
                this.loadingPromises.delete(src);
                resolve();
            };
            
            script.onerror = () => {
                this.loadingPromises.delete(src);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });

        this.loadingPromises.set(src, promise);
        return promise;
    },

    /**
     * Load CSS dynamically
     */
    async loadCSS(href) {
        if (this.loadedModules.has(href)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            link.onload = () => {
                this.loadedModules.add(href);
                resolve();
            };
            
            link.onerror = () => {
                reject(new Error(`Failed to load CSS: ${href}`));
            };

            document.head.appendChild(link);
        });
    },

    /**
     * Load component when it enters viewport
     */
    observeComponent(element, loader) {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            loader();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loader();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(element);
    },

    /**
     * Preload critical resources
     */
    preloadCritical() {
        const criticalResources = [
            'js/config.js',
            'js/supabase-config.js',
            'css/styles.css'
        ];

        criticalResources.forEach(resource => {
            if (resource.endsWith('.js')) {
                this.loadScript(resource);
            } else if (resource.endsWith('.css')) {
                this.loadCSS(resource);
            }
        });
    },

    /**
     * Load admin dashboard components
     */
    async loadAdminComponents() {
        const components = [
            'js/modules/storage.js',
            'js/modules/validation.js'
        ];

        await Promise.all(components.map(component => this.loadScript(component)));
    },

    /**
     * Load survey form components
     */
    async loadSurveyComponents() {
        const components = [
            'js/ch1-form.js',
            'js/modules/storage.js',
            'js/modules/validation.js',
            'js/modules/sanitizer.js'
        ];

        await Promise.all(components.map(component => this.loadScript(component)));
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}
