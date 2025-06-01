/**
 * Director Information Lookup System for DocSpace.uk
 * Provides additional context about company directors
 */

class DirectorLookup {
    constructor() {
        // Cache for director information to avoid repeated lookups
        this.directorCache = new Map();
        
        // Known directors database (expandable)
        this.knownDirectors = {
            'MARIA IONTSEVA': {
                appointments: [
                    {
                        company: 'CHERRYPICKED DESIGN LIMITED',
                        companyNumber: '12387565',
                        role: 'Director',
                        appointed: '6 January 2020',
                        status: 'Active',
                        companyStatus: 'Active',
                        companyAddress: '38 Crouch Hill, London, N4 4AU'
                    },
                    {
                        company: 'LOBSTER IT LIMITED',
                        companyNumber: '08510890',
                        role: 'Director',
                        appointed: '26 July 2013',
                        status: 'Active',
                        companyStatus: 'In Liquidation',
                        note: 'Co-founder, Product Designer'
                    }
                ],
                details: {
                    nationality: 'British/Russian',
                    residence: 'United Kingdom',
                    occupation: 'Company Director/Product Designer',
                    totalAppointments: 2,
                    activeAppointments: 2,
                    website: 'mariaiontseva.com'
                }
            }
        };
    }

    /**
     * Look up director information
     */
    async lookupDirector(directorName) {
        const normalizedName = directorName.toUpperCase().trim();
        
        // Check cache first
        if (this.directorCache.has(normalizedName)) {
            return this.directorCache.get(normalizedName);
        }
        
        // Check known directors
        if (this.knownDirectors[normalizedName]) {
            const info = this.knownDirectors[normalizedName];
            this.directorCache.set(normalizedName, info);
            return info;
        }
        
        // Future: API lookup could go here
        return null;
    }

    /**
     * Create director info badge HTML
     */
    createDirectorBadge(directorInfo) {
        if (!directorInfo) return '';
        
        const totalCompanies = directorInfo.appointments.length;
        const activeCompanies = directorInfo.appointments.filter(a => a.status === 'Active').length;
        
        return `
            <span class="director-info-badge" title="Click for more info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                </svg>
                ${totalCompanies} ${totalCompanies === 1 ? 'company' : 'companies'}
            </span>
        `;
    }

    /**
     * Create detailed director popup
     */
    createDirectorPopup(directorName, directorInfo) {
        if (!directorInfo) return '';
        
        const appointments = directorInfo.appointments.map(app => `
            <div class="director-appointment">
                <div class="appointment-company">
                    <a href="#company/${app.companyNumber}" class="company-link">
                        ${app.company}
                    </a>
                    <span class="company-status ${app.companyStatus.toLowerCase().replace(/\s+/g, '-')}">${app.companyStatus}</span>
                </div>
                <div class="appointment-details">
                    <span class="role">${app.role}</span> • 
                    <span class="date">Appointed ${app.appointed}</span>
                    ${app.note ? `<div class="appointment-note">${app.note}</div>` : ''}
                </div>
            </div>
        `).join('');
        
        return `
            <div class="director-popup" id="director-popup-${directorName.replace(/\s+/g, '-')}">
                <div class="popup-header">
                    <h3>${directorName}</h3>
                    <button class="close-popup" onclick="closeDirectorPopup('${directorName.replace(/\s+/g, '-')}')">×</button>
                </div>
                <div class="popup-content">
                    <div class="director-summary">
                        <div class="summary-item">
                            <span class="label">Total Appointments:</span>
                            <span class="value">${directorInfo.details.totalAppointments}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">Active:</span>
                            <span class="value">${directorInfo.details.activeAppointments}</span>
                        </div>
                        ${directorInfo.details.nationality ? `
                        <div class="summary-item">
                            <span class="label">Nationality:</span>
                            <span class="value">${directorInfo.details.nationality}</span>
                        </div>` : ''}
                        ${directorInfo.details.occupation ? `
                        <div class="summary-item">
                            <span class="label">Occupation:</span>
                            <span class="value">${directorInfo.details.occupation}</span>
                        </div>` : ''}
                    </div>
                    
                    <div class="appointments-section">
                        <h4>Company Appointments</h4>
                        ${appointments}
                    </div>
                    
                    ${directorInfo.details.website ? `
                    <div class="director-links">
                        <a href="https://${directorInfo.details.website}" target="_blank" rel="noopener">
                            🌐 Professional Website
                        </a>
                    </div>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Enhance director name with lookup info
     */
    async enhanceDirectorName(directorName, container) {
        const info = await this.lookupDirector(directorName);
        if (!info) return;
        
        // Add badge next to name
        const badge = this.createDirectorBadge(info);
        container.insertAdjacentHTML('beforeend', badge);
        
        // Add click handler
        container.querySelector('.director-info-badge').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDirectorPopup(directorName, info);
        });
    }

    /**
     * Show director popup
     */
    showDirectorPopup(directorName, directorInfo) {
        // Remove any existing popup
        const existingPopup = document.querySelector('.director-popup-overlay');
        if (existingPopup) existingPopup.remove();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'director-popup-overlay';
        overlay.innerHTML = this.createDirectorPopup(directorName, directorInfo);
        
        // Add to body
        document.body.appendChild(overlay);
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }
}

// CSS for director lookup features
const directorLookupStyles = `
<style>
.director-info-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
    padding: 2px 8px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 12px;
    font-size: 11px;
    color: #6366f1;
    cursor: pointer;
    transition: all 0.2s ease;
}

.director-info-badge:hover {
    background: rgba(99, 102, 241, 0.2);
    transform: translateY(-1px);
}

.director-popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
}

.director-popup {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.popup-header h3 {
    margin: 0;
    font-size: 20px;
    color: #1f2937;
}

.close-popup {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
}

.close-popup:hover {
    background: #f3f4f6;
    color: #1f2937;
}

.popup-content {
    padding: 20px;
}

.director-summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 20px;
}

.summary-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.summary-item .label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
}

.summary-item .value {
    font-size: 14px;
    color: #1f2937;
    font-weight: 600;
}

.appointments-section h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #1f2937;
}

.director-appointment {
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 12px;
    border: 1px solid #e5e7eb;
}

.appointment-company {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.company-link {
    font-weight: 600;
    color: #3b82f6;
    text-decoration: none;
    transition: color 0.2s;
}

.company-link:hover {
    color: #2563eb;
    text-decoration: underline;
}

.company-status {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
}

.company-status.active {
    background: #d1fae5;
    color: #065f46;
}

.company-status.in-liquidation {
    background: #fee2e2;
    color: #991b1b;
}

.appointment-details {
    font-size: 13px;
    color: #6b7280;
}

.appointment-note {
    margin-top: 4px;
    font-style: italic;
    color: #9ca3af;
}

.director-links {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
}

.director-links a {
    color: #3b82f6;
    text-decoration: none;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.director-links a:hover {
    text-decoration: underline;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .director-popup {
        background: #1f2937;
        color: #f3f4f6;
    }
    
    .popup-header h3,
    .summary-item .value,
    .appointments-section h4 {
        color: #f3f4f6;
    }
    
    .director-summary,
    .director-appointment {
        background: #374151;
        border-color: #4b5563;
    }
    
    .close-popup:hover {
        background: #374151;
        color: #f3f4f6;
    }
}
</style>
`;

// Initialize director lookup
const directorLookup = new DirectorLookup();

// Export for use in main application
window.directorLookup = directorLookup;
window.closeDirectorPopup = function(directorId) {
    const overlay = document.querySelector('.director-popup-overlay');
    if (overlay) overlay.remove();
};

// Auto-inject styles
if (!document.getElementById('director-lookup-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'director-lookup-styles';
    styleElement.innerHTML = directorLookupStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

export default DirectorLookup;