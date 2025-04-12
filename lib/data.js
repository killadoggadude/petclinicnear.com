import fs from 'fs';
import path from 'path';

// Helper function to read and parse the main data file
export function getProcessedData() {
  const dataPath = path.join(process.cwd(), 'data', 'processed_data.json');
  try {
      // Ensure utf-8 encoding is specified for reading JSON
      const jsonData = fs.readFileSync(dataPath, 'utf-8'); 
      const data = JSON.parse(jsonData);
      // Return the expected structure
      return {
          cities: data.cities || [], 
          allItems: data.allItems || [], // Keep if needed elsewhere
          categories: data.categories || [] // Keep if needed elsewhere
      };
  } catch (error) {
      console.error("Error reading processed data:", error);
      // Return an empty structure in case of error
      return { cities: [], allItems: [], categories: [] }; 
  }
}

// You could add more data-related utility functions here later 