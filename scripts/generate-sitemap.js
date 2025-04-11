const fs = require('fs');
const path = require('path');

// --- Configuration --- 
const BASE_URL = 'https://www.yourdomain.com'; // !! IMPORTANT: Replace with your actual domain !!
const OUTPUT_DIR = path.join(__dirname, '../out'); // The output directory after 'next build'
const SITEMAP_PATH = path.join(OUTPUT_DIR, 'sitemap.xml');
const DATA_PATH = path.join(__dirname, '../data/processed_data.json');

// --- Helper Functions --- 
function getDate() {
    // Get current date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
}

function generateUrlEntry(url, changefreq = 'weekly', priority = 0.7) {
    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${getDate()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// --- Main Generation Logic --- 
async function generateSitemap() {
    console.log('Generating sitemap...');

    let data;
    try {
        const jsonData = fs.readFileSync(DATA_PATH, 'utf8');
        data = JSON.parse(jsonData);
    } catch (error) {
        console.error(`Error reading processed data file at ${DATA_PATH}:`, error);
        process.exit(1);
    }

    const allItems = data.allItems || [];
    const locations = data.locations || [];

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 1. Static Pages
    sitemapContent += generateUrlEntry(`${BASE_URL}/`, 'daily', 1.0); // Homepage
    sitemapContent += generateUrlEntry(`${BASE_URL}/cities`, 'weekly', 0.8); // All locations page
    sitemapContent += generateUrlEntry(`${BASE_URL}/about`, 'monthly', 0.5);
    sitemapContent += generateUrlEntry(`${BASE_URL}/contact`, 'monthly', 0.5);
    sitemapContent += generateUrlEntry(`${BASE_URL}/terms`, 'monthly', 0.3);
    // Add other static pages like /privacy here if you create them

    // 2. Location (City) Pages
    locations.forEach(location => {
        const url = `${BASE_URL}/${location.slug}`;
        sitemapContent += generateUrlEntry(url, 'weekly', 0.8);
    });

    // 3. Item (Plumber) Pages
    allItems.forEach(item => {
        // Ensure required slugs exist before generating URL
        if (item.locationSlug && item.slug) { 
            const url = `${BASE_URL}/${item.locationSlug}/${item.slug}`;
            sitemapContent += generateUrlEntry(url, 'monthly', 0.6);
        } else {
            console.warn(`Skipping sitemap entry for item due to missing slugs: ${item.name}`);
        }
    });

    sitemapContent += `
</urlset>`;

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        console.warn(`Output directory ${OUTPUT_DIR} does not exist. Creating...`);
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write the sitemap file
    try {
        fs.writeFileSync(SITEMAP_PATH, sitemapContent);
        console.log(`Sitemap successfully generated at ${SITEMAP_PATH}`);
    } catch (error) {
        console.error(`Error writing sitemap file:`, error);
        process.exit(1);
    }
}

generateSitemap(); 