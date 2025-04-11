import fs from 'fs';
import path from 'path';

// Helper function to read and parse the data file
function getCityItems(citySlug) {
  const dataPath = path.join(process.cwd(), 'data', 'processed_data.json');
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(jsonData);

    // Find the city matching the slug
    const cityData = data.cities.find(city => city.slug === citySlug);

    // Return the items for that city, or an empty array if not found
    return cityData ? cityData.items || [] : [];
  } catch (error) {
    console.error(`Error reading data for city ${citySlug}:`, error);
    // Return an empty array or handle the error as appropriate
    return []; 
  }
}

export default function handler(req, res) {
  // Extract the citySlug from the query parameters
  const { citySlug } = req.query;

  if (!citySlug) {
    return res.status(400).json({ message: 'City slug is required' });
  }

  // Get the items for the requested city
  const items = getCityItems(citySlug);

  // Check if the city was found (even if items might be empty)
  // You might want more sophisticated not found handling depending on getCityItems logic
  // For now, we assume an empty array means either no items or city not found
  // if (items === null) { // Adjust if getCityItems returns null for not found
  //   return res.status(404).json({ message: 'City not found' });
  // }

  // Send the items as a JSON response
  res.status(200).json(items);
} 