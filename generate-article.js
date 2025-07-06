#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Example article configuration
const exampleArticle = {
    // SEO Meta
    PAGE_TITLE: "Britain's Corporate Time Travelers - Oldest Public Companies in the UK",
    META_TITLE: "Britain's Corporate Time Travelers - When Ancient Companies Became Modern PLCs",
    META_DESCRIPTION: "Discover the fascinating history of Britain's oldest companies that became PLCs. From medieval goldsmith bankers to Victorian railway financiers - download all their Companies House documents.",
    META_KEYWORDS: "oldest public companies uk, corporate history, companies house documents, barclays plc history, lloyds bank plc, f&c investment trust, british business history, plc formation 1981, docspace uk",
    PAGE_SLUG: "oldest-plc-companies.html",
    
    // Hero Section
    HERO_TITLE: "Britain's Corporate Time Travelers",
    HERO_SUBTITLE: "When Ancient Companies Became Modern PLCs",
    HERO_DESCRIPTION: "From medieval goldsmith bankers to Victorian railway financiers, these companies have survived centuries of British history. But here's the fascinating twist: despite their ancient origins, none became \"Public Limited Companies\" until Margaret Thatcher's corporate revolution of the 1980s.",
    
    // Optional Feature Image
    FEATURE_IMAGE: true,
    FEATURE_IMAGE_URL: "thatcher.png",
    FEATURE_IMAGE_ALT: "Margaret Thatcher",
    
    // Optional Highlight Box
    HIGHLIGHT_BOX: true,
    HIGHLIGHT_TITLE: "The Great PLC Plot Twist",
    HIGHLIGHT_CONTENT: "<strong>Surprising fact:</strong> The term \"Public Limited Company\" and the \"PLC\" suffix only existed since 1981. Before then, all limited companies just used \"Ltd.\" So the \"oldest PLCs\" are actually just the oldest companies that were quick to adopt the shiny new PLC status when it became available.",
    
    // Main Content
    SECTION_TITLE: "The Real \"Oldest PLCs\"",
    CONTENT_PARAGRAPHS: [
        "Barclays began its story in 1690, when two Quaker goldsmiths, John Freame and Thomas Gould, set up shop in Lombard Street, the heart of London's financial district. Their business was grounded in the Quaker principles of honesty, simplicity, and trust—qualities that helped them build a solid reputation among merchants and traders in the growing city.",
        "For more than two centuries, the bank expanded steadily, becoming known as Barclays Bank Limited by the early 20th century. In 1896, it absorbed a network of other Quaker-run banks, significantly increasing its reach. It wasn't until 1982, however, that the institution formally became Barclays Bank PLC, adopting the public limited company structure that aligned with the modern corporate world."
    ],
    PULL_QUOTE: "They were financing Quaker traders in America and the Caribbean before the United States even existed",
    
    // Optional Conclusion
    CONCLUSION: true,
    CONCLUSION_TITLE: "The Verdict: Ancient Wisdom, Modern Structure",
    CONCLUSION_PARAGRAPHS: [
        "These companies prove that survival isn't about age—it's about adaptation. While they may only be \"PLCs\" for 40-odd years, their ability to evolve from medieval guilds to Victorian pioneers to modern corporations shows the true spirit of British enterprise.",
        "<strong>The real lesson?</strong> Sometimes the newest legal structure can house the oldest business wisdom. These \"oldest PLCs\" are really just the most successful corporate shape-shifters in British history."
    ]
};

function generateArticle(config) {
    // Read the template
    const templatePath = path.join(__dirname, 'template-article.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace all placeholders
    Object.keys(config).forEach(key => {
        const value = config[key];
        
        if (Array.isArray(value)) {
            // Handle arrays (like CONTENT_PARAGRAPHS)
            const arrayContent = value.join('\n            ');
            template = template.replace(new RegExp(`{{#each ${key}}}[\\s\\S]*?{{/each}}`, 'g'), 
                value.map(item => `<p class="content-text">\n                ${item}\n            </p>`).join('\n            '));
        } else if (typeof value === 'boolean') {
            // Handle conditional blocks
            const conditionalRegex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{/if}}`, 'g');
            template = template.replace(conditionalRegex, (match, content) => {
                return value ? content : '';
            });
        } else {
            // Handle simple replacements
            template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
    });
    
    // Clean up any remaining conditionals that weren't matched
    template = template.replace(/{{#if \w+}}[\s\S]*?{{\/if}}/g, '');
    template = template.replace(/{{#each \w+}}[\s\S]*?{{\/each}}/g, '');
    template = template.replace(/{{[^}]+}}/g, '');
    
    return template;
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node generate-article.js <config.json> [output.html]');
        console.log('\nGenerating example article...');
        
        // Generate example
        const output = generateArticle(exampleArticle);
        const outputPath = 'example-generated-article.html';
        fs.writeFileSync(outputPath, output);
        console.log(`Example article generated: ${outputPath}`);
        
        // Also save example config
        fs.writeFileSync('example-article-config.json', JSON.stringify(exampleArticle, null, 2));
        console.log('Example config saved: example-article-config.json');
    } else {
        // Generate from config file
        const configPath = args[0];
        const outputPath = args[1] || 'generated-article.html';
        
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const output = generateArticle(config);
            fs.writeFileSync(outputPath, output);
            console.log(`Article generated: ${outputPath}`);
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }
}

module.exports = { generateArticle };