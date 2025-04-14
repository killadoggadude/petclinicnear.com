require('dotenv').config(); // Load environment variables from .env file
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const slugify = require('slugify'); // Import slugify

// --- Configuration --- 
// Reverted back to items.csv (already renamed)
const CSV_FILE_PATH = path.join(__dirname, '../data/items.csv'); 
const OUTPUT_DATA_PATH = path.join(__dirname, '../data/processed_data.json'); 
const SLUGIFY_OPTIONS = { lower: true, strict: true }; 

// Define the ACTUAL headers expected in items.csv
const KEYWORD_HEADER = 'Keyword';
const FILLER_WORD_HEADER = 'Filler Word';
const DESCRIPTION_HEADER = 'Description'; 
const NAME_HEADER = 'Business Name'; 
const WEBSITE_HEADER = 'Website';
const CATEGORY_HEADER = 'Category';
const PHONE_HEADER = 'Phone';
const STREET_HEADER = 'Street';
const CITY_HEADER = 'City';     
const CITY_DESCRIPTION_HEADER = 'City Description'; // Assuming this exists
const POSTAL_CODE_HEADER = 'postal_code';
const REGION_HEADER = 'State';    
const COUNTRY_HEADER = 'country';
const LATITUDE_HEADER = 'Latitude';
const LONGITUDE_HEADER = 'Longitude';
const RATING_HEADER = 'Rating';
const REVIEWS_HEADER = 'Number of Reviews';
const REVIEWS_LINK_HEADER = 'reviews_link';
const REVIEWS_TAGS_HEADER = 'reviews_tags';
const IMAGE_URL_HEADER = 'Image URL';
const WORKING_HOURS_HEADER = 'Working Hours';
const LOCATION_LINK_HEADER = 'location_link';

console.log('Starting data parsing (No AI Generation)...');

// --- Main Script Logic ---
async function main() {
    console.log('Starting data parsing process (No AI Generation)...');

    // --- Read and Parse CSV ---
    let csvContent;
    try {
        csvContent = fs.readFileSync(CSV_FILE_PATH, { encoding: 'utf8' });
    } catch (readError) {
        console.error(`Error: Could not read input CSV file at ${CSV_FILE_PATH}`);
        console.error(`Please ensure 'data/items.csv' exists and contains columns: ${NAME_HEADER}, ${LOCATION_HEADER}, ${REGION_HEADER}`);
        process.exit(1);
    }
    
    // Parse CSV
    const records = parse(csvContent, {
        columns: header => header.map(column => column.trim()), 
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
            if (!context.header && context.records > 0) { 
                 let columnHeader = null;
                 if (context.headers && Array.isArray(context.headers) && context.index < context.headers.length) {
                     columnHeader = context.headers[context.index]; // Get the exact header
                 } else if (context.column) { 
                     columnHeader = context.column;
                 }

                 if (columnHeader) { 
                    // Match against the exact header constants defined above
                    // Handle Coordinates
                    if ((columnHeader === LATITUDE_HEADER || columnHeader === LONGITUDE_HEADER) && value) {
                        const numericString = String(value).replace(',', '.'); 
                        const parsedValue = parseFloat(numericString);
                        return !isNaN(parsedValue) ? parsedValue : null;
                    }
                    // Handle Rating
                    if (columnHeader === RATING_HEADER) {
                        const parsedValue = parseFloat(value);
                        return !isNaN(parsedValue) ? parsedValue : null;
                    }
                    // Handle Reviews
                    if (columnHeader === REVIEWS_HEADER) {
                        const parsedValue = parseInt(value, 10);
                        return !isNaN(parsedValue) ? parsedValue : null;
                    }
                 } 
            }
            return value;
        }
    });

    if (records.length === 0) {
        console.warn("Warning: CSV file is empty or contains only headers.");
        fs.writeFileSync(OUTPUT_DATA_PATH, JSON.stringify({ cities: [], allItems: [] }, null, 2)); // Use cities/allItems keys
        console.log('Empty processed_data.json file created.');
        process.exit(0);
    }

    console.log(`Parsed ${records.length} records from CSV.`);

    // --- Data Processing ---
    console.log('Processing CSV data (No AI Generation)...');

    const processedData = {
        cities: [], 
        allItems: [], 
    };
    const cityMap = {}; // { citySlug: { name, slug, state, items: [] } }
    const itemSlugsInCity = {}; // { citySlug: Set<itemSlug> }

    // Use Promise.all to run generation potentially in parallel (respect rate limits)
    const processingPromises = records.map((record, index) => { 
        const headers = Object.keys(record);
        const itemName = record[NAME_HEADER];
        const cityName = record[CITY_HEADER];
        const stateName = record[REGION_HEADER];
        
        if (!itemName || !cityName || !stateName) {
            console.warn(`Skipping row ${index + 2} due to missing required data.`);
            return null; // Return null for skipped records
        }

        // Structure item data (most of this can be synchronous)
        const citySlug = slugify(cityName, SLUGIFY_OPTIONS);
        let itemSlug = slugify(itemName, SLUGIFY_OPTIONS);
        
        // Return only immediately available data
        return {
            record, 
            itemName,
            cityName,
            stateName,
            citySlug,
            itemSlugBase: itemSlug, 
        };
    });

    // No need to await if no async operations in the map
    const initialProcessedItems = processingPromises.filter(item => item !== null);

    // --- Synchronous part: Handle slug duplicates, build final structure ---
    console.log('Finalizing data structure (No AI Generation)...');
    initialProcessedItems.forEach(processedItem => {
        const { record, itemName, cityName, stateName, citySlug, itemSlugBase } = processedItem;
        const headers = Object.keys(record);

        // Initialize city if needed (original logic)
        if (!cityMap[citySlug]) {
            cityMap[citySlug] = {
                name: cityName,
                slug: citySlug,
                state: stateName, // Store state name here
                items: [], 
            };
            itemSlugsInCity[citySlug] = new Set(); 
        }

        // Handle slug duplicates within the city
        let itemSlug = itemSlugBase;
        let counter = 1;
        while (itemSlugsInCity[citySlug].has(itemSlug)) {
            console.warn(`Duplicate item slug detected for "${itemName}" in ${cityName}. Appending count.`);
            counter++;
            itemSlug = `${itemSlugBase}-${counter}`;
        }
        itemSlugsInCity[citySlug].add(itemSlug); 

        // Build final itemData object
        const itemData = {};
        headers.forEach(header => {
            itemData[header] = record[header]; // Directly assign using original header
        });

        // Manually assign or overwrite specific keys for consistency/slugs
        itemData.name = record[NAME_HEADER]; 
        itemData.slug = itemSlug; 
        itemData.citySlug = citySlug; 
        itemData.city = record[CITY_HEADER]; 
        itemData.state = record[REGION_HEADER]; 
        itemData.street = record[STREET_HEADER]; 
        itemData.phone = record[PHONE_HEADER]; // FIX: Explicitly assign lowercase phone
        itemData.website = record[WEBSITE_HEADER]; // FIX: Explicitly assign lowercase website
        
        // Explicitly include the description using the correct header constant
        itemData.description = record[DESCRIPTION_HEADER] || null; 

        // Clean up keys that might have been duplicated by the generic mapping
        // Use the CONSTANTS defined above for the keys to delete
        delete itemData[NAME_HEADER];
        delete itemData[CITY_HEADER];
        delete itemData[REGION_HEADER];
        delete itemData[STREET_HEADER]; 
        delete itemData[PHONE_HEADER]; // FIX: Delete original Phone key
        delete itemData[WEBSITE_HEADER]; // FIX: Delete original Website key
        delete itemData[DESCRIPTION_HEADER]; 
        
        // Re-assign core fields and ensure description comes from mapping
        itemData.rating = record[RATING_HEADER]; 
        itemData.reviews = record[REVIEWS_HEADER];
        itemData.latitude = record[LATITUDE_HEADER]; 
        itemData.longitude = record[LONGITUDE_HEADER]; 
        itemData.imageUrl = record[IMAGE_URL_HEADER] || null;
        
        // Try parsing Working Hours as JSON
        let parsedHours = null;
        const hoursString = record[WORKING_HOURS_HEADER];
        if (hoursString && typeof hoursString === 'string') {
            try {
                // Attempt to parse the string as JSON
                parsedHours = JSON.parse(hoursString);
                // Optional basic validation: check if it's an object
                if (typeof parsedHours !== 'object' || parsedHours === null) {
                    console.warn(`[parse-csv] Working Hours for "${itemName}" parsed but is not an object.`);
                    parsedHours = null;
                } else {
                    // Ensure keys like 'Monday', 'Tuesday' exist if needed, or handle variations
                }
            } catch (e) {
                // Log if parsing fails, indicating unexpected format
                console.warn(`[parse-csv] Failed to parse Working Hours JSON for item "${itemName}". Expected JSON object string. Error: ${e.message}`);
                parsedHours = null;
            }
        }
        itemData.workingHours = parsedHours; // Assign the parsed object or null
        
        // Add item to city list and flat list
        cityMap[citySlug].items.push(itemData);
        processedData.allItems.push(itemData);
    });

    // --- Final Assembly (Use original cityMap conversion) --- 
    console.log('Assembling final data structure (Cities -> Items)...');
    processedData.cities = Object.values(cityMap).map(city => {
        city.itemCount = Array.isArray(city.items) ? city.items.length : 0; 
        if (Array.isArray(city.items)) { 
            city.items.sort((a, b) => a.name.localeCompare(b.name));
        }
        // Remove uniqueText field if it exists from previous runs
        delete city.uniqueText; 
        return city;
    });
    processedData.cities.sort((a, b) => a.name.localeCompare(b.name));

    // Sort the flat list of all items
    processedData.allItems.sort((a, b) => a.name.localeCompare(b.name));

    // --- Output Generation --- 
    fs.writeFileSync(OUTPUT_DATA_PATH, JSON.stringify(processedData, null, 2));
    console.log(`Processed data (${processedData.allItems.length} items across ${processedData.cities.length} cities) saved to ${OUTPUT_DATA_PATH}`);

    console.log('Data parsing finished successfully (No AI Generation).');
}

// Run the async main function
main().catch(error => {
    console.error('Error during data processing script execution:', error);
    process.exit(1); 
});