import { getProcessedData } from '../../lib/data';

// --- Haversine Distance Calculation --- 
// (Keep this utility on the server-side)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null; // Cannot calculate if coordinates are missing
  }

  function toRad(Value) {
    return Value * Math.PI / 180;
  }

  const R = 3958.8; // miles (changed to miles)

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c;
  return d; // Distance in miles
}
// ------------------------------------

export default function handler(req, res) {
  // Get query parameters
  const { citySlug, currentItemSlug, latitude, longitude } = req.query;
  const currentLat = parseFloat(latitude);
  const currentLon = parseFloat(longitude);

  // Basic validation
  if (!citySlug || !currentItemSlug || isNaN(currentLat) || isNaN(currentLon)) {
    return res.status(400).json({ message: 'Missing or invalid query parameters (citySlug, currentItemSlug, latitude, longitude required)' });
  }

  try {
    const allData = getProcessedData();
    
    // Find items in the same city/location, excluding the current item
    const itemsInLocation = allData.allItems.filter(
      item => item.citySlug === citySlug && item.slug !== currentItemSlug
    );

    // Calculate distance for each item
    const itemsWithDistance = itemsInLocation.map(item => ({
      ...item,
      distance: calculateDistance(currentLat, currentLon, item.latitude, item.longitude)
    }));

    // Sort by distance (closest first), handling null distances
    const sortedItems = itemsWithDistance.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0; 
        if (a.distance === null) return 1;  
        if (b.distance === null) return -1; 
        return a.distance - b.distance; 
    });

    let relatedListings = sortedItems.slice(0, 5);

    // --- START: Fallback to random items if no nearby listings --- 
    if (relatedListings.length === 0) {
      console.log(`[API /related-listings] No items found in city ${citySlug}. Falling back to random items.`);
      
      // Get all items again (could optimize by passing allData down if needed)
      // const allItems = allData.allItems; // Assuming allData is still in scope
      
      // Filter out the current item
      const allOtherItems = allData.allItems.filter(item => item.slug !== currentItemSlug);
      
      // Shuffle the array (Fisher-Yates algorithm for better randomness)
      for (let i = allOtherItems.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allOtherItems[i], allOtherItems[j]] = [allOtherItems[j], allOtherItems[i]];
      }
      
      // Take the top 10 random items
      relatedListings = allOtherItems.slice(0, 10);
      
      // Mark these as random (optional, for client-side differentiation if needed)
      // relatedListings = relatedListings.map(item => ({ ...item, isRandomFallback: true }));
      console.log(`[API /related-listings] Returning ${relatedListings.length} random fallback items.`);
    }
    // --- END: Fallback logic ---

    res.status(200).json(relatedListings);

  } catch (error) {
    console.error('[API /related-listings] Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
} 