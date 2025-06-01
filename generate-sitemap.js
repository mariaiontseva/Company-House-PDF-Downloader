/**
 * Sitemap Generator for DocSpace.uk
 * Generates XML sitemaps for better SEO indexing
 */

class SitemapGenerator {
    constructor() {
        this.baseUrl = 'https://docspace.uk';
        this.railwayApiUrl = 'https://companies-api-production-68c2.up.railway.app';
    }

    /**
     * Generate complete sitemap XML
     */
    async generateSitemap() {
        try {
            // Get company data from Railway API
            const [oldestCompanies, newestCompanies] = await Promise.all([
                this.fetchCompanies('/api/oldest?limit=1000'),
                this.fetchCompanies('/api/newest?limit=1000')
            ]);

            // Combine and deduplicate companies
            const allCompanies = [...oldestCompanies, ...newestCompanies];
            const uniqueCompanies = this.deduplicateCompanies(allCompanies);

            // Generate sitemap XML
            const sitemap = this.createSitemapXML(uniqueCompanies);
            
            console.log(`Generated sitemap with ${uniqueCompanies.length} companies`);
            return sitemap;

        } catch (error) {
            console.error('Error generating sitemap:', error);
            return this.createBasicSitemap();
        }
    }

    /**
     * Fetch companies from Railway API
     */
    async fetchCompanies(endpoint) {
        try {
            const response = await fetch(`${this.railwayApiUrl}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return [];
        }
    }

    /**
     * Remove duplicate companies
     */
    deduplicateCompanies(companies) {
        const seen = new Set();
        return companies.filter(company => {
            const number = company.CompanyNumber || company.number;
            if (seen.has(number)) return false;
            seen.add(number);
            return true;
        });
    }

    /**
     * Create sitemap XML
     */
    createSitemapXML(companies) {
        const urls = [];

        // Add main pages
        urls.push(this.createUrlEntry('/', '1.0', 'daily'));
        urls.push(this.createUrlEntry('/oldest-companies', '0.9', 'weekly'));
        urls.push(this.createUrlEntry('/newest-companies', '0.9', 'weekly'));
        urls.push(this.createUrlEntry('/royal-charter-companies', '0.8', 'monthly'));
        urls.push(this.createUrlEntry('/plc-companies', '0.8', 'weekly'));

        // Add industry pages
        const industries = [
            'retail', 'financial-services', 'technology', 'healthcare',
            'construction', 'manufacturing', 'professional-services',
            'real-estate', 'hospitality', 'transport'
        ];
        industries.forEach(industry => {
            urls.push(this.createUrlEntry(`/industries/${industry}`, '0.7', 'monthly'));
        });

        // Add location pages
        const locations = [
            'london', 'manchester', 'birmingham', 'glasgow', 'edinburgh',
            'liverpool', 'bristol', 'leeds', 'sheffield', 'cardiff'
        ];
        locations.forEach(location => {
            urls.push(this.createUrlEntry(`/companies/${location}`, '0.7', 'monthly'));
        });

        // Add company pages
        companies.forEach(company => {
            const companyNumber = company.CompanyNumber || company.number;
            if (companyNumber) {
                const priority = this.getCompanyPriority(company);
                const changefreq = this.getCompanyChangeFreq(company);
                urls.push(this.createUrlEntry(`/company/${companyNumber}`, priority, changefreq));
            }
        });

        // Create XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

        return xml;
    }

    /**
     * Create URL entry for sitemap
     */
    createUrlEntry(path, priority, changefreq) {
        const lastmod = new Date().toISOString().split('T')[0];
        return `  <url>
    <loc>${this.baseUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }

    /**
     * Get priority for company based on importance
     */
    getCompanyPriority(company) {
        const companyName = company.CompanyName || company.name || '';
        const companyNumber = company.CompanyNumber || company.number || '';
        
        // Royal Charter companies get higher priority
        if (companyNumber.startsWith('RC')) return '0.9';
        
        // Well-known companies get higher priority
        const wellKnownCompanies = [
            'TESCO', 'SAINSBURY', 'MARKS & SPENCER', 'BRITISH TELECOM',
            'VODAFONE', 'BARCLAYS', 'LLOYDS', 'HSBC', 'BP', 'SHELL'
        ];
        
        if (wellKnownCompanies.some(name => companyName.toUpperCase().includes(name))) {
            return '0.8';
        }
        
        // PLCs get medium priority
        if (companyName.includes('PLC')) return '0.7';
        
        // Default priority
        return '0.5';
    }

    /**
     * Get change frequency for company
     */
    getCompanyChangeFreq(company) {
        const companyNumber = company.CompanyNumber || company.number || '';
        
        // Royal Charter companies change less frequently
        if (companyNumber.startsWith('RC')) return 'yearly';
        
        // Regular companies
        return 'monthly';
    }

    /**
     * Create basic sitemap if API fails
     */
    createBasicSitemap() {
        const urls = [
            this.createUrlEntry('/', '1.0', 'daily'),
            this.createUrlEntry('/oldest-companies', '0.9', 'weekly'),
            this.createUrlEntry('/newest-companies', '0.9', 'weekly'),
            this.createUrlEntry('/royal-charter-companies', '0.8', 'monthly'),
            this.createUrlEntry('/plc-companies', '0.8', 'weekly')
        ];

        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
    }

    /**
     * Download sitemap as file
     */
    downloadSitemap(xml) {
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Generate and download sitemap
     */
    async generateAndDownload() {
        console.log('Generating sitemap...');
        const xml = await this.generateSitemap();
        this.downloadSitemap(xml);
        console.log('Sitemap generated and downloaded!');
    }
}

// Make available globally
window.SitemapGenerator = SitemapGenerator;

// Auto-generate sitemap function
window.generateSitemap = async function() {
    const generator = new SitemapGenerator();
    await generator.generateAndDownload();
};

export default SitemapGenerator;