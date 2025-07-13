// Configuration for production deployment
// Replace these values with environment variables in production

const CONFIG = {
    // API Keys - DO NOT COMMIT REAL KEYS
    COMPANIES_HOUSE_API_KEY: process.env.COMPANIES_HOUSE_API_KEY || '22aefa40-ee9e-47c0-b40a-2dd3c03165c6',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBWvrPY7tpqqz-0IyYaYodNtIJd9Ao4UR4',
    
    // API URLs
    WORKER_URL: process.env.WORKER_URL || 'https://blue-flower-d40f.mahin84.workers.dev',
    RAILWAY_API_URL: process.env.RAILWAY_API_URL || 'https://companies-api-production-68c2.up.railway.app',
    
    // Feature Flags
    ENABLE_MAPS: true,
    ENABLE_PDF_DOWNLOAD: true,
    ENABLE_ANALYTICS: true
};

// Make config available globally
window.APP_CONFIG = CONFIG;