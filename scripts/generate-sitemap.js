const fs = require('fs');
const path = require('path');

// Define the paths
const DATA_PATH = path.join(__dirname, '../data/processed_data.json');
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://petclinicnear.com'; // Your website's base URL

function generateSitemap() {
    console.log('Generating sitemap...');

    // Read processed data
    let processedData;
    try {
        const jsonData = fs.readFileSync(DATA_PATH, 'utf-8');
        processedData = JSON.parse(jsonData);
    } catch (error) {
        console.error(`Error reading processed data file at ${DATA_PATH}:`, error);
        process.exit(1);
    }

    const { cities = [], allItems = [] } = processedData;
    const currentDate = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD

    // Start XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Helper to add a URL entry
    const addUrl = (loc, lastmod = currentDate, changefreq = 'weekly', priority = 0.8) => {
        // Basic URL encoding/escaping - replace special characters
        const escapedLoc = loc.replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
        xml += `  <url>
    <loc>${escapedLoc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
    };

    // Add Homepage (higher priority)
    addUrl(BASE_URL, currentDate, 'daily', 1.0);

    // Add /cities page
    addUrl(`${BASE_URL}/cities`, currentDate, 'weekly', 0.9);

    // Add City Pages
    cities.forEach(city => {
        if (city.slug) {
            addUrl(`${BASE_URL}/${city.slug}`, currentDate, 'weekly', 0.8);
        }
    });

    // Add Item Pages
    allItems.forEach(item => {
        if (item.citySlug && item.slug) {
            addUrl(`${BASE_URL}/${item.citySlug}/${item.slug}`, currentDate, 'monthly', 0.7);
        }
    });

    // End XML string
    xml += `</urlset>`;

    // Write sitemap file
    try {
        fs.writeFileSync(SITEMAP_PATH, xml);
        console.log(`Sitemap successfully generated at ${SITEMAP_PATH} with ${2 + cities.length + allItems.length} URLs.`);
    } catch (error) {
        console.error(`Error writing sitemap file at ${SITEMAP_PATH}:`, error);
        process.exit(1);
    }
}

// Run the function
generateSitemap(); 