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
    return res.status(400).json({ message: 'Missing or invalid query parameters' });
  }

  try {
    const allData = getProcessedData();
    const TARGET_COUNT = 10;
    
    // 1. Find items in the same city, excluding the current item
    const itemsInLocation = allData.allItems.filter(
      item => item.citySlug === citySlug && item.slug !== currentItemSlug
    );

    // 2. Calculate distance for each item in the same location
    const itemsWithDistance = itemsInLocation.map(item => ({
      ...item,
      distance: calculateDistance(currentLat, currentLon, item.latitude, item.longitude)
    }));

    // 3. Sort nearby items by distance
    const sortedNearbyItems = itemsWithDistance.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0; 
        if (a.distance === null) return 1;  
        if (b.distance === null) return -1; 
        return a.distance - b.distance; 
    });

    let combinedListings = [...sortedNearbyItems]; // Start with nearby items
    const nearbyCount = combinedListings.length;
    
    // 4. If we need more items, find random ones
    if (nearbyCount < TARGET_COUNT) {
      const needed = TARGET_COUNT - nearbyCount;
      console.log(`[API /related-listings] Found ${nearbyCount} nearby. Needing ${needed} random items.`);

      // Create a set of slugs already included to avoid duplicates
      const includedSlugs = new Set(combinedListings.map(item => item.slug));
      includedSlugs.add(currentItemSlug); // Also exclude the current item itself

      // Filter all items to get potential random candidates
      const randomCandidates = allData.allItems.filter(item => !includedSlugs.has(item.slug));
      
      // Shuffle the candidates (Fisher-Yates)
      for (let i = randomCandidates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [randomCandidates[i], randomCandidates[j]] = [randomCandidates[j], randomCandidates[i]];
      }
      
      // Take the required number of random items
      const randomFallbackItems = randomCandidates.slice(0, needed);
       // Add distance property as null or calculate if needed (keeping it simple for now)
      const randomFallbackItemsWithNullDistance = randomFallbackItems.map(item => ({ ...item, distance: null }));

      console.log(`[API /related-listings] Adding ${randomFallbackItemsWithNullDistance.length} random fallback items.`);
      
      // Add the random items to the list
      combinedListings.push(...randomFallbackItemsWithNullDistance);
    }
    
    // 5. Ensure the final list has at most TARGET_COUNT items
    const finalListings = combinedListings.slice(0, TARGET_COUNT);

    console.log(`[API /related-listings] Returning final list of ${finalListings.length} items.`);
    res.status(200).json(finalListings);

  } catch (error) {
    console.error('[API /related-listings] Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
} 