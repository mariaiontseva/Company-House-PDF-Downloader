/**
 * Dual Routing Support for DocSpace.uk
 * Handles both hash-based (#company/123) and clean URLs (/company/123)
 * Ensures backward compatibility during SEO transition
 */

class DualRouter {
    constructor() {
        this.isCleanUrlEnabled = false; // Start with hash URLs
        this.init();
    }

    init() {
        // Check if we're on a clean URL
        this.checkCleanUrl();
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => this.handlePopState());
        
        // Handle hash changes (existing functionality)
        window.addEventListener('hashchange', () => this.handleHashChange());
    }

    /**
     * Check if current URL is a clean URL and convert to hash if needed
     */
    checkCleanUrl() {
        const path = window.location.pathname;
        
        // Check for company URLs
        if (path.match(/^\/company\/([A-Z0-9]+)$/i)) {
            const companyNumber = path.split('/company/')[1];
            console.log('🔍 Clean URL detected, company:', companyNumber);
            
            // Convert to hash URL for now (until fully migrated)
            if (!this.isCleanUrlEnabled) {
                window.location.replace(`/#company/${companyNumber}`);
                return;
            }
            
            // If clean URLs enabled, trigger company load
            this.loadCompany(companyNumber);
        }
        
        // Check for category URLs
        const categoryPatterns = {
            '/oldest-companies': 'oldest',
            '/newest-companies': 'newest',
            '/royal-charter-companies': 'royal-charter',
            '/plc-companies': 'plc'
        };
        
        if (categoryPatterns[path]) {
            console.log('🔍 Category URL detected:', categoryPatterns[path]);
            // Handle category page load
            this.loadCategory(categoryPatterns[path]);
        }
    }

    /**
     * Handle browser navigation
     */
    handlePopState() {
        this.checkCleanUrl();
    }

    /**
     * Handle hash changes (existing functionality)
     */
    handleHashChange() {
        // This will be handled by existing handleCompanyHash function
        // Wait for function to be available
        if (typeof handleCompanyHash === 'function') {
            handleCompanyHash();
        } else {
            // Try again after DOM is loaded
            setTimeout(() => {
                if (typeof handleCompanyHash === 'function') {
                    handleCompanyHash();
                }
            }, 100);
        }
    }

    /**
     * Load company (can be called from either URL type)
     */
    loadCompany(companyNumber) {
        // Update SEO meta tags
        if (window.seoManager) {
            // This would need company data, so we'd fetch it first
            console.log('🔍 Would update SEO for company:', companyNumber);
        }
        
        // Trigger existing modal system
        if (typeof handleCompanyHash === 'function') {
            window.location.hash = `#company/${companyNumber}`;
        }
    }

    /**
     * Load category page
     */
    loadCategory(category) {
        // Update SEO meta tags
        if (window.seoManager) {
            window.seoManager.updateCategoryMeta(category);
        }
        
        // Update UI to show category
        console.log('🔍 Loading category:', category);
        // Implementation depends on your category display logic
    }

    /**
     * Get the appropriate URL based on current mode
     */
    getCompanyUrl(companyNumber) {
        if (this.isCleanUrlEnabled) {
            return `/company/${companyNumber}`;
        }
        return `/#company/${companyNumber}`;
    }

    /**
     * Update all company links on the page
     */
    updateAllLinks() {
        const companyLinks = document.querySelectorAll('a[href*="#company/"]');
        companyLinks.forEach(link => {
            const match = link.href.match(/#company\/([A-Z0-9]+)/i);
            if (match) {
                const companyNumber = match[1];
                link.href = this.getCompanyUrl(companyNumber);
            }
        });
    }

    /**
     * Enable clean URLs (for testing)
     */
    enableCleanUrls() {
        this.isCleanUrlEnabled = true;
        this.updateAllLinks();
        console.log('✅ Clean URLs enabled');
    }

    /**
     * Disable clean URLs (fallback to hash)
     */
    disableCleanUrls() {
        this.isCleanUrlEnabled = false;
        this.updateAllLinks();
        console.log('✅ Hash URLs enabled');
    }
}

// Initialize router
window.dualRouter = new DualRouter();

// Add helper function for testing
window.toggleCleanUrls = function() {
    if (window.dualRouter.isCleanUrlEnabled) {
        window.dualRouter.disableCleanUrls();
    } else {
        window.dualRouter.enableCleanUrls();
    }
    return window.dualRouter.isCleanUrlEnabled;
};