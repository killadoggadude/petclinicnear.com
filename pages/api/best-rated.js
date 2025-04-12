import { getProcessedData } from '../../lib/data';

export default function handler(req, res) {
  // Get the slug of the item to exclude (optional)
  const { excludeSlug } = req.query;
  const TARGET_COUNT = 5;

  try {
    const allData = getProcessedData();
    
    // Filter out the excluded slug if provided
    const itemsToConsider = excludeSlug 
      ? allData.allItems.filter(item => item.slug !== excludeSlug)
      : allData.allItems;

    // Sort items by rating (desc), then reviews (desc)
    itemsToConsider.sort((a, b) => {
        const ratingA = a.rating ?? -1; // Treat null/missing rating as lowest
        const ratingB = b.rating ?? -1;
        
        if (ratingB !== ratingA) {
            return ratingB - ratingA; // Higher rating first
        }
        
        // If ratings are equal, sort by review count
        const reviewsA = a.reviews ?? 0; // Treat null/missing reviews as 0
        const reviewsB = b.reviews ?? 0;
        return reviewsB - reviewsA; // Higher review count first
    });

    // Get top N best rated listings
    const bestRatedListings = itemsToConsider.slice(0, TARGET_COUNT);

    console.log(`[API /best-rated] Returning ${bestRatedListings.length} best rated items (excluding: ${excludeSlug || 'none'}).`);
    res.status(200).json(bestRatedListings);

  } catch (error) {
    console.error('[API /best-rated] Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
} 