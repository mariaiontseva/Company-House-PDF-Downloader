// Enhanced Company Card Design - Tabbed Structure
// Better organized than Companies House interface with user-centric value

const enhancedCompanyCardStructure = {
  
  // ==================================================
  // TAB 1: COMPANY OVERVIEW (First Impression)
  // ==================================================
  "overview": {
    title: "Overview",
    icon: "🏢",
    priority: 1,
    userValue: "Quick company snapshot with key risk indicators",
    
    sections: {
      // Hero section with key metrics
      hero: {
        companyName: "string",
        status: "active|dissolved|liquidation", 
        incorporationDate: "date",
        companyType: "string",
        sector: "calculated from SIC codes",
        
        // NEW CALCULATED INSIGHTS
        riskScore: "calculated 1-100 (charges + compliance + filings)",
        healthIndicator: "GREEN|AMBER|RED",
        lastActivity: "days since last filing",
        
        // Quick stats bar
        quickStats: {
          totalOfficers: "number",
          totalCharges: "number", 
          outstandingChargesValue: "£amount",
          latestAccountsDate: "date",
          complianceStatus: "UP_TO_DATE|OVERDUE|CRITICAL"
        }
      },
      
      // Address & contacts
      location: {
        registeredOffice: "full address",
        serviceAddress: "if different", 
        mapCoordinates: "calculated for mapping",
        postcode: "for area analysis"
      },
      
      // Business activity (better than CH)
      activity: {
        primarySIC: "main business activity",
        sicDescription: "human-readable description",
        allSICs: "array of all activities",
        businessSummary: "calculated from SIC combinations"
      }
    },
    
    apiEndpoints: [
      "/company/{company_number}",
      "/company/{company_number}/officers",
      "/company/{company_number}/charges"
    ]
  },

  // ==================================================
  // TAB 2: PEOPLE & CONTROL (Who's Behind It)
  // ==================================================
  "people": {
    title: "People & Control", 
    icon: "👥",
    priority: 2,
    userValue: "Understanding company control structure and key people",
    
    sections: {
      // Key control (PSCs first - most important)
      significantControl: {
        title: "Who Controls This Company",
        persons: [{
          name: "string",
          controlType: "ownership|voting|board",
          percentage: "25-50%|50-75%|75%+",
          nature: "shares|voting|appointments",
          nationality: "string",
          dateOfBirth: "month/year",
          address: "service address"
        }],
        
        // NEW CALCULATED INSIGHTS
        controlConcentration: "DISPERSED|CONCENTRATED|SINGLE_CONTROL",
        foreignControl: "boolean - non-UK control",
        corporateControl: "boolean - company controlled by other companies"
      },
      
      // Current active officers (better organization than CH)
      activeOfficers: {
        title: "Current Management",
        directors: [{
          name: "string",
          role: "director|secretary|etc",
          appointedDate: "date",
          tenure: "calculated years/months",
          nationality: "string",
          occupation: "string",
          otherCompanies: "calculated count from cross-references"
        }],
        
        // NEW CALCULATED INSIGHTS
        boardStability: "HIGH|MEDIUM|LOW (based on tenure)",
        averageTenure: "calculated average years",
        recentChanges: "count of changes last 12 months"
      },
      
      // Officer network analysis (NEW FEATURE)
      officerNetwork: {
        title: "Professional Networks",
        connections: [{
          officerName: "string",
          sharedCompanies: "array of companies",
          connectionStrength: "STRONG|MEDIUM|WEAK",
          riskIndicators: "boolean flags"
        }],
        
        networkRiskScore: "calculated risk from connections",
        unusualPatterns: "array of risk flags"
      },
      
      // Historical changes timeline
      changeHistory: {
        title: "Recent Changes", 
        changes: [{
          date: "date",
          type: "appointment|resignation|address_change",
          officer: "name",
          details: "string",
          significance: "HIGH|MEDIUM|LOW"
        }],
        
        changeFrequency: "calculated stability indicator",
        massExodus: "boolean - multiple resignations"
      }
    },
    
    apiEndpoints: [
      "/company/{company_number}/persons-with-significant-control",
      "/company/{company_number}/officers", 
      "/company/{company_number}/filing-history"
    ]
  },

  // ==================================================
  // TAB 3: SECURITIES & RISK (Financial Obligations)
  // ==================================================
  "securities": {
    title: "Securities & Risk",
    icon: "🔒", 
    priority: 3,
    userValue: "Understanding financial obligations, charges, and credit risk",
    
    sections: {
      // Charges overview (enhanced from our earlier work)
      chargesOverview: {
        title: "Secured Obligations",
        totalSecured: "£total amount",
        outstandingAmount: "£outstanding",
        satisfiedAmount: "£historical satisfied", 
        chargeCount: "number",
        
        // NEW CALCULATED INSIGHTS
        securityRatio: "charges vs estimated company value",
        riskLevel: "LOW|MEDIUM|HIGH|CRITICAL",
        lenderDiversity: "number of different lenders",
        averageChargeAge: "calculated from creation dates"
      },
      
      // Individual charges (better than CH presentation)
      chargeDetails: [{
        amount: "£secured amount", 
        status: "outstanding|satisfied|part_satisfied",
        type: "debenture|floating|mortgage|etc",
        lender: "company/person name",
        createdDate: "date",
        satisfiedDate: "date or null",
        assets: "description of secured assets",
        
        // NEW CALCULATED INSIGHTS  
        ageInDays: "calculated",
        isRecent: "boolean - created < 12 months",
        lenderType: "BANK|PARENT|INDIVIDUAL|OTHER",
        riskCategory: "calculated risk level"
      }],
      
      // Lender analysis (NEW FEATURE)
      lenderAnalysis: {
        title: "Lender Relationships",
        primaryLenders: ["array of main lenders"],
        parentCompanyCharges: "boolean",
        bankingRelationships: "array of banks", 
        
        // Risk indicators
        lenderConcentration: "HIGH|MEDIUM|LOW",
        parentDependency: "boolean - relies on parent funding",
        bankingDiversity: "number of banking relationships"
      },
      
      // Comparative analysis (NEW FEATURE)
      industryComparison: {
        title: "Industry Context",
        sectorAverage: "average charges for sector",
        peerComparison: "ABOVE|BELOW|AVERAGE",
        riskPercentile: "where company sits 0-100%"
      }
    },
    
    apiEndpoints: [
      "/company/{company_number}/charges"
    ]
  },

  // ==================================================
  // TAB 4: FINANCIALS & PERFORMANCE (Money Matters)
  // ==================================================
  "financials": {
    title: "Financials",
    icon: "📊",
    priority: 4, 
    userValue: "Financial performance, compliance, and business health",
    
    sections: {
      // Filing compliance (critical for risk)
      compliance: {
        title: "Regulatory Compliance",
        accountsStatus: "FILED|OVERDUE|CRITICAL",
        lastAccountsDate: "date",
        nextAccountsDue: "date", 
        daysOverdue: "calculated if overdue",
        confirmationStatement: "up to date status",
        
        // NEW CALCULATED INSIGHTS
        complianceScore: "0-100 score",
        filingPattern: "CONSISTENT|IRREGULAR|POOR",
        riskOfStrike: "boolean - at risk of being struck off"
      },
      
      // Financial highlights (from filed accounts)
      accountsHighlights: {
        title: "Latest Financial Position",
        accountsDate: "period end date",
        accountsType: "full|abbreviated|micro",
        
        // Key figures (if available in accounts)
        turnover: "£amount or 'not disclosed'",
        totalAssets: "£amount",
        netWorth: "£calculated",
        
        // NEW CALCULATED INSIGHTS
        financialTrend: "GROWING|STABLE|DECLINING",
        sizeCategory: "MICRO|SMALL|MEDIUM|LARGE",
        profitabilityIndicator: "estimated from available data"
      },
      
      // Document availability 
      documentsAvailable: {
        title: "Available Documents",
        documents: [{
          type: "accounts|returns|charges|etc",
          date: "date",
          cost: "£price",
          description: "what's included"
        }],
        
        totalDocuments: "count",
        estimatedDownloadCost: "£total for all docs"
      },
      
      // Business trajectory (NEW FEATURE)
      businessTrajectory: {
        title: "Business Development",
        ageOfCompany: "years since incorporation",
        lifecycleStage: "STARTUP|GROWTH|MATURE|DECLINING",
        activityLevel: "HIGH|MEDIUM|LOW",
        recentMilestones: "array of significant events"
      }
    },
    
    apiEndpoints: [
      "/company/{company_number}/filing-history",
      "/company/{company_number}"
    ]
  },

  // ==================================================
  // TAB 5: ACTIVITY TIMELINE (What's Happening)
  // ==================================================
  "timeline": {
    title: "Activity Timeline",
    icon: "📅",
    priority: 5,
    userValue: "Understanding company activity patterns and recent developments",
    
    sections: {
      // Recent activity feed (last 12 months)
      recentActivity: {
        title: "Recent Activity (12 months)",
        events: [{
          date: "date",
          type: "accounts|charges|officers|address|etc",
          description: "human readable description",
          significance: "HIGH|MEDIUM|LOW",
          category: "FINANCIAL|GOVERNANCE|OPERATIONAL|COMPLIANCE"
        }],
        
        // NEW CALCULATED INSIGHTS
        activityScore: "0-100 how active company is",
        activityTrend: "INCREASING|STABLE|DECREASING",
        unusualActivity: "boolean - spikes in activity"
      },
      
      // Key milestones timeline
      milestones: {
        title: "Company Milestones",
        events: [{
          date: "date",
          milestone: "incorporation|first_charge|major_filing|etc",
          description: "string",
          impact: "HIGH|MEDIUM|LOW"
        }]
      },
      
      // Predictive insights (NEW FEATURE)
      upcomingEvents: {
        title: "Upcoming Requirements",
        events: [{
          dueDate: "date",
          type: "accounts|confirmation|etc",
          description: "what's due",
          urgency: "OVERDUE|URGENT|UPCOMING|FUTURE"
        }],
        
        riskOfDefault: "boolean - likely to miss deadlines"
      }
    },
    
    apiEndpoints: [
      "/company/{company_number}/filing-history"
    ]
  },

  // ==================================================
  // TAB 6: ADVANCED INSIGHTS (Power User Features)
  // ==================================================
  "insights": {
    title: "Advanced Insights", 
    icon: "🔍",
    priority: 6,
    userValue: "Advanced analytics and risk assessment for professional users",
    
    sections: {
      // Overall risk assessment
      riskAssessment: {
        title: "Risk Assessment",
        overallRisk: "LOW|MEDIUM|HIGH|CRITICAL",
        riskFactors: ["array of identified risks"],
        mitigatingFactors: ["array of positive factors"],
        
        // Risk breakdown
        creditRisk: "score 0-100",
        complianceRisk: "score 0-100", 
        operationalRisk: "score 0-100",
        reputationalRisk: "score 0-100"
      },
      
      // Industry & peer analysis
      marketPosition: {
        title: "Market Position",
        industryCategory: "calculated from SIC",
        competitorCount: "estimated in sector", 
        marketShare: "estimated if data available",
        
        // NEW CALCULATED INSIGHTS
        innovationScore: "based on filings and activities",
        marketPresence: "DOMINANT|ESTABLISHED|EMERGING|NICHE"
      },
      
      // Network analysis (connections to other companies)
      corporateNetwork: {
        title: "Corporate Network",
        subsidiaries: "array if available",
        parentCompany: "if controlled by another",
        sisterCompanies: "companies with same control",
        
        // Risk indicators from network
        groupRisk: "risks from related companies",
        networkComplexity: "SIMPLE|MODERATE|COMPLEX"
      },
      
      // Data quality & confidence
      dataQuality: {
        title: "Data Confidence",
        lastUpdated: "most recent data point",
        completeness: "percentage of available data",
        confidence: "HIGH|MEDIUM|LOW confidence in analysis",
        dataGaps: "array of missing information"
      }
    },
    
    // Multiple API endpoints combined
    apiEndpoints: [
      "/company/{company_number}",
      "/company/{company_number}/officers", 
      "/company/{company_number}/charges",
      "/company/{company_number}/filing-history",
      "/company/{company_number}/persons-with-significant-control"
    ]
  }
};

// ==================================================
// NEW CALCULATED METRICS DEFINITIONS
// ==================================================

const calculatedMetrics = {
  
  // Risk scoring algorithm
  riskScore: {
    formula: "weighted sum of multiple factors",
    factors: {
      chargesRisk: "charges amount vs estimated company value (30%)",
      complianceRisk: "filing delays and patterns (25%)",
      governanceRisk: "officer changes and control structure (20%)", 
      financialRisk: "accounts data and trends (15%)",
      networkRisk: "connections to high-risk entities (10%)"
    },
    scale: "0-100 (100 = highest risk)"
  },
  
  // Health indicator
  healthIndicator: {
    GREEN: "low risk, good compliance, stable structure",
    AMBER: "medium risk, some concerns identified", 
    RED: "high risk, multiple red flags, immediate attention needed"
  },
  
  // Activity scoring
  activityScore: {
    calculation: "filings frequency + officer changes + charge activity",
    scale: "0-100 (100 = very active company)"
  },
  
  // Compliance scoring  
  complianceScore: {
    factors: ["filing timeliness", "accounts quality", "fee payments"],
    penalties: ["late filings", "struck off history", "director bans"]
  }
};

// ==================================================
// USER EXPERIENCE IMPROVEMENTS OVER COMPANIES HOUSE
// ==================================================

const uxImprovements = {
  
  currentCHProblems: [
    "Technical jargon confusing to non-experts",
    "Poor information hierarchy",
    "Scattered related information", 
    "No risk assessment or context",
    "No industry comparisons",
    "No predictive insights",
    "Complex navigation"
  ],
  
  ourSolutions: [
    "User-friendly language with explanations",
    "Risk-first organization (what users care about)",
    "Related information grouped logically",
    "Clear risk indicators and scores", 
    "Industry context and comparisons",
    "Predictive upcoming events",
    "Progressive disclosure - simple to advanced"
  ],
  
  designPrinciples: [
    "Start with what users need to know first (risk/overview)",
    "Progressive complexity (basic → advanced)",
    "Visual hierarchy with clear indicators", 
    "Actionable insights not just data",
    "Context and comparisons for all metrics"
  ]
};

module.exports = {
  enhancedCompanyCardStructure,
  calculatedMetrics, 
  uxImprovements
};