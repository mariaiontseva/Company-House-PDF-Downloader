// Configuration for production deployment
window.APP_CONFIG = {
    // API Keys
    COMPANIES_HOUSE_API_KEY: '22aefa40-ee9e-47c0-b40a-2dd3c03165c6',
    GOOGLE_MAPS_API_KEY: 'AIzaSyBWvrPY7tpqqz-0IyYaYodNtIJd9Ao4UR4',
    // NEVER put OpenAI API key in frontend code - use backend proxy instead
    
    // API URLs
    WORKER_URL: 'https://blue-flower-d40f.mahin84.workers.dev',
    RAILWAY_API_URL: 'https://companies-api-production-68c2.up.railway.app',
    OPENAI_PROXY_URL: 'https://companies-api-production-68c2.up.railway.app', // Production proxy server for OpenAI
    
    // Feature Flags
    ENABLE_MAPS: true,
    ENABLE_PDF_DOWNLOAD: true,
    ENABLE_ANALYTICS: true,
    ENABLE_AI_ANALYSIS: true
};

console.log('Config loaded:', window.APP_CONFIG);