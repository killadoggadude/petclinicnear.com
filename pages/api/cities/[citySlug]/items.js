// Import the shared data fetching utility
import { getProcessedData } from '../../../lib/data';

export default function handler(req, res) {
  // Extract the citySlug from the query parameters
  const { citySlug } = req.query;

  if (!citySlug) {
    return res.status(400).json({ message: 'City slug is required' });
  }

  try {
    // Get all data using the shared utility
    const allData = getProcessedData();

    // Find the city matching the slug
    const cityData = allData.cities.find(city => city.slug === citySlug);

    // Get items for that city, default to empty array
    const items = cityData ? cityData.items || [] : [];

    // Send the items as a JSON response
    res.status(200).json(items);

  } catch (error) {
    // Log the error on the server
    console.error(`API Error fetching items for city ${citySlug}:`, error);
    // Send a generic server error response
    res.status(500).json({ message: 'Internal Server Error' });
  }
} 