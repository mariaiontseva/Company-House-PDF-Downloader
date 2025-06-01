/**
 * SEO Meta Manager for DocSpace.uk
 * Handles dynamic meta tags, structured data, and URL management
 */

class SEOMetaManager {
    constructor() {
        this.defaultMeta = {
            title: "Companies House Bulk Download - Get All PDFs for £5 | DocSpace",
            description: "Download all Companies House documents instantly. Get every PDF filing for any UK company in one ZIP file. Official API, secure payment, £5 per company.",
            keywords: "companies house documents, uk company filings, download company documents",
            image: "https://docspace.uk/og-image.png"
        };
    }

    /**
     * Update page meta tags for a specific company
     */
    updateCompanyMeta(companyData) {
        const companyName = companyData.company_name || companyData.name || 'Unknown Company';
        const companyNumber = companyData.company_number || companyData.number || '';
        const status = companyData.company_status || companyData.status || 'Unknown';
        
        // Calculate age for SEO
        let ageText = '';
        if (companyData.date_of_creation || companyData.incorporationDate) {
            const incorporationDate = new Date(companyData.date_of_creation || companyData.incorporationDate);
            const age = Math.floor((new Date() - incorporationDate) / (365.25 * 24 * 60 * 60 * 1000));
            ageText = age > 0 ? `${age} years in business, ` : '';
        }

        const title = `${companyName} (${companyNumber}) - Complete Company Documents | DocSpace`;
        const description = `Download all ${companyName} documents from Companies House. ${ageText}${status} status, complete filing history available for £5.`;
        const keywords = `${companyName}, company documents, Companies House, ${companyNumber}, UK company filings, ${companyName} directors, ${companyName} accounts`;
        const url = `https://docspace.uk/company/${companyNumber}`;

        // Update meta tags
        this.setMetaTag('title', title);
        this.setMetaTag('description', description);
        this.setMetaTag('keywords', keywords);
        
        // Open Graph
        this.setMetaTag('og:title', title);
        this.setMetaTag('og:description', description);
        this.setMetaTag('og:url', url);
        this.setMetaTag('og:image', `https://docspace.uk/og-images/company-${companyNumber}.png`);
        this.setMetaTag('og:type', 'website');
        
        // Twitter
        this.setMetaTag('twitter:title', title);
        this.setMetaTag('twitter:description', description);
        this.setMetaTag('twitter:card', 'summary_large_image');
        this.setMetaTag('twitter:image', `https://docspace.uk/og-images/company-${companyNumber}.png`);

        // Update page title
        document.title = title;

        // Update canonical URL
        this.setCanonicalUrl(url);

        // Add structured data
        this.addCompanyStructuredData(companyData);

        // Update URL without page reload
        this.updateUrl(`/company/${companyNumber}`, title);
    }

    /**
     * Update meta tags for category pages
     */
    updateCategoryMeta(category) {
        const categoryMeta = {
            'oldest': {
                title: 'Oldest UK Companies - Royal Charter Companies Since 1327 | DocSpace',
                description: 'Explore the oldest companies in the UK, including Royal Charter companies from 1327. Download complete historical documents and filings.',
                keywords: 'oldest UK companies, Royal Charter companies, historical companies, ancient corporations'
            },
            'newest': {
                title: 'Newest UK Companies - Recently Incorporated Businesses | DocSpace',
                description: 'Browse the newest companies incorporated in the UK. Access complete documentation for recently registered businesses.',
                keywords: 'newest UK companies, new businesses, recent incorporations, startup companies'
            },
            'royal-charter': {
                title: 'Royal Charter Companies - Ancient UK Corporations Since 1327 | DocSpace',
                description: 'Complete list of Royal Charter companies in the UK. Download documents for these historic corporations, some dating back to 1327.',
                keywords: 'Royal Charter companies, ancient corporations, historic companies, medieval businesses'
            },
            'plc': {
                title: 'Public Limited Companies (PLC) - Download Company Documents | DocSpace',
                description: 'Browse all UK Public Limited Companies (PLCs). Download complete documentation including accounts, returns, and filings.',
                keywords: 'PLC companies, public limited companies, UK corporations, listed companies'
            }
        };

        const meta = categoryMeta[category] || this.defaultMeta;
        this.setBasicMeta(meta);
    }

    /**
     * Set basic meta tags
     */
    setBasicMeta(meta) {
        this.setMetaTag('title', meta.title);
        this.setMetaTag('description', meta.description);
        this.setMetaTag('keywords', meta.keywords);
        
        this.setMetaTag('og:title', meta.title);
        this.setMetaTag('og:description', meta.description);
        this.setMetaTag('og:image', meta.image);
        
        document.title = meta.title;
    }

    /**
     * Set individual meta tag
     */
    setMetaTag(name, content) {
        // Handle different meta tag types
        let selector;
        if (name === 'title') {
            document.title = content;
            return;
        } else if (name.startsWith('og:') || name.startsWith('twitter:')) {
            selector = `meta[property="${name}"]`;
        } else {
            selector = `meta[name="${name}"]`;
        }

        let meta = document.querySelector(selector);
        if (!meta) {
            meta = document.createElement('meta');
            if (name.startsWith('og:') || name.startsWith('twitter:')) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    /**
     * Set canonical URL
     */
    setCanonicalUrl(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);
    }

    /**
     * Update URL using History API
     */
    updateUrl(path, title) {
        if (window.history && window.history.pushState) {
            window.history.pushState({}, title, path);
        }
    }

    /**
     * Add structured data for company
     */
    addCompanyStructuredData(companyData) {
        const existingSchema = document.getElementById('company-schema');
        if (existingSchema) {
            existingSchema.remove();
        }

        const schema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": companyData.company_name || companyData.name,
            "identifier": companyData.company_number || companyData.number,
            "url": `https://docspace.uk/company/${companyData.company_number || companyData.number}`,
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "GB"
            }
        };

        // Add incorporation date if available
        if (companyData.date_of_creation || companyData.incorporationDate) {
            schema.foundingDate = companyData.date_of_creation || companyData.incorporationDate;
        }

        // Add address details if available
        if (companyData.registered_office_address) {
            const address = companyData.registered_office_address;
            schema.address = {
                "@type": "PostalAddress",
                "streetAddress": [address.address_line_1, address.address_line_2].filter(Boolean).join(', '),
                "addressLocality": address.locality,
                "addressRegion": address.region,
                "postalCode": address.postal_code,
                "addressCountry": "GB"
            };
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'company-schema';
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
    }

    /**
     * Generate sitemap for companies
     */
    generateSitemap(companies) {
        const sitemap = companies.map(company => {
            const companyNumber = company.number || company.company_number;
            return `https://docspace.uk/company/${companyNumber}`;
        });
        
        console.log('Generated sitemap URLs:', sitemap.length);
        return sitemap;
    }

    /**
     * Handle browser back/forward buttons
     */
    handlePopState() {
        window.addEventListener('popstate', (event) => {
            const path = window.location.pathname;
            if (path.startsWith('/company/')) {
                const companyNumber = path.split('/company/')[1];
                // Trigger company modal open
                window.location.hash = `#company/${companyNumber}`;
            }
        });
    }

    /**
     * Initialize URL routing from query parameters
     */
    initializeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const company = urlParams.get('company');
        const category = urlParams.get('category');
        const industry = urlParams.get('industry');
        const location = urlParams.get('location');

        if (company) {
            // Trigger company modal
            setTimeout(() => {
                window.location.hash = `#company/${company}`;
            }, 100);
        } else if (category) {
            this.updateCategoryMeta(category);
        }
    }
}

// Initialize SEO manager
const seoManager = new SEOMetaManager();

// Export for global use
window.seoManager = seoManager;

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    seoManager.initializeFromURL();
    seoManager.handlePopState();
});

export default SEOMetaManager;