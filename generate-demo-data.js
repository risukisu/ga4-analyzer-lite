// Generate realistic demo data for GA4 Analyzer Lite
// Run: node generate-demo-data.js

const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'demo-data');
fs.mkdirSync(outDir, { recursive: true });

// ── Config ──
const COMPANY = 'NovaTech';
const PROPERTY = 'novatech.io - GA4';
const YEARS = [2024, 2025, 2026];
const PARTIAL_2026_END = '20260328';

// SERP events that should cause visible dips
const SERP_DIPS = [
    { date: '2024-03-05', magnitude: 0.18 },  // March 2024 Core Update
    { date: '2024-08-15', magnitude: 0.08 },  // August 2024 Core Update
    { date: '2024-05-14', magnitude: 0.05 },  // AI Overviews US Launch
    { date: '2024-12-12', magnitude: 0.10 },  // December 2024 Core Update
    { date: '2025-03-13', magnitude: 0.12 },  // March 2025 Core Update
    { date: '2026-03-05', magnitude: 0.06 },  // March 2026 Core Update
];

// ── Pages data ──
const pages = [
    // Core pages — moderate decline
    { path: '/', base: 45000, trend: -0.15 },
    { path: '/pricing', base: 12000, trend: -0.10 },
    { path: '/about', base: 8500, trend: -0.20 },
    { path: '/contact', base: 6200, trend: -0.12 },
    { path: '/careers', base: 9800, trend: -0.25 },
    { path: '/demo', base: 7500, trend: -0.08 },

    // Services — mixed
    { path: '/services/cloud-migration', base: 5200, trend: -0.30 },
    { path: '/services/api-development', base: 4800, trend: -0.22 },
    { path: '/services/devops-consulting', base: 3900, trend: -0.18 },
    { path: '/services/security-audit', base: 3100, trend: 0.35 },  // GROWING
    { path: '/services/ai-integration', base: 4200, trend: 0.85 },  // STRONG GROWTH
    { path: '/services/data-engineering', base: 3500, trend: -0.15 },

    // Case studies — declining
    { path: '/case-studies/fintech-platform', base: 4100, trend: -0.28 },
    { path: '/case-studies/ecommerce-scale', base: 3600, trend: -0.35 },
    { path: '/case-studies/healthcare-api', base: 2800, trend: -0.20 },
    { path: '/case-studies/retail-analytics', base: 2200, trend: -0.40 },

    // Docs — mostly stable/slight decline
    { path: '/docs', base: 8200, trend: -0.12 },
    { path: '/docs/getting-started', base: 6100, trend: -0.08 },
    { path: '/docs/authentication', base: 4500, trend: -0.15 },
    { path: '/docs/api-reference', base: 9500, trend: 0.20 },  // GROWING
    { path: '/docs/webhooks', base: 3200, trend: -0.25 },
    { path: '/docs/sdks', base: 4100, trend: -0.10 },
    { path: '/docs/deployment-guide', base: 2800, trend: -0.30 },
    { path: '/docs/troubleshooting', base: 3500, trend: -0.18 },
    { path: '/docs/changelog', base: 2600, trend: -0.05 },

    // Blog — traditional tech content declining, AI content growing
    { path: '/blog/introduction-to-kubernetes', base: 12000, trend: -0.45 },
    { path: '/blog/rest-api-best-practices', base: 11500, trend: -0.40 },
    { path: '/blog/docker-compose-tutorial', base: 10800, trend: -0.50 },
    { path: '/blog/jwt-authentication-guide', base: 8200, trend: -0.35 },
    { path: '/blog/microservices-architecture', base: 9500, trend: -0.42 },
    { path: '/blog/aws-lambda-serverless', base: 8800, trend: -0.38 },
    { path: '/blog/ci-cd-pipeline-guide', base: 7200, trend: -0.30 },
    { path: '/blog/postgresql-performance', base: 7800, trend: -0.44 },
    { path: '/blog/react-hooks-guide', base: 7500, trend: -0.48 },
    { path: '/blog/terraform-iac', base: 5800, trend: -0.32 },
    { path: '/blog/graphql-vs-rest', base: 5200, trend: -0.36 },
    // AI content — GROWING
    { path: '/blog/llm-integration-production', base: 3800, trend: 1.20 },
    { path: '/blog/vector-databases-explained', base: 2500, trend: 0.95 },
    { path: '/blog/prompt-engineering-guide', base: 2200, trend: 1.50 },
    { path: '/blog/rag-architecture-patterns', base: 1800, trend: 1.80 },
    { path: '/blog/ai-agent-frameworks', base: 1200, trend: 2.20 },
    { path: '/blog/fine-tuning-llms', base: 1500, trend: 1.40 },
    { path: '/blog/openai-api-optimization', base: 3200, trend: 0.70 },
    // Security — growing
    { path: '/blog/zero-trust-security', base: 4100, trend: 0.30 },

    // Resources
    { path: '/resources/ebooks', base: 1800, trend: -0.20 },
    { path: '/resources/webinars', base: 1400, trend: -0.30 },
    { path: '/resources/whitepapers', base: 1200, trend: -0.25 },
];

function generatePagesCSV(year, yearIndex) {
    const isPartial = (year === 2026);
    const startDate = `${year}0101`;
    const endDate = isPartial ? PARTIAL_2026_END : `${year}1231`;
    const partialFactor = isPartial ? (87 / 365) : 1; // Jan 1 - Mar 28 = 87 days

    let csv = `# ----------------------------------------\n`;
    csv += `# Pages and screens: Page path and screen class\n`;
    csv += `# Account: ${COMPANY}\n`;
    csv += `# Property: ${PROPERTY}\n`;
    csv += `# ----------------------------------------\n`;
    csv += `# \n`;
    csv += `# All Users\n`;
    csv += `# Start date: ${startDate}\n`;
    csv += `# End date: ${endDate}\n`;
    csv += `Page path and screen class,Views,Active users,Views per active user,Average engagement time per active user,Event count,Key events,Total revenue\n`;

    for (const page of pages) {
        // Apply trend per year (compounding from base year 2024)
        const yearMultiplier = 1 + (page.trend * yearIndex);
        const views = Math.max(10, Math.round(page.base * yearMultiplier * partialFactor * (0.9 + Math.random() * 0.2)));
        const users = Math.round(views * (0.55 + Math.random() * 0.2));
        const viewsPerUser = (views / users).toFixed(4);
        const engTime = (15 + Math.random() * 75).toFixed(4);
        const events = Math.round(views * (2.5 + Math.random() * 2.5));
        const keyEvents = Math.round(Math.random() * views * 0.005);
        csv += `${page.path},${views},${users},${viewsPerUser},${engTime},${events},${keyEvents},0\n`;
    }

    return csv;
}

function generateEngagementCSV(year) {
    const isPartial = (year === 2026);
    const startDate = `${year}0101`;
    const endDate = isPartial ? PARTIAL_2026_END : `${year}1231`;
    const days = isPartial ? 87 : (year % 4 === 0 ? 366 : 365);

    let csv = `# ----------------------------------------\n`;
    csv += `# View user engagement & retention overview\n`;
    csv += `# Account: ${COMPANY}\n`;
    csv += `# Property: ${PROPERTY}\n`;
    csv += `# ----------------------------------------\n`;
    csv += `# \n`;
    csv += `# Start date: ${startDate}\n`;
    csv += `# End date: ${endDate}\n`;
    csv += `Nth day,Active users\n`;

    // Base daily traffic with seasonal patterns and SERP dips
    const yearStart = new Date(Date.UTC(year, 0, 1));
    let baseTraffic;
    if (year === 2024) baseTraffic = 2800;
    else if (year === 2025) baseTraffic = 2200;  // declining
    else baseTraffic = 1900;

    for (let d = 0; d < days; d++) {
        const currentDate = new Date(yearStart.getTime() + d * 86400000);
        const dateStr = currentDate.toISOString().slice(0, 10);

        // Day of week effect (weekends lower)
        const dow = currentDate.getUTCDay();
        const dowFactor = (dow === 0 || dow === 6) ? 0.55 : 1.0;

        // Seasonal: slight dip in summer, boost in fall
        const month = currentDate.getUTCMonth();
        const seasonalFactor = month >= 5 && month <= 7 ? 0.88 : (month >= 8 && month <= 10 ? 1.08 : 1.0);

        // Gradual decline through the year
        const declineFactor = 1 - (d / days) * 0.10;

        // SERP event dips
        let serpFactor = 1.0;
        for (const dip of SERP_DIPS) {
            const dipDate = new Date(dip.date + 'T00:00:00Z');
            const diffDays = (currentDate - dipDate) / 86400000;
            // Sharp drop over 2 weeks, slow recovery over 6 weeks
            if (diffDays >= 0 && diffDays <= 14) {
                serpFactor *= (1 - dip.magnitude * (1 - diffDays / 14));
            } else if (diffDays > 14 && diffDays <= 56) {
                const recovery = (diffDays - 14) / 42;
                serpFactor *= (1 - dip.magnitude * 0.3 * (1 - recovery));
            }
        }

        // Random noise
        const noise = 0.80 + Math.random() * 0.40;

        const users = Math.max(50, Math.round(baseTraffic * dowFactor * seasonalFactor * declineFactor * serpFactor * noise));
        const dayStr = String(d).padStart(4, '0');
        csv += `${dayStr},${users}\n`;
    }

    return csv;
}

// Generate all files
for (let i = 0; i < YEARS.length; i++) {
    const year = YEARS[i];
    const pagesCSV = generatePagesCSV(year, i);
    const engCSV = generateEngagementCSV(year);

    fs.writeFileSync(path.join(outDir, `${year}_Pages_and_screens.csv`), pagesCSV);
    fs.writeFileSync(path.join(outDir, `${year}_Engagement_overview.csv`), engCSV);
    console.log(`Generated ${year} data`);
}

console.log(`\nDemo data written to ${outDir}/`);
console.log('Files:');
fs.readdirSync(outDir).forEach(f => console.log(`  ${f}`));
