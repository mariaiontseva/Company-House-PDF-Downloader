// Configuration for local development
window.APP_CONFIG = {
    // API Keys
    COMPANIES_HOUSE_API_KEY: '22aefa40-ee9e-47c0-b40a-2dd3c03165c6',
    GOOGLE_MAPS_API_KEY: 'AIzaSyBWvrPY7tpqqz-0IyYaYodNtIJd9Ao4UR4',
    
    // API URLs - Use local proxy for development
    WORKER_URL: 'http://localhost:3002/api/proxy',
    RAILWAY_API_URL: 'http://localhost:3002/api/railway',
    OPENAI_PROXY_URL: 'http://localhost:3002/api/openai',
    
    // Feature Flags
    ENABLE_MAPS: true,
    ENABLE_PDF_DOWNLOAD: true,
    ENABLE_ANALYTICS: false,
    ENABLE_AI_ANALYSIS: false
};

console.log('Local config loaded:', window.APP_CONFIG);